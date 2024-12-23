import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserDocument } from '../models/userModel';
import { CustomError } from '../error/customError';
import userRepository from '../repositories/userRepository';
import { Response } from 'express';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail';
import { emailTemplates } from '../utils/emailTemplates';
import generateOTP from '../utils/generateOtp';
import mongoose from 'mongoose';
import { s3Service } from './s3Service';
import { GoogleUserData, ILoginResponse, User } from '../interfaces/commonInterfaces';
import { IUserService } from '../interfaces/serviceInterfaces/user.Service.Interface';
import { IUserRepository } from '../interfaces/repositoryInterfaces/user.repository.Interface';
import { createAccessToken, createRefreshToken, isTokenExpiringSoon } from '../config/jwt.config';
import { BlockStatus } from '../enums/commonEnums';



class UserService implements IUserService {

    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository
    }


    login = async (email: string, password: string): Promise<ILoginResponse> => {
        try {

            const existingUser = await this.userRepository.findByEmail(email);

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
                throw new CustomError('Blocked by Admin', 403)
            }

            let userWithSignedUrl = existingUser.toObject();

            if (existingUser?.imageUrl) {
                try {

                    const signedImageUrl = await s3Service.getFile('captureCrew/photo/', existingUser?.imageUrl);

                    userWithSignedUrl = {
                        ...userWithSignedUrl,
                        imageUrl: signedImageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL during login:', error);
                }
            }

            const token = createAccessToken(existingUser._id.toString());

            let { refreshToken } = existingUser;
            if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
                refreshToken = createRefreshToken(existingUser._id.toString())
                existingUser.refreshToken = refreshToken;
                await existingUser.save()
            }


            return {
                token,
                refreshToken,
                isNewUser: false,
                user: userWithSignedUrl,
                message: 'Succesfully Logged in'
            }

        } catch (error) {
            console.error('Error in Login', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to login', 500)
        }
    };


    signup = async (
        email: string,
        password: string,
        name: string,
        contactinfo: string,
    ): Promise<User> => {
        try {
            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                throw new CustomError('User already exists', 404);
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const isActive: boolean = true;
            const newUser = await this.userRepository.create({
                email,
                password: hashedPassword,
                name,
                walletBalance: 0,
                transactions: [],
                contactinfo,
                isActive,

            })
            return newUser
        } catch (error) {
            console.error('Error in signup', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to sign up new User', 500)
        }
    }

    resendNewOtp = async (email: string): Promise<string> => {
        try {
            const newOtp = await generateOTP(email);
            return newOtp as string

        } catch (error) {
            console.error('Error in resendNewOtp:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError((error as Error).message || 'Failed to resend new Otp', 500);
        }
    }

    create_RefreshToken = async (refreshToken: string): Promise<string> => {
        try {
            const decodedToken = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET_KEY!
            ) as { _id: string }

            const user = await this.userRepository.getById(decodedToken._id);

            if (!user || user.refreshToken !== refreshToken) {
                throw new CustomError('Invalid refresh Token', 401)
            }

            const accessToken = createAccessToken(user._id.toString())
            return accessToken;

        } catch (error) {
            console.error('Error while creatin refreshToken', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create refresh Token', 500);
        }
    }

    checkBlock = async (userId: string): Promise<User> => {
        try {
            const user = await this.userRepository.getById(userId.toString())
            if (user) return user
            throw new CustomError('User not found', 404)
        } catch (error) {
            console.error('Error while checking user ', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to check block status', 500);
        }
    }

    handleForgotPassword = async (email: string): Promise<void> => {
        try {
            const user = await this.userRepository.findByEmail(email)
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
            const user = await this.userRepository.findByToken(token);

            if (!user) {
                throw new CustomError('Invalid token', 400);
            }
            if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
                throw new CustomError('Password reset token has expired', 400);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            let updateSuccess = await this.userRepository.UpdatePasswordAndClearToken(user._id, hashedPassword);

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

    validateToken = async (token: string): Promise<boolean> => {
        try {
            const user = await this.userRepository.findByToken(token)

            if (!user) {
                throw new CustomError('Invalid token', 400);
            }
            if (!user.resetPasswordExpires) {
                throw new CustomError('No reset token expiry date found', 400);
            }

            const currentTime = new Date().getTime()
            const tokenExpiry = new Date(user.resetPasswordExpires).getTime();

            if (currentTime > tokenExpiry) {
                await this.userRepository.clearResetToken(user._id)
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

    googleSignup = async ({ email, name, googleId }: GoogleUserData): Promise<object> => {
        try {
            const existingUser = await this.userRepository.findByEmail(email);

            if (existingUser) {
                if (existingUser.isGoogleUser) return { user: existingUser };
                else {
                    throw new CustomError('Email already registered with different method', 400);
                }
            }

            const newUser = await this.userRepository.create({
                email,
                googleId,
                name,
                walletBalance: 0,
                transactions: [],
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

    authenticateGoogleLogin = async (userData: GoogleUserData): Promise<ILoginResponse> => {
        try {
            const existingUser = await this.userRepository.findByEmail(userData.email);
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
                user = await this.userRepository.create({
                    email: userData.email,
                    name: userData.name,
                    googleId: userData.googleId,
                    isGoogleUser: true,
                    walletBalance: 0,
                    transactions: [],
                    imageUrl: userData.picture,
                    isActive: true
                });
                isNewUser = true;
            }
            let userWithSignedUrl = user.toObject();
            if (user?.imageUrl) {
                try {
                    const signedImageUrl = await s3Service.getFile('captureCrew/photo/', user.imageUrl);
                    userWithSignedUrl = {
                        ...userWithSignedUrl,
                        imageUrl: signedImageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL during Google login:', error);
                }
            }
            const token = createAccessToken(user._id.toString())
            const refreshToken = createRefreshToken(user._id.toString())

            user.refreshToken = refreshToken;
            await user.save();

            return {
                user: userWithSignedUrl,
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

    getUserProfileService = async (userId: string): Promise<UserDocument> => {
        try {
            const user = await this.userRepository.getById(userId.toString());
            if (!user) {
                throw new CustomError('User not found', 400);
            }
            if (user?.imageUrl) {
                try {
                    const imageUrl = await s3Service.getFile('captureCrew/photo/', user?.imageUrl);
                    return {
                        ...user.toObject(),
                        imageUrl: imageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL:', error);
                    return user;
                }
            }
            return user
        } catch (error) {
            console.error('Error in getUserProfileService:', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError((error as Error).message || 'Failed to get profile details', 500);
        }
    }

    updateProfileService = async (
        name: string,
        contactinfo: string,
        userId: any,
        files: Express.Multer.File | null
    ): Promise<UserDocument | null> => {
        try {
            const user = await this.userRepository.getById(userId.toString())
            if (!user) {
                throw new CustomError('User not found', 404)
            }

            const updateData: {
                name?: string;
                contactinfo?: string;
                imageUrl?: string;
            } = {};

            if (name && name !== user.name) {
                updateData.name = name;
            }
            if (contactinfo && contactinfo !== user.contactinfo) {
                updateData.contactinfo = contactinfo;
            }

            if (files) {
                try {
                    const imageFileName = await s3Service.uploadToS3(
                        'captureCrew/photo/',
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

            const updatedUser = await this.userRepository.update(userId, updateData)
            if (!updatedUser) {
                throw new CustomError('Failed to update user', 500);
            }
            await updatedUser.save();
            const freshUser = await this.userRepository.getById(userId.toString());
            if (freshUser?.imageUrl) {
                try {
                    const imageUrl = await s3Service.getFile('captureCrew/photo/', freshUser.imageUrl);
                    return {
                        ...freshUser.toObject(),
                        imageUrl: imageUrl
                    };
                } catch (error) {
                    console.error('Error generating signed URL:', error);
                    return freshUser;
                }
            }

            return freshUser;

        } catch (error) {
            console.error("Error in updateProfileService:", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to update profile.", 500);
        }
    }

    passwordCheckUser = async (currentPassword: string, newPassword: string, userId: any): Promise<void> => {
        try {
            const user = await this.userRepository.getById(userId.toString())
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
            const updateSuccess = await this.userRepository.UpdatePassword(userId, newHashedPassword)
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


    getSingleUser = async (userId: string): Promise<UserDocument> => {
        try {
            const user = await this.userRepository.getById(userId)
            if (!user) {
                throw new CustomError('User Not Found', 400)
            }
            let userWithSignedUrl = user.toObject();
            if (user?.imageUrl) {
                try {
                    const signedImageUrl = await s3Service.getFile('captureCrew/photo/', user?.imageUrl);
                    userWithSignedUrl = {
                        ...userWithSignedUrl,
                        imageUrl: signedImageUrl
                    }
                } catch (error) {
                    console.error('Error generating signed URL during getSingleUser:', error);
                }
            }
            return userWithSignedUrl
        } catch (error) {
            console.error("Error in getting singleUser", error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError("Failed to get user", 500);
        }
    }


    getUsers = async(page: number, limit: number, search: string, status?: string): Promise<{users: UserDocument[], total: number, totalPages: number}> =>{
        try {
            const result = await this.userRepository.findAllUsers(page, limit, search, status);
            return result
        } catch (error) {
            console.error('Error in finding users', error)
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to get Users', 500)
        }
    }

    SUserBlockUnblock = async(userId: string): Promise<BlockStatus> =>{
        try {
            const user = await this.userRepository.getById(userId);
            if (!user) {
                throw new CustomError('User not Found', 404)
            }
            user.isActive = !user.isActive
            await user.save()
            return user.isActive ? BlockStatus.UNBLOCK : BlockStatus.BLOCK
        } catch (error) {
            console.error("Error in SUserBlockUnblock", error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to block and Unblock', 500)
        }
    }


    private async scheduleTokenCleanup(userId: mongoose.Types.ObjectId, expiryTime: Date): Promise<void> {
        const timeUntilExpiry = new Date(expiryTime).getTime() - Date.now();
        setTimeout(async () => {
            try {
                await this.userRepository.clearResetToken(userId)
            } catch (error) {
                console.error('Error cleaning up expired token:', error);
            }
        }, timeUntilExpiry)
    }

}

export default UserService;



