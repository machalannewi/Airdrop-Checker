import rateLimit from "express-rate-limit";

// Brute-force protection for login/signup endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: "Too many attempts. Please try again later." },
});

// Looser limiter for general write endpoints (deposits/withdrawals)
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { msg: "Too many requests. Please try again later." },
});
