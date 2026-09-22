import express from "express";
import { body, validationResult } from "express-validator";
import Transaction from "../Models/Transaction.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const ALLOWED_CURRENCIES = ["BTC", "ETH", "SOL", "LTC"];

// User submits a crypto deposit request (goes to "pending" until an admin approves it)
router.post(
  "/submit",
  authMiddleware,
  [
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("currency")
      .isString()
      .trim()
      .toUpperCase()
      .isIn(ALLOWED_CURRENCIES)
      .withMessage(`Currency must be one of: ${ALLOWED_CURRENCIES.join(", ")}`),
    body("transactionHash").isString().trim().notEmpty().withMessage("Transaction hash is required"),
    body("walletAddress").optional().isString().trim(),
    body("network").optional().isString().trim(),
    body("reference").optional().isString().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { amount, currency, reference, walletAddress, network, transactionHash } = req.body;
      const userId = req.user.userId;

      const existingDeposit = await Transaction.findOne({ transactionHash });
      if (existingDeposit) {
        return res.status(400).json({ msg: "Transaction hash already exists" });
      }

      const newTransaction = new Transaction({
        userId,
        amount,
        currency,
        transactionHash,
        reference: reference || transactionHash,
        paymentMethod: "Crypto",
        walletAddress,
        network,
        status: "pending",
      });

      await newTransaction.save();
      res.status(201).json({ msg: "Deposit submitted. Awaiting admin approval." });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/deposits/user - fetch the authenticated user's own deposits
router.get("/user", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const deposits = await Transaction.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ deposits });
  } catch (error) {
    next(error);
  }
});

export default router;
