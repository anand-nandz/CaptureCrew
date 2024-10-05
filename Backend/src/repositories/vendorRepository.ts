import  Vendor,{ VendorDocument } from "../models/vendorModel";
import { Document } from "mongoose";
import { BaseRepository } from "./baseRepository";


class VendorRepository extends BaseRepository<VendorDocument>{
    constructor(){
        super(Vendor);
    }


}

export default new VendorRepository();