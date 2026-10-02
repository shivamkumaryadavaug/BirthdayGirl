"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import TornEdge from "./TornEdge";
import { birthday } from "@/data/birthday";
import { usePrefersReducedMotion } from "@/lib/hooks";

type Slot = { text: string; hand?: boolean; small?: boolean };

export default function FutureWishes() {
  const reduce = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const slots: Slot[] = useMemo(
    () => [
      ...birthday.wishes.map((w) => ({ text: w })),
      { text: birthday.wishesClosing[0], small: true },
      { text: birthday.wishesClosing[1], hand: true },
    ],
    []
  );
  const N = slots.length;

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(N - 1, Math.max(0, Math.floor(p * N)));
    setIdx((prev) => (prev === i ? prev : i));
  });

  const moonY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [150, -40]);
  const moonOpacity = useTransform(scrollYProgress, [0, 0.25, 0.9, 1], [0, 0.95, 0.95, 0.6]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.5, 0.66], [1, 1, 0]);

  const visible = useMemo(
    () => [idx - 1, idx, idx + 1].filter((k) => k >= 0 && k < N),
    [idx, N]
  );

  return (
    <section
      id="wishes"
      data-scene
      data-label="THE YEAR AHEAD"
      className="relative bg-night text-cream"
      aria-label="For the year ahead"
    >
      <TornEdge fill="#f5f0e8" />

      {/* the moon, rising as you scroll */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-[10%] w-[110px] md:w-[150px]"
        style={{ y: moonY, opacity: moonOpacity }}
      >
        <Image
          src="/elements/moon.png"
          alt=""
          width={300}
          height={300}
          className="w-full select-none object-contain"
          draggable={false}
        />
      </motion.div>
      <Image
        src="/elements/twoStar.png"
        alt=""
        width={110}
        height={110}
        aria-hidden="true"
        className="float-slow pointer-events-none absolute bottom-[16%] left-[10%] w-[64px] opacity-70 md:w-[84px]"
        draggable={false}
      />

      <div ref={scrollRef} style={{ height: `${(N + 0.8) * 100}vh` }}>
        <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden px-6">
          {/* heading — quietly steps aside */}
          <motion.div
            className="absolute top-[16%] flex flex-col items-center gap-5 text-center"
            style={{ opacity: headOpacity }}
          >
            <p className="eyebrow text-rose">{birthday.wishesIntro.eyebrow}</p>
            <h2 className="display text-[clamp(2.2rem,8vw,5rem)]">
              {birthday.wishesIntro.title.map((l, i) => (
                <span key={i} className="block">
                  {l}
                </span>
              ))}
            </h2>
          </motion.div>

          {visible.map((k) => (
            <SlotWithT key={k} slot={slots[k]} index={k} scrollYProgress={scrollYProgress} n={N} reduce={reduce} />
          ))}

          {/* wish progress */}
          <div
            aria-hidden="true"
            className="absolute bottom-[max(1.4rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 items-center gap-4"
          >
            <span className="eyebrow text-[9px] text-cream/40">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="h-px w-32 bg-cream/15">
              <div
                className="h-full origin-left bg-rose"
                style={{
                  transform: `scaleX(${(idx + 0.5) / N})`,
                  transition: "transform .5s cubic-bezier(.22,1,.36,1)",
                }}
              />
            </div>
            <span className="eyebrow text-[9px] text-cream/40">{N}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SlotWithT({
  slot,
  index,
  scrollYProgress,
  n,
  reduce,
}: {
  slot: Slot;
  index: number;
  scrollYProgress: MotionValue<number>;
  n: number;
  reduce: boolean;
}) {
  const t = useTransform(scrollYProgress, (p) => p * n - index);
  const opacity = useTransform(t, [-0.4, -0.08, 0.62, 0.94], [0, 1, 1, 0]);
  const y = useTransform(
    t,
    [-0.4, 0.05, 0.62, 1],
    reduce ? [0, 0, 0, 0] : [36, 0, 0, -30]
  );

  return (
    <motion.p
      className={
        slot.hand
          ? "hand max-w-[20ch] rotate-[-1.5deg] text-center text-[clamp(1.9rem,6.5vw,3.2rem)] text-rose"
          : slot.small
            ? "serif-body max-w-[24ch] text-center italic text-cream/75"
            : "display max-w-[16ch] text-center text-[clamp(2.4rem,9vw,5.4rem)] italic"
      }
      style={{ opacity, y, willChange: "transform, opacity" }}
    >
      {slot.text}
    </motion.p>
  );
}
