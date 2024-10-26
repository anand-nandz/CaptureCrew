import { Request, Response } from "express";
import dotenv from 'dotenv';
import user from '../models/userModel'
import { handleError } from "../utils/handleError";
import adminService from "../services/adminService";
import userService from "../services/userService";
import vendorService from "../services/vendorService";
import { AcceptanceStatus } from "../models/vendorModel";
dotenv.config();

class AdminController {
    constructor() {
        this.AdminLogin = this.AdminLogin.bind(this);  // Bind the method to the class context
    }

    async AdminLogin(req: Request, res: Response) : Promise<void> {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ message: 'Email and Password are required!' });
                return
            }

            const { refreshToken, token, adminData, message } = await adminService.login(email, password);

            res.cookie('jwtToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3600000
            });
            res.status(200).json({ refreshToken, token, adminData, message });
        } catch (error) {
            handleError(res, error, 'AdminLogin');
        }
    }


    async AdminLogout (req:Request , res:Response) : Promise<void>{
       try {
        res.clearCookie('jwtToken',{
            httpOnly :true,
            secure : process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })
        res.status(200).json({ message: 'Admin logout Successfully...' })
       } catch (error) {
        handleError(res, error, 'AdminLogout');
       }
    }


    async getAllUsers(req:Request , res:Response) : Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1
            const limit = parseInt(req.query.limit as string) || 6
            const search = req.query.search as string || '' ;
            const status = req.query.status as string;
            const result = await userService.getUsers(page, limit, search,status)
            res.status(200).json({
                users: result.users,
                totalPages : result.totalPages,
                currentPage : page,
                totalUsers : result.total
            })

        } catch (error) {
            handleError(res,error,'getAllUsers')
        }
    }




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
            handleError(res,error,'getAllUsers')
        }
    }


    async UserBlockUnblock(req:Request,res:Response): Promise <void> {
       try {
        const userId :string | undefined  = req.query.userId as string | undefined ;
        if(!userId){
            res.status(400).json({message:'UserId is missing or invalid'})
            return
        }
        await userService.SUserBlockUnblock(userId)
        let proceesHandle = await user.findOne({_id: userId})
        res.status(200).json({
            message: 'User block/unblock status updated succesfully.',
            proceesHandle: !proceesHandle?.isActive ? 'block' : 'unblock'
        })
       } catch (error) {
        handleError(res,error,'UserBlockUnblock')
       }
    }

    async VendorBlockUnblock(req:Request,res:Response): Promise <void> {
        try {
         const vendorId :string | undefined  = req.query.vendorId as string | undefined ;
         if(!vendorId){
             res.status(400).json({message:'VendorId is missing or invalid'})
             return
         }
         await vendorService.SVendorBlockUnblock(vendorId)
         let proceesHandle = await user.findOne({_id: vendorId})
         res.status(200).json({
             message: 'Vendor block/unblock status updated succesfully.',
             proceesHandle: !proceesHandle?.isActive ? 'block' : 'unblock'
         })
        } catch (error) {
         handleError(res,error,'VendorBlockUnblock')
        }
     }
 

    async VerifyVendor(req:Request ,res:Response) : Promise <void> {
        try {
            const {vendorId} = req.params ;
            const {status} = req.body as {status : AcceptanceStatus}
            if(!vendorId) {
                res.status(400).json({message : 'Invalid vendorId'})
                return
            }
            const result = await vendorService.verifyVendor(vendorId, status);

            if (result.success) {
                res.status(200).json({ message: result.message });
              } else {
                res.status(400).json({ message: result.message });
              }
        } catch (error) {
            handleError(res,error,'VerifyVendor')
        }
    }




    
}

export default new AdminController();




