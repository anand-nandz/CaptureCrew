import { NextFunction,Response } from "express";
import { AuthenticatedRequest } from "../types/userTypes";
import { CustomError } from "../error/customError";
import jwt from 'jsonwebtoken';
import UserRepository from "../repositories/userRepository";
import HTTP_statusCode from "../enums/httpStatusCode";
import Messages from "../enums/errorMessage";

const userRepository = new UserRepository(); 

export const  authMiddleware = async (req:AuthenticatedRequest, res:Response ,next :NextFunction)=>{
    try {
        const token = req.headers.authorization?.split(' ')[1]
        
        if(!token){
            throw new CustomError(Messages.AUTHENTICATION_REQUIRED,HTTP_statusCode.Unauthorized)
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as { _id: string };
            const user = await userRepository.getById(decoded._id);
            
            if (!user) {
                throw new CustomError(Messages.USER_NOT_FOUND, HTTP_statusCode.NotFound);
            }

            req.user = {
                _id: user._id
            };
            
            next();
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