import jwt from 'jsonwebtoken';
import { CustomError } from '../error/customError';
import userRepository from '../repositories/userRepository';
import adminRepository from '../repositories/adminRepository';
import moment from "moment";
import bookingModel from '../models/bookingModel';


interface LoginResponse {
  token: string;
  refreshToken: string;
  adminData: object;
  message: string
}


class AdminService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const existingAdmin = await adminRepository.findByEmail(email);

      if (!existingAdmin) {
        throw new CustomError('Admin not exist!..', 404);
      }
      if (password !== existingAdmin.password) {
        throw new CustomError('Incorrect Password', 401)
      }

      const token = jwt.sign(
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



  async createRefreshToken(jwtTokenAdmin: string) {
    try {
      const decodedToken = jwt.verify(
        jwtTokenAdmin,
        process.env.JWT_REFRESH_SECRET_KEY!
      ) as { _id: string }

      const admin = await userRepository.getById(decodedToken._id);

      if (!admin || admin.refreshToken !== jwtTokenAdmin) {
        throw new CustomError('Invalid refresh Token', 401)
      }
      // const tokenPayload = {
      //     _id: user._id,
      //     role: 'user' 
      // };


      const accessToken = jwt.sign(
        { _id: admin._id },
        // tokenPayload,
        process.env.JWT_SECRET_KEY!,
        { expiresIn: '2h' }
      )
      console.log(accessToken, 'acces created in the service cretae refresh');



      return accessToken;


    } catch (error) {
      console.error('Error while creatin refreshToken', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create refresh Token', 500);
    }
  }

  async getDashboardStats() {
    try {
      const stats = await adminRepository.getDashboardStats();

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

  async getRevenueDetails(dateType: string) {
    try {
      let start, end, groupBy, sortField, arrayLength = 0;
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

      const revenueData = await bookingModel.aggregate([
        {
          $project: {
            validAdvanceAmount: {
              $cond: [
                { $eq: ['$advancePayment.status', 'completed'] },
                '$advancePayment.amount',
                0
              ]
            },
            validFinalAmount: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$finalPayment.status', 'completed'] },
                    { $ne: ['$finalPayment.paidAt', null] }
                  ]
                },
                '$finalPayment.amount',
                0
              ]
            },
            paidAt: {
              $ifNull: ['$finalPayment.paidAt', '$advancePayment.paidAt']
            }
          }
        },
        {
          $project: {
            totalAmount: { $add: ['$validAdvanceAmount', '$validFinalAmount'] },
            paidAt: 1
          }
        },
        {
          $match: {
            paidAt: { $gte: start, $lt: end }
          }
        },
        {
          $group: {
            _id: {
              [sortField]: groupBy
            },
            totalRevenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { [`_id.${sortField}`]: 1 } }
      ]);

      console.log(JSON.stringify(revenueData));




      const revenueArray = Array.from({ length: arrayLength }, (_, index) => {
        const item = revenueData.find((r) => {

          if (dateType === 'week') {
            const dayFromData = r._id?.day;
            return dayFromData === index + 1;
          } else if (dateType === 'month') {
            return r._id?.month === index + 1 || r._id?.month?.month === index + 1;
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

export default new AdminService();



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
