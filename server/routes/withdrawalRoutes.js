// routes/withdrawals.js
import express from "express";
import { body, validationResult } from "express-validator";
import Withdrawal from "../Models/withdrawal.js";
import User from "../Models/user.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { writeLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const ALLOWED_METHODS = ["btc", "eth", "sol", "ltc"];

router.post(
  "/request",
  authMiddleware,
  writeLimiter,
  [
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0"),
    body("method")
      .isString()
      .trim()
      .toLowerCase()
      .isIn(ALLOWED_METHODS)
      .withMessage(`Method must be one of: ${ALLOWED_METHODS.join(", ")}`),
    body("walletAddress").isString().trim().notEmpty().withMessage("Wallet address is required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { amount, method, walletAddress } = req.body;
      const userId = req.user.userId;
      const methodKey = `${method}_balance`;

      // Atomic, conditional update: only deducts if the balance is still
      // sufficient at the moment of the write. This closes a race condition
      // where two concurrent requests could both pass a separate balance
      // check and overdraw the account.
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId, [methodKey]: { $gte: amount } },
        { $inc: { [methodKey]: -amount, deposited: -amount } },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(400).json({ msg: "Insufficient balance" });
      }

      const newWithdrawal = new Withdrawal({
        userId,
        amount,
        method,
        walletAddress,
      });

      await newWithdrawal.save();

      res.status(200).json({ msg: "Withdrawal request submitted", withdrawal: newWithdrawal });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
