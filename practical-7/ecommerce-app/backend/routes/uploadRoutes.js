const express = require("express");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const router = express.Router();

// ─── POST /api/upload/product-image (Protected) ───────────────────────────────
router.post(
  "/product-image",
  authMiddleware,
  (req, res, next) => {
    // Use single file upload with field name "image"
    upload.single("image")(req, res, (err) => {
      if (err) {
        // Multer errors (file too large, wrong type, etc.)
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error",
        });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please attach an image with field name 'image'.",
      });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully!",
      file: {
        originalName: req.file.originalname,
        savedAs: req.file.filename,
        size: `${(req.file.size / 1024).toFixed(2)} KB`,
        mimetype: req.file.mimetype,
        url: fileUrl,
      },
      uploadedBy: req.user.name,
      timestamp: new Date().toISOString(),
    });
  }
);

// ─── POST /api/upload/multiple (Protected) ───────────────────────────────────
router.post(
  "/multiple",
  authMiddleware,
  (req, res, next) => {
    upload.array("images", 5)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error",
        });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded. Please attach images with field name 'images'.",
      });
    }

    const files = req.files.map((file) => ({
      originalName: file.originalname,
      savedAs: file.filename,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
    }));

    res.status(201).json({
      success: true,
      message: `${files.length} image(s) uploaded successfully!`,
      files,
      uploadedBy: req.user.name,
      timestamp: new Date().toISOString(),
    });
  }
);

module.exports = router;
