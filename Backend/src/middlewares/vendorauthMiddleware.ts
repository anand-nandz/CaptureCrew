import { NextFunction, Response } from "express";
import { CustomError } from "../error/customError";
import jwt from 'jsonwebtoken';
import { VendorRequest } from "../types/vendorTypes";
import VendorRepository from "../repositories/vendorRepository";
import HTTP_statusCode from "../enums/httpStatusCode";
import Messages from "../enums/errorMessage";

const vendorRepository = new VendorRepository()

export const vendorMiddleware = async (req: VendorRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            throw new CustomError(Messages.AUTHENTICATION_REQUIRED, HTTP_statusCode.Unauthorized)
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as { _id: string }
            const vendor = await vendorRepository.getById(decoded._id);
            if (!vendor) {
                throw new CustomError(Messages.VENDOR_NOT_FOUND, HTTP_statusCode.NotFound);
            }

            req.vendor = {
                _id: vendor._id
            }
            next()
        } catch (jwtError) {
            if (jwtError instanceof jwt.TokenExpiredError) {
                res.status(HTTP_statusCode.Unauthorized).json({ message: 'Token expired', expired: true });
            } else {
                res.status(HTTP_statusCode.Unauthorized).json({ message: Messages.INVALID_TOKEN });
            }
        }

    } catch (error) {
        next(error);
    }
}