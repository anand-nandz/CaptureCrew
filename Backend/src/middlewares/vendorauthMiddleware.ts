import { NextFunction, Response } from "express";
import { CustomError } from "../error/customError";
import jwt from 'jsonwebtoken';
import { VendorRequest } from "../types/vendorTypes";
import vendorRepository from "../repositories/vendorRepository";



export const vendorMiddleware = async (req: VendorRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            throw new CustomError('Authentication Required', 401)
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as { _id: string }
            const vendor = await vendorRepository.getById(decoded._id);
            if (!vendor) {
                throw new CustomError('Vendor not found', 404);
            }

            req.vendor = {
                _id: vendor._id
            }
            next()
        } catch (jwtError) {
            if (jwtError instanceof jwt.TokenExpiredError) {
                res.status(401).json({ message: 'Token expired', expired: true });
            } else {
                res.status(401).json({ message: 'Invalid token' });
            }
        }

    } catch (error) {
        next(error);
    }
}