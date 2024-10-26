import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserDocument } from '../models/userModel';
import { CustomError } from '../error/customError';
import userRepository from '../repositories/userRepository';
import generateUserTokenAndSetCookie from '../utils/generateUserTokenAndSetCookie';
import { Response } from 'express';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail';
import { emailTemplates } from '../utils/emailTemplates';
import generateOTP from '../utils/generateOtp';
import mongoose from 'mongoose';


export interface GoogleUserData {
    email: string;
    name: string;
    googleId: string;
    picture?: string;
}

interface LoginResponse {
    user: UserDocument;
    message: string
    isNewUser: boolean;
    token: string;
    refreshToken: string;
}

class UserService {
    async signup(
        email: string,
        password: string,
        name: string,
        contactinfo: string,
        res: Response,
    ): Promise<object> {
        try {
            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                throw new CustomError('User already exists', 404);
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const isActive: boolean = true;
            const newUser = await userRepository.create({
                email,
                password: hashedPassword,
                name,
                contactinfo,
                isActive,

            })
            // generateUserTokenAndSetCookie(newUser._id.toString(), res);
            console.log(newUser, 'new User in service');


            return { user: newUser }
        } catch (error) {
            console.error('Error in signup', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to sign up new User', 500)
        }
    }

    async googleSignup({ email, name, googleId }: GoogleUserData): Promise<object> {
        try {
            const existingUser = await userRepository.findByEmail(email);
            console.log(existingUser, 'exixteing in signup service');


            if (existingUser) {
                if (existingUser.isGoogleUser) return { user: existingUser };
                else {
                    throw new CustomError('Email already registered with different method', 400);
                }

            }

            const newUser = await userRepository.create({
                email,
                googleId,
                name,
                isActive: true,
                isGoogleUser: true,
            });
            return { user: newUser }

        } catch (error) {
            console.error('Error in signup using google', error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to SignIn using Google', 500)
        }
    }


    async authenticateGoogleLogin(userData: GoogleUserData, res: Response): Promise<LoginResponse> {
        try {
            const existingUser = await userRepository.findByEmail(userData.email);
            let user: UserDocument;
            let isNewUser = false;

            if (existingUser) {
                if (!existingUser.isGoogleUser) {
                    existingUser.isGoogleUser = true;
                    existingUser.googleId = userData.googleId;
                    if (userData.picture) existingUser.imageUrl = userData.picture;
                    user = await existingUser.save()
                } else {
                    user = existingUser;
                }
            } else {
                user = await userRepository.create({
                    email: userData.email,
                    name: userData.name,
                    googleId: userData.googleId,
                    isGoogleUser: true,
                    imageUrl: userData.picture,
                    isActive: true
                });
                isNewUser = true;
            }

            const token = jwt.sign(
                { _id: user._id },
                process.env.JWT_SECRET_KEY!,
                { expiresIn: '1m' }
            );

            const refreshToken = jwt.sign(
                { _id: user._id },
                process.env.JWT_REFRESH_SECRET_KEY!,
                { expiresIn: '3m' }
            );

            user.refreshToken = refreshToken;
            await user.save();
            await generateUserTokenAndSetCookie(user._id.toString(), res);
            console.log(user);

            return {
                user,
                isNewUser,
                token,
                refreshToken,
                message: 'Google authenticate successfull'
            };

        } catch (error) {
            console.error('Error in Google authentication:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to authenticate with Google', 500);
        }
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const existingUser = await userRepository.findByEmail(email);

            if (!existingUser) {
                throw new CustomError('User Not Exist!!..', 404)
            }

            const passwordMatch = await bcrypt.compare(
                password,
                existingUser.password || ''
            )

            if (!passwordMatch) {
                throw new CustomError('Incorrect Password', 401)
            }
            if (existingUser.isActive === false) {
                throw new CustomError('Blocked by Admin', 404)
            }

            const token = jwt.sign(
                { _id: existingUser._id },
                process.env.JWT_SECRET_KEY!,
                {
                    expiresIn: '1m'
                }
            )

            let { refreshToken } = existingUser;
            if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
                console.log('hi to sign refreshtoken in login');

                refreshToken = jwt.sign(
                    { _id: existingUser._id },
                    process.env.JWT_REFRESH_SECRET_KEY!,
                    {
                        expiresIn: '3m'
                    }
                )
                existingUser.refreshToken = refreshToken;
                await existingUser.save()
            }


            return {
                token,
                refreshToken,
                isNewUser: false,
                user: existingUser,
                message: 'Succesfully Logged in'
            }

        } catch (error) {
            console.error('Error in Login', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to login', 500)
        }
    }


    async createRefreshToken(refreshToken: string) {
        try {
            const decodedToken = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET_KEY!
            ) as { _id: string }

            const user = await userRepository.getById(decodedToken._id);

            if (!user || user.refreshToken !== refreshToken) {
                throw new CustomError('Invalid refresh Token', 404)
            }

            const accessToken = jwt.sign(
                { _id: user._id },
                process.env.JWT_SECRET_KEY!,
                { expiresIn: '1m' }
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

    async getUsers(page: number, limit: number, search: string, status?: string) {
        try {
            const result = await userRepository.findAllUsers(page, limit, search, status)
            return result
        } catch (error) {
            console.error('Error in finding users', error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to get Users', 500)
        }
    }

    async SUserBlockUnblock(userId: string): Promise<void> {
        try {
            const user = await userRepository.getById(userId);
            if (!user) {
                throw new CustomError('User not Found', 404)
            }
            user.isActive = !user.isActive
            await user.save()
        } catch (error) {
            console.error("Error in SUserBlockUnblock", error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to block and Unblock', 500)
        }
    }

    async handleForgotPassword(email: string): Promise<void> {
        try {
            const user = await userRepository.findByEmail(email)
            if (!user) {
                throw new CustomError('User not exists', 404);
            }
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 50 * 60 * 1000);

            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            await user.save();


            const resetUrl = `${process.env.FRONTEND_URL}/forgot-password/${resetToken}`
            await sendEmail(
                email,
                'Password Reset Request',
                emailTemplates.forgotPassword(user.name, resetUrl)
            );
            this.scheduleTokenCleanup(user._id, resetTokenExpiry)
            console.log(`Password reset link: ${resetUrl}`);
        } catch (error) {
            console.error('Error in handleForgotPassword:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to process forgot password request', 500);
        }
    }

    private async scheduleTokenCleanup(userId: mongoose.Types.ObjectId, expiryTime: Date): Promise<void> {
        const timeUntilExpiry = new Date(expiryTime).getTime() - Date.now();
        setTimeout(async () => {
            try {
                await userRepository.clearResetToken(userId)
            } catch (error) {
                console.error('Error cleaning up expired token:', error);
            }
        }, timeUntilExpiry)
    }



    async newPasswordChange(token: string, password: string): Promise<void> {
        try {
            const user = await userRepository.findByToken(token)
            console.log(user, 'user in new passwordchange');

            if (!user) {
                throw new CustomError('Invalid token', 400);
            }
            if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
                throw new CustomError('Password reset token has expired', 400);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            let updateSuccess = await userRepository.UpdatePasswordAndClearToken(user._id, hashedPassword);

            if (!updateSuccess) {
                throw new CustomError('Failed to Update password', 500)
            }

            await sendEmail(
                user.email,
                'Password Reset Successful',
                emailTemplates.ResetPasswordSuccess(user.name)
            );

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
            const user = await userRepository.findByToken(token)

            if (!user) {
                throw new CustomError('Invalid token', 400);
            }
            if (!user.resetPasswordExpires) {
                throw new CustomError('No reset token expiry date found', 400);
            }

            const currentTime = new Date().getTime()
            const tokenExpiry = new Date(user.resetPasswordExpires).getTime();
            console.log(currentTime, tokenExpiry, 'checking in valkidation token');

            if (currentTime > tokenExpiry) {
                await userRepository.clearResetToken(user._id)
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

    async resendNewOtp(email: string) {
        try {
            const newOtp = await generateOTP(email);
            console.log(newOtp, 'newOtp');
            return newOtp


        } catch (error) {
            console.error('Error in resendNewOtp:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError((error as Error).message || 'Failed to resend new Otp', 500);
        }
    }

    async updateProfile(updateData: { name?: string; contactinfo?: string }, userId: any) {
        try {

            const user = await userRepository.getById(userId.toString())
            if (!user) {
                throw new CustomError('User not found', 404)
            }
            const mergeData = {
                ...user.toObject(),
                ...updateData
            }

            const updatedUser = await userRepository.update(userId, mergeData)
            if (!updatedUser) {
                throw new CustomError('Failed to update user', 500);
            }
            await updatedUser.save();

            const freshUser = await userRepository.getById(userId.toString());
            return freshUser;

        } catch (error) {
            console.error("Error in updateProfileService:", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to update profile.", 500);
        }
    }
    async passwordCheckUser(currentPassword: string, newPassword: string, userId: any) {
        try {
            const user = await userRepository.getById(userId.toString())
            if (!user) {
                throw new CustomError('User not found', 404)
            }
            if (!user.password) {
                throw new CustomError("User password not set", 400)
            }

            const passwordMatch = await bcrypt.compare(
                currentPassword,
                user.password || ''
            )
            if (!passwordMatch) {
                throw new CustomError('Incorrect Password', 401)
            }

            if (currentPassword === newPassword) {
                throw new CustomError("Current and New Passwords can't be same", 401)
            }

            const salt = await bcrypt.genSalt(10);
            const newHashedPassword = await bcrypt.hash(newPassword, salt);
            const updateSuccess = await userRepository.UpdatePassword(userId, newHashedPassword)
            if (!updateSuccess) {
                throw new CustomError('Failed to update password', 500);
            }
            await sendEmail(
                user.email,
                'Password Reset Successful',
                emailTemplates.ResetPasswordSuccess(user.name)
            );


        } catch (error) {
            console.error("Error in updating password:", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to changing password.", 500);
        }
    }



}

export default new UserService();


function isTokenExpiringSoon(token: string): boolean {
    try {
        const decoded = jwt.decode(token) as { exp: number };
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;


        return timeUntilExpiration < 24 * 60 * 60 * 1000;
    } catch (error) {
        return true;
    }
}


