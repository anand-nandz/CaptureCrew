import { CustomError } from "../error/customError"
import { AcceptanceStatus, VendorDocument } from "../models/vendorModel";
import crypto from 'crypto';
import vendorRepository from "../repositories/vendorRepository";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { emailTemplates } from "../utils/emailTemplates";
import { sendEmail } from "../utils/sendEmail";
import { s3Service } from "./s3Service";
import { ServiceProvided } from "../models/postModel";
import mongoose from "mongoose";
import { CustomizationOption, PackageDocument } from "../models/packageModel";
import { validatePackageInput } from "../validations/packageValidation";
import packageRepository from "../repositories/packageRepository";
import moment from "moment";
import bookingModel from "../models/bookingModel";

interface VendorLoginResponse {
    vendor: object,
    message: string,
    isNewVendor: boolean,
    token: string,
    refreshToken: string
}


class VendorService {
    async signup(
        email: string,
        password: string,
        name: string,
        contactinfo: string,
        city: string,
        companyName: string,
        about: string
    ) {
        try {
            const existingVendor = await vendorRepository.findByEmail(email);
            if (existingVendor) throw new CustomError('Vendor already exists', 409);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newVendor = await vendorRepository.create({
                email,
                password: hashedPassword,
                name,
                contactinfo,
                city: toTitleCase(city),
                companyName,
                about,
                isActive: false,
                isVerified: false,
                isAccepted: AcceptanceStatus.Requested,
                totalBooking: 0
            })

            const token = jwt.sign(
                { _id: newVendor._id },
                process.env.JWT_SECRET_KEY!,
                { expiresIn: '1h' }
            );

            const refreshToken = jwt.sign(
                { _id: newVendor._id },
                process.env.JWT_REFRESH_SECRET_KEY!,
                { expiresIn: '1d' }
            );

            return { vendor: newVendor, token, refreshToken }
        } catch (error) {
            console.log('Error in Signup', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create a New Vendor', 500)
        }
    }


    async login(email: string, password: string): Promise<VendorLoginResponse> {
        try {
            const existingVendor = await vendorRepository.findByEmail(email);

            if (!existingVendor) throw new CustomError('Vendor not Registered', 404);

            let vendorWithSignedUrl = existingVendor.toObject();
            if (existingVendor.imageUrl) {
                try {
                    const signedImageUrl = await s3Service.getFile('captureCrew/vendor/photo/', existingVendor.imageUrl);
                    vendorWithSignedUrl = {
                        ...vendorWithSignedUrl,
                        imageUrl: signedImageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL during login:', error);
                    // Don't throw error, just continue with unsigned URL
                }
            }

            const passwordMatch = await bcrypt.compare(
                password,
                existingVendor.password || ''
            )
            if (existingVendor.isVerified === false || existingVendor.isAccepted === AcceptanceStatus.Requested) {
                throw new CustomError('Admin needs to verify Your Account', 403);
            }

            if (!passwordMatch) throw new CustomError('Incorrect Password ,Try again', 401)
            if (existingVendor.isActive === false) throw new CustomError('Account is Blocked by Admin', 403);

            const token = jwt.sign(
                { _id: existingVendor._id },
                process.env.JWT_SECRET_KEY!,
                {
                    expiresIn: '1h'
                }
            )

            let { refreshToken } = existingVendor;

            if (!refreshToken || isTokenExpiringSoon(refreshToken)) {

                refreshToken = jwt.sign(
                    { _id: existingVendor._id },
                    process.env.JWT_REFRESH_SECRET_KEY!,
                    {
                        expiresIn: '7d'
                    }
                )

                existingVendor.refreshToken = refreshToken
                await existingVendor.save()
            }

            return {
                token,
                refreshToken,
                isNewVendor: false,
                vendor: vendorWithSignedUrl,
                message: 'Successfully logged in...'
            }

        } catch (error) {
            console.log('Error in login', error);

            if (error instanceof CustomError) {
                throw error;
            }

            throw new CustomError('Failed to login', 500);
        }
    }



    async createRefreshToken(refreshToken: string) {
        try {
            const decodedToken = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET_KEY!
            ) as { _id: string }

            const vendor = await vendorRepository.getById(decodedToken._id);

            if (!vendor || vendor.refreshToken !== refreshToken) {
                throw new CustomError('Invalid refresh token', 401)
            }

            const accessToken = jwt.sign(
                { _id: vendor._id },
                process.env.JWT_SECRET_KEY!,
                { expiresIn: '1h' }
            )
            return accessToken;


        } catch (error) {
            console.error('Error while creatin refreshToken', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create refresh Token', 500);
        }
    }


    async getVendors(page: number, limit: number, search: string, status?: string) {
        try {
            const result = await vendorRepository.findAllVendors(page, limit, search, status);
            const updatedVendors = await Promise.all(
                result.vendors.map(async (vendor) => {
                    try {
                        if (vendor.imageUrl === '') {
                            return { ...vendor }
                        }
                        if (vendor.imageUrl) {
                            const signedUrl = await s3Service.getFile(
                                'captureCrew/vendor/photo/',
                                vendor.imageUrl
                            )
                            return {
                                ...vendor,
                                imageUrl: signedUrl
                            }

                        }
                    } catch (error) {
                        console.error(`Error getting Signed URL for ${vendor.imageUrl}:`, error);
                        return vendor
                    }
                })
            )


            return {
                ...result,
                vendors: updatedVendors
            };
        } catch (error) {
            console.error('Error in finding users', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to get Users', 500)
        }
    }

    async verifyVendor(vendorId: string, status: AcceptanceStatus) {
        try {
            const vendor = await vendorRepository.getById(vendorId);
            if (!vendor) {
                return { success: false, message: 'Vendor not found' };
            }


            vendor.isAccepted = status;
            vendor.isActive = status === AcceptanceStatus.Accepted;
            vendor.isVerified = status === AcceptanceStatus.Accepted;

            await vendor.save()

            const emailSubject = status === AcceptanceStatus.Accepted
                ? 'Your vendor account has been accepted'
                : 'Your vendor account has been rejected';

            const emailBody = status === AcceptanceStatus.Accepted
                ? emailTemplates.vendorAccepted(vendor.name)
                : emailTemplates.vendorRejected(vendor.name);

            await sendEmail(vendor.email, emailSubject, emailBody)
            return {
                success: true,
                message: status === AcceptanceStatus.Accepted
                    ? 'Vendor has been accepted and notified via email'
                    : 'Vendor has been rejected and notified via email'
            };

        } catch (error) {
            console.error('Error in verifyinf vendor', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to Verify vendor', 500);
        }
    }




    async SVendorBlockUnblock(vendorId: string): Promise<void> {
        try {
            const vendor = await vendorRepository.getById(vendorId);
            if (!vendor) {
                throw new CustomError('Vendor not Found', 404)
            }
            console.log(vendor, 'vendor to be blocked sblock service');

            vendor.isActive = !vendor.isActive
            await vendor.save()
        } catch (error) {
            console.error("Error in SVendorBlockUnblock", error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to block and Unblock', 500)
        }
    }

    async handleForgotPassword(email: string): Promise<void> {
        try {
            const vendor = await vendorRepository.findByEmail(email)
            if (!vendor) {
                throw new CustomError('User not exists', 404);
            }
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 1000);

            vendor.resetPasswordToken = resetToken;
            vendor.resetPasswordExpires = resetTokenExpiry;
            await vendor.save();


            const resetUrl = `${process.env.FRONTEND_URL}/vendor/forgot-password/${resetToken}`
            await sendEmail(
                email,
                'Password Reset Request',
                emailTemplates.forgotPassword(vendor.name, resetUrl)
            );

        } catch (error) {
            console.error('Error in handleForgotPassword:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to process forgot password request', 500);
        }
    }

    async newPasswordChange(token: string, password: string): Promise<void> {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const vendor = await vendorRepository.findByToken(token)

            if (!vendor) {
                throw new CustomError('Invalid token', 400);
            }
            if (!vendor.resetPasswordExpires || new Date() > vendor.resetPasswordExpires) {
                throw new CustomError('Password reset token has expired', 400);
            }

            let updateSuccess = await vendorRepository.UpdatePassword(vendor._id, hashedPassword);

            if (!updateSuccess) {
                throw new CustomError('Failed to Update password', 500)
            } else {
                vendor.isActive = true;
                vendor.resetPasswordExpires = undefined;
                vendor.resetPasswordToken = undefined;
                await vendor.save();
                await sendEmail(
                    vendor.email,
                    'Password Reset Successful',
                    emailTemplates.ResetPasswordSuccess(vendor.name)
                );
            }



        } catch (error) {
            console.error('Error in newPasswordChange:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to password', 500);
        }
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            const vendor = await vendorRepository.findByToken(token)

            if (!vendor) {
                throw new CustomError('Invalid token', 400);
            }
            if (!vendor.resetPasswordExpires) {
                throw new CustomError('No reset token expiry date found', 400);
            }

            const currentTime = new Date().getTime()
            const tokenExpiry = new Date(vendor.resetPasswordExpires).getTime();

            if (currentTime > tokenExpiry) {
                vendor.resetPasswordToken = undefined
                vendor.resetPasswordExpires = undefined;
                await vendor.save()
                return false;
            }
            return true;

        } catch (error) {
            console.error('Error in validateResetToken:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError((error as Error).message || 'Failed to validate token', 500);
        }
    }

    async getVendorProfileService(vendorId: string) {
        try {
            const vendor = await vendorRepository.getById(vendorId.toString());

            if (!vendor) {
                throw new CustomError('Vendor not found', 400)
            }

            if (vendor?.imageUrl) {
                try {
                    const imageUrl = await s3Service.getFile('captureCrew/vendor/photo/', vendor?.imageUrl);
                    return {
                        ...vendor.toObject(),
                        imageUrl: imageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL:', error);
                    return vendor;
                }
            }
            return vendor

        } catch (error) {
            console.error('Error in getVendorProfileService:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError((error as Error).message || 'Failed to get profile details', 500);
        }
    }

    async updateProfileService(name: string, contactinfo: string, companyName: string, city: string, about: string, files: Express.Multer.File | null, vendorId: any) {
        try {

            const vendor = await vendorRepository.getById(vendorId.toString())
            if (!vendor) {
                throw new CustomError('User not found', 404)
            }

            const updateData: {
                name?: string;
                contactinfo?: string;
                imageUrl?: string;
                companyName?: string;
                city?: string;
                about?: string;
            } = {};
            if (name && name !== vendor.name) {
                updateData.name = name;
            }
            if (contactinfo && contactinfo !== vendor.contactinfo) {
                updateData.contactinfo = contactinfo;
            }
            if (companyName && companyName !== vendor.companyName) {
                updateData.companyName = companyName;
            }
            if (city && city !== vendor.city) {
                updateData.city = city;
            }
            if (about && about !== vendor.about) {
                updateData.about = about;
            }
            if (files) {
                try {
                    const imageFileName = await s3Service.uploadToS3(
                        'captureCrew/vendor/photo/',
                        files
                    );
                    updateData.imageUrl = imageFileName;
                } catch (error) {
                    console.error('Error uploading to S3:', error);
                    throw new CustomError('Failed to upload image to S3', 500);
                }
            }

            if (Object.keys(updateData).length === 0) {
                throw new CustomError('No changes to update', 400);
            }

            const updatedVendor = await vendorRepository.update(vendorId, updateData)
            if (!updatedVendor) {
                throw new CustomError('Failed to update user', 500);
            }
            await updatedVendor.save();

            const freshVendor = await vendorRepository.getById(vendorId.toString());
            if (freshVendor?.imageUrl) {
                try {
                    const imageUrl = await s3Service.getFile('captureCrew/vendor/photo/', freshVendor.imageUrl);

                    return {
                        ...freshVendor.toObject(),
                        imageUrl: imageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL:', error);
                    return freshVendor;
                }
            }
            return freshVendor;

        } catch (error) {
            console.error("Error in updateProfileService:", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to update profile.", 500);
        }
    }


    async addNewPkg(
        serviceType: ServiceProvided,
        price: number,
        description: string,
        duration: number | string,
        photographerCount: number,
        videographerCount: number,
        features: string[],
        customizationOptions: CustomizationOption[],
        vendorId: mongoose.Types.ObjectId
    ): Promise<{ package: PackageDocument }> {
        try {
            const durationNum = typeof duration === 'string' ? parseFloat(duration) : duration;

            const validationResult = await validatePackageInput({
                serviceType,
                price,
                description,
                duration: durationNum,
                photographerCount,
                videographerCount,
                features,
                customizationOptions
            })

            if (!validationResult.isValid) {
                throw new CustomError(
                    `Validation failed: ${validationResult.errors?.join(', ')}`,
                    400
                )
            }

            const exists = await packageRepository.checkExistingPackage(vendorId, serviceType);
            if (exists) {
                throw new CustomError(
                    `A package for ${serviceType} already exists for this vendor`,
                    409
                )
            }
            console.log(exists, 'exists or not');


            const packageData: Partial<PackageDocument> = {
                vendor_id: vendorId,
                serviceType,
                price,
                description,
                duration: durationNum,
                photographerCount,
                videographerCount,
                features,
                customizationOptions,
                isActive: true,
                createdAt: new Date()
            };

            const createdPackage = await packageRepository.create(packageData)
            console.log(createdPackage, 'in service all done pkg creation');

            return { package: createdPackage }

        } catch (error) {
            console.error('Error while creating new package', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create new package', 500);
        }
    }

    async updatePkg(
        vendorId: mongoose.Types.ObjectId,
        packageId: string,
        serviceType?: ServiceProvided,
        price?: number,
        description?: string,
        duration?: number | string,
        photographerCount?: number,
        videographerCount?: number,
        features?: string[],
        customizationOptions?: CustomizationOption[],
    ): Promise<{ package: PackageDocument }> {
        try {
            const existingPkg = await packageRepository.getById(packageId);
            console.log(existingPkg, 'existing package');

            if (!existingPkg) {
                throw new CustomError('Package not found', 404)
            }
            if (existingPkg.vendor_id.toString() !== vendorId.toString()) {
                throw new CustomError('Unauthorized to edit this package', 403);
            }

            const updatedData: Partial<PackageDocument> = {
                serviceType,
                price,
                description,
                duration: typeof duration === 'string' ? parseFloat(duration) : duration,
                photographerCount,
                videographerCount,
                features,
                customizationOptions
            };
            console.log(updatedData, 'updatesd daata i serive');


            const validationResult = await validatePackageInput(updatedData);
            if (!validationResult.isValid) {
                throw new CustomError(
                    `Validation failed: ${validationResult.errors?.join(', ')}`,
                    400
                );
            }

            const updatedPackage = await packageRepository.update(packageId, updatedData);
            console.log(updatedPackage, 'updated pkg in service');


            if (!updatedPackage) {
                throw new CustomError('Failed to update package', 500);
            }
            return { package: updatedPackage };

        } catch (error) {
            console.error('Error while updating package', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to update package', 500);
        }
    }

    async getPackages(vendorId: mongoose.Types.ObjectId) {
        try {
            const packages = await packageRepository.getPkgs(vendorId)
            if (packages.length === 0) {
                throw new CustomError('No packages added', 404)
            }
            return packages
        } catch (error) {
            console.error('Error in getPackages:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetch vendor packages', 500);
        }
    }


    async getAllDetails(vendorId: string) {
        try {
            const vendorDetails = await vendorRepository.getAllPopulate(vendorId);
            let updatedVendorDetails = { ...vendorDetails };

            // Handle vendor profile image
            if (vendorDetails?.imageUrl) {
                try {
                    const profileImageUrl = await s3Service.getFile('captureCrew/vendor/photo/', vendorDetails.imageUrl);
                    updatedVendorDetails.imageUrl = profileImageUrl;
                } catch (error) {
                    console.error('Error generating signed URL for profile image:', error);
                }
            }

            // Handle posts images
            if (vendorDetails.posts && Array.isArray(vendorDetails.posts)) {
                const updatedPosts = await Promise.all(
                    vendorDetails.posts.map(async (post) => {
                        try {
                            if (post.imageUrl && Array.isArray(post.imageUrl)) {
                                const signedImageUrls = await Promise.all(
                                    post.imageUrl.map(async (imageFileName) => {
                                        try {
                                            const signedUrl = await s3Service.getFile(
                                                'captureCrew/vendor/posts/',
                                                imageFileName
                                            );
                                            return signedUrl;
                                        } catch (error) {
                                            console.error(`Error getting signed URL for image ${imageFileName}:`, error);
                                            return null;
                                        }
                                    })
                                );

                                // Filter out null values and create new post object
                                const validSignedUrls = signedImageUrls.filter(url => url !== null);
                                return {
                                    ...post,  // Spread the post object directly
                                    imageUrl: validSignedUrls
                                };
                            }
                            return post;  // Return the post object directly
                        } catch (error) {
                            console.error('Error processing post:', error);
                            return post;  // Return the post object directly
                        }
                    })
                );

                updatedVendorDetails.posts = updatedPosts;
            }

            // Convert the entire vendor details to a plain object if it's a Mongoose document
            const finalVendorDetails = vendorDetails.toObject ?
                { ...vendorDetails.toObject(), ...updatedVendorDetails } :
                updatedVendorDetails;

            return finalVendorDetails;

        } catch (error) {
            console.error('Error in getAllDetails:', error);
            throw new CustomError('Failed to getAllDetails from database', 500);
        }
    }

    async addDates(dates: string[], vendorId: string) {
        try {
            const isValidDates = dates.every(date => {
                const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
                return dateRegex.test(date);
            })

            if (!isValidDates) {
                throw new CustomError('Invalid date format. Use DD/MM/YYYY', 400);
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const hasInvalidDate = dates.some(date => {
                const [day, month, year] = date.split('/');
                const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                return dateObj < today;
            });

            if (hasInvalidDate) {
                throw new CustomError('Cannot add dates from the past', 400);
            }

            const { newDates, alreadyBooked, updatedVendor } = await vendorRepository.addDates(dates, vendorId);
            console.log(newDates, 'newDates');
            console.log(alreadyBooked, 'alreadyBooked');
            console.log(updatedVendor, 'updatedVendor');




            if (newDates.length === 0 && alreadyBooked.length > 0) {
                return {
                    success: false,
                    message: 'All selected dates are already marked as unavailable',
                    addedDates: [],
                    alreadyBookedDates: alreadyBooked,
                };
            }

            // const maxBlockedDates = 30; // Example business rule
            // if (updatedVendor.bookedDates.length > maxBlockedDates) {
            //     throw new CustomError(`Vendor cannot block more than ${maxBlockedDates} dates`, 400);
            // }
            return {
                success: true,
                message: 'Dates updated successfully',
                addedDates: newDates,
                alreadyBookedDates: alreadyBooked
            };



        } catch (error) {
            console.error('Error in addDates:', error);
            throw new CustomError('Failed to addDates', 500);
        }
    }

    async showDates(vendorId: string) {
        try {
            const vendor = await vendorRepository.getById(vendorId)
            return vendor
        } catch (error) {
            console.error('Error in showUnavailble dates:', error);
            throw new CustomError('Failed to getDatesfrom database', 500);
        }
    }

    async removeDates(dates: string[], vendorId: string) {
        try {
            const isValidDates = dates.every(date => {
                const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
                return dateRegex.test(date);
            });

            if (!isValidDates) {
                throw new CustomError('Invalid date format. Use DD/MM/YYYY', 400);
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const hasInvalidDate = dates.some(date => {
                const [day, month, year] = date.split('/');
                const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                return dateObj < today;
            });

            if (hasInvalidDate) {
                throw new CustomError('Cannot modify dates from the past', 400);
            }

            const result = await vendorRepository.removeDates(dates, vendorId);

            return {
                success: true,
                removedDates: result.removedDates
            };
        } catch (error) {
            console.error('Error in removeDates:', error);
            throw error;
        }
    }

    async passwordCheckUser(currentPassword: string, newPassword: string, vendorId: any) {
        try {
            const vendor = await vendorRepository.getById(vendorId.toString())
            if (!vendor) {
                throw new CustomError('User not found', 404)
            }
            if (!vendor.password) {
                throw new CustomError("User password not set", 400)
            }

            const passwordMatch = await bcrypt.compare(
                currentPassword,
                vendor.password || ''
            )
            if (!passwordMatch) {
                throw new CustomError('Incorrect Password', 401)
            }

            if (currentPassword === newPassword) {
                throw new CustomError("Current and New Passwords can't be same", 401)
            }

            const salt = await bcrypt.genSalt(10);
            const newHashedPassword = await bcrypt.hash(newPassword, salt);
            const updateSuccess = await vendorRepository.UpdatePassword(vendorId, newHashedPassword)
            if (!updateSuccess) {
                throw new CustomError('Failed to update password', 500);
            }
            await sendEmail(
                vendor.email,
                'Password Reset Successful',
                emailTemplates.ResetPasswordSuccess(vendor.name)
            );


        } catch (error) {
            console.error("Error in updating password:", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to changing password.", 500);
        }
    }

    async getSingleVendor(vendorId:string): Promise<VendorDocument> {
        try {
            const vendor = await vendorRepository.getById(vendorId)
            if(!vendor){
                throw new CustomError('Vendor not found',404)
            }
            let vendorWithSignedUrl = vendor.toObject();
            if (vendor?.imageUrl) {
                try {
                    const signedImageUrl = await s3Service.getFile('captureCrew/vendor/photo/', vendor?.imageUrl);
                    vendorWithSignedUrl = {
                        ...vendorWithSignedUrl,
                        imageUrl: signedImageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL during getSingleVendor:', error);
                    // Don't throw error, just continue with unsigned URL
                }
            }
            return vendorWithSignedUrl
        } catch (error) {
            console.error("Error in getting singlevendor", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to get vendor", 500);
        }
    }

    async getRevenueDetails(dateType: string,vendorId: string) {
        try {
          let start, end, groupBy, sortField, arrayLength = 0;
          switch (dateType) {
            case 'week':
              const { startOfWeek, endOfWeek } = getCurrentWeekRange();
              start = startOfWeek;
              end = endOfWeek;
              groupBy = { $dayOfWeek: '$paidAt' };
              sortField = 'day';
              arrayLength = 7;
              break;
    
            case 'month':
              const { startOfYear, endOfYear } = getCurrentYearRange();
              start = startOfYear;
              end = endOfYear;
              groupBy = { $month: '$paidAt' };
              sortField = 'month';
              arrayLength = 12;
              break;
    
            case 'year':
              const { startOfFiveYearsAgo, endOfCurrentYear } = getLastFiveYearsRange();
              start = startOfFiveYearsAgo;
              end = endOfCurrentYear;
              groupBy = { $year: '$paidAt' };
              sortField = 'year';
              arrayLength = 5;
              break;
    
    
            default:
              throw new CustomError('Invalid Date Parameter', 400)
          }
    
          const revenueData = await bookingModel.aggregate([
            {
                $match: {
                    vendorId: new mongoose.Types.ObjectId(vendorId), 
                },
            },
            {
              $project: {
                validAdvanceAmount: {
                  $cond: [
                    { $eq: ['$advancePayment.status', 'completed'] },
                    '$advancePayment.amount',
                    0
                  ]
                },
                validFinalAmount: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$finalPayment.status', 'completed'] },
                        { $ne: ['$finalPayment.paidAt', null] }
                      ]
                    },
                    '$finalPayment.amount',
                    0
                  ]
                },
                paidAt: {
                  $ifNull: ['$finalPayment.paidAt', '$advancePayment.paidAt']
                }
              }
            },
            {
              $project: {
                totalAmount: { $add: ['$validAdvanceAmount', '$validFinalAmount'] },
                paidAt: 1
              }
            },
            {
              $match: {
                paidAt: { $gte: start, $lt: end }
              }
            },
            {
              $group: {
                _id: {
                  [sortField]: groupBy
                },
                totalRevenue: { $sum: '$totalAmount' }
              }
            },
            { $sort: { [`_id.${sortField}`]: 1 } }
          ]);
    
          const revenueArray = Array.from({ length: arrayLength }, (_, index) => {
            const item = revenueData.find((r) => {
    
              if (dateType === 'week') {
                const dayFromData = r._id?.day;
                return dayFromData === index + 1;
              } else if (dateType === 'month') {
                return r._id?.month === index + 1 || r._id?.month?.month === index + 1;
              } else if (dateType === 'year') {
                const expectedYear = new Date().getFullYear() - (arrayLength - 1) + index;
                return r._id?.year === expectedYear;
              }
              return false;
            });
    
            return item ? item.totalRevenue : 0;
          });
          return revenueArray
    
        } catch (error) {
          console.error('Error fetching revenue stats:', error);
          throw new Error('Unable to fetch revenue statistics');
        }
      }




}

function toTitleCase(city: string): string {
    return city.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1)
    }).join(' ')
}



function isTokenExpiringSoon(token: string): boolean {
    try {
        const decoded = jwt.decode(token) as { exp: number };
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;


        return timeUntilExpiration < 7 * 24 * 60 * 60 * 1000;
    } catch (error) {
        return true;
    }

}


function getCurrentWeekRange() {
    const startOfWeek = moment().startOf("isoWeek").toDate();
    const endOfWeek = moment().endOf("isoWeek").toDate();
    return { startOfWeek, endOfWeek };
  }
  
  // Function to get current year range
  function getCurrentYearRange() {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear() + 1, 0, 1);
    return { startOfYear, endOfYear };
  }
  
  // Function to calculate the last five years' range
  function getLastFiveYearsRange() {
    const currentYear = new Date().getFullYear();
    const startOfFiveYearsAgo = new Date(currentYear - 4, 0, 1);
    const endOfCurrentYear = new Date(currentYear + 1, 0, 1);
    return { startOfFiveYearsAgo, endOfCurrentYear };
  }
  

export default new VendorService();
