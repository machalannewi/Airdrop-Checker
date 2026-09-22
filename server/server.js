import dotenv from "dotenv";
dotenv.config(); // Must run before anything below reads process.env

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cron from "node-cron"; // For scheduling tasks
import User from "./Models/user.js"; // Import User model;
import authRoutes from "./routes/authRoutes.js";
import airdropRoutes from "./routes/airdropRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import paystackRoutes from "./routes/paystackRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { sendRenewalReminder, sendSubscriptionExpiredEmail } from "./routes/mailer.js"; // Import mailer functions
import depositRoutes from "./routes/depositRoutes.js"; // Import deposit routes
import walletRoutes from "./routes/walletRoutes.js"; // Import wallet routes
import withdrawalRoutes from "./routes/withdrawalRoutes.js"; // Import withdrawal routes
import { authLimiter } from "./middleware/rateLimiter.js";
import Transaction from "./Models/Transaction.js";
import { refreshAirdropCache } from "./services/airdropScraper.js";

const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
  process.exit(1);
}

const port = process.env.PORT || 5000;

const app = express();

app.set("trust proxy", 1);
app.use(helmet());

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(mongoSanitize());

// Rate-limit auth endpoints (login/signup brute force protection)
app.use("/api/auth", authLimiter);
app.use("/api/admin/login", authLimiter);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // The transactionHash index used to be a plain unique index (required
    // on every document). It's now sparse, since Paystack transactions
    // don't have one — sync it so the live index matches the schema
    // instead of silently keeping the old, stricter one.
    await Transaction.syncIndexes();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
connectDB();

// 1. Check for RENEWAL reminders (3 days before expiry) - Runs at 9 AM daily
cron.schedule("0 9 * * *", async () => {
  const now = new Date();

  const warningDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 3,
      now.getUTCHours(),
      now.getUTCMinutes()
    )
  );

  try {
    const expiringSoonUsers = await User.find({
      isSubscribed: true,
      subscriptionExpiry: {
        $gte: now.toISOString(),
        $lte: warningDate.toISOString(),
      },
    });

    for (const user of expiringSoonUsers) {
      await sendRenewalReminder(user.email, user.subscriptionExpiry);
    }

    console.log(`Sent ${expiringSoonUsers.length} renewal reminders.`);
  } catch (error) {
    console.error("Renewal reminder error:", error);
  }
});

// 2. Check for EXPIRED subscriptions - Runs at midnight daily
cron.schedule("0 0 * * *", async () => {
  const now = new Date();

  try {
    const expiredUsers = await User.find({
      isSubscribed: true,
      subscriptionExpiry: { $lte: now.toISOString() },
    });

    if (expiredUsers.length > 0) {
      await User.updateMany(
        { _id: { $in: expiredUsers.map((u) => u._id) } },
        { $set: { isSubscribed: false, lastExpiryNotification: now } }
      );

      const emailResults = await Promise.allSettled(
        expiredUsers.map((user) =>
          sendSubscriptionExpiredEmail(user.email)
            .then(() => ({ success: true, email: user.email }))
            .catch((e) => ({ success: false, email: user.email, error: e.message }))
        )
      );

      const failedEmails = emailResults.filter(
        (r) => r.status === "fulfilled" && !r.value.success
      );
      console.log(`Expired ${expiredUsers.length} subscriptions.`);
      console.log(`Sent ${emailResults.length - failedEmails.length} expiry emails.`);
      if (failedEmails.length > 0) {
        console.error("Failed emails:", failedEmails);
      }
    } else {
      console.log("No expired subscriptions found.");
    }
  } catch (error) {
    console.error("Expiry check error:", error);
  }
});

// 3. Keep the airdrop cache warm. Scraping is slow (a full headless Chrome
// launch + several page loads) and was regularly exceeding request timeouts
// when it ran live on GET /api/airdrops; running it here means that route
// is always just a fast DB read. Fire-and-forget on boot so the cache isn't
// empty right after a deploy (or after Render's free tier spins the
// service down and a new request wakes it back up), then keep it fresh on
// a schedule for as long as the process stays up.
const AIRDROP_SCRAPE_INTERVAL_MIN = Number(process.env.AIRDROP_SCRAPE_INTERVAL_MIN) || 20;
refreshAirdropCache().catch((err) => console.error("Initial airdrop scrape failed:", err.message));
cron.schedule(`*/${AIRDROP_SCRAPE_INTERVAL_MIN} * * * *`, () => {
  refreshAirdropCache().catch((err) => console.error("Scheduled airdrop scrape failed:", err.message));
});

console.log("Cron jobs for subscriptions are active.");

app.use("/api/auth", authRoutes);
app.use("/api", airdropRoutes); // Protected Airdrop Route
app.use("/api/users", userRoutes); // Protected User Route
app.use("/api/users", subscribeRoutes); // Protected Subscribe status Route
app.use("/api/paystack", paystackRoutes); // Paystack Payment Route
app.use("/api/admin", adminRoutes); // Protected Admin Route
app.use("/api/deposits", depositRoutes); // Deposit Route
app.use("/api/withdrawals", withdrawalRoutes); // Withdraw Route
app.use("/api/wallets", walletRoutes); // Wallet Route

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: "Not found" });
});

// Central error handler — never leak internals (stack traces, driver errors) to clients
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ msg: "Server error" });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
