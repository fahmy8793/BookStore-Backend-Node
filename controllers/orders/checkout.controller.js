const mongoose = require('mongoose');
const Book = require('../../models/book.model');
const Order = require('../../models/order.model');
const User = require('../../models/user.model');

const checkoutOrder = async(req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const userId = req.user.id;
        const { books, total } = req.body;
        
        const user = await User.findById(userId).session(session);
        // console.log('User ID:', userId);
        // console.log('Books:', books);
        // console.log('total:', total);
        if(!user) {
            throw new Error('User not found');
        }

        calculatedTotal = 0;
        for(const item of books) {
            const book = await Book.findById(item.book).session(session);
            if(!book) {
                throw new Error(`Book with ID ${item.book} not found`);
            }

            if(book.stock < item.quantity) {
                throw new Error(`Not enough stock for book ${book.title}`);
            }

            book.stock -= item.quantity;
            await book.save({ session });

            calculatedTotal += book.price * item.quantity;
            orderBooks.push({
                book: item.book,
                quantity: item.quantity
            });
        }
        if (Math.round(calculatedTotal * 100) !== Math.round(total * 100)) {
            throw new Error('Total amount mismatch');
        }
        const newOrder = new Order({
            user: userId,
            books: orderBooks,
            total: calculatedTotal
        });
        await newOrder.save({ session });

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

module.exports = {
    checkoutOrder
};