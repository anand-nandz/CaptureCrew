import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/userTypes';
import { handleError } from '../utils/handleError';
import { CustomError } from '../error/customError';
import { IReportService } from '../interfaces/serviceInterfaces/report.Service.Interface';
import HTTP_statusCode from '../enums/httpStatusCode';


class ReportController {

  private reportService : IReportService;
  constructor(reportService : IReportService) {
    this.reportService = reportService
  }
    reoportItem = async (req: AuthenticatedRequest, res: Response):Promise<void>=>{
        try {
            const { 
                itemId, 
                type, 
                reason, 
                additionalDetails 
              } = req.body;
              const reportedBy = req.user?._id;
              if(!reportedBy){
                throw new CustomError('User not found', 404)
              }              

              const { success, reportId }  = await this.reportService.reportItems(reportedBy.toString(),itemId, type, reason, additionalDetails )
              
              if(success){
                res.status(HTTP_statusCode.OK).json({message: 'Report Submitted succesfully', reportId})
              }
        } catch (error) {
            handleError(res, error, 'reoportItem')
        }
    }
}

export default ReportController