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

// Only fetch expiry dates for this many airdrops (most recently listed
// first) — scraping all of them one detail page at a time took long enough
// to exceed most hosting platforms' request timeout, which is the likely
// reason this stopped returning anything at all.
const MAX_DETAIL_PAGES = 20;
const DETAIL_CONCURRENCY = 4;
const NAV_TIMEOUT_MS = 15000;
const SCRAPE_HARD_TIMEOUT_MS = 90000;

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;

  async function runNext() {
    const i = next++;
    if (i >= items.length) return;
    results[i] = await worker(items[i], i);
    await runNext();
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runNext));
  return results;
}

async function scrapeAirdrops() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      // Cloud/container hosts (Render, Docker, etc.) generally can't run
      // Chrome's own sandbox, and without --no-sandbox the launch fails
      // outright rather than falling back — this is the most common reason
      // Puppeteer works locally but silently breaks once deployed.
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
    await page.goto("https://airdrop.io", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("a.w-full.aspect-square", { timeout: NAV_TIMEOUT_MS }).catch(() => null);

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

    await page.close();

    const detailTargets = airdrops.slice(0, MAX_DETAIL_PAGES);

    await mapWithConcurrency(detailTargets, DETAIL_CONCURRENCY, async (airdrop) => {
      let detailPage;
      try {
        detailPage = await browser.newPage();
        detailPage.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
        await detailPage.goto(airdrop.link, { waitUntil: "domcontentloaded" });

        const expiry = await detailPage.evaluate(() => {
          const paragraphs = Array.from(document.querySelectorAll("p"));
          for (const p of paragraphs) {
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

        airdrop.expiry = expiry;
      } catch (err) {
        console.error(`Error scraping expiry for ${airdrop.title}:`, err.message);
        airdrop.expiry = null;
      } finally {
        if (detailPage) await detailPage.close().catch(() => {});
      }
    });

    return airdrops;
  } finally {
    if (browser) await browser.close().catch(() => {});
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
      inFlightFetch = Promise.race([
        scrapeAirdrops(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Scrape timed out")), SCRAPE_HARD_TIMEOUT_MS)
        ),
      ]).finally(() => {
        inFlightFetch = null;
      });
    }

    const airdrops = await inFlightFetch;
    cache = { data: airdrops, fetchedAt: Date.now() };
    res.json(airdrops);
  } catch (error) {
    console.error("Scraping failed:", error);
    // If we have a stale cache, serving it is better than an empty page.
    if (cache.data) {
      return res.json(cache.data);
    }
    res.status(502).json({ error: "Unable to fetch airdrops right now. Try again shortly." });
  }
});

export default router;
