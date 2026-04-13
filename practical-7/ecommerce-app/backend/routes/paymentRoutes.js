const express = require("express");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ─── POST /api/payment/process (Protected) ────────────────────────────────────
router.post(
  "/process",
  authMiddleware,
  [
    body("amount")
      .notEmpty().withMessage("Amount is required")
      .isFloat({ min: 0.01 }).withMessage("Amount must be a positive number"),

    body("cardNumber")
      .notEmpty().withMessage("Card number is required")
      .isLength({ min: 16, max: 16 }).withMessage("Card number must be exactly 16 digits")
      .matches(/^\d+$/).withMessage("Card number must contain only digits"),

    body("cvv")
      .notEmpty().withMessage("CVV is required")
      .isLength({ min: 3, max: 4 }).withMessage("CVV must be 3 or 4 digits")
      .matches(/^\d+$/).withMessage("CVV must contain only digits"),

    body("cardHolder")
      .trim()
      .notEmpty().withMessage("Card holder name is required")
      .isLength({ min: 2 }).withMessage("Card holder name must be at least 2 characters"),

    body("expiryMonth")
      .notEmpty().withMessage("Expiry month is required")
      .isInt({ min: 1, max: 12 }).withMessage("Expiry month must be between 1 and 12"),

    body("expiryYear")
      .notEmpty().withMessage("Expiry year is required")
      .isInt({ min: new Date().getFullYear() }).withMessage("Card has expired"),
  ],
  (req, res) => {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Payment validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { amount, cardNumber, cardHolder } = req.body;

    // ── Mock Payment Logic ──────────────────────────────────────────────────
    // Cards ending in 0000 always fail (useful for Postman testing)
    // All other cards succeed
    const lastFour = cardNumber.slice(-4);
    const isForcedFailure = lastFour === "0000";

    // Simulate processing delay awareness (no actual delay, just mock)
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    if (isForcedFailure) {
      return res.status(402).json({
        success: false,
        message: "Payment declined. Insufficient funds or card blocked.",
        transactionId,
        amount,
        cardHolder,
        cardLast4: lastFour,
        timestamp: new Date().toISOString(),
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Payment processed successfully! 🎉",
      transactionId,
      amount: parseFloat(amount).toFixed(2),
      currency: "USD",
      cardHolder,
      cardLast4: lastFour,
      status: "APPROVED",
      processedBy: req.user.name,
      timestamp: new Date().toISOString(),
    });
  }
);

// ─── GET /api/payment/status/:transactionId (Protected) ──────────────────────
router.get("/status/:transactionId", authMiddleware, (req, res) => {
  const { transactionId } = req.params;
  // Mock status check
  res.json({
    success: true,
    transactionId,
    status: transactionId.startsWith("TXN-") ? "COMPLETED" : "NOT_FOUND",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
