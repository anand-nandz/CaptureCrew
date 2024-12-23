import mongoose from "mongoose";
import { UserDocument } from "../../models/userModel";

export interface IUserRepository {
    findByEmail(email:string) : Promise< UserDocument | null>;
    create(data: Partial<UserDocument>): Promise<UserDocument>;
    update(id: string, data: Partial<UserDocument>): Promise<UserDocument | null>;
    getById(id: string): Promise<UserDocument | null>; 
    clearResetToken(userId:mongoose.Types.ObjectId) : Promise<void>;
    findByToken(resetPasswordToken:string) : Promise< UserDocument | null>;
    UpdatePasswordAndClearToken(userId:mongoose.Types.ObjectId, hashedPassword:string) : Promise<boolean>;
    UpdatePassword(userId:mongoose.Types.ObjectId, hashedPassword:string) : Promise<boolean>;
    updateUserWallet(userId: string, walletUpdate: object): Promise<void>;
    findAllUsers(page: number, limit: number, search: string, status?:string): Promise<{users: UserDocument[], total: number, totalPages: number}>;

}