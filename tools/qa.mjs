/* Automated QA for the birthday experience.
 * Usage: node tools/qa.mjs
 * Outputs: tools/shots/*.png + a JSON report.
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "tools/shots";
fs.mkdirSync(OUT, { recursive: true });

const report = { console: [], failedRequests: [], overflow: {}, scenes: [], interactions: {} };

async function checkOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const sw = window.innerWidth;
    const overflowers = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 1 && (r.right > sw + 1 || r.left < -1)) {
        const cls = (el.className && typeof el.className === "string") ? el.className.slice(0, 60) : el.tagName;
        overflowers.push(`${el.tagName}.${cls} right=${Math.round(r.right)} left=${Math.round(r.left)}`);
      }
    });
    return {
      scrollW: doc.scrollWidth,
      innerW: sw,
      hasHorizontalScroll: doc.scrollWidth > sw + 1,
      overflowers: overflowers.slice(0, 12),
    };
  });
}

async function scrollThrough(page, steps = 60, stepMs = 260) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), (height * i) / steps);
    await page.waitForTimeout(stepMs);
  }
}

async function newPage(browser, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") report.console.push(`[${width}] ${m.type()}: ${m.text().slice(0, 200)}`);
  });
  page.on("requestfailed", (r) => report.failedRequests.push(`[${width}] ${r.url().slice(0, 140)} — ${r.failure()?.errorText}`));
  page.on("response", (r) => {
    if (r.status() >= 400) report.failedRequests.push(`[${width}] HTTP ${r.status()} ${r.url().slice(0, 140)}`);
  });
  return { ctx, page };
}

const browser = await chromium.launch();

/* ---------------- PASS 1: mobile 390 — full journey ---------------- */
{
  const { ctx, page } = await newPage(browser, 390, 844);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${OUT}/01-envelope-390.png` });

  report.overflow["390-envelope"] = await checkOverflow(page);

  // open the gift
  await page.locator("button.btn-ghost", { hasText: "OPEN YOUR GIFT" }).click();
  await page.waitForTimeout(3400);
  await page.screenshot({ path: `${OUT}/02-hero-390.png` });
  report.interactions.envelopeOpened = await page.locator("#hero").count();
  report.overflow["390-hero"] = await checkOverflow(page);

  // scroll the full story, capture known checkpoints
  const sceneIds = ["hero-memory", "memories", "qualities", "song", "letter", "wishes", "reveal", "ending"];
  for (const id of sceneIds) {
    await page.evaluate((sid) => {
      const el = document.getElementById(sid);
      el.scrollIntoView({ behavior: "instant", block: "start" });
    }, id);
    await page.waitForTimeout(1500);
    const label = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll("[data-scene]"));
      let cur = null;
      for (const s of sections) if (s.getBoundingClientRect().top <= window.innerHeight * 0.55) cur = s;
      return cur?.dataset.label ?? "(none)";
    });
    report.scenes.push({ id, label });
  }

  // mid-memory chapter screenshot
  await page.evaluate(() => document.getElementById("memories").scrollIntoView());
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const doc = document.documentElement;
    window.scrollTo(0, doc.scrollHeight * 0.235);
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/03-memory-chapter-390.png` });

  // qualities — keyboard navigation
  await page.evaluate(() => document.getElementById("qualities").scrollIntoView());
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/04-qualities-390.png` });
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(700);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(700);
  const qLabel = await page.locator("[aria-live='polite']").first().textContent();
  report.interactions.galleryKeyboard = qLabel?.trim();

  // music — play
  await page.evaluate(() => document.getElementById("song").scrollIntoView());
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/05-song-390.png` });
  await page.getByRole("button", { name: "Play music" }).first().click();
  await page.waitForTimeout(2500);
  report.interactions.musicPlaying = await page.evaluate(() => {
    const btn = document.querySelector('[aria-pressed]');
    return [...document.querySelectorAll("button")].some((b) => b.getAttribute("aria-label") === "Pause music");
  });
  await page.screenshot({ path: `${OUT}/05b-song-playing-390.png` });
  // scroll far away -> should auto-pause
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  report.interactions.musicAutopaused = !(await page.evaluate(() =>
    [...document.querySelectorAll("button")].some((b) => b.getAttribute("aria-label") === "Pause music")
  ));

  // letter
  await page.evaluate(() => document.getElementById("letter").scrollIntoView());
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/06-letter-390.png` });

  // wishes + reveal + ending
  await page.evaluate(() => document.getElementById("wishes").scrollIntoView());
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/07-wishes-390.png` });
  await page.evaluate(() => {
    const el = document.getElementById("reveal");
    el.scrollIntoView();
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const doc = document.documentElement;
    const top = document.getElementById("reveal").getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + window.innerHeight * 3.1);
  });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/08-reveal-390.png` });
  report.interactions.confetti = await page.evaluate(() => {
    const c = document.querySelector("#reveal canvas");
    return c ? "canvas present" : "MISSING";
  });
  await page.evaluate(() => document.getElementById("ending").scrollIntoView());
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${OUT}/09-ending-390.png` });

  // replay
  await page.getByRole("button", { name: /experience it again/i }).click();
  await page.waitForTimeout(1200);
  report.interactions.replay = await page.evaluate(() => !!document.querySelector("[role='dialog']"));
  await page.screenshot({ path: `${OUT}/10-replay-envelope-390.png` });

  // images all loaded?
  report.interactions.brokenImages = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    return imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src);
  });

  report.overflow["390-full"] = await checkOverflow(page);
  await ctx.close();
}

/* ---------------- PASS 2: widths 360 / 430 / 768 / 1440 ---------------- */
for (const w of [360, 430, 768, 1440]) {
  const { ctx, page } = await newPage(browser, w, w === 1440 ? 900 : 800);
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await page.locator("button.btn-ghost", { hasText: "OPEN YOUR GIFT" }).click();
  await page.waitForTimeout(2800);
  const o = await checkOverflow(page);
  report.overflow[`${w}-hero`] = { hasHorizontalScroll: o.hasHorizontalScroll, scrollW: o.scrollW, innerW: o.innerW };
  if (w === 360 || w === 1440) {
    await page.screenshot({ path: `${OUT}/hero-${w}.png` });
    // scroll through everything quickly to trigger lazy loads
    await scrollThrough(page, 40, 160);
    const o2 = await checkOverflow(page);
    report.overflow[`${w}-full`] = { hasHorizontalScroll: o2.hasHorizontalScroll, scrollW: o2.scrollW, innerW: o2.innerW, overflowers: o2.overflowers };
    if (w === 1440) await page.screenshot({ path: `${OUT}/full-1440-end.png` });
  }
  await ctx.close();
}

/* ---------------- PASS 3: reduced motion ---------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") report.console.push(`[reduced] error: ${m.text().slice(0, 200)}`);
  });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.locator("button.btn-ghost", { hasText: "OPEN YOUR GIFT" }).click();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/11-reduced-hero-390.png` });
  report.interactions.reducedMotionHero = await page.locator("#hero").count();
  await scrollThrough(page, 24, 140);
  report.interactions.reducedMotionEnd = await page.evaluate(() => !!document.getElementById("ending"));
  await ctx.close();
}

await browser.close();
fs.writeFileSync("tools/qa-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
