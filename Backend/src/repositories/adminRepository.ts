import Admin , { AdminDocument } from "../models/adminModel";
import  User from "../models/userModel";
import  Post from "../models/postModel";
import  Vendor from "../models/vendorModel";
import  Booking from "../models/bookingModel";
import { BaseRepository } from "./baseRepository";

class AdminRepository extends BaseRepository<AdminDocument>{
  constructor(){
    super(Admin)
  }
  async findByEmail(email:string): Promise<AdminDocument | null> {
    return await Admin.findOne({ email });
  }

  async getTotalVendors() {
    return await Vendor.countDocuments({ 
      isActive: true, 
      isVerified: true, 
      isAccepted: 'accepted' 
    });
  }

  async getTotalUsers() {
    return await User.countDocuments();
  }

  async getTotalPosts() {
    return await Post.countDocuments({ 
      status: 'Published' 
    });
  }

  async getTotalBookings() {
    return await Booking.countDocuments();
  }

  async getTotalRevenue() {
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

  async calculateTotalRevenue() {
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
  

  async getMonthOverMonthComparison() {
    const currentDate = new Date();
    const lastMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Vendors comparison
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

    // Users comparison
    const usersLastMonth = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: lastMonthStart, $lt: currentMonthStart }
    });

    const usersCurrentMonth = await User.countDocuments({
      isActive: true,
      createdAt: { $gte: currentMonthStart, $lt: currentDate }
    });

    // Posts comparison
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

  async getDashboardStats() {
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

export default new AdminRepository()




