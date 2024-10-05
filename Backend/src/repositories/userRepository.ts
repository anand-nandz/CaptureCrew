import  User,{ UserDocument } from "../models/userModel";
import { Document } from "mongoose";
import { BaseRepository } from "./baseRepository";


class UserRepository extends BaseRepository<UserDocument>{
    constructor(){
        super(User);
    }


}

export default new UserRepository();