"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { birthday } from "@/data/birthday";
import { usePrefersReducedMotion } from "@/lib/hooks";

type Props = {
  onOpened: () => void;
};

/** tiny, tasteful paper sound — created only after the click gesture */
function playPaperSound() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const dur = 0.9;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      // two soft "slide" swells, like paper dragging out
      const env =
        Math.exp(-Math.pow((t - 0.18) * 6, 2)) * 0.9 +
        Math.exp(-Math.pow((t - 0.62) * 5, 2)) * 0.7;
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(700, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(2200, ctx.currentTime + 0.7);
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.value = 0.055;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    src.onended = () => ctx.close();
  } catch {
    /* sound is optional — silence is fine */
  }
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export default function Envelope({ onOpened }: Props) {
  const reduce = usePrefersReducedMotion();
  const [opening, setOpening] = useState(false);
  const [flapBehind, setFlapBehind] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const envRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cta = envRef.current?.querySelector<HTMLButtonElement>("button[data-cta]");
    cta?.focus({ preventScroll: true });
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  const handleOpen = useCallback(() => {
    if (opening) return;
    setOpening(true);
    playPaperSound();

    if (reduce) {
      timers.current.push(setTimeout(onOpened, 650));
      return;
    }
    // flap passes vertical → drop it behind the letter
    timers.current.push(setTimeout(() => setFlapBehind(true), 560));
    // the story fades in beneath us while the overlay dissolves
    timers.current.push(setTimeout(onOpened, 2050));
  }, [opening, onOpened, reduce]);

  /* gentle physical tilt toward the cursor (desktop, idle only) */
  const tilt = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (opening || reduce) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--rx", `${-py * 5}deg`);
      el.style.setProperty("--ry", `${px * 6}deg`);
    },
    [opening, reduce]
  );
  const untilt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  }, []);

  return (
    <motion.section
      className="fixed inset-0 z-[100] flex flex-col items-center overflow-hidden bg-[#1b1815] vignette"
      role="dialog"
      aria-modal="true"
      aria-label="A little surprise, made just for you"
      exit={{ opacity: 0, scale: 1.045 }}
      transition={{ duration: 1.05, ease: EASE_OUT }}
    >
      {/* soft warm pool of light behind everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 38%, rgba(201,143,148,0.13), transparent 70%)",
        }}
      />

      <div className="relative flex h-full w-full max-w-[430px] flex-col items-center justify-between px-6 py-[max(5vh,env(safe-area-inset-top))] pb-[max(6vh,env(safe-area-inset-bottom))]">
        {/* ——— heading ——— */}
        <div className="flex flex-col items-center gap-5 pt-[4vh] text-center">
          <motion.p
            className="eyebrow text-[#c98f94]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2 }}
          >
            {birthday.envelope.eyebrow}
          </motion.p>
          <motion.h1
            className="display text-[clamp(2rem,8.5vw,3.1rem)] text-[#f5f0e8]"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE_OUT, delay: 0.38 }}
          >
            {birthday.envelope.title.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </motion.h1>
        </div>

        {/* ——— the envelope ——— */}
        <motion.div
          ref={envRef}
          onMouseMove={tilt}
          onMouseLeave={untilt}
          className="relative mt-6 w-[min(84vw,352px)]"
          style={{ perspective: 1100 }}
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.62 }}
        >
          <motion.div
            className="relative aspect-[10/7]"
            style={{
              transformStyle: "preserve-3d",
              transform:
                "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(0)",
              transition: "transform .5s cubic-bezier(.22,1,.36,1)",
            }}
            animate={
              opening
                ? { scale: [1, 1.04, 1], y: [0, -6, 0] }
                : { scale: 1, y: 0 }
            }
            transition={{ duration: 1.6, ease: EASE_OUT }}
          >
            {/* back panel */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-[10px]"
              style={{
                background: "linear-gradient(175deg, #d9c9ae, #cbb894 90%)",
                boxShadow:
                  "0 30px 60px -18px rgba(0,0,0,0.65), 0 4px 14px rgba(0,0,0,0.4)",
              }}
            />

            {/* the letter inside */}
            <motion.div
              className="absolute left-1/2 top-[7%] z-[3] w-[86%] -translate-x-1/2"
              initial={false}
              animate={opening ? { y: "-96%" } : { y: "6%" }}
              transition={
                reduce
                  ? { duration: 0.4 }
                  : { duration: 1.15, ease: EASE_OUT, delay: 0.95 }
              }
              style={{ willChange: "transform" }}
            >
              <div
                className="paper-sheet paper-fibre flex aspect-[10/8.6] flex-col items-center justify-center gap-2 rounded-[6px]"
                style={{ transform: "rotate(-1.2deg)" }}
              >
                <span className="eyebrow text-[8px] text-[#756e67]">
                  {birthday.envelope.eyebrow}
                </span>
                <span className="rule w-10 bg-[#756e67]/40" />
                <span className="hand text-[22px] text-[#5b2732]">
                  a little surprise
                </span>
                <span className="hand text-[17px] text-[#756e67]">for you</span>
              </div>
            </motion.div>

            {/* front pocket */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-[4] rounded-[10px]"
              style={{
                clipPath:
                  "polygon(0 0, 50% 30%, 100% 0, 100% 100%, 0 100%)",
                background:
                  "linear-gradient(180deg, #e6d7bd 0%, #dfd0b4 55%, #d6c5a5 100%)",
                boxShadow:
                  "inset 0 2px 3px rgba(255,252,240,0.55), inset 0 -3px 6px rgba(93,68,40,0.18)",
              }}
            />
            {/* pocket seams */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-[4] rounded-[10px]"
              style={{
                clipPath:
                  "polygon(0 0, 50% 30%, 100% 0, 100% 100%, 0 100%)",
                background:
                  "linear-gradient(115deg, rgba(93,68,40,0.14) 0%, transparent 28%, transparent 72%, linear-gradient(0deg, transparent, rgba(93,68,40,0.1))",
              }}
            />

            {/* top flap */}
            <motion.div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-[58%]"
              style={{
                zIndex: flapBehind ? 2 : 5,
                transformOrigin: "top center",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background:
                  "linear-gradient(180deg, #e9dcc4 0%, #e0d0b0 70%, #d8c6a2 100%)",
                boxShadow: "0 3px 8px rgba(80,60,35,0.25)",
                backfaceVisibility: "visible",
                willChange: "transform",
              }}
              initial={false}
              animate={opening ? { rotateX: -178 } : { rotateX: 0 }}
              transition={
                reduce
                  ? { duration: 0.3 }
                  : { duration: 0.95, ease: [0.3, 0.9, 0.35, 1], delay: 0.3 }
              }
            />

            {/* wax seal */}
            <motion.button
              type="button"
              data-cta
              data-cursor="open"
              onClick={handleOpen}
              aria-label="Open your gift"
              className="absolute left-1/2 z-[6] flex h-[72px] w-[72px] -translate-x-1/2 items-center justify-center rounded-full"
              style={{ top: "44%" }}
              initial={false}
              animate={
                opening
                  ? { scale: 0.35, opacity: 0, rotate: 28 }
                  : { scale: 1, opacity: 1, rotate: 0 }
              }
              transition={
                reduce
                  ? { duration: 0.25 }
                  : { duration: 0.5, ease: EASE_OUT }
              }
              whileHover={opening ? undefined : { scale: 1.07 }}
              whileTap={opening ? undefined : { scale: 0.92 }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 34% 30%, #8a3b49, #5b2732 58%, #471c26 100%)",
                  boxShadow:
                    "0 6px 14px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,190,190,0.28), inset 0 -3px 6px rgba(30,8,14,0.55)",
                }}
              />
              <span
                aria-hidden="true"
                className="absolute inset-[7px] rounded-full border border-[#e9b9bd]/25"
              />
              <span
                className="display relative text-[26px] text-[#e8c9c5]"
                style={{ textShadow: "0 1px 2px rgba(20,5,10,0.6)" }}
              >
                {birthday.envelope.seal}
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* ——— CTA ——— */}
        <motion.div
          className="flex w-full flex-col items-center gap-4 pb-[2vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button
            type="button"
            onClick={handleOpen}
            data-cursor="open"
            className="btn-ghost btn-ghost--cream w-full max-w-[300px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.9 }}
          >
            {birthday.envelope.cta}
          </motion.button>
          <motion.p
            className="text-[10px] uppercase tracking-[0.3em] text-[#756e67]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.25 }}
          >
            best enjoyed with sound on
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  );
}
