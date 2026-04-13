const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ─── Helper: Generate JWT ─────────────────────────────────────────────────────
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty().withMessage("Name is required")
      .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),

    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please enter a valid email address")
      .normalizeEmail(),

    body("password")
      .notEmpty().withMessage("Password is required")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
      .matches(/\d/).withMessage("Password must contain at least one number"),
  ],
  async (req, res) => {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = User.create({ name, email, hashedPassword });

      // Generate JWT
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: "Account created successfully!",
        token,
        user,
      });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ success: false, message: "Server error during registration" });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please enter a valid email address")
      .normalizeEmail(),

    body("password")
      .notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { email, password } = req.body;

    try {
      // Find user
      const user = User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT
      const { password: _, ...safeUser } = user;
      const token = generateToken(safeUser);

      res.status(200).json({
        success: true,
        message: "Login successful!",
        token,
        user: safeUser,
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ success: false, message: "Server error during login" });
    }
  }
);

// ─── GET /api/auth/profile (Protected) ───────────────────────────────────────
router.get("/profile", authMiddleware, (req, res) => {
  const user = User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const { password, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

module.exports = router;
