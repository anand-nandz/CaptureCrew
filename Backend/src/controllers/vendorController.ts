import { Request, Response } from "express";
import generateOTP from "../utils/generateOtp";
import { handleError } from "../utils/handleError";
import { CustomError } from "../error/customError";
import vendorService from "../services/vendorService";
import vendorRepository from "../repositories/vendorRepository";
import { VendorRequest } from "../types/vendorTypes";
import jwt from 'jsonwebtoken';

interface VendorSession {
    otpSetTimestamp: number | undefined;
    email: string;
    password: string;
    name: string;
    city: string;
    contactinfo: string;
    companyName: string;
    about: string;
    otpCode: string | undefined
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
        vendor: VendorSession,
        otp: OTP | undefined
    }
}

const OTP_EXPIRY_TIME = 2 * 60 * 1000;
const RESEND_COOLDOWN = 2 * 60 * 1000;
class VendorController {

    async VendorSignUp(req: Request, res: Response): Promise<void> {
        try {
            const { email, name, password, city, contactinfo, companyName, about } = req.body;

            const existingVendor = await vendorRepository.findByEmail(email);
            if (existingVendor) throw new CustomError('Email already registered', 409);

            const otpCode = await generateOTP(email)

            if (otpCode !== undefined) {
                const otpSetTimestamp = Date.now();
                const vendorData: VendorSession = {
                    email: email,
                    password: password,
                    name: name,
                    contactinfo: contactinfo,
                    city: city,
                    companyName: companyName,
                    about: about,
                    otpCode: otpCode,
                    otpSetTimestamp,
                    otpExpiry: otpSetTimestamp + OTP_EXPIRY_TIME,
                    resendTimer: otpSetTimestamp + RESEND_COOLDOWN
                }
                req.session.vendor = vendorData
                req.session.save((err) => {
                    if (err) {
                        console.error('Session save error:', err);
                        throw new CustomError('Error saving session', 500);
                    }
                    res.status(200).json({
                        message: `OTP send to Email for Verification`,
                        email: email,
                        otpExpiry: vendorData.otpExpiry,
                        resendAvailableAt: vendorData.resendTimer
                    });
                })

            } else {
                res.status(500).json({
                    message: `Server Error,Couldn't generate Otp`
                })
            }
        } catch (error) {
            handleError(res, error, 'VendorSignUp')
        }
    }

    async VerifyOTP(req: Request, res: Response): Promise<void> {
        try {
            const otp = req.body.otp
            const { name, email, city, password, contactinfo, otpCode, companyName, about, otpExpiry, otpSetTimestamp } = req.session.vendor

            if (otp !== otpCode) {
                throw new CustomError('OTP expired , Try resend OTP!!', 400)
            }
            const currentTime = Date.now();
            if (currentTime > otpExpiry) {
                throw new CustomError('OTP has expired. Please request a new one.', 400);
            }

            if (otp === otpCode) {
                const { vendor, token } = await vendorService.signup(
                    email,
                    password,
                    name,
                    contactinfo,
                    city,
                    companyName,
                    about
                )
                res.status(201).json({ vendor, message: 'Account created successfully!' })
            }
        } catch (error) {
            handleError(res, error, 'VerifyOTP')
        }
    }


    async VendorLogin(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const { token, refreshToken, vendor, message } = await vendorService.login(email, password);

            res.cookie('jwtToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            res.status(200).json({ token, vendor, message })
        } catch (error) {
            handleError(res, error, 'VendorLogin')
        }
    }

    async VendorLogout(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie('jwtToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.status(200).json({ message: 'Vendor Logged out Succesfully' })
        } catch (error) {
            handleError(res, error, 'VendorLogout')
        }
    }

    async CreateRefreshToken(req: Request, res: Response): Promise<void> {
        try {
            const refreshToken = req.cookies.jwtToken;

            if (!refreshToken) {
                throw new CustomError('No refresh token provided', 401);
            }
            try {

                const newAccessToken = await vendorService.createRefreshToken(refreshToken);

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


    async checkBlockStatus(req: VendorRequest, res: Response): Promise<void> {
        try {
            const vendorId = req.vendor?._id
            if (!vendorId) {
                throw new CustomError('Vendor not found', 404)
            }
            const vendor = await vendorRepository.getById(vendorId.toString())
            if (!vendor) {
                throw new CustomError('Vendor not found', 404)
            }

            if (!vendor.isActive) {
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
            if (!email) {
                throw new CustomError('Email is required', 400);
            }

            await vendorService.handleForgotPassword(email)
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

            let updated = await vendorService.newPasswordChange(token, password)

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
            const isValid = await vendorService.validateToken(token);
            res.status(200).json({ isValid });
        } catch (error) {
            res.status(400).json({ message: (error as Error).message });
        }
    }


    async getVendorProfile(req: VendorRequest, res: Response): Promise<void> {
        try {
            const vendorId = req.vendor?._id;
            if (!vendorId) {
                res.status(400).json({ message: 'Vendor ID is missing' });
                return;
            }

            const result = await vendorService.getVendorProfileService(vendorId.toString())
            res.status(200).json(result);
        } catch (error) {
            handleError(res, error, 'getVendor'); // Error handling
        }
    }

    async updateProfile(req: VendorRequest, res: Response): Promise<void> {
        try {
            const { name, contactinfo, companyName, city, about } = req.body
            const vendorId = req.vendor?._id;

            if (!vendorId) {
                res.status(400).json({ message: 'Vendor ID is missing' });
                return;
            }
            if ((!name && !contactinfo && !companyName && !city && !about && !req.file) || (name === '' && contactinfo === '' && companyName === '' && city === '' && about === '' && !req.file)) {
                res.status(400).json({ message: 'At least one field (name or contact info) is required' });
                return;
            }

            const vendor = await vendorService.updateProfileService(name, contactinfo, companyName, city, about, req.file || null, vendorId)
            res.status(201).json(vendor);
        } catch (error) {
            handleError(res, error, 'updateProfile')
        }
    }

    
    async getPackages(req: VendorRequest, res: Response): Promise<void> {
        try {

            if (!req.vendor?._id) {
                throw new CustomError('Vendor not found in request', 401);
            }

            const vendorId = req.vendor?._id;
            const result = await vendorService.getPackages(vendorId)

            res.status(200).json({
                status: 'success',
                data: {
                    packages: result
                }
            });

        } catch (error) {
            handleError(res, error, 'getPackages')
        }
    }

    async createPackage(req: VendorRequest, res: Response): Promise<void> {
        try {
            const {
                serviceType,
                price,
                description,
                duration,
                photographerCount,
                videographerCount,
                features,
                customizationOptions
            } = req.body

            const vendorId = req.vendor?._id;
            console.log(req.body);
            if (!vendorId) {
                res.status(400).json({ message: 'VendorId is missing' });
                return
            }


            const createPackage = await vendorService.addNewPkg(
                serviceType,
                price,
                description,
                duration,
                photographerCount,
                videographerCount,
                features,
                customizationOptions,
                vendorId
            )
            console.log(createPackage, 'neewwwwwwwww package created');

            res.status(201).json(createPackage)

        } catch (error) {
            handleError(res, error, 'createPackage')
        }
    }


    async updatePackge(req: VendorRequest, res: Response): Promise<void> {
        try {
            const packageId = req.params.id;
            const vendorId = req.vendor?._id;

            const {
                serviceType,
                price,
                description,
                duration,
                photographerCount,
                videographerCount,
                features,
                customizationOptions
             } = req.body

            if (!vendorId) {
                res.status(400).json({ message: 'Vendor ID is missing' });
                return;
            }

            if (!packageId) {
                res.status(400).json({ message: 'Package ID is missing' });
                return;
            }

            
            const updatePackage = await vendorService.updatePkg(
                vendorId,
                packageId,
                serviceType,
                price,
                description,
                duration,
                photographerCount,
                videographerCount,
                features,
                customizationOptions
            )

            console.log(updatePackage,'updatd packageeeeeeeeeeeeeeeeeeeee');
            
            res.status(200).json({package:updatePackage})

        } catch (error) {
            handleError(res, error, 'updatePackge')
        }
    }


    async getVendorWithAll(req: VendorRequest, res: Response) : Promise<void> {
        try {
            const vendorId = req.vendor?._id
            if (!vendorId) {
                res.status(400).json({ message: 'Vendor ID is missing' });
                return;
            }

            const result =  await vendorService.getAllDetails(vendorId.toString())
            
            res.status(200).json({vendor: result})

        } catch (error) {
            handleError(res,error,'getVendorWithAll')
        }
    }

    async showUnavailableDates(req: VendorRequest, res: Response) : Promise<void> {
        try {
            const vendorId = req.vendor?._id ;             
            if(!vendorId){
                res.status(401).json({success: false, message: 'VendorId is missing'})
                return
            }

            const result = await vendorService.showDates(vendorId.toString())
            console.log(result,'res show');
            
            res.status(200).json({
                success: true,
                message: 'Data fetched succesfully',
                result
            })
        } catch (error) {
            handleError(res,error,'showUnavailableDates')
        }
    }

    async addUnavailableDates(req: VendorRequest, res: Response) : Promise<void> {
        try {
            const vendorId = req.vendor?._id ; 
            const {dates} =  req.body ; 
            console.log(dates,'dates');
            console.log(vendorId,'vendorId');
            
            if(!vendorId){
                res.status(401).json({success: false, message: 'VendorId is missing'})
                return
            }

            const result = await vendorService.addDates(dates,vendorId.toString())
            console.log(result,'result in controler');
            
            if(result.success){
                res.status(200).json({
                    success: true,
                    message: result.message,
                    addedDates: result.addedDates,
                    alreadyBookedDates: result.alreadyBookedDates
                })
            } 

            if(result.success === false) {
                res.status(200).json({
                    success: false,
                    message: result.message,
                    addedDates: [],
                    alreadyBookedDates: result.alreadyBookedDates
                });
            }
        } catch (error) {
            handleError(res, error, 'addUnavailableDates')
        }
    }


    async removeUnavailableDates(req: VendorRequest, res: Response): Promise<void> {
        try {
            const vendorId = req.vendor?._id;
            const { dates } = req.body;
            
            if (!vendorId) {
                res.status(401).json({ success: false, message: 'VendorId is missing' });
                return;
            }
    
            const result = await vendorService.removeDates(dates, vendorId.toString());
            
            res.status(200).json({
                success: true,
                message: 'Dates updated successfully',
                updatedDates: result.removedDates
            });
        } catch (error) {
            handleError(res, error, 'removeUnavailableDates');
        }
    }


    


}

export default new VendorController()