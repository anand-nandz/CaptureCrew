import { CustomError } from "../error/customError"
import { AcceptanceStatus } from "../models/vendorModel";
import crypto from 'crypto';
import vendorRepository from "../repositories/vendorRepository";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { emailTemplates } from "../utils/emailTemplates";
import { sendEmail } from "../utils/sendEmail";

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

            console.log(newVendor, 'new vendor  in vemdpr Sevice added');

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
            console.log(existingVendor,'login vendor');
            
            if (!existingVendor) throw new CustomError('Vendor not Registered', 404);

            const passwordMatch = await bcrypt.compare(
                password,
                existingVendor.password || ''
            )
            if (existingVendor.isVerified === false || existingVendor.isAccepted === AcceptanceStatus.Requested) {
                throw new CustomError('Admin needs to verify Your Account', 403);
            }

            if (!passwordMatch) throw new CustomError('Incorrect Password ,Try again', 401)
            else if (existingVendor.isActive === false) throw new CustomError('Account is Blocked by Admin', 403);

            const token = jwt.sign(
                { _id: existingVendor._id },
                process.env.JWT_SECRET_KEY!,
                {
                    expiresIn: '1h'
                }
            )
            const refreshToken = jwt.sign(
                { _id: existingVendor._id },
                process.env.JWT_REFRESH_SECRET_KEY!,
                {
                    expiresIn: '1d'
                }
            )

            existingVendor.refreshToken = refreshToken
            await existingVendor.save()

            return {
                refreshToken,
                token,
                isNewVendor: false,
                vendor: existingVendor,
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


    async getVendors(page: number, limit: number, search: string, status?: string) {
        try {
            const result = await vendorRepository.findAllVendors(page, limit, search, status)
            return result
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
            else {
                const accessToken = jwt.sign(
                    { _id: vendor._id },
                    process.env.JWT_SECRET_KEY!,
                    { expiresIn: '1h' }
                )
                return accessToken;
            }

        } catch (error) {
            console.error('Error while creatin refreshToken', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create refresh Token', 500);
        }
    }


    
    async SVendorBlockUnblock(vendorId :string):Promise<void> {
        try {
            const vendor = await vendorRepository.getById(vendorId);
            if(!vendor){
                throw new CustomError('Vendor not Found',404)
            }
            vendor.isActive = !vendor.isActive
            await vendor.save()
        } catch (error) {
            console.error("Error in SVendorBlockUnblock",error);
            if (error instanceof CustomError) {
                throw error;
            }   
            throw new CustomError('Failed to block and Unblock',500)
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

            console.log(`Password reset link: ${resetUrl}`);
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
            console.log(vendor, 'user in new passwordchange');


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
            console.log(currentTime, tokenExpiry, 'checking in valkidation token');

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

    async updateProfile(updateData: { name?: string; contactinfo?: string; companyName?: string; city?: string; about?: string }, vendorId: any) {
        try {

            const vendor = await vendorRepository.getById(vendorId.toString())
            if (!vendor) {
                throw new CustomError('User not found', 404)
            }
            const mergeData = {
                ...vendor.toObject(),
                ...updateData
            }

            const updatedVendor= await vendorRepository.update(vendorId, mergeData)
            if (!updatedVendor) {
                throw new CustomError('Failed to update user', 500);
            }
            await updatedVendor.save();

            const freshVendor = await vendorRepository.getById(vendorId.toString());
            return freshVendor;

        } catch (error) {
            console.error("Error in updateProfileService:", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to update profile.", 500);
        }
    }




}

function toTitleCase(city: string): string {
    return city.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1)
    }).join(' ')
}

export default new VendorService();
