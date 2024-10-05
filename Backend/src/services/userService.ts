import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserDocument } from '../models/userModel';
import { CustomError } from '../error/customError';
import userRepository from '../repositories/userRepository';
import generateUserTokenAndSetCookie from '../utils/generateUserTokenAndSetCookie';
import { Response } from 'express';


export interface GoogleUserData {
    email: string;
    name: string;
    googleId: string;
    picture?: string;
  }

interface LoginResponse {
    user: UserDocument;
    message: string
    isNewUser: boolean;
    token: string;
    refreshToken: string;
}

class UserService {
    async signup(
        email: string,
        password: string,
        name: string,
        contactinfo: number,
        res: Response,
    ): Promise<object> {
        try {
            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                throw new CustomError('User already exists', 404);
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const isActive: boolean = true;
            const newUser = await userRepository.create({
                email,
                password: hashedPassword,
                name,
                contactinfo,
                isActive,
                
            })
            generateUserTokenAndSetCookie(newUser._id.toString(), res);
            return { user: newUser }
        } catch (error) {
            console.error('Error in signup', error);
            throw new CustomError('Failed to sign up new User', 500)
        }
    }

    async googleSignup({ email, name, googleId }: GoogleUserData) : Promise<object> {
        try {
            const existingUser = await userRepository.findByEmail(email) ;

            if(existingUser){
                if(existingUser.isGoogleUser) return { user: existingUser };
                else{
                    throw new CustomError('Email already registered with different method', 400);
                }
                
            }
            
            const newUser = await userRepository.create({
                email,
                googleId,
                name,
                isActive :true,
                isGoogleUser: true,
            });
            return { user: newUser }
        } catch (error) {
            console.error('Error in signup using google',error)
            throw new CustomError('Failed to SignIn using Google',500)
        }
    }


    async authenticateGoogleLogin (userData : GoogleUserData , res: Response) :Promise<LoginResponse>{
        try {
            const existingUser = await userRepository.findByEmail(userData.email) ;
            let user: UserDocument ;
            let isNewUser = false ; 

            if(existingUser){
                if(!existingUser.isGoogleUser){
                    existingUser.isGoogleUser = true ;
                    existingUser.googleId = userData.googleId ;
                    if(userData.picture) existingUser.imageUrl = userData.picture ;
                    user = await existingUser.save()
                }else{
                    user = existingUser ;
                }
            }else{
                user = await userRepository.create({
                    email: userData.email,
                    name: userData.name,
                    googleId: userData.googleId,
                    isGoogleUser: true,
                    imageUrl: userData.picture,
                    isActive: true
                  });
                  isNewUser = true;
            }

            const token = jwt.sign(
                {_id : user._id},
                process.env.JWT_SECRET_KEY!,
                {expiresIn : '1h'}
            ) ;

            const refreshToken = jwt.sign(
                { _id: user._id },
                process.env.JWT_REFRESH_SECRET_KEY!,
                { expiresIn: '1d' }
              );

              user.refreshToken = refreshToken;
            await user.save();
            await generateUserTokenAndSetCookie(user._id.toString(), res);

            return {
              user,
              isNewUser,
              token,
              refreshToken,
              message : 'Google authenticate successfull'
            };

        } catch (error) {
            console.error('Error in Google authentication:', error);
            throw new CustomError('Failed to authenticate with Google', 500);
        }
    }

    async login(email :string ,password:string): Promise<LoginResponse>{
        try {
            const existingUser = await userRepository.findByEmail(email) ;
            
            if(!existingUser){
                throw new CustomError('User Not Exist!!..',404)
            }
            
            const passwordMatch = await bcrypt.compare(
                password,
                existingUser.password || ''
            )

            if(!passwordMatch){
                throw new CustomError('Incorrect Password',401)
            } else if (existingUser.isActive === false){
                throw new CustomError('Blocked by Admin',404)
            }

            const token  = jwt.sign(
                {_id:existingUser._id},
                process.env.JWT_SECRET_KEY!,
                {
                    expiresIn:'1h'
                }
            )

            const refreshToken  = jwt.sign(
                {_id:existingUser._id},
                process.env.JWT_REFRESH_SECRET_KEY!,
                {
                    expiresIn:'1d'
                }
            )
            existingUser.refreshToken = refreshToken ; 
            await existingUser.save()

            return{
                token,
                refreshToken,
                isNewUser : false,
                user:existingUser,
                message: 'Succesfully Logged in'
            }

        } catch (error) {
            console.error('Error in Login',error)
            throw new CustomError('Failed to login',500)
        }
    }



}

export default new UserService();