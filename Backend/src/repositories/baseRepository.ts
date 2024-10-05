import mongoose from "mongoose";

export class BaseRepository<T extends mongoose.Document>{
    private model:mongoose.Model<T>;

    constructor(model:mongoose.Model<T>){
        this.model =model;
    }
    
    async create(data:Partial<T>):Promise<T>{
        const newItem = new this.model(data) ;
        return await newItem.save() ;
    }
    
    async findByEmail(email:string) : Promise< T | null> {
        return await this.model.findOne({email})
    }
}