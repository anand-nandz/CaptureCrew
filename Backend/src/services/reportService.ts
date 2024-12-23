import mongoose from "mongoose";
import { CustomError } from "../error/customError";
import generateUniqueId from "../utils/extraUtils";
import { ReportReason, ReportStatus, ReportType } from "../interfaces/commonInterfaces";
import { IVendorRepository } from "../interfaces/repositoryInterfaces/vendor.Repository.interface";
import { IPostRepository } from "../interfaces/repositoryInterfaces/post.repository.interface";
import { IReportRepository } from "../interfaces/repositoryInterfaces/report.Repository.Interfaces";
import { IReport } from "../models/reportModel";
import { IReportService } from "../interfaces/serviceInterfaces/report.Service.Interface";

class Reportservice implements IReportService {

    private reportRepository: IReportRepository;
    private vendorRepository: IVendorRepository;
    private postRepository: IPostRepository;

    constructor(
        reportRepository: IReportRepository,
        vendorRepository: IVendorRepository,
        postRepository: IPostRepository
    ) {
        this.reportRepository = reportRepository;
        this.vendorRepository = vendorRepository;
        this.postRepository = postRepository;
    }

   reportItems = async(
        reportedBy: string,
        itemId: string,
        type: ReportType,
        reason: ReportReason,
        additionalDetails?: string,
    ): Promise<{ success: boolean; reportId: string }>  =>{
        try {
            const existingReport = await this.reportRepository.findOne({
                reportedBy: new mongoose.Types.ObjectId(reportedBy),
                'reportedItem.itemId': new mongoose.Types.ObjectId(itemId),
                'reportedItem.type': type,
                status: { $ne: ReportStatus.RESOLVED } // To avoid rejecting resolved reports
            });
    
            if (existingReport) {
                throw new CustomError('You have already reported this item.', 400);
            }
    
            let reportedItem;
            if (type === ReportType.POST) {
                reportedItem = await this.postRepository.getById(itemId)
            } else if (type === ReportType.VENDOR) {
                reportedItem = await this.vendorRepository.getById(itemId)
            }

            if (!reportedItem) {
                throw new CustomError('Reported item not found', 404)
            }
            let reportId = generateUniqueId('ID');

            const report = await this.reportRepository.create({
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
                await this.postRepository.update(
                    itemId,
                    { $inc: { reportCount: 1 } as any},
                );
            } else if(type === ReportType.VENDOR ) {
                await this.vendorRepository.update(itemId,{
                    $inc: {reportCount: 1} as any,
                })
            }
            
            await report.save()
            return { success: true, reportId };


        } catch (error) {
            if (error instanceof CustomError) {
                throw new CustomError(error.message, error.statusCode);
            }
    
            throw new CustomError('Failed to report item', 500);
        }

    }

    getClientReports = async(page: number, limit: number, search: string, status?: string): Promise<{ reports: IReport[]; total: number; totalPages: number }> =>{
        try {
            const result = await this.reportRepository.findAllReports(page, limit, search, status);
            return result
        } catch (error) {
            console.error('Error in getting reports :', error)
            throw new CustomError('Failed to get report ', 500)
        }
    }
}

export default Reportservice;
