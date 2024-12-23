import mongoose from "mongoose";
import { IBaseRepository } from "../interfaces/base.repository.interface";

export abstract class BaseRepository<T extends mongoose.Document> implements IBaseRepository<T>{
    private model:mongoose.Model<T>;

    constructor(model:mongoose.Model<T>){
        this.model =model;
    }
    
    async create(data:Partial<T>):Promise<T>{
        const newItem = new this.model(data) ;
        return await newItem.save() ;
    }
    
    async findByEmail(email:string) : Promise< T | null> {
        email = email.toLowerCase()
        return await this.model.findOne({email})
    }

    async update(id:string,data:Partial<T>):Promise<T|null>{
        return await this.model.findByIdAndUpdate(id,data)
    }
    
    async findOne(condition: Record<string, unknown>): Promise<T | null> {
        return await this.model.findOne(condition);
    }

    async findByToken(resetPasswordToken:string) : Promise< T | null> {
        return await this.model.findOne({resetPasswordToken})
    }

    async getById(id:string) : Promise<T | null> {
        return await this.model.findById(id)
    }

    findByCondition = async(condition:Record<string, unknown>): Promise<T[]> => {
        return await this.model.find(condition)
    }
}