import { CustomError } from "../error/customError"
// import { VendorDocument } from "../models/vendorModel";
import vendorRepository from "../repositories/vendorRepository" ;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface VendorLoginResponse {
    vendor : object,
    message : string ,
    isNewVendor : boolean ,
    token : string ,
    refreshToken : string 
}


class VendorService {
    async signup(
        email:string,
        password:string,
        name: string,
        contactinfo:number,
        city :string,
    ){
        try {
            const existingVendor = await vendorRepository.findByEmail(email) ;
            if(existingVendor) throw new CustomError('Vendor already exists',409) ;
            const salt =  await bcrypt.genSalt(10) ;
            const hashedPassword = await bcrypt.hash(password,salt);

            const newVendor = await vendorRepository.create({
                email ,
                password : hashedPassword ,
                name ,
                contactinfo ,
                city :toTitleCase(city),
                isActive : true ,
                isVerified : false ,
                verificationRequest : false ,
                totalBooking : 0
            })

            console.log(newVendor,'new vendor  in vemdpr Sevice added');
            
            const token = jwt.sign(
                {_id : newVendor._id},
                process.env.JWT_SECRET_KEY!,
                {expiresIn : '1h'}
            ) ;

            const refreshToken = jwt.sign(
                { _id: newVendor._id },
                process.env.JWT_REFRESH_SECRET_KEY!,
                { expiresIn: '1d' }
              );

              return {vendor:newVendor ,token}
        } catch (error) {
            console.log('Error in Signup',error)
            throw new CustomError('Failed to create a New Vendor',500)
        }
    }
    

    async login(email:string ,password : string): Promise <VendorLoginResponse>{
        try {
            const existingVendor = await vendorRepository.findByEmail(email) ;

            if(!existingVendor) throw new CustomError('Vendor not Registered',404) ;

            const passwordMatch = await bcrypt.compare(
                password,
                existingVendor.password || ''
            )

            if(!passwordMatch) throw new CustomError('Incorrect Password',401) 
                else if(existingVendor.isActive === false) throw new CustomError('Blocked by Admin',404) ;

            const token  = jwt.sign(
                {_id:existingVendor._id},
                process.env.JWT_SECRET_KEY!,
                {
                    expiresIn:'1h'
                }
            )


            const refreshToken  = jwt.sign(
                {_id:existingVendor._id},
                process.env.JWT_REFRESH_SECRET_KEY!,
                {
                    expiresIn:'1d'
                }
            )

            existingVendor.refreshToken = refreshToken 
            await existingVendor.save()

            return {
                refreshToken,
                token,
                isNewVendor : false ,
                vendor : existingVendor ,
                message : 'Successfully logged in...'
            }




        } catch (error) {
            console.log('Error in login',error)
            throw new CustomError('Failed to login',500)
        }
    }
}

function toTitleCase(city: string): string {
    return city.toLowerCase().split(' ').map(word=>{
        return word.charAt(0).toUpperCase() + word.slice(1)
    }).join(' ')
}

export default new VendorService();
