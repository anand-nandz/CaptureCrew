import { IReport } from "../../models/reportModel";

export interface IReportRepository {
    create(data: Partial<IReport>): Promise<IReport>;
    findAllReports(page: number, limit: number, search: string, status?: string): Promise<{
        reports: IReport[];
        total: number;
        totalPages: number;
      }>;
      findOne(condition: Record<string, unknown>): Promise<IReport | null>;

}