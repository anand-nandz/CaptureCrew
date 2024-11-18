import { Request, Response } from "express";
import generateOTP from "../utils/generateOtp";
import { handleError } from "../utils/handleError";
import { CustomError } from "../error/customError";
import userService, { GoogleUserData } from "../services/userService";
import userRepository from "../repositories/userRepository";
import Jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/userTypes";
import jwt from 'jsonwebtoken';
import vendorService from "../services/vendorService";


interface DecodedData {
    name: string;
    email: string;
    picture?: string;
    sub: string
}

interface UserSession {
    email: string;
    password: string;
    name: string;
    contactinfo: string;
    otpCode: string | undefined
    otpSetTimestamp: number | undefined;
    otpExpiry: number;
    resendTimer: number;
}

interface OTP {
    otp: string | undefined;
    email: string;
    otpSetTimestamp: number | undefined
}

declare module 'express-session' {
    interface Session {
        user?: UserSession;
    }
}



const OTP_EXPIRY_TIME = 2 * 60 * 1000;
const RESEND_COOLDOWN = 2 * 60 * 1000;

class UserController {
    async UserSignUp(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name, contactinfo } = req.body;
            const otpCode = await generateOTP(email);

            if (otpCode !== undefined) {
                const otpSetTimestamp = Date.now();
                const userData: UserSession = {
                    email: email,
                    password: password,
                    name: name,
                    contactinfo: contactinfo,
                    otpCode: otpCode,
                    otpSetTimestamp,
                    otpExpiry: otpSetTimestamp + OTP_EXPIRY_TIME,
                    resendTimer: otpSetTimestamp + RESEND_COOLDOWN
                };

                req.session.user = userData;

                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                        throw new CustomError('Error saving session', 500);
                    }

                    res.status(200).json({
                        message: `OTP sent to Email for Verification`,
                        email: email,
                        otpExpiry: userData.otpExpiry,
                        resendAvailableAt: userData.resendTimer
                    });
                });

            } else {
                throw new CustomError("Couldn't generate OTP", 500);
            }
        } catch (error) {
            handleError(res, error, 'UserSignUp')
        }
    }

    async VerifyOTP(req: Request, res: Response): Promise<void> {
        try {
            const { otp } = req.body;
            const userData = req.session.user;

            if (!userData) {
                throw new CustomError('Session expired. Please sign up again.', 400);
            }
            const currentTime = Date.now();

            if (currentTime > userData.otpExpiry) {
                throw new CustomError('OTP has expired. Please request a new one.', 400);
            }

            if (otp === userData.otpCode) {
                const user = await userService.signup(
                    userData.email,
                    userData.password,
                    userData.name,
                    userData.contactinfo,
                    res
                );
                delete req.session.user
                req.session.save((err) => {
                    if (err) console.error('Error saving session after clearing user data:', err);
                });

                res.status(201).json({ user, message: 'Account created successfully!' });
            } else {
                throw new CustomError('Invalid Otp !!', 400)
            }
        } catch (error) {
            handleError(res, error, 'VerifyOTP')
        }
    }

    async ResendOtp(req: Request, res: Response): Promise<void> {
        try {
            const userData: UserSession | undefined = req.session.user;

            if (!userData) {
                throw new CustomError('Session expired. Please sign up again.', 400);
            }
            const currentTime = Date.now();
            if (currentTime < userData.resendTimer) {
                const waitTime = Math.ceil((userData.resendTimer - currentTime) / 1000);
                throw new CustomError(`Please wait ${waitTime} seconds before requesting new OTP`, 429);
            }
            const newOtp = await userService.resendNewOtp(userData.email)

            req.session.user = {
                ...userData,
                otpCode: newOtp,
                otpSetTimestamp: currentTime,
                otpExpiry: currentTime + OTP_EXPIRY_TIME,
                resendTimer: currentTime + RESEND_COOLDOWN
            };

            res.status(200).json({
                message: 'New OTP sent to email',
                otpExpiry: currentTime + OTP_EXPIRY_TIME,
                resendAvailableAt: currentTime + RESEND_COOLDOWN
            });

        } catch (error) {
            handleError(res, error, 'ResendOtp')

        }
    }

    async googleSignUp(req: Request, res: Response): Promise<void> {
        try {

            const token = req.body.credential
            const decodedData = Jwt.decode(token) as DecodedData;


            if (!decodedData) {
                throw new CustomError('Invalid token', 400);
            }
            const { name, email, sub: googleId }: DecodedData = decodedData;

            const user = await userService.googleSignup({ name, email, googleId });

            if (user) {
                res.status(200).json({
                    success: true,
                    message: 'User saved successfully'
                }),
                    user
            }

        } catch (error) {
            handleError(res, error, 'googleSignUp')
        }
    }

    async googleAuth(req: Request, res: Response): Promise<void> {
        try {
            const { credential } = req.body
            const decodedToken = Jwt.decode(credential) as DecodedData;

            if (!decodedToken || !decodedToken.email) {
                throw new CustomError('Invalid Google token', 400)
            }

            const googleUserData: GoogleUserData = {
                email: decodedToken.email,
                name: decodedToken.name,
                googleId: decodedToken.sub,
                picture: decodedToken.picture
            }

            const { user, isNewUser, token, refreshToken } = await userService.authenticateGoogleLogin(googleUserData, res);
            if (user.isActive) {

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true, secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000
                })
                res.status(200).json({
                    user,
                    token,
                    message: isNewUser
                        ? 'Successfully signed up with Google'
                        : 'Successfully logged in with Google'
                });
            } else {

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true, secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000
                })
                res.status(200).json({
                    user,
                    token,
                });
            }


        } catch (error) {
            handleError(res, error, 'googleAuth')
        }
    }

    async Login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const { token, refreshToken, user, message } = await userService.login(email, password);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true, secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            res.status(200).json({ token, user, message })

        } catch (error) {
            handleError(res, error, 'Login')
        }
    }

    async CreateRefreshToken(req: Request, res: Response): Promise<void> {
        try {

            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                throw new CustomError('No refresh token provided', 401);
            }

            try {
                const newAccessToken = await userService.createRefreshToken(refreshToken);
                res.status(200).json({ token: newAccessToken });
            } catch (error) {
                if (error instanceof jwt.TokenExpiredError) {
                    res.clearCookie('refreshToken');
                    throw new CustomError('Refresh token expired', 401);
                }
                throw error;
            }



        } catch (error) {
            handleError(res, error, 'CreateRefreshToken')
        }
    }

    async UserLogout(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.status(200).json({ message: 'User logout Successfully...' })
        } catch (error) {
            handleError(res, error, 'UserLogout')
        }
    }

    async checkBlockStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?._id

            if (!userId) {
                throw new CustomError('User not found', 404)
            }
            const user = await userRepository.getById(userId.toString())
            if (!user) {
                throw new CustomError('User not found', 404)
            }

            if (!user.isActive) {
                res.status(403).json({
                    message: 'Blocked by Admin',
                    isBlocked: true
                })
                return
            }

            res.status(200).json({
                isBlocked: false
            });
        } catch (error) {
            handleError(res, error, 'checkBlockStatus');
        }
    }


    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body
            console.log(email);
            
            if (!email) {
                throw new CustomError('Email is required', 400);
            }

            await userService.handleForgotPassword(email)
            res.status(200).json({ message: 'Password reset link sent to your email' });

        } catch (error) {
            handleError(res, error, 'forgotPassword')
        }
    }

    async changeForgotPassword(req: Request, res: Response): Promise<void> {
        const { token } = req.params;
        const { password } = req.body;
        
        try {
            if (!token) {
                throw new CustomError('Session Expired', 400)
            } else if (!password) {
                throw new CustomError("Password required", 400)
            }

            let updated = await userService.newPasswordChange(token, password)
            res.status(200).json({ message: 'Password Reset Successfull' })

        } catch (error) {
            handleError(res, error, 'changePassword')
        }
    }

    async validateResetToken(req: Request, res: Response): Promise<void> {
        const { token } = req.params;
        try {
            if (!token) {
                throw new CustomError('Token is required', 400);
            }
            const isValid = await userService.validateToken(token);
            res.status(200).json({ isValid });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }

    async getUserProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?._id;

            if (!userId) {
                res.status(401).json({ message: 'User ID is missing' });
                return;
            }

            const result = await userService.getUserProfileService(userId.toString())
            
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'getUser');
        }
    }

    async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { name, contactinfo } = req.body
            const userId = req.user?._id;

            if (!userId) {
                res.status(400).json({ message: 'User ID is missing' });
                return;
            }

            if ((!name && !contactinfo && !req.file) ||
                (name === '' && contactinfo === '' && !req.file)) {
                res.status(400).json({
                    message: 'At least one field (name, contact info, or image) is required'
                });
                return;
            }

            const user = await userService.updateProfileService(name, contactinfo, userId, req.file || null)

            res.status(200).json({user});
        } catch (error) {
            handleError(res, error, 'updateProfile')
        }
    }

    async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { currentPassword, newPassword } = req.body
            const userId = req.user?._id;
            if (!userId) {
                res.status(400).json({ message: 'User ID is missing' });
                return;
            }
            const passwordCheck = await userService.passwordCheckUser(currentPassword, newPassword, userId)

            res.status(200).json({ message: "Password reset successfully." });
        } catch (error) {
            handleError(res, error, 'changePassword')
        }
    }

    
    // async getAllVendors(req:Request , res:Response) : Promise<void> {
    //     try {
    //         const page = parseInt(req.query.page as string) || 1
    //         const limit = parseInt(req.query.limit as string) || 6
    //         const search = req.query.search as string || '' ;
    //         const status = req.query.status as string;
    //         const result = await vendorService.getVendors(page, limit, search,status)
            
    //         res.status(200).json({
    //             vendors: result.vendors,
    //             totalPages : result.totalPages,
    //             currentPage : page,
    //             totalVendors : result.total
    //         })

    //     } catch (error) {
    //         handleError(res,error,'getAllUsers')
    //     }
    // }

    
    async getAllVendors(req:Request , res:Response) : Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 6
            const search = req.query.search as string || '' ;
            const status = req.query.status as string;
            const result = await vendorService.getVendors(page, limit, search,status)
            
            res.status(200).json({
                vendors: result.vendors,
                totalPages : result.totalPages,
                currentPage : page,
                totalVendors : result.total
            })

        } catch (error) {
            handleError(res,error,'getAllVendors')
        }
    }


}

export default new UserController()




