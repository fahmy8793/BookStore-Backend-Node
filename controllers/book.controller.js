const fs = require("fs");
const Book = require("../models/book.model");
const { validationResult } = require("express-validator");
const cloudinary = require("../config/cloudinary");
const Review = require("../models/review.model");

// Upload a new book with PDF and image files
const uploadBook = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, description, category, price, stock } = req.body;

    // check if required fields are present
    let pdfUploadResult = null;
    if (req.files?.pdf && req.files.pdf.length > 0) {
      const pdfPath = req.files.pdf[0].path;
      pdfUploadResult = await cloudinary.uploader.upload(pdfPath, {
        resource_type: "raw",
        folder: "books/pdf",
        format: "pdf",
        upload_preset: "bookStore",
        public_id: title.replace(/\s+/g, "_").toLowerCase(),
      });
      fs.unlinkSync(pdfPath);
    }

    // check if image file is present
    if (!req.files?.image || req.files.image.length === 0) {
      return res.status(400).json({ error: "Image file is required." });
    }
    const imagePath = req.files.image[0].path;
    const imageUpload = await cloudinary.uploader.upload(imagePath, {
      folder: "books/images",
      upload_preset: "bookStore",
      public_id: title.replace(/\s+/g, "_").toLowerCase(),
    });
    fs.unlinkSync(imagePath);

    // Create new book entry
    const newBook = await Book.create({
      title,
      author,
      description,
      category,
      price,
      stock,
      image: imageUpload.secure_url,
      pdfPath: pdfUploadResult ? pdfUploadResult.secure_url : null,
    });

    res.status(201).json({
      message: "Book uploaded successfully!",
      book: newBook,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed", message: err.message });
  }
};
// Retrieve all books with optional filtering and pagination
const getAllBooks = async (req, res) => {
  try {
    // 1. استخلاص كل الخيارات من الطلب مع قيم افتراضية
    const { author, category, sort = "rating" } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // 2. بناء مرحلة الفلترة ($match)
    const matchStage = {};
    if (author) matchStage.author = { $regex: author, $options: "i" };
    if (category) matchStage.category = { $regex: category, $options: "i" };

    // 3. بناء مرحلة الترتيب ($sort)
    let sortStage = {};
    switch (sort) {
      case "priceAsc":
        sortStage = { price: 1 };
        break;
      case "priceDesc":
        sortStage = { price: -1 };
        break;
      case "rating":
      default:
        // سنقوم بالترتيب حسب حقل rate الجديد الذي سننشئه
        sortStage = { rate: -1, createdAt: -1 };
        break;
    }

    // 4. بناء الـ Aggregation Pipeline الكامل
    const aggregationPipeline = [
      // المرحلة الأولى: فلترة الكتب حسب author أو category
      { $match: matchStage },

      // المرحلة الثانية: ربط (join) مع جدول المراجعات (reviews)
      {
        $lookup: {
          from: "reviews", // اسم الـ collection الخاص بالمراجعات (تأكد منه)
          localField: "reviews",
          foreignField: "_id",
          as: "reviewDetails",
        },
      },

      // المرحلة الثالثة: إضافة حقل جديد 'rate' يحتوي على متوسط التقييمات
      {
        $addFields: {
          rate: {
            // استخدم $ifNull للتعامل مع الكتب التي ليس لديها مراجعات (لتجنب القسمة على صفر)
            $ifNull: [{ $avg: "$reviewDetails.rating" }, 0],
          },
        },
      },

      // المرحلة الرابعة (الأهم): استخدام $facet لتنفيذ الترقيم والعد في نفس الوقت
      {
        $facet: {
          // الفرع الأول: جلب البيانات المرقمة والمرتبة
          data: [{ $sort: sortStage }, { $skip: skip }, { $limit: limit }],
          // الفرع الثاني: جلب العدد الإجمالي للكتب بعد الفلترة
          pagination: [{ $count: "total" }],
        },
      },
    ];

    // 5. تنفيذ الـ Pipeline
    const results = await Book.aggregate(aggregationPipeline);

    // 6. تجهيز الرد النهائي
    const books = results[0].data;
    const total = results[0].pagination[0] ? results[0].pagination[0].total : 0;
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Books retrieved successfully",
      data: books,
      pagination: { total, page, pages },
    });
  } catch (err) {
    console.error("--- ERROR in getAllBooks (Aggregation) ---", err);
    res.status(500).json({
      message: "An error occurred while retrieving books",
      error: err.message,
    });
  }
};
// Retrieve a single book by ID
const getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;

    const book = await Book.findById(bookId).populate("reviews");

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book retrieved successfully",
      data: book,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to retrieve book",
      error: err.message,
    });
  }
};

//  Update book by ID

const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const updateData = req.body;

    const updatedBook = await Book.findByIdAndUpdate(bookId, updateData, {
      new: true, // return the updated document
      runValidators: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update book",
      error: err.message,
    });
  }
};

//  Delete book by ID
const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book deleted successfully",
      data: deletedBook,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete book",
      error: err.message,
    });
  }
};

module.exports = {
  uploadBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
};
