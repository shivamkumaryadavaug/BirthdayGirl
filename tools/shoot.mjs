import { chromium } from "playwright";
import fs from "node:fs";
const browser = await chromium.launch();
const shots = [
  { w: 390, h: 844, name: "hero-390", wait: 4200, sec: null },
  { w: 1440, h: 900, name: "hero-1440", wait: 4200, sec: null },
  { w: 1440, h: 900, name: "memory-1440", wait: 1600, sec: "memories", scroll: 0.24 },
  { w: 1440, h: 900, name: "qualities-1440", wait: 1600, sec: "qualities" },
  { w: 1440, h: 900, name: "song-1440", wait: 2000, sec: "song" },
  { w: 1440, h: 900, name: "letter-1440", wait: 2400, sec: "letter" },
  { w: 1440, h: 900, name: "wishes-1440", wait: 1800, sec: "wishes", scroll: 0.3 },
  { w: 1440, h: 900, name: "reveal-1440", wait: 2000, sec: "reveal", scroll: 3.2 },
  { w: 1440, h: 900, name: "ending-1440", wait: 2400, sec: "ending" },
  { w: 360, h: 780, name: "hero-360", wait: 4200, sec: null },
];
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message.slice(0, 150)));
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await page.locator("button.btn-ghost", { hasText: "OPEN YOUR GIFT" }).click();
  try {
    await page.waitForSelector("#hero", { timeout: 6000 });
  } catch {
    // hydration race — click again
    await page.locator("button.btn-ghost", { hasText: "OPEN YOUR GIFT" }).click().catch(() => {});
    await page.waitForSelector("#hero", { timeout: 8000 });
  }
  await page.waitForTimeout(s.wait);
  if (s.sec) {
    await page.evaluate((id) => document.getElementById(id).scrollIntoView(), s.sec);
    await page.waitForTimeout(600);
    if (s.scroll) {
      await page.evaluate(({ id, frac }) => {
        const top = document.getElementById(id).getBoundingClientRect().top + scrollY;
        scrollTo(0, top + innerHeight * frac);
      }, { id: s.sec, frac: s.scroll });
    }
    await page.waitForTimeout(1400);
  }
  await page.screenshot({ path: `tools/shots/final-${s.name}.png` });
  if (errs.length) console.log(`ERRS ${s.name}:`, errs);
  await page.close();
}
await browser.close();
console.log("shots done");
