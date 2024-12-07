import { BaseRepository } from "./baseRepository";
import Report, { IReport } from "../models/reportModel";
import { string } from "yup";

class ReportRepository extends BaseRepository<IReport> {
  constructor() {
    super(Report);
  }

  async findAllReports(page: number, limit: number, search: string, status?: string) {
    try {
      const skip = (page - 1) * limit;

      let query: { [key: string]: any } = {}

      if (search) {
        query = {
          $or: [
            { reportId: { $regex: search, $options: 'i' } },
          ]
        }
      }

      if (status) {
        query.isActive = status === 'active'
    }

      const total = await Report.countDocuments(query);
      const reports = await Report.find(query)
        .populate({
          path: 'reportedBy', 
          select: '_id name email'
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })

      return {
        reports,
        total,
        totalPages: Math.ceil(total / limit)
      }

    } catch (error) {
      throw error
    }
  }

}

export default new ReportRepository();
