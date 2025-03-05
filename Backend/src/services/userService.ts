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
import HTTP_statusCode from '../enums/httpStatusCode';
import Messages from '../enums/errorMessage';


class UserService implements IUserService {

    private userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository
    }


    login = async (email: string, password: string): Promise<ILoginResponse> => {
        try {

            const existingUser = await this.userRepository.findByEmail(email);

            if (!existingUser) {
                throw new CustomError('User Not Exist!!..', HTTP_statusCode.Unauthorized)
            }

            const passwordMatch = await bcrypt.compare(
                password,
                existingUser.password || ''
            )

            if (!passwordMatch) {
                throw new CustomError('Incorrect Password', HTTP_statusCode.Unauthorized)
            }
            if (existingUser.isActive === false) {
                throw new CustomError('Blocked by Admin', HTTP_statusCode.NoAccess)
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
            throw new CustomError('Failed to login', HTTP_statusCode.InternalServerError)
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
                throw new CustomError('User already exists', HTTP_statusCode.NotFound);
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
            throw new CustomError('Failed to sign up new User', HTTP_statusCode.InternalServerError)
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
            throw new CustomError((error as Error).message || 'Failed to resend new Otp', HTTP_statusCode.InternalServerError);
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
                throw new CustomError('Invalid refresh Token', HTTP_statusCode.Unauthorized)
            }

            const accessToken = createAccessToken(user._id.toString())
            return accessToken;

        } catch (error) {
            console.error('Error while creatin refreshToken', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to create refresh Token', HTTP_statusCode.InternalServerError);
        }
    }

    checkBlock = async (userId: string): Promise<User> => {
        try {
            const user = await this.userRepository.getById(userId.toString())
            if (user) return user
            throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound)
        } catch (error) {
            console.error('Error while checking user ', error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to check block status', HTTP_statusCode.InternalServerError);
        }
    }

    handleForgotPassword = async (email: string): Promise<void> => {
        try {
            const user = await this.userRepository.findByEmail(email)
            if (!user) {
                throw new CustomError('User not exists', HTTP_statusCode.NotFound);
            }
            const resetToken = crypto.randomBytes(20).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);

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
            throw new CustomError('Failed to process forgot password request', HTTP_statusCode.InternalServerError);
        }
    }

    newPasswordChange = async (token: string, password: string): Promise<void> => {
        try {
            const user = await this.userRepository.findByToken(token);

            if (!user) {
                throw new CustomError('Invalid token', HTTP_statusCode.InternalServerError);
            }
            if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
                throw new CustomError('Password reset token has expired', HTTP_statusCode.InternalServerError);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            let updateSuccess = await this.userRepository.UpdatePasswordAndClearToken(user._id, hashedPassword);

            if (!updateSuccess) {
                throw new CustomError('Failed to Update password', HTTP_statusCode.InternalServerError)
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
            throw new CustomError('Failed to password', HTTP_statusCode.InternalServerError);
        }
    }

    validateToken = async (token: string): Promise<boolean> => {
        try {
            const user = await this.userRepository.findByToken(token)

            if (!user) {
                throw new CustomError('Invalid token', HTTP_statusCode.InternalServerError);
            }
            if (!user.resetPasswordExpires) {
                throw new CustomError('No reset token expiry date found', HTTP_statusCode.InternalServerError);
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
            throw new CustomError((error as Error).message || 'Failed to validate token', HTTP_statusCode.InternalServerError);
        }
    }

    googleSignup = async ({ email, name, googleId }: GoogleUserData): Promise<object> => {
        try {
            const existingUser = await this.userRepository.findByEmail(email);

            if (existingUser) {
                if (existingUser.isGoogleUser) return { user: existingUser };
                else {
                    throw new CustomError('Email already registered with different method', HTTP_statusCode.InternalServerError);
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
            throw new CustomError('Failed to SignIn using Google', HTTP_statusCode.InternalServerError)
        }
    }

    authenticateGoogleLogin = async (userData: GoogleUserData): Promise<ILoginResponse> => {
        try {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            let user: UserDocument;
            let isNewUser = false;
            if (existingUser?.isActive === false) {
                throw new CustomError('Blocked by Admin', HTTP_statusCode.NoAccess)
            }

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
            throw new CustomError('Failed to authenticate with Google', HTTP_statusCode.InternalServerError);
        }
    }

    getUserProfileService = async (userId: string): Promise<UserDocument> => {
        try {
            const user = await this.userRepository.getById(userId.toString());
            if (!user) {
                throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.InternalServerError);
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
            throw new CustomError((error as Error).message || 'Failed to get profile details', HTTP_statusCode.InternalServerError);
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
                throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound)
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
                    throw new CustomError('Failed to upload image to S3', HTTP_statusCode.InternalServerError);
                }
            }

            if (Object.keys(updateData).length === 0) {
                throw new CustomError('No changes to update', HTTP_statusCode.InternalServerError);
            }

            const updatedUser = await this.userRepository.update(userId, updateData)
            if (!updatedUser) {
                throw new CustomError('Failed to update user', HTTP_statusCode.InternalServerError);
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
            throw new CustomError("Failed to update profile.", HTTP_statusCode.InternalServerError);
        }
    }

    passwordCheckUser = async (currentPassword: string, newPassword: string, userId: any): Promise<void> => {
        try {
            const user = await this.userRepository.getById(userId.toString())
            if (!user) {
                throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound)
            }
            if (!user.password) {
                throw new CustomError("User password not set", HTTP_statusCode.InternalServerError)
            }

            const passwordMatch = await bcrypt.compare(
                currentPassword,
                user.password || ''
            )
            if (!passwordMatch) {
                throw new CustomError('Incorrect Password', HTTP_statusCode.Unauthorized)
            }

            if (currentPassword === newPassword) {
                throw new CustomError("Current and New Passwords can't be same", HTTP_statusCode.Unauthorized)
            }

            const salt = await bcrypt.genSalt(10);
            const newHashedPassword = await bcrypt.hash(newPassword, salt);
            const updateSuccess = await this.userRepository.UpdatePassword(userId, newHashedPassword)
            if (!updateSuccess) {
                throw new CustomError('Failed to update password', HTTP_statusCode.InternalServerError);
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
            throw new CustomError("Failed to changing password.", HTTP_statusCode.InternalServerError);
        }
    }


    getSingleUser = async (userId: string): Promise<UserDocument> => {
        try {
            const user = await this.userRepository.getById(userId)
            if (!user) {
                throw new CustomError('User Not Found', HTTP_statusCode.InternalServerError)
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
            throw new CustomError("Failed to get user", HTTP_statusCode.InternalServerError);
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
            throw new CustomError('Failed to get Users', HTTP_statusCode.InternalServerError)
        }
    }

    SUserBlockUnblock = async(userId: string): Promise<BlockStatus> =>{
        try {
            const user = await this.userRepository.getById(userId);
            if (!user) {
                throw new CustomError('User not Found', HTTP_statusCode.NotFound)
            }
            user.isActive = !user.isActive
            await user.save()
            return user.isActive ? BlockStatus.UNBLOCK : BlockStatus.BLOCK
        } catch (error) {
            console.error("Error in SUserBlockUnblock", error);
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to block and Unblock', HTTP_statusCode.InternalServerError)
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



