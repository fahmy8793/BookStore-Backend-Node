const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage ({
    cloudinary,
    params: {
        folder: 'bookstore/books',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});

const upload = multer({ storage});

// export default upload;
module.exports = upload;