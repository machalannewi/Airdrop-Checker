import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import checkSubscription from "../middleware/subscriptionMiddleware.js";
import Airdrop from "../Models/Airdrop.js";

const router = express.Router();

// The actual scraping happens off the request path, on a schedule (see
// services/airdropScraper.js + the cron job in server.js) — this route is
// just a fast DB read, so it can never time out the way a live Puppeteer
// scrape did.
router.get("/airdrops", authMiddleware, checkSubscription, async (req, res, next) => {
  try {
    const airdrops = await Airdrop.find().sort({ timerSeconds: 1 }).lean();
    res.json(airdrops);
  } catch (error) {
    next(error);
  }
});

export default router;
