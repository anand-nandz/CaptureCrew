import { Request, Response } from "express";
import generateOTP from "../utils/generateOtp";
import { handleError } from "../utils/handleError";
import { CustomError } from "../error/customError";
import userService, { GoogleUserData } from "../services/userService";
import { app } from "../app";
import userRepository from "../repositories/userRepository";
import Jwt from "jsonwebtoken";

interface DecodedData {
    name: string;
    email: string;
    picture?: string;
    sub: string
}

interface UserSession {
    otpSetTimestamp: number | undefined;
    email: string;
    password: string;
    name: string;
    contactinfo: number;
    otpCode: string | undefined
}

interface OTP {
    otp: string | undefined;
    email: string;
    otpSetTimestamp: number | undefined
}

declare module 'express-session' {
    interface Session {
        user: UserSession,
        otp: OTP | undefined
    }
}


class UserController {
    async UserSignUp(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name, contactinfo } = req.body;
            const otpCode = await generateOTP(email);

            if (otpCode !== undefined) {
                req.session.user = {
                    email: email,
                    password: password,
                    name: name,
                    contactinfo: parseInt(contactinfo),
                    otpCode: otpCode,
                    otpSetTimestamp: Date.now(),
                };

                res.status(200).json({
                    message: `OTP send to Email for Verification`,
                    email: email,
                });

            } else {
                res.status(500).json({
                    message: `Server Error,Couldn't generate Otp`
                })

            }
        } catch (error) {
            handleError(res, error, 'UserSignUp')
        }
    }
     
    async VerifyOTP(req: Request, res: Response): Promise<void> {
        try {
            const otp = req.body.otp
            const { email, name, password, contactinfo, otpCode } = req.session.user

            if (!otpCode) {
                throw new CustomError('OTP Expired .... Try resend OTP !! ', 400)
            }
            if (otp === otpCode) {
                const user = await userService.signup(email, password, name, contactinfo, res);

                res.status(201).json(user);
            } else {
                throw new CustomError('Invalid Otp !!', 400)
            }
        } catch (error) {
            handleError(res, error, 'VerifyOTP')
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
            res.status(200).json({
                user,
                token,
                refreshToken,
                message: isNewUser
                    ? 'Successfully signed up with Google'
                    : 'Successfully logged in with Google'
            });

        } catch (error) {
            handleError(res, error, 'googleAuth')
        }
    }

    async Login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            const { token, refreshToken, user, message } = await userService.login(email, password);

            res.cookie('jwtToken', token, { httpOnly: true })
            res.status(200).json({ token, refreshToken, user, message })

        } catch (error) {
            handleError(res, error, 'Login')
        }
    }

    async UserLogout(req: Request, res: Response): Promise<void> {
        try {
            res.cookie('jwtToken', '', { maxAge: 0 })
            res.status(200).json({ message: 'User logout Successfully...' })
        } catch (error) {
            handleError(res, error, 'UserLogout')
        }
    }
}

export default new UserController()