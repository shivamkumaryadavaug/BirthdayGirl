# A Little Surprise — August 02

> *“A little corner of the internet, made entirely for you.”*

A cinematic, scrapbook-style birthday experience. Next.js 15 + Tailwind v4 + framer-motion.
All of her photographs and the decorative scrapbook elements from the original site are
preserved in `public/ref`, `public/elements`, `public/pages` and `public/frames`.

---

## The story (10 scenes)

| # | Scene | What happens |
|---|-------|--------------|
| 01 | The Envelope | A sealed letter on a dark stage — click the wax seal to open it (with a soft paper sound) |
| 02 | The Card | “HAPPY BIRTHDAY, SWEETY.” — huge editorial serif, staggered mask reveal |
| 03 | Where it begins | One photograph, given its own space, with slow parallax |
| 04 | Our Little Memories | 12 memories as a pinned, page-turning scrapbook — full-bleed, polaroid, matted and tall layouts |
| 05 | Things I Love | Nine names (Cutie → Queen) in a draggable/swipeable gallery |
| 06 | Our Song | A vintage vinyl player — press play, the record spins, lyrics fade in (audio never autoplays) |
| 07 | The Letter | A physical letter that unfolds, on torn old paper, with a hand-drawn signature |
| 08 | The Year Ahead | Wishes appear one by one under a rising moon |
| 09 | One More Thing | The dark reveal — “…I’d give you every reason to smile.” + soft paper confetti |
| 10 | The End — For Now | “— Shivam” and a replay button |

---

## Editing every word (one file)

**Everything personal lives in [`data/birthday.ts`](data/birthday.ts):**
name, date, hero copy, all 12 memory captions/messages, the nine qualities,
the letter (paragraphs, closing, signature, P.S.), the wishes, the final reveal
and the ending. No component contains hardcoded personal text.

## Changing the song

Drop your real song at `public/music/our-song.mp3` (replace the generated one)
and update the title / lyrics in `data/birthday.ts` → `song`.
The current file is a gentle original piano piece synthesized by `tools/make_song.py`.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

Deploy exactly like the original: push to GitHub → import in Vercel.

## Quality notes

- Mobile-first: tested at 360 / 390 / 430 / 768 / 1440 — no horizontal overflow,
  ≥44px touch targets, safe-area aware (`viewport-fit=cover`)
- No console errors; all images verified loading (automated Playwright QA: `node tools/qa.mjs`)
- `prefers-reduced-motion` replaces cinematic movement with simple fades
- Audio: no autoplay, pauses when the scene scrolls away or the tab hides
- Images: `next/image` with AVIF/WebP, lazy loading, only 3 memory photos mounted at a time
- Custom cursor on precise pointers only; disabled on touch
