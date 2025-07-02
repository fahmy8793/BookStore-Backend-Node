const User = require('../models/user.model');
const Book = require('../models/book.model');
const Order = require('../models/order.model');

export const getDashboardStats = async (req, res) => {
    try{
        const totalBooks = await Book.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();

        const totalRevenueData = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total'}
                }
            }
        ]);
        
        const totalRevenue = totalRevenueData[0]?.total || 0;

        res.status(200).json({
            message: 'Dashboard stats fetched successfully',
            data: {
                totalBooks,
                totalUsers,
                totalOrders,
                totalRevenue
            }
        });

    } catch(err) {
        res.status(500).json({
            message: 'An error occurred while fetching dashboard stats',
            data: err.message
        });
    }
}