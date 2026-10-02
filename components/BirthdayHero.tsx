"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { birthday } from "@/data/birthday";
import { usePrefersReducedMotion } from "@/lib/hooks";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function BirthdayHero() {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -70]);
  const peekY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);

  const begin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    document
      .getElementById("hero-memory")
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  const line = (i: number) => ({
    initial: { y: reduce ? "0%" : "115%" },
    animate: { y: "0%" },
    transition: {
      duration: reduce ? 0.5 : 1.0,
      ease: EASE,
      delay: 0.32 + i * 0.11,
    },
  });

  const fade = (d: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: EASE, delay: d },
  });

  return (
    <section
      ref={ref}
      id="hero"
      data-scene
      data-label="AUGUST 02 — THE CARD"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6"
      aria-label="Happy birthday, Sweety"
    >
      <div className="flex w-full max-w-[1100px] flex-col items-center">
        {/* eyebrow */}
        <motion.div className="flex items-center gap-4" {...fade(0.25)}>
          <span className="rule w-10 text-ink" aria-hidden="true" />
          <p className="eyebrow text-muted">{birthday.hero.eyebrow}</p>
          <span className="rule w-10 text-ink" aria-hidden="true" />
        </motion.div>

        {/* the big editorial title */}
        <motion.h1
          className="display mt-8 text-center text-[clamp(3.4rem,15.5vw,10.5rem)] text-ink"
          style={{ y: titleY }}
        >
          {birthday.hero.title.map((l, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className={
                  l === birthday.hero.accentWord
                    ? "block font-medium italic tracking-[-0.01em] text-rose"
                    : "block"
                }
                {...line(i)}
              >
                {l}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {/* handwritten accent */}
        <motion.p
          className="hand -mt-2 rotate-[-4deg] self-end pr-[8%] text-[clamp(1.25rem,3.4vw,1.7rem)] text-wine/80 md:-mt-6"
          {...fade(0.95)}
        >
          {birthday.hero.handNote}
        </motion.p>

        {/* supporting text */}
        <motion.p
          className="serif-body mt-10 text-center text-muted md:mt-14"
          {...fade(1.1)}
        >
          {birthday.hero.subtitle.map((l, i) => (
            <span key={i} className="block">
              {l}
            </span>
          ))}
        </motion.p>

        {/* CTA */}
        <motion.button
          type="button"
          onClick={begin}
          data-cursor="view"
          className="link-line mt-12 text-ink md:mt-16"
          {...fade(1.3)}
        >
          {birthday.hero.cta}
          <span aria-hidden="true" className={reduce ? "" : "bob-soft"}>
            ↓
          </span>
        </motion.button>
      </div>

      {/* polaroids peeking in from the corner */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] hidden w-[290px] select-none sm:block md:-right-8 md:w-[340px]"
        style={{ y: peekY }}
      >
        <motion.div {...fade(1.45)}>
          <div
            className="polaroid relative w-[58%] rotate-[7deg]"
            style={{ "--tilt": "7deg" } as React.CSSProperties}
          >
            <span className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-6" />
            <Image
              src={birthday.hero.peek[0]}
              alt=""
              width={290}
              height={290}
              className="photo aspect-square w-full object-cover"
              sizes="(max-width: 768px) 180px, 220px"
            />
          </div>
          <div
            className="polaroid absolute -bottom-10 right-0 w-[52%] rotate-[-5deg]"
            style={{ "--tilt": "-5deg" } as React.CSSProperties}
          >
            <span className="tape tape--rose -top-3 left-1/2 -translate-x-1/2 rotate-3" />
            <Image
              src={birthday.hero.peek[1]}
              alt=""
              width={290}
              height={290}
              className="photo aspect-square w-full object-cover"
              sizes="(max-width: 768px) 160px, 200px"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
