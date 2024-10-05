import { Request, Response } from "express";
import generateOTP from "../utils/generateOtp";
import { handleError } from "../utils/handleError";
import { CustomError } from "../error/customError";
import Jwt from "jsonwebtoken";
import exp from "constants";
import vendorService from "../services/vendorService";
import vendorRepository from "../repositories/vendorRepository";

interface VendorSession {
    otpSetTimestamp: number | undefined;
    email: string;
    password: string;
    name: string;
    city: string;
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
        vendor: VendorSession,
        otp: OTP | undefined
    }
}

class VendorController {
    async VendorSignUp(req: Request, res: Response): Promise<void> {
        try {
            console.log("Vendore signup function entered");
            
            const { email, name, password, city, contactinfo } = req.body;
           
            const existingVendor = await vendorRepository.findByEmail(email) ;
            if(existingVendor) throw new CustomError('Email already registered',409);
            
            const otpCode = await generateOTP(email)
            console.log(otpCode,'otp in vendor cOntroller genreated');
            
            if (otpCode !== undefined) {
                req.session.vendor = {
                    email: email,
                    password: password,
                    name: name,
                    city: city,
                    contactinfo: parseInt(contactinfo),
                    otpCode: otpCode,
                    otpSetTimestamp: Date.now(),
                }
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
            handleError(res, error, 'VendorSignUp')
        }
    }

    async VerifyOTP(req: Request, res: Response): Promise<void> {
        try {
            console.log("verify Otp  function entered");
            const otp = req.body.otp
            const { name, email, city, password, contactinfo, otpCode } = req.session.vendor
            console.log(otp,name,email,city,password,contactinfo,'in bverifyOtp');
            
            if (otp !== otpCode) {
                throw new CustomError('OTP expired , Try resend OTP!!', 400)
            }

            if (otp === otpCode) {
                const { vendor, token } = await vendorService.signup(
                    email,
                    password,
                    name,
                    contactinfo,
                    city,
                )
                res.status(201).json({ vendor })
            }
        } catch (error) {
            handleError(res, error, 'VerifyOTP')
        }
    }


    async VendorLogin(req:Request , res:Response) : Promise<void> {
        try {
            const {email,password} = req.body ;
            const  {refreshToken,token,vendor , message} = await vendorService.login(email,password) ;
            res.cookie('jwtToken',token , {httpOnly:true})
            res.status(200).json({token,refreshToken,vendor,message})
        } catch (error) {
            handleError(res, error, 'VendorLogin')
        }
    }

    async VendorLogout (req:Request ,res:Response): Promise<void>{
        try {
            res.clearCookie('jwtToken')
            res.status(200).json({message:'Vendor Logged out Succesfully'})
        } catch (error) {
            handleError(res, error, 'VendorLogin')
        }
    }
}

export default new VendorController()