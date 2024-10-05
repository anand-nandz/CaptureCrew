import { Response } from "express";
import jwt from 'jsonwebtoken' ;
import dotenv from 'dotenv' ;
dotenv.config() ;

const generateUserTokenAndSetCookie = async(userId : string , res:Response) : Promise<void> =>{

    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    if (!jwtSecretKey) {
        throw new Error('JWT_SECRET_KEY is not defined in the environment variables');
    }
    const token = jwt.sign({ userId }, jwtSecretKey, { expiresIn: '10d' });
    
    res.cookie('jwtUser',token,{
        maxAge : 10*24*60*60*1000,
        httpOnly : true ,
        sameSite : 'strict',
        secure : process.env.NODE_ENV === 'production'
 
    })
}

export default generateUserTokenAndSetCookie;