const mongoose = require('mongoose');
const Book = require('../models/book.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');

export const checkoutOrder = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const userId = req.user.id;
        const { books, total } = req.body;
        
        const user = await User.findById(userId).session(session);
        if(!user) {
            throw new Error('User not found');
        }

        calculatedTotal = 0;
        for(const item of books) {
            const book = await Book.findById(item.bookId).session(session);
            if(!book) {
                throw new Error(`Book with ID ${item.bookId} not found`);
            }

            if(book.stock < item.quantity) {
                throw new Error(`Not enough stock for book ${book.title}`);
            }

            book.stock -= item.quantity;
            await book.save({ session });

            calculatedTotal += book.price * item.quantity;

        }

        if(calculatedTotal !== total) {
            throw new Error('Total amount does not match the calculated total');
        }

        if(user.balance < total) {
            throw new Error('Insufficient balance');
        }

        user.balance -= total;
        await user.save({ session });

        const orderBooks = books.map(item => ({
            book: item.bookId,
            quantity: item.quantity
        }));

        const newOrder = new Order({
            user: userId,
            books: orderBooks,
            total: total
        });

        await newOrder.save({ session});

        await session.commitTransaction();
        session.endSession();
        res.status(201).json({
            message: 'Order placed sussessfully',
            order: newOrder
        })
        
    } catch(err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            message: err.message || 'An error occurred while processing the order'  
        });
    }
}