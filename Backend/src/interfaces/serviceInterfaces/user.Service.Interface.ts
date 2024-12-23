import { BlockStatus } from "../../enums/commonEnums";
import { UserDocument } from "../../models/userModel";
import { GoogleUserData, ILoginResponse, User } from "../commonInterfaces";

export interface IUserService {
    login(email: string,password: string): Promise<ILoginResponse>;
    signup(email: string, password: string, name: string, contactinfo: string): Promise<User>; 
    resendNewOtp(email: string): Promise<string>;
    create_RefreshToken(refreshToken: string) : Promise<string>;
    checkBlock(userId: string): Promise<User>;
    handleForgotPassword(email: string): Promise<void>;
    newPasswordChange(token: string, password: string): Promise<void>;
    validateToken (token: string): Promise<boolean>;
    googleSignup({ email, name, googleId }: GoogleUserData): Promise<object>;
    authenticateGoogleLogin(userData: GoogleUserData): Promise<ILoginResponse>;
    getUserProfileService(email:string): Promise<UserDocument>;
    updateProfileService(name: string, contactinfo: string, userId: any, files: Express.Multer.File | null): Promise<UserDocument | null>;
    passwordCheckUser(currentPassword: string, newPassword: string, userId: any): Promise<void>;
    getSingleUser(userId: string): Promise<UserDocument>;
    getUsers(page: number, limit: number, search: string, status?: string): Promise<{users: UserDocument[], total: number, totalPages: number}>;
    SUserBlockUnblock(userId: string): Promise<BlockStatus>;
}