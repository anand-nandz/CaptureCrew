import { Request, Response } from "express";
import generateOTP from "../utils/generateOtp";
import { handleError } from "../utils/handleError";
import { CustomError } from "../error/customError";
import Jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/userTypes";
import jwt from 'jsonwebtoken';
import { GoogleUserData, IDecodedData, IUserSession } from "../interfaces/commonInterfaces";
import { IUserService } from "../interfaces/serviceInterfaces/user.Service.Interface";
import { IVendorService } from "../interfaces/serviceInterfaces/vendor.service.interface";
import { OTP_EXPIRY_TIME, RESEND_COOLDOWN } from "../enums/commonEnums";
import HTTP_statusCode from "../enums/httpStatusCode";

declare module 'express-session' {
    interface Session {
        user?: IUserSession;
    }
}
class UserController {

    private userService: IUserService;
    private vendorService: IVendorService;

    constructor(userService: IUserService,vendorService: IVendorService) {
        this.userService = userService;
        this.vendorService =vendorService
    }

    Login = async (req: Request, res: Response) => {

        try {
            const { email, password } = req.body;
            const serviceResponse = await this.userService.login(email, password);

            res.cookie('refreshToken', serviceResponse.refreshToken, {
                httpOnly: true, secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            res.status(HTTP_statusCode.OK).json({
                token: serviceResponse.token,
                user: serviceResponse.user,
                message: serviceResponse.message
            })

        } catch (error) {

            handleError(res, error, 'Login')
        }
    }

    UserLogout = async (req: Request, res: Response): Promise<void> => {
        try {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.status(HTTP_statusCode.OK).json({ message: 'User logout Successfully...' })
        } catch (error) {
            handleError(res, error, 'UserLogout')
        }
    }


    UserSignUp = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password, name, contactinfo } = req.body;
            const otpCode = await generateOTP(email);
            console.log(otpCode, 'otpcode');

            if (otpCode !== undefined) {
                const otpSetTimestamp = Date.now();
                const userData: IUserSession = {
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
                        throw new CustomError('Error saving session', HTTP_statusCode.InternalServerError);
                    }

                    res.status(HTTP_statusCode.OK).json({
                        message: `OTP sent to Email for Verification`,
                        email: email,
                        otpExpiry: userData.otpExpiry,
                        resendAvailableAt: userData.resendTimer
                    });
                });

            } else {
                throw new CustomError("Couldn't generate OTP", HTTP_statusCode.InternalServerError);
            }
        } catch (error) {
            handleError(res, error, 'UserSignUp')
        }
    }

    VerifyOTP = async (req: Request, res: Response): Promise<void> => {
        try {
            const { otp } = req.body;
            const userData = req.session.user;

            if (!userData) {
                throw new CustomError('Session expired. Please sign up again.', HTTP_statusCode.BadRequest);
            }
            const currentTime = Date.now();

            if (currentTime > userData.otpExpiry) {
                throw new CustomError('OTP has expired. Please request a new one.', HTTP_statusCode.BadRequest);
            }

            if (otp === userData.otpCode) {
                const user = await this.userService.signup(
                    userData.email,
                    userData.password,
                    userData.name,
                    userData.contactinfo,
                );

                delete req.session.user
                req.session.save((err) => {
                    if (err) console.error('Error saving session after clearing user data:', err);
                });


                res.status(201).json({ user, message: 'Account created successfully!' });
            } else {
                throw new CustomError('Invalid Otp !!', HTTP_statusCode.BadRequest)
            }
        } catch (error) {
            handleError(res, error, 'VerifyOTP')
        }
    }

    ResendOtp = async (req: Request, res: Response): Promise<void> => {
        try {
            const userData: IUserSession | undefined = req.session.user;            
            if (!userData) {
                throw new CustomError('Session expired. Please sign up again.', HTTP_statusCode.BadRequest);
            }
            const currentTime = Date.now();
            if (currentTime < userData.resendTimer) {
                const waitTime = Math.ceil((userData.resendTimer - currentTime) / 1000);
                throw new CustomError(`Please wait ${waitTime} seconds before requesting new OTP`, 429);
            }
            const newOtp: string = await this.userService.resendNewOtp(userData.email)

            req.session.user = {
                ...userData,
                otpCode: newOtp,
                otpSetTimestamp: currentTime,
                otpExpiry: currentTime + OTP_EXPIRY_TIME,
                resendTimer: currentTime + RESEND_COOLDOWN
            };

            res.status(HTTP_statusCode.OK).json({
                message: 'New OTP sent to email',
                otpExpiry: currentTime + OTP_EXPIRY_TIME,
                resendAvailableAt: currentTime + RESEND_COOLDOWN
            });

        } catch (error) {
            handleError(res, error, 'ResendOtp')

        }
    }

    create_RefreshToken = async (req: Request, res: Response): Promise<void> => {
        try {

            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                throw new CustomError('No refresh token provided', 401);
            }

            try {
                const newAccessToken = await this.userService.create_RefreshToken(refreshToken);
                res.status(HTTP_statusCode.OK).json({ token: newAccessToken });
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

    checkBlockStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?._id

            if (!userId) {
                throw new CustomError('User not found', 404)
            }
            const user = await this.userService.checkBlock(userId.toString())
            if (!user) {
                throw new CustomError('User not found', 404)
            }

            if (!user.isActive) {
                res.status(HTTP_statusCode.NoAccess).json({
                    message: 'Blocked by Admin',
                    isBlocked: true
                })
                return
            }
            res.status(HTTP_statusCode.OK).json({
                isBlocked: false
            });
        } catch (error) {
            handleError(res, error, 'checkBlockStatus');
        }
    }

    forgotPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body

            if (!email) {
                throw new CustomError('Email is required', HTTP_statusCode.BadRequest);
            }
            await this.userService.handleForgotPassword(email)
            res.status(HTTP_statusCode.OK).json({ message: 'Password reset link sent to your email' });

        } catch (error) {
            handleError(res, error, 'forgotPassword')
        }
    }

    changeForgotPassword = async (req: Request, res: Response): Promise<void> => {
        const { token } = req.params;
        const { password } = req.body;

        try {
            if (!token) {
                throw new CustomError('Session Expired', HTTP_statusCode.BadRequest)
            } else if (!password) {
                throw new CustomError("Password required", HTTP_statusCode.BadRequest)
            }

            await this.userService.newPasswordChange(token, password)
            res.status(HTTP_statusCode.OK).json({ message: 'Password Reset Successfull' })

        } catch (error) {
            handleError(res, error, 'changePassword')
        }
    }

    validateResetToken = async (req: Request, res: Response): Promise<void> => {
        const { token } = req.params;
        try {
            if (!token) {
                throw new CustomError('Token is required', HTTP_statusCode.BadRequest);
            }
            const isValid = await this.userService.validateToken(token);
            if (isValid) res.status(HTTP_statusCode.OK).json({ isValid });

        } catch (error) {
            res.status(HTTP_statusCode.BadRequest).json({ message: (error as Error).message });
        }
    }

    googleSignUp = async (req: Request, res: Response): Promise<void> => {
        try {

            const token = req.body.credential
            const decodedData = Jwt.decode(token) as IDecodedData;


            if (!decodedData) {
                throw new CustomError('Invalid token', HTTP_statusCode.BadRequest);
            }
            const { name, email, sub: googleId }: IDecodedData = decodedData;

            const user = await this.userService.googleSignup({ name, email, googleId });

            if (user) {
                res.status(HTTP_statusCode.OK).json({
                    success: true,
                    message: 'User saved successfully'
                }),
                    user
            }

        } catch (error) {
            handleError(res, error, 'googleSignUp')
        }
    }

    googleAuth = async (req: Request, res: Response): Promise<void> => {
        try {
            const { credential } = req.body
            const decodedToken = Jwt.decode(credential) as IDecodedData;

            if (!decodedToken || !decodedToken.email) {
                throw new CustomError('Invalid Google token', HTTP_statusCode.BadRequest)
            }

            const googleUserData: GoogleUserData = {
                email: decodedToken.email,
                name: decodedToken.name,
                googleId: decodedToken.sub,
                picture: decodedToken.picture
            }

            const { user, isNewUser, token, refreshToken } = await this.userService.authenticateGoogleLogin(googleUserData);
            if (user.isActive) {

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true, secure: process.env.NODE_ENV === 'production',
                    maxAge: 7 * 24 * 60 * 60 * 1000
                })
                res.status(HTTP_statusCode.OK).json({
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
                res.status(HTTP_statusCode.OK).json({
                    user,
                    token,
                });
            }


        } catch (error) {
            handleError(res, error, 'googleAuth')
        }
    }

    getUserProfile = async(req: AuthenticatedRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?._id;

            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'User ID is missing' });
                return;
            }

            const result = await this.userService.getUserProfileService(userId.toString())
            res.status(HTTP_statusCode.OK).json(result);
        } catch (error) {
            handleError(res, error, 'getUser');
        }
    }

    updateProfile = async(req: AuthenticatedRequest, res: Response): Promise<void> =>{
        try {
            const { name, contactinfo } = req.body
            const userId = req.user?._id;

            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'User ID is missing' });
                return;
            }

            if ((!name && !contactinfo && !req.file) ||
                (name === '' && contactinfo === '' && !req.file)) {
                res.status(HTTP_statusCode.BadRequest).json({
                    message: 'At least one field (name, contact info, or image) is required'
                });
                return;
            }

            const user = await this.userService.updateProfileService(name, contactinfo, userId, req.file || null)

            res.status(HTTP_statusCode.OK).json({user});
        } catch (error) {
            handleError(res, error, 'updateProfile')
        }
    }

    changePassword = async(req: AuthenticatedRequest, res: Response): Promise<void> =>{
        try {
            const { currentPassword, newPassword } = req.body

            const userId = req.user?._id;
            if (!userId) {
                res.status(HTTP_statusCode.BadRequest).json({ message: 'User ID is missing' });
                return;
            }
            await this.userService.passwordCheckUser(currentPassword, newPassword, userId)

            res.status(HTTP_statusCode.OK).json({ message: "Password reset successfully." });
        } catch (error) {
            handleError(res, error, 'changePassword')
        }
    }

    getUser = async(req:Request , res:Response) : Promise<void> =>{
        try {
            const userId: string = req.query.userId as string
            if(!userId){
                res.status(HTTP_statusCode.BadRequest).json({message:'UserId is missing'})
                return
            }

            const data = await this.userService.getSingleUser(userId)
            if(!data){
                res.status(HTTP_statusCode.BadRequest).json({message: "User not Found."})
            } else {
                res.status(HTTP_statusCode.OK).json({data: data})
            }

        } catch (error) {
            handleError(res,error,'getUser')
        }
    }

    getAllVendors= async(req:Request , res:Response) : Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 6
            const search = req.query.search as string || '' ;
            const status = req.query.status as string;
            const result = await this.vendorService.getVendors(page, limit, search,status)

            res.status(HTTP_statusCode.OK).json({
                vendors: result.vendors,
                totalPages : result.totalPages,
                currentPage : page,
                totalVendors : result.total
            })

        } catch (error) {
            handleError(res,error,'getAllVendors')
        }
    }

    getUsers = async(req: Request, res: Response): Promise<void> =>{
        try {
            const userId: string = req.query.userId as string
            if(!userId){
                res.status(HTTP_statusCode.BadRequest).json({message:'userId is missing'})
                return
            }

            const data = await this.userService.getSingleUser(userId)
            if(!data){
                res.status(HTTP_statusCode.BadRequest).json({message: "user not Found."})
            } else {
                res.status(HTTP_statusCode.OK).json({data: data})
            }
        } catch (error) {
            handleError(res,error,'getUsers')
        }
    }

    



}

export default UserController;




