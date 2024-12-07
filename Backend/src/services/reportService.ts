import mongoose from "mongoose";
import { CustomError } from "../error/customError";
import { ReportReason, ReportStatus, ReportType } from "../models/reportModel";
import postRepository from "../repositories/postRepository";
import reportRepository from "../repositories/reportRepository";
import vendorRepository from "../repositories/vendorRepository";
import generateUniqueId from "../utils/extraUtils";

class Reportservice {
    async reportItems(
        reportedBy: string,
        itemId: string,
        type: ReportType,
        reason: ReportReason,
        additionalDetails?: string,
    ) {
        try {
    
            
            let reportedItem;
            if (type === ReportType.POST) {
                reportedItem = await postRepository.getById(itemId)
            } else if (type === ReportType.VENDOR) {
                reportedItem = await vendorRepository.getById(itemId)
            }

            if (!reportedItem) {
                throw new CustomError('Reported item not found', 404)
            }
            let reportId = generateUniqueId('ID');

            const report = await reportRepository.create({
                reportedBy: new mongoose.Types.ObjectId(reportedBy),
                reportId: reportId,
                reportedItem: {
                    itemId: new mongoose.Types.ObjectId(itemId),
                    type
                },
                reason,
                additionalDetails,
                status: ReportStatus.PENDING
            });

            if (type === ReportType.POST) {
                await postRepository.update(
                    itemId,
                    { $inc: { reportCount: 1 } as any},
                );
            } else if(type === ReportType.VENDOR ) {
                await vendorRepository.update(itemId,{
                    $inc: {reportCount: 1} as any,
                })
            }
            


            await report.save()
            return true



        } catch (error) {
            console.error('Error in reporting :', error)
            throw new CustomError('Failed to report it', 500)
        }

    }

    async getClientReports(page: number, limit: number, search: string, status?: string){
        try {
            const result = await reportRepository.findAllReports(page, limit, search, status);
            console.log(result);
            
            return result
        } catch (error) {
            console.error('Error in getting reports :', error)
            throw new CustomError('Failed to get report ', 500)
        }
    }
}

export default new Reportservice();
