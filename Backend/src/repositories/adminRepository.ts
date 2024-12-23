import Admin, { AdminDocument } from "../models/adminModel";
import User from "../models/userModel";
import Post from "../models/postModel";
import Vendor from "../models/vendorModel";
import Booking from "../models/bookingModel";
import { BaseRepository } from "./baseRepository";
import { IAdminRepository } from "../interfaces/repositoryInterfaces/admin.Repository.Interface";

class AdminRepository extends BaseRepository<AdminDocument> implements IAdminRepository {
  constructor() {
    super(Admin)
  }
  async findByEmail(email: string): Promise<AdminDocument | null> {
    return await Admin.findOne({ email });
  }

  async getTotalVendors(): Promise<number> {
    return await Vendor.countDocuments({
      isActive: true,
      isVerified: true,
      isAccepted: 'accepted'
    });
  }

  async getTotalUsers(): Promise<number> {
    return await User.countDocuments();
  }

  async getTotalPosts(): Promise<number> {
    return await Post.countDocuments({
      status: 'Published'
    });
  }

  async getTotalBookings(): Promise<number> {
    return await Booking.countDocuments();
  }

  async getTotalRevenue(): Promise<number> {
    const result = await Booking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    return result[0]?.totalRevenue || 0;
  }

  async calculateTotalRevenue(): Promise<number> {
    try {
      const revenueData = await Booking.aggregate([
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
            }
          }
        },
        {
          $project: {
            totalAmount: { $add: ['$validAdvanceAmount', '$validFinalAmount'] }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]);

      return revenueData[0]?.totalRevenue || 0; // Return total revenue or 0 if no data
    } catch (error) {
      console.error('Error calculating total revenue:', error);
      throw new Error('Unable to calculate total revenue');
    }
  }


  async getMonthOverMonthComparison(): Promise<{ vendors: number; users: number; posts: number }> {
    const currentDate = new Date();
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const vendorsLastMonth = await Vendor.countDocuments({
      isActive: true,
      isVerified: true,
      isAccepted: 'accepted',
      createdAt: { $gte: lastMonthStart, $lt: currentMonthStart }
    });

    const vendorsCurrentMonth = await Vendor.countDocuments({
      isActive: true,
      isVerified: true,
      isAccepted: 'accepted',
      createdAt: { $gte: currentMonthStart, $lt: currentDate }
    });

    const usersLastMonth = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: lastMonthStart, $lt: currentMonthStart }
    });

    const usersCurrentMonth = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: currentMonthStart, $lt: currentDate }
    });

    const postsLastMonth = await Post.countDocuments({
      status: 'Published',
      createdAt: { $gte: lastMonthStart, $lt: currentMonthStart }
    });

    const postsCurrentMonth = await Post.countDocuments({
      status: 'Published',
      createdAt: { $gte: currentMonthStart, $lt: currentDate }
    });

    return {
      vendors: this.calculatePercentageChange(vendorsLastMonth, vendorsCurrentMonth),
      users: this.calculatePercentageChange(usersLastMonth, usersCurrentMonth),
      posts: this.calculatePercentageChange(postsLastMonth, postsCurrentMonth)
    };
  }

  private calculatePercentageChange(lastMonth: number, currentMonth: number): number {
    if (lastMonth === 0) return currentMonth > 0 ? 100 : 0;
    return Math.round(((currentMonth - lastMonth) / lastMonth) * 100);
  }

  async getDashboardStats(): Promise<{
    totalVendors: number;
    totalUsers: number;
    totalPosts: number;
    totalRevenue: number;
    trends: { vendors: number; users: number; posts: number };
  }> {
    const [
      totalVendors,
      totalUsers,
      totalPosts,
      totalRevenue,
      monthOverMonthComparison
    ] = await Promise.all([
      this.getTotalVendors(),
      this.getTotalUsers(),
      this.getTotalPosts(),
      this.calculateTotalRevenue(),
      this.getMonthOverMonthComparison()
    ]);

    return {
      totalVendors,
      totalUsers,
      totalPosts,
      totalRevenue,
      trends: monthOverMonthComparison
    };
  }




}

export default AdminRepository




