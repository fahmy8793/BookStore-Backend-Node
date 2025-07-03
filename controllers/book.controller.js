const Book = require('../models/book.model');

const createBook = async(req, res) => {
    try{
        const { title, author, price, stock, description, category } = req.body;
        // const imageUrl = req.file?.path;
        const image = req.file?.path;
        if( !title || !author || !price || !stock || !description || !category || !image) {
            return res.status(400).json({
                message: 'All fields are required',
                data: null
            });
        }

        const newBook = await Book.create({
            title,
            author,
            price,
            stock,
            description,
            category,
            image
        });

        res.status(201).json({
            message: 'Book created successfully',
            data: newBook
        });
    } catch(err) {
        res.status(500).json({
            message: 'An error occurred while creating the book',
            data: err.message
        });
    }
}

module.exports = {
  createBook
};