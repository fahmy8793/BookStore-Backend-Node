const mongoose = require('mongoose');
const Order = require('../../models/order.model');

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ user: userId })
            .populate('books.book')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Orders fetched successfully',
            data: orders
        });
    } catch (err) {
        res.status(500).json({
            message: 'An error occurred while fetching the orders',
            data: err.message
        });
    }
}

const getOrderById = async (req, res) => {
    try {
        const userId = req.user.id;
        const order = await Order.findById(req.params.id)
            .populate('books.book', 'title price')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            })
        }

        if (order.user.toString() !== userId) {
            return res.status(403).json({
                message: 'You do not have permission to view this order'
            })
        }

        res.status(200).json({
            message: 'Orders fetched successfully',
            data: order
        });
    } catch (err) {
        res.status(500).json({
            message: 'An error occurred while fetching the order',
            data: err.message
        });
    }
}

module.exports = {
    getMyOrders,
    getOrderById
};