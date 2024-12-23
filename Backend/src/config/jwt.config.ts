import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const SECRET_KEY = process.env.JWT_SECRET_KEY as string;
const ACCESS_TOKEN_TIME = '1h' as string;

const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY as string;
const REFRESH_TOKEN_TIME = '7d' as string;


const createAccessToken = (_id: string): string => {
    return jwt.sign({_id}, SECRET_KEY, {expiresIn: ACCESS_TOKEN_TIME})
}

const createRefreshToken = (_id: string): string => {
    return jwt.sign({_id}, REFRESH_SECRET_KEY, {expiresIn: REFRESH_TOKEN_TIME})
}

const isTokenExpiringSoon = (token: string): boolean => {
    try {
        const decoded = jwt.decode(token) as { exp: number };
        const expirationTime = decoded.exp * 1000; 
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        return timeUntilExpiration < 7 * 24 * 60 * 60 * 1000;
    } catch (error) {
        return true; 
    }
};

export {createAccessToken, createRefreshToken, isTokenExpiringSoon}