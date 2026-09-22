import mongoose from "mongoose";

// Cached results of scraping airdrop.io — kept warm by a background cron job
// (see services/airdropScraper.js) so the user-facing GET /api/airdrops
// route is a fast DB read instead of a live Puppeteer scrape on the request
// path, which was slow/fragile enough on hosted platforms to routinely
// exceed request timeouts.
const AirdropSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: String,
    currency: String,
    link: { type: String, required: true, unique: true },
    image: String,
    imageAlt: String,
    timer: String,
    timerSeconds: Number,
    expiry: Number, // epoch ms, null if unknown
    scrapedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Airdrop", AirdropSchema);
