import jwt from 'jsonwebtoken';
import { CustomError } from '../error/customError';
import moment from "moment";
import { AdminLoginResponse } from '../interfaces/commonInterfaces';
import { IAdminService } from '../interfaces/serviceInterfaces/admin.Service.Interface';
import { IAdminRepository } from '../interfaces/repositoryInterfaces/admin.Repository.Interface';
import { createAccessToken } from '../config/jwt.config';
import { IBookingRepository } from '../interfaces/repositoryInterfaces/booking.Repository.interface';

class AdminService implements IAdminService {
  private adminRepository: IAdminRepository;
  private bookingRepo: IBookingRepository;

  constructor(
    adminRepository: IAdminRepository,
    bookingRepo: IBookingRepository,
  ) {
    this.adminRepository = adminRepository;
    this.bookingRepo = bookingRepo;
  }


  login = async (email: string, password: string): Promise<AdminLoginResponse> => {
    try {
      const existingAdmin = await this.adminRepository.findByEmail(email);

      if (!existingAdmin) {
        throw new CustomError('Admin not exist!..', 404);
      }
      if (password !== existingAdmin.password) {
        throw new CustomError('Incorrect Password', 401)
      }

      const token = createAccessToken(existingAdmin._id.toString())
      jwt.sign(
        { _id: existingAdmin._id },
        process.env.JWT_SECRET_KEY!,
        { expiresIn: '2h' }
      );

      let { refreshToken } = existingAdmin;
      if (!refreshToken || isTokenExpiringSoon(refreshToken)) {
        refreshToken = jwt.sign(
          { _id: existingAdmin._id },
          process.env.JWT_REFRESH_SECRET_KEY!,
          { expiresIn: '7d' }
        )
        existingAdmin.refreshToken = refreshToken;
        await existingAdmin.save();
      }

      return {
        token,
        refreshToken,
        adminData: existingAdmin,
        message: 'Succesfully logged in'
      }


    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to login', 500);
    }
  }



  createRefreshToken = async (jwtTokenAdmin: string): Promise<string> => {
    try {
      const decodedToken = jwt.verify(
        jwtTokenAdmin,
        process.env.JWT_REFRESH_SECRET_KEY!
      ) as { _id: string }

      const admin = await this.adminRepository.getById(decodedToken._id);

      if (!admin || admin.refreshToken !== jwtTokenAdmin) {
        throw new CustomError('Invalid refresh Token', 401)
      }

      const accessToken = createAccessToken(admin._id.toString())

      return accessToken;

    } catch (error) {
      console.error('Error while creatin refreshToken', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create refresh Token', 500);
    }
  }

  getDashboardStats = async (): Promise<{
    totalVendors: { count: number };
    totalUsers: { count: number };
    totalPosts: { count: number };
    revenue: { count: string };
  }> => {
    try {
      const stats = await this.adminRepository.getDashboardStats();

      return {
        totalVendors: {
          count: stats.totalVendors,
          // trend: `+${stats.trends.vendors}%`
        },
        totalUsers: {
          count: stats.totalUsers,
          // trend: `+${stats.trends.users}%`
        },
        totalPosts: {
          count: stats.totalPosts,
          // trend: `+${stats.trends.posts}%`
        },
        revenue: {
          count: `₹${stats.totalRevenue.toFixed(2)}`,
          // trend: '+0%' 
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Unable to fetch dashboard statistics');
    }
  }

  getRevenueDetails = async (dateType: string, startDate?: string, endDate?: string): Promise<number[]> => {
    try {
      let start: Date, end: Date, groupBy, sortField: string, arrayLength = 0;

      if (dateType === 'custom' && startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        groupBy = { $dayOfMonth: '$paidAt' };
        sortField = 'day'
        arrayLength = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      } else {
        switch (dateType) {
          case 'week':
            const { startOfWeek, endOfWeek } = getCurrentWeekRange();
            start = startOfWeek;
            end = endOfWeek;
            groupBy = { $dayOfWeek: '$paidAt' };
            sortField = 'day';
            arrayLength = 7;
            break;

          case 'month':
            const { startOfYear, endOfYear } = getCurrentYearRange();
            start = startOfYear;
            end = endOfYear;
            groupBy = { $month: '$paidAt' };
            sortField = 'month';
            arrayLength = 12;
            break;

          case 'year':
            const { startOfFiveYearsAgo, endOfCurrentYear } = getLastFiveYearsRange();
            start = startOfFiveYearsAgo;
            end = endOfCurrentYear;
            groupBy = { $year: '$paidAt' };
            sortField = 'year';
            arrayLength = 5;
            break;


          default:
            throw new CustomError('Invalid Date Parameter', 400)
        }
      }

      const revenueData = await this.bookingRepo.getAllRevenueData(start, end, groupBy, sortField);
      console.log(revenueData, 'revenueData');

   if (dateType === 'custom') {
      const dailyRevenue = new Array(arrayLength).fill(0);

      revenueData.forEach(item => {
        const day = item._id.day;
                let currentDate = new Date(start);
        while (currentDate <= end) {
          if (currentDate.getDate() === day) {
            const dayIndex = Math.floor(
              (currentDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            );
            
            const revenueDate = new Date(currentDate);
            revenueDate.setHours(0, 0, 0, 0);
        
            const revenueDateStr = revenueDate.toISOString().split('T')[0];
            const startStr = start.toISOString().split('T')[0];
            const endStr = end.toISOString().split('T')[0];
            
            if (revenueDateStr >= startStr && revenueDateStr <= endStr && 
                dayIndex >= 0 && dayIndex < arrayLength) {
              dailyRevenue[dayIndex] = item.totalRevenue;
            }
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      console.log(dailyRevenue, 'dailyRevenue');
      return dailyRevenue;
    }


      const revenueArray = Array.from({ length: arrayLength }, (_, index) => {
        const item = revenueData.find((r) => {

          if (dateType === 'week') {
            const dayFromData = r._id?.day;
            return dayFromData === index + 1;
          } else if (dateType === 'month') {
            return r._id?.month === index + 1;
          } else if (dateType === 'year') {
            const expectedYear = new Date().getFullYear() - (arrayLength - 1) + index;
            return r._id?.year === expectedYear;
          }
          return false;
        });

        return item ? item.totalRevenue : 0;
      });
      return revenueArray

    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      throw new Error('Unable to fetch revenue statistics');
    }
  }


}

export default AdminService;



function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;

    return timeUntilExpiration < 7 * 24 * 60 * 60 * 1000;
  } catch (error) {
    return true;
  }
}



function getCurrentWeekRange() {
  const startOfWeek = moment().startOf("isoWeek").toDate();
  const endOfWeek = moment().endOf("isoWeek").toDate();
  return { startOfWeek, endOfWeek };
}

// Function to get current year range
function getCurrentYearRange() {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const endOfYear = new Date(new Date().getFullYear() + 1, 0, 1);
  return { startOfYear, endOfYear };
}

// Function to calculate the last five years' range
function getLastFiveYearsRange() {
  const currentYear = new Date().getFullYear();
  const startOfFiveYearsAgo = new Date(currentYear - 4, 0, 1);
  const endOfCurrentYear = new Date(currentYear + 1, 0, 1);
  return { startOfFiveYearsAgo, endOfCurrentYear };
}
