import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../Models/user.js";

const router = express.Router();

// A fixed dummy hash to compare against when no user is found, so a login
// attempt for a non-existent email takes roughly as long as one for a real
// email with a wrong password — otherwise the response-time difference
// (skip bcrypt vs. run bcrypt) lets an attacker enumerate registered emails
// even though both cases return the same error message.
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8dQwvI3VvIfXtHLXLd4hxbGqDvHHAG";

// User Signup
router.post(
  "/signup",
  [
    body("fullname").trim().notEmpty().isLength({ max: 100 }).withMessage("Full name is required"),
    body("username")
      .trim()
      .isLength({ min: 3, max: 32 })
      .withMessage("Username must be 3-32 characters long"),
    body("email")
      .isEmail()
      .withMessage("Enter a valid email")
      .isLength({ max: 254 })
      .trim()
      .toLowerCase(),
    body("password")
      .isLength({ min: 8, max: 128 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/[a-zA-Z]/)
      .withMessage("Password must include at least one letter")
      .matches(/[0-9]/)
      .withMessage("Password must include at least one number"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { fullname, username, email, password } = req.body;
      const userExists = await User.findOne({ email });

      if (userExists) return res.status(400).json({ msg: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({ fullname, username, email, password: hashedPassword });
      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({ msg: "User registered successfully", token });
    } catch (error) {
      next(error);
    }
  }
);

// User Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email").isLength({ max: 254 }).trim().toLowerCase(),
    body("password").notEmpty().isLength({ max: 128 }).withMessage("Password is required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      // Same generic message whether the account exists or the password is
      // wrong, so a caller can't use this endpoint to enumerate registered
      // emails — and always run a bcrypt compare (against a dummy hash when
      // there's no user) so the response time doesn't leak that either.
      const isMatch = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
      if (!user || !isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.json({
        msg: "Login successful",
        token,
        isSubscribed: user.isSubscribed,
        subscriptionExpiry: user.subscriptionExpiry,
        user: {
          _id: user._id,
          fullname: user.fullname,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
