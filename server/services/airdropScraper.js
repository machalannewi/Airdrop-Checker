import puppeteer from "puppeteer";
import Airdrop from "../Models/Airdrop.js";

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
];

// Generous now that scraping happens off the request path — a background
// job has no HTTP request timeout to fit inside, just a sanity cap so a
// stuck run can't hold a browser open forever.
const MAX_DETAIL_PAGES = 50;
const DETAIL_CONCURRENCY = 4;
const NAV_TIMEOUT_MS = 20000;
const SCRAPE_HARD_TIMEOUT_MS = 3 * 60 * 1000;

// Regular Puppeteer bundles its own Chromium, but that build commonly fails
// to even launch on managed/minimal Linux hosts (Render included) — not
// because of the sandbox, but because system libraries it links against
// (libnss3 and friends) simply aren't installed on the image, and there's
// no apt-get available there to install them. @sparticuz/chromium ships a
// Chromium build made specifically to run standalone on exactly these
// hosts, so use it whenever we're actually running on Linux; keep plain
// Puppeteer for local dev on Windows/Mac, where @sparticuz/chromium's
// binary is Linux-only.
async function launchBrowser() {
  if (process.platform === "linux") {
    const { default: chromium } = await import("@sparticuz/chromium");
    return puppeteer.launch({
      args: [...chromium.args, ...LAUNCH_ARGS],
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  return puppeteer.launch({ headless: true, args: LAUNCH_ARGS });
}

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

async function fetchLiveAirdrops() {
  let browser;
  try {
    browser = await launchBrowser();

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

let refreshing = null;

// Scrapes airdrop.io and upserts the results into MongoDB. Safe to call
// concurrently (a second call while one is in flight just awaits the same
// run) and safe to call on a schedule (a scrape that returns nothing keeps
// whatever was cached before, rather than wiping it).
export async function refreshAirdropCache() {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const start = Date.now();
    try {
      const airdrops = await Promise.race([
        fetchLiveAirdrops(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Scrape timed out")), SCRAPE_HARD_TIMEOUT_MS)
        ),
      ]);

      if (!airdrops || airdrops.length === 0) {
        console.warn("Airdrop scrape returned no results; keeping existing cache.");
        return { count: 0, skipped: true };
      }

      const scrapedAt = new Date();
      await Airdrop.bulkWrite(
        airdrops.map((a) => ({
          updateOne: {
            filter: { link: a.link },
            update: { $set: { ...a, scrapedAt } },
            upsert: true,
          },
        }))
      );

      // Anything not touched by this run is no longer listed on the site —
      // drop it instead of letting stale/expired airdrops pile up forever.
      await Airdrop.deleteMany({ scrapedAt: { $lt: scrapedAt } });

      console.log(`Airdrop cache refreshed: ${airdrops.length} items in ${Date.now() - start}ms`);
      return { count: airdrops.length, skipped: false };
    } catch (error) {
      console.error("Airdrop refresh failed:", error.message);
      throw error;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}
