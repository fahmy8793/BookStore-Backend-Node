const mongoose = require('mongoose');
//   inventoryStatus?: 'INSTOCK' | 'LOWSTOCK' | 'OUTOFSTOCK';
//   isWishlisted?: boolean; // Managed by frontend for display
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    pdfPath:{
        type: String,
        // required: true,
        trim: true
    },
    
    reviews: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }
]
},{ timestamps: true })

module.exports = mongoose.model('Book', bookSchema);
