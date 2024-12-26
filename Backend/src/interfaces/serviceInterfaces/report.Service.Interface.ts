import { ReportReason, ReportType } from "../../enums/commonEnums";
import { IReport } from "../../models/reportModel";

export interface IReportService {
    reportItems(
        reportedBy: string,
        itemId: string,
        type: ReportType,
        reason: ReportReason,
        additionalDetails?: string,
    ): Promise<{ success: boolean; reportId: string }>;
    getClientReports(page: number, limit: number, search: string, status?: string): Promise<{
        reports: IReport[];
        total: number;
        totalPages: number;
    }>;
}