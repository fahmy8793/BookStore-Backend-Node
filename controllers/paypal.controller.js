const paypal = require('@paypal/checkout-server-sdk');
const client = require('../utils/paypal');
const Book = require('../models/book.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');

const createPaypalOrder = async (req, res) => {
    const { total, books } = req.body;
    if (!total || !Array.isArray(books)) {
        return res.status(400).json({ message: "Total or books missing" });
    }

    try {
        const stockIssues = [];

        for (const item of books) {
            const book = await Book.findById(item.book);
            if (!book) {
                return res.status(404).json({ message: `Book not found` });
            }

            if (book.stock < item.quantity) {
                stockIssues.push({
                    title: book.title,
                    available: book.stock,
                    requested: item.quantity
                });
            }
        }

        // ✅ لو في مشاكل ستوك
        if (stockIssues.length > 0) {
            return res.status(200).json({
                stockError: true,
                issues: stockIssues
            });
        }

        // ✅ الطلب عادي لو مفيش مشاكل
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: total.toString()
                    },
                },
            ],
            application_context: {
                return_url: "http://localhost:4200/checkout",
                cancel_url: "http://localhost:4200/checkout?cancel=true"
            }
        });

        const order = await client.execute(request);
        const approvalUrl = order.result.links.find(link => link.rel === "approve").href;

        res.status(200).json({
            id: order.result.id,
            approvalUrl
        });

    } catch (err) {
        res.status(500).json({
            message: "Error creating PayPal order",
            error: err.message
        });
    }
};


const capturePayPalOrder = async (req, res) => {
    const { orderID, books, total } = req.body;
    const userId = req.user.id;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});


    try {
        // capture paypal payment
        const capture = await client.execute(request);

        // check if payment is done
        if (capture.result.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        // update stock and calculate total
        const orderBooks = [];
        let calculatedTotal = 0;

        for (const item of books) {
            const book = await Book.findById(item.book);
            if (!book) throw new Error(`Book with ID ${item.book} not found`);
            if (book.stock < item.quantity) {
                throw new Error(`Not enough stock for ${book.title}`);
            }

            book.stock -= item.quantity;
            await book.save();

            orderBooks.push({ book: book._id, quantity: item.quantity });
            calculatedTotal += book.price * item.quantity;
        }
        if (calculatedTotal !== total) {
            return res.status(400).json({ message: 'Price mismatch, please refresh and try again.' });
        }

        // create the order in db
        const newOrder = await Order.create({
            user: userId,
            books: orderBooks,
            total: calculatedTotal
        });
        // update user document
        const user = await User.findById(userId);
        user.orders.push(newOrder._id);
        orderBooks.forEach(item => {
            if (!user.purchasedBooks.includes(item.book)) {
                user.purchasedBooks.push(item.book);
            }
        });

        user.paypalPayments.push({
            orderId: orderID,
            status: capture.result.status,
            amount: total,
            date: new Date()
        });
        await user.save();
        // clean the cart 
        await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

        // إرسال إشعار إلى الأدمن عبر WebSocket
        const io = req.app.locals.io;
        io.emit("new-order", {
        message: "✅ New order placed!",
        orderId: order._id,
        customer: order.userId,
        total: order.totalPrice,
        });

        // the response
        res.status(200).json({
            message: 'Order captured and saved successfully',
            order: newOrder,
            payment: capture.result
        });
    } catch (err) {
        console.error('Capture Error:', err);
        res.status(500).json({
            message: 'Failed to capture PayPal payment',
            error: err.message
        });
    }
};
module.exports = {
    createPaypalOrder,
    capturePayPalOrder
}