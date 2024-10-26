import Admin , { AdminDocument } from "../models/adminModel";
import { BaseRepository } from "./baseRepository";

class AdminRepository extends BaseRepository<AdminDocument>{
  constructor(){
    super(Admin)
  }
  async findByEmail(email:string): Promise<AdminDocument | null> {
    return await Admin.findOne({ email });
  }
}

export default new AdminRepository()




