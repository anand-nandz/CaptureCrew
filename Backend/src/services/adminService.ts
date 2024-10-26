import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { CustomError } from '../error/customError';
import userRepository from '../repositories/userRepository';
import vendorRepository from "../repositories/vendorRepository" ;
import adminRepository from '../repositories/adminRepository';


interface LoginResponse {
    refreshToken :string ;
    token :string ;
    adminData : object ;
    message :string
}


class  AdminService {
    async login(email:string , password:string) :Promise<LoginResponse> {
        try {
            const existingAdmin = await adminRepository.findByEmail(email);
            if(!existingAdmin) {
                throw new CustomError('Incorrect email',400) ;
            }
            else if(password !== existingAdmin.password){
                throw new CustomError('Incorrect Password',401)
            }

            const token = jwt.sign(
                {_id : existingAdmin._id},
                process.env.JWT_SECRET_KEY!,
                {expiresIn : '1h'}
            ) ;

            let { refreshToken }= existingAdmin ;
            if(!refreshToken || isTokenExpiringSoon(refreshToken)) {
                refreshToken = jwt.sign(
                    {_id:existingAdmin._id},
                    process.env.JWT_REFRESH_SECRET_KEY!,
                    { expiresIn: '1d' }
                )
                existingAdmin.refreshToken =  refreshToken ;
                await existingAdmin.save() ;
            }

            return {
                refreshToken,
                token,
                adminData :existingAdmin,
                message : 'Succesfully logged in'
            }

           
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError('Failed to login', 500);
        }
    }
}

export default new AdminService() ;



function isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as { exp: number };
      const expirationTime = decoded.exp * 1000; 
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Return true if token expires in less than 1 day
      return timeUntilExpiration < 24 * 60 * 60 * 1000;
    } catch (error) {
      return true; // If there's an error decoding, assume the token needs refresh
    }
  }