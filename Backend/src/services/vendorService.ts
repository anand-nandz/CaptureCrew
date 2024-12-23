import { CustomError } from "../error/customError"
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { emailTemplates } from "../utils/emailTemplates";
import { sendEmail } from "../utils/sendEmail";
import { s3Service } from "./s3Service";
import mongoose from "mongoose";
import { PackageDocument } from "../models/packageModel";
import { validatePackageInput } from "../validations/packageValidation";
import moment from "moment";
import { AcceptanceStatus, BlockStatus, OTP_EXPIRY_TIME, RESEND_COOLDOWN, ServiceProvided } from "../enums/commonEnums";
import { VendorDocument } from "../models/vendorModel";
import { IVendorService } from "../interfaces/serviceInterfaces/vendor.service.interface";
import { IVendorRepository } from "../interfaces/repositoryInterfaces/vendor.Repository.interface";
import { CustomizationOption, FindAllVendorsResult, IVendorLoginResponse, Post, Vendor, VendorDetailsWithAll, VendorSession } from "../interfaces/commonInterfaces";
import { createAccessToken, createRefreshToken } from "../config/jwt.config";
import { IPackageRepository } from "../interfaces/repositoryInterfaces/package.repository.intrface";
import { PostDocument } from "../models/postModel";
import { IBookingRepository } from "../interfaces/repositoryInterfaces/booking.Repository.interface";
import generateOTP from "../utils/generateOtp";

class VendorService implements IVendorService {


    private vendorRepository: IVendorRepository;
    private packageRepository: IPackageRepository;
    private bookingRepo: IBookingRepository;

    constructor(
        vendorRepository: IVendorRepository,
        packageRepository: IPackageRepository,
        bookingRepo: IBookingRepository,
    ) {
        this.vendorRepository = vendorRepository;
        this.packageRepository = packageRepository;
        this.bookingRepo = bookingRepo;
    }


    registerVendor = async (data: {
        email: string;
        name: string;
        password: string;
        city: string;
        contactinfo: string;
        companyName: string;
        about: string;
    }): Promise<VendorSession> => {
        const { email, name, password, city, contactinfo, companyName, about } = data;

        const existingVendor = await this.vendorRepository.findByEmail(email);
        if (existingVendor) throw new CustomError('Email already registered', 409);

        const otpCode = await generateOTP(email);

        if (!otpCode) throw new CustomError("Couldn't generate OTP", 500);

        const otpSetTimestamp = Date.now();
        return {
            email,
            password,
            name,
            contactinfo,
            city,
            companyName,
            about,
            otpCode,
            otpSetTimestamp,
            otpExpiry: otpSetTimestamp + OTP_EXPIRY_TIME,
            resendTimer: otpSetTimestamp + RESEND_COOLDOWN,
        };
    }

    signup = async (
        email: string,
        password: string,
        name: string,
        contactinfo: string,
        city: string,
        companyName: string,
        about: string
    ): Promise<{ vendor: VendorDocument }> => {
        try {
            const existingVendor = await this.vendorRepository.findByEmail(email);
            if (existingVendor) throw new CustomError('Vendor already exists', 409);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newVendor = await this.vendorRepository.create({
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

            return { vendor: newVendor }
        } catch (error) {
            console.log('Error in Signup', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create a New Vendor', 500)
        }
    }


    login = async (email: string, password: string): Promise<IVendorLoginResponse> => {
        try {
            const existingVendor = await this.vendorRepository.findByEmail(email);

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

            const token = createAccessToken(existingVendor._id.toString())

            let { refreshToken } = existingVendor;

            if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
                refreshToken = createRefreshToken(existingVendor._id.toString())
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

    create_RefreshToken = async (refreshToken: string): Promise<string> => {
        try {
            const decodedToken = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET_KEY!
            ) as { _id: string }

            const vendor = await this.vendorRepository.getById(decodedToken._id);

            if (!vendor || vendor.refreshToken !== refreshToken) {
                throw new CustomError('Invalid refresh token', 401)
            }

            const accessToken = createAccessToken(vendor._id.toString())
            return accessToken;

        } catch (error) {
            console.error('Error while creatin refreshToken', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create refresh Token', 500);
        }
    }

    checkBlock = async (vendorId: string): Promise<Vendor> => {
        try {
            const vendor = await this.vendorRepository.getById(vendorId.toString())
            if (vendor) return vendor
            throw new CustomError('Vendor not found', 404)
        } catch (error) {
            console.error('Error while checking vendor ', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to check block status', 500);
        }
    }

    getVendors = async (page: number, limit: number, search: string, status?: string): Promise<FindAllVendorsResult> => {
        try {
            const result = await this.vendorRepository.findAllVendors(page, limit, search, status);
            const updatedVendors = await Promise.all(
                result.vendors.map(async (vendor) => {
                    if (!vendor) {
                        return undefined;
                    }

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

    verifyVendor = async (vendorId: string, status: AcceptanceStatus): Promise<{ success: boolean, message: string }> => {
        try {
            const vendor = await this.vendorRepository.getById(vendorId);
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

    SVendorBlockUnblock = async (vendorId: string): Promise<BlockStatus> => {
        try {
            const vendor = await this.vendorRepository.getById(vendorId);
            if (!vendor) {
                throw new CustomError('Vendor not Found', 404)
            }
            vendor.isActive = !vendor.isActive
            await vendor.save()
            return vendor.isActive ? BlockStatus.UNBLOCK : BlockStatus.BLOCK;
        } catch (error) {
            console.error("Error in SVendorBlockUnblock", error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to block and Unblock', 500)
        }
    }

    handleForgotPassword = async (email: string): Promise<void> => {
        try {
            const vendor = await this.vendorRepository.findByEmail(email)
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

    newPasswordChange = async (token: string, password: string): Promise<void> => {
        try {
            const vendor = await this.vendorRepository.findByToken(token)

            if (!vendor) {
                throw new CustomError('Invalid token', 400);
            }
            if (!vendor.resetPasswordExpires || new Date() > vendor.resetPasswordExpires) {
                throw new CustomError('Password reset token has expired', 400);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            let updateSuccess = await this.vendorRepository.UpdatePassword(vendor._id, hashedPassword);

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

    validateToken = async (token: string): Promise<boolean> => {
        try {
            const vendor = await this.vendorRepository.findByToken(token)

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

    getVendorProfileService = async (vendorId: string): Promise<VendorDocument> => {
        try {
            const vendor = await this.vendorRepository.getById(vendorId.toString());

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

    updateProfileService = async (
        name: string,
        contactinfo: string,
        companyName: string,
        city: string,
        about: string,
        files: Express.Multer.File | null,
        vendorId: any
    ): Promise<VendorDocument | null> => {
        try {

            const vendor = await this.vendorRepository.getById(vendorId.toString())
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

            const updatedVendor = await this.vendorRepository.update(vendorId, updateData)
            if (!updatedVendor) {
                throw new CustomError('Failed to update user', 500);
            }
            await updatedVendor.save();

            const freshVendor = await this.vendorRepository.getById(vendorId.toString());
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


    addNewPkg = async (
        serviceType: ServiceProvided,
        price: number,
        description: string,
        duration: number | string,
        photographerCount: number,
        videographerCount: number,
        features: string[],
        customizationOptions: CustomizationOption[],
        vendorId: mongoose.Types.ObjectId
    ): Promise<{ package: PackageDocument }> => {
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

            const exists = await this.packageRepository.checkExistingPackage(vendorId, serviceType);
            if (exists) {
                throw new CustomError(
                    `A package for ${serviceType} already exists for this vendor`,
                    409
                )
            }

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

            const createdPackage = await this.packageRepository.create(packageData)
            return { package: createdPackage }

        } catch (error) {
            console.error('Error while creating new package', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create new package', 500);
        }
    }

    updatePkg = async (
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
    ): Promise<{ package: PackageDocument }> => {
        try {
            const existingPkg = await this.packageRepository.getById(packageId);

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


            const validationResult = await validatePackageInput(updatedData);
            if (!validationResult.isValid) {
                throw new CustomError(
                    `Validation failed: ${validationResult.errors?.join(', ')}`,
                    400
                );
            }

            const updatedPackage = await this.packageRepository.update(packageId, updatedData);


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

    getPackages = async (vendorId: mongoose.Types.ObjectId): Promise<PackageDocument[]> => {
        try {
            const packages = await this.packageRepository.getPkgs(vendorId)
            // if (packages.length === 0) {
            //     throw new CustomError('No packages added', 404)
            // }
            return packages
        } catch (error) {
            console.error('Error in getPackages:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to fetch vendor packages', 500);
        }
    }


    getAllDetails = async (vendorId: string): Promise<VendorDetailsWithAll> => {
        try {
            const vendorDetails = await this.vendorRepository.getAllPopulate(vendorId);
            let updatedVendorDetails = { ...vendorDetails };

            if (vendorDetails?.imageUrl) {
                try {
                    const profileImageUrl = await s3Service.getFile('captureCrew/vendor/photo/', vendorDetails.imageUrl);
                    updatedVendorDetails.imageUrl = profileImageUrl;
                } catch (error) {
                    console.error('Error generating signed URL for profile image:', error);
                }
            }

            if (vendorDetails.posts && Array.isArray(vendorDetails.posts)) {
                const updatedPosts = await Promise.all(
                    vendorDetails.posts.map(async (post: PostDocument) => {
                        try {
                            const postObject = post.toObject ? post.toObject() : post;
                            if (postObject.imageUrl && Array.isArray(postObject.imageUrl)) {
                                const signedImageUrls = await Promise.all(
                                    postObject.imageUrl.map(async (imageFileName: string) => {
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

                                const validSignedUrls = signedImageUrls.filter(url => url !== null);
                                return {
                                    ...postObject,
                                    imageUrl: validSignedUrls
                                };
                            }
                            return postObject;
                        } catch (error) {
                            console.error('Error processing post:', error);
                            return post;
                        }
                    })
                );

                updatedVendorDetails.posts = updatedPosts;
            }

            const finalVendorDetails = {
                ...vendorDetails,
                ...updatedVendorDetails,
            };

            return finalVendorDetails;

        } catch (error) {
            console.error('Error in getAllDetails:', error);
            throw new CustomError('Failed to getAllDetails from database', 500);
        }
    }

    addDates = async (dates: string[], vendorId: string): Promise<{
        success: boolean;
        message: string;
        addedDates: string[];
        alreadyBookedDates: string[];
    }> => {
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

            const { newDates, alreadyBooked, updatedVendor } = await this.vendorRepository.addDates(dates, vendorId);

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

    showDates = async (vendorId: string): Promise<VendorDocument | null> => {
        try {
            const vendor = await this.vendorRepository.getById(vendorId)
            return vendor
        } catch (error) {
            console.error('Error in showUnavailble dates:', error);
            throw new CustomError('Failed to getDatesfrom database', 500);
        }
    }

    removeDates = async (dates: string[], vendorId: string): Promise<{
        success: boolean;
        removedDates: string[];
    }> => {
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

            const result = await this.vendorRepository.removeDates(dates, vendorId);

            return {
                success: true,
                removedDates: result.removedDates
            };
        } catch (error) {
            console.error('Error in removeDates:', error);
            throw error;
        }
    }

    passwordCheckVendor = async (currentPassword: string, newPassword: string, vendorId: any): Promise<void> => {
        try {
            const vendor = await this.vendorRepository.getById(vendorId.toString())
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
            const updateSuccess = await this.vendorRepository.UpdatePassword(vendorId, newHashedPassword)
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

    getSingleVendor = async (vendorId: string): Promise<VendorDocument> => {
        try {
            const vendor = await this.vendorRepository.getById(vendorId)
            if (!vendor) {
                throw new CustomError('Vendor not found', 404)
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

    getRevenueDetails = async (dateType: string, vendorId: string, startDate?: string, endDate?: string): Promise<number[]> => {
        try {
            let start: Date, end: Date, groupBy, sortField: string, arrayLength = 0;
            if (dateType === 'custom' && startDate && endDate) {
                start = new Date(startDate);
                end = new Date(endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                groupBy = { $dayOfMonth: '$paidAt' };
                sortField = 'day'
                arrayLength = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            } else {
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
            }

            const revenueData = await this.bookingRepo.getRevenueData(vendorId, start, end, groupBy, sortField);

            if (dateType === 'custom') {
                const dailyRevenue = new Array(arrayLength).fill(0);
          
                revenueData.forEach(item => {
                  const day = item._id.day;
                          let currentDate = new Date(start);
                  while (currentDate <= end) {
                    if (currentDate.getDate() === day) {
                      const dayIndex = Math.floor(
                        (currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                      );
                      
                      const revenueDate = new Date(currentDate);
                      revenueDate.setHours(0, 0, 0, 0);
                  
                      const revenueDateStr = revenueDate.toISOString().split('T')[0];
                      const startStr = start.toISOString().split('T')[0];
                      const endStr = end.toISOString().split('T')[0];
                      
                      if (revenueDateStr >= startStr && revenueDateStr <= endStr && 
                          dayIndex >= 0 && dayIndex < arrayLength) {
                        dailyRevenue[dayIndex] = item.totalRevenue;
                      }
                    }
                    
                    currentDate.setDate(currentDate.getDate() + 1);
                  }
                });
          
                console.log(dailyRevenue, 'dailyRevenue');
                return dailyRevenue;
              }

            const revenueArray = Array.from({ length: arrayLength }, (_, index) => {
                const item = revenueData.find((r) => {

                    if (dateType === 'week') {
                        const dayFromData = r._id?.day;
                        return dayFromData === index + 1;
                    } else if (dateType === 'month') {
                        return r._id?.month === index + 1;
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


export default VendorService;
