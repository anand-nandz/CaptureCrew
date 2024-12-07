import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/userTypes';
import { handleError } from '../utils/handleError';
import { CustomError } from '../error/customError';
import reportService from '../services/reportService';


class ReportController {
    async reoportItem(req: AuthenticatedRequest, res: Response):Promise<void> {
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

              const report = await reportService.reportItems(reportedBy.toString(),itemId, type, reason, additionalDetails )
              
              if(report){
                res.status(200).json({message: 'Report Submitted succesfully',report})
              }
        } catch (error) {
            handleError(res, error, 'reoportItem')
        }
    }
}

export default new ReportController()