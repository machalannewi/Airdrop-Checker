import express from "express";
import puppeteer from "puppeteer";
import authMiddleware from "../middleware/authMiddleware.js";
import checkSubscription from "../middleware/subscriptionMiddleware.js";

const router = express.Router();

// Scraping a fresh headless browser per request is expensive; cache results
// briefly so a burst of requests (or refresh spamming) can't spin up many
// Chrome instances at once and exhaust server memory/CPU.
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = { data: null, fetchedAt: 0 };
let inFlightFetch = null;

async function scrapeAirdrops() {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto("https://airdrop.io", { waitUntil: "networkidle2" });

    const airdrops = await page.evaluate(() => {
      const parseTimerToSeconds = (timerText) => {
        if (!timerText) return 0;

        const timeParts = { mo: 0, d: 0, h: 0, m: 0, s: 0 };
        const regex = /(\d+)\s*(mo|d|h|m|s)/g;
        let match;
        while ((match = regex.exec(timerText)) !== null) {
          const value = parseInt(match[1]);
          const unit = match[2];
          timeParts[unit] = value;
        }

        return (
          timeParts.mo * 30 * 24 * 60 * 60 +
          timeParts.d * 24 * 60 * 60 +
          timeParts.h * 60 * 60 +
          timeParts.m * 60 +
          timeParts.s
        );
      };

      return Array.from(document.querySelectorAll("a.w-full.aspect-square")).map((airdrop) => {
        const image = airdrop.querySelector("img")?.src || "No image";
        const imageAlt = airdrop.querySelector("img")?.alt || "No alt text";
        const timerText = airdrop.querySelector('[class*="bg-airdropio-green"]')?.innerText.trim() || "0s";
        const timerSeconds = parseTimerToSeconds(timerText);

        const title = airdrop.querySelector("h3")?.innerText.trim() || "No title";
        const rewardContainer = airdrop.querySelector('[class*="text-[#A8A8A8]"]');
        const rewardText = rewardContainer?.innerText.trim() || "No reward";
        const [amount, currency] = rewardText.split(" ") || ["Unknown", "Unknown"];
        const link = airdrop.href ? `https://airdrop.io${airdrop.getAttribute("href")}` : "No link";

        return { title, amount, currency, link, image, imageAlt, timer: timerText, timerSeconds };
      });
    });

    for (let i = 0; i < airdrops.length; i++) {
      try {
        const detailPage = await browser.newPage();
        await detailPage.goto(airdrops[i].link, { waitUntil: "networkidle2" });

        const expiry = await detailPage.evaluate(() => {
          const paragraphs = Array.from(document.querySelectorAll("p"));
          for (let p of paragraphs) {
            if (p.innerText.trim().startsWith("End date:")) {
              const match = p.innerText.trim().match(/End date:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/);
              if (match) {
                const [, month, day, year] = match;
                return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`).getTime();
              }
            }
          }
          return null;
        });

        airdrops[i].expiry = expiry;
        await detailPage.close();
      } catch (err) {
        console.error(`Error scraping expiry for ${airdrops[i].title}:`, err.message);
        airdrops[i].expiry = null;
      }
    }

    return airdrops;
  } finally {
    if (browser) await browser.close();
  }
}

router.get("/airdrops", authMiddleware, checkSubscription, async (req, res) => {
  try {
    const isFresh = cache.data && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
    if (isFresh) {
      return res.json(cache.data);
    }

    // Single-flight: if a scrape is already running, let every concurrent
    // caller await that same promise instead of each launching its own browser.
    if (!inFlightFetch) {
      inFlightFetch = scrapeAirdrops().finally(() => {
        inFlightFetch = null;
      });
    }

    const airdrops = await inFlightFetch;
    cache = { data: airdrops, fetchedAt: Date.now() };
    res.json(airdrops);
  } catch (error) {
    console.error("Scraping failed:", error.message);
    res.status(500).json({ error: "Unable to fetch Airdrop" });
  }
});

export default router;
