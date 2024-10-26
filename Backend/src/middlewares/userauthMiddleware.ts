import { NextFunction,Response } from "express";
import { AuthenticatedRequest } from "../types/userTypes";
import { CustomError } from "../error/customError";
import jwt from 'jsonwebtoken';
import userRepository from "../repositories/userRepository";



export const authMiddleware = async (req:AuthenticatedRequest, res:Response ,next :NextFunction)=>{
    try {
        const token = req.headers.authorization?.split(' ')[1]
        
        if(!token){
            throw new CustomError('Authentication Required',401)
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as { _id: string };
            const user = await userRepository.getById(decoded._id);
            
            if (!user) {
                throw new CustomError('User not found', 404);
            }

            req.user = {
                _id: user._id
            };
            
            next();
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