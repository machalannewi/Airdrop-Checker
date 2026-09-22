import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import Admin from "../Models/admin.js";
import adminAuth, { adminAuthMiddleware } from "../middleware/adminAuth.js"; // Middleware to protect admin routes
import Transaction from "../Models/Transaction.js";
import User from "../Models/user.js";
import { sendDepositApprovalEmail, sendSubscriptionRenewalEmail } from "./mailer.js";

const router = express.Router();

const ALLOWED_BALANCE_CURRENCIES = ["btc", "eth", "sol", "ltc"];

// Admin Login
router.post(
  "/login",
  [
    body("username").isString().trim().notEmpty().withMessage("Username is required"),
    body("password").isString().notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { username, password } = req.body;
      const admin = await Admin.findOne({ username });

      if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

      res.json({ token });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/dashboard", adminAuth, (req, res) => {
  res.json({ msg: "Welcome to the admin dashboard!" });
});

// Get all transactions (Admin Only)
router.get("/transactions", adminAuthMiddleware, async (req, res, next) => {
  try {
    const transactions = await Transaction.find().populate("userId", "username email");
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

// Verify a Paystack/crypto transaction and extend the user's subscription
router.patch("/verify-transaction/:id", adminAuthMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ msg: "Transaction not found" });
    }

    if (transaction.status !== "pending") {
      return res.status(400).json({ msg: "Transaction already verified" });
    }

    const user = await User.findById(transaction.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found for this transaction" });
    }

    const currentDate = new Date();
    let newExpiryDate;

    if (user.isSubscribed && user.subscriptionExpiry > currentDate) {
      newExpiryDate = new Date(user.subscriptionExpiry);
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);
    } else {
      newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + 30);
    }

    user.isSubscribed = true;
    user.subscriptionExpiry = newExpiryDate;
    await user.save();

    transaction.status = "verified";
    await transaction.save();

    await sendDepositApprovalEmail(user.email, transaction.amount, "crypto", transaction.reference);
    await sendSubscriptionRenewalEmail(user.email, newExpiryDate);

    res.json({ msg: "Transaction verified successfully", transaction });
  } catch (error) {
    next(error);
  }
});

// Admin verifies a crypto deposit and credits the user's balance
router.put("/verify-deposit/:id", adminAuthMiddleware, async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const deposit = await Transaction.findById(id);
    if (!deposit) {
      return res.status(404).json({ msg: "Deposit not found" });
    }

    if (deposit.status !== "pending") {
      return res.status(400).json({ msg: "Deposit already processed" });
    }

    if (status === "approved") {
      const currency = (deposit.currency || "").toLowerCase();
      if (!ALLOWED_BALANCE_CURRENCIES.includes(currency)) {
        return res.status(400).json({ msg: "Deposit has no valid currency to credit" });
      }

      const user = await User.findById(deposit.userId);
      if (!user) return res.status(404).json({ msg: "User not found" });

      const balanceField = `${currency}_balance`;
      user[balanceField] = (user[balanceField] || 0) + deposit.amount;
      await user.save();
    }

    deposit.status = status;
    await deposit.save();

    res.json({ msg: `Deposit ${status} successfully` });
  } catch (error) {
    next(error);
  }
});

export default router;
