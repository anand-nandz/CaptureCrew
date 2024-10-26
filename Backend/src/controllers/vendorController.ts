import { Request, Response } from "express";
import generateOTP from "../utils/generateOtp";
import { handleError } from "../utils/handleError";
import { CustomError } from "../error/customError";
import vendorService from "../services/vendorService";
import vendorRepository from "../repositories/vendorRepository";
import { strict } from "assert";
import { VendorRequest } from "../types/vendorTypes";

interface VendorSession {
    otpSetTimestamp: number | undefined;
    email: string;
    password: string;
    name: string;
    city: string;
    contactinfo: string;
    companyName : string ;
    about :string ;
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
            console.log("Vendor signup function entered");
            
            const { email, name, password, city, contactinfo,companyName,about } = req.body;
           
            const existingVendor = await vendorRepository.findByEmail(email) ;
            if(existingVendor) throw new CustomError('Email already registered',409);
            
            const otpCode = await generateOTP(email)
            console.log(otpCode,'otp in vendor cOntroller genreated');
            
            if (otpCode !== undefined) {
                const otpSetTimestamp = Date.now();
                const vendorData: VendorSession = {
                    email: email,
                    password: password,
                    name: name,                  
                    contactinfo: contactinfo,
                    city: city,
                    companyName:companyName,
                    about:about,
                    otpCode: otpCode,
                    otpSetTimestamp,
                    otpExpiry: otpSetTimestamp + OTP_EXPIRY_TIME,
                    resendTimer: otpSetTimestamp + RESEND_COOLDOWN
                }
                req.session.vendor =  vendorData
                req.session.save((err) => {
                    if(err){
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
            console.log("verify Otp  function entered");
            const otp = req.body.otp
            const { name, email, city, password, contactinfo, otpCode ,companyName,about,otpExpiry,otpSetTimestamp } = req.session.vendor
            console.log(otp,name,email,city,password,contactinfo,companyName,about,'in bverifyOtp');
            
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
                res.status(201).json({ vendor , message: 'Account created successfully!' })
            }
        } catch (error) {
            handleError(res, error, 'VerifyOTP')
        }
    }


    async VendorLogin(req:Request , res:Response) : Promise<void> {
        try {
            const {email,password} = req.body ;
            const  {refreshToken,token,vendor , message} = await vendorService.login(email,password) ;
            res.cookie('jwtToken',token , {
                httpOnly:true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000
            })
            res.status(200).json({token,refreshToken,vendor,message})
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({
                    message: error.message
                });
            } else {
                res.status(500).json({
                    message: 'Internal server error'
                });
            }
        }
    }

    async VendorLogout (req:Request ,res:Response): Promise<void>{
        try {
            res.clearCookie('jwtToken',{
                httpOnly :true,
                secure : process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.status(200).json({message:'Vendor Logged out Succesfully'})
        } catch (error) {
            handleError(res, error, 'VendorLogout')
        }
    }

    async CreateRefreshToken(req:Request,res:Response): Promise<void>{
        try {
            if(req.cookies?.jwtToken){

                const refreshToken = req.cookies.jwtToken;

                const token = await vendorService.createRefreshToken(refreshToken) ;

                res.status(200).json({token})
            }
        } catch (error) {
            handleError(res, error, 'CreateRefreshToken')
        }
    }

    
    async checkBlockStatus(req:VendorRequest ,res:Response) : Promise<void> {
        try {
            const vendorId =  req.vendor?._id
            if(!vendorId){
                throw new CustomError('Vendor not found',404)
            }
            const vendor = await vendorRepository.getById(vendorId.toString())
            if(!vendor){
                throw new CustomError('Vendor not found',404)
            }

            if(!vendor.isActive){
                res.status(403).json({
                    message: 'Blocked by Admin',
                    isBlocked :true
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
            console.log(updated, 'updated');

            res.status(200).json({ message: 'Password Reset Successfull' })

        } catch (error) {
            handleError(res, error, 'changePassword')
        }
    }

    async validateResetToken(req: Request, res: Response): Promise<void> {
        const { token } = req.params;
        console.log(token,'token in venodr controler');
        
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


    async getVendor(req: VendorRequest, res: Response): Promise<void> {
        try {
            const vendorId = req.vendor?._id; 
            console.log('Vendor ID from request:', vendorId);

            if (!vendorId) {
                res.status(400).json({ message: 'Vendor ID is missing' });
                return;
            }

            const vendor = await vendorRepository.getById(vendorId.toString());
            console.log('Retrieved Vendor:', vendor);

            if (!vendor) {
                res.status(404).json({ message: 'Vendor not found' });
                return;
            }

            res.status(200).json(vendor); // Return user data
        } catch (error) {
            handleError(res, error, 'getVendor'); // Error handling
        }
    }

    async updateProfile(req: VendorRequest, res: Response): Promise<void> {
        try {
            const { name, contactinfo, companyName , city , about } = req.body
            console.log(name, contactinfo, companyName , city , about ,'in update')
            const vendorId = req.vendor?._id;
            if (!vendorId) {
                res.status(400).json({ message: 'Vendor ID is missing' });
                return;
            }

            if ((!name && !contactinfo && !companyName && !city && !about) || (name === '' && contactinfo === '' && companyName === '' && city === '' && about === '')) {
                res.status(400).json({ message: 'At least one field (name or contact info) is required' });
                return;
            }
            const updateData: { 
                name?: string;
                contactinfo?: string;
                companyName?: string;
                city?: string;
                about?: string;
             } = {};
            if (name !== undefined && name !== '') updateData.name = name;
            if (contactinfo !== undefined && contactinfo !== '') updateData.contactinfo = contactinfo;
            if (companyName !== undefined && companyName !== '') updateData.companyName = companyName;
            if (city !== undefined && city !== '') updateData.city = city;
            if (about !== undefined && about !== '') updateData.about = about;
            const vendor = await vendorService.updateProfile(updateData, vendorId)
            res.status(201).json(vendor);
        } catch (error) {
            handleError(res, error, 'updateProfile')
        }
    }

}

export default new VendorController()