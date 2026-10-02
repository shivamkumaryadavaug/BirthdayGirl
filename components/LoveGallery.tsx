"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { birthday } from "@/data/birthday";
import { usePrefersReducedMotion } from "@/lib/hooks";

const EASE = [0.22, 1, 0.36, 1] as const;
const QS = birthday.qualities;
const GAP = 28;

export default function LoveGallery() {
  const reduce = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  const [step, setStep] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);

  const measure = useCallback(() => {
    if (slideRef.current) {
      setStep(slideRef.current.offsetWidth + GAP);
    }
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const go = useCallback(
    (dir: 1 | -1) => {
      setI((prev) => Math.min(QS.length - 1, Math.max(0, prev + dir)));
    },
    []
  );

  const onDragEnd = useCallback(
    (_e: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const th = Math.max(60, step * 0.2);
      if (info.offset.x < -th || info.velocity.x < -420) go(1);
      else if (info.offset.x > th || info.velocity.x > 420) go(-1);
    },
    [go, step]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  const intro = {
    initial: { opacity: 0, y: reduce ? 0 : 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-15%" },
    transition: { duration: 1, ease: EASE },
  };

  return (
    <section
      id="qualities"
      data-scene
      data-label="THINGS I LOVE"
      className="relative overflow-hidden bg-paperdeep py-[16vh] paper-fibre"
      aria-label="Things I love about you"
    >
      <div className="mx-auto w-full max-w-[1100px] px-6">
        <motion.p className="eyebrow text-muted" {...intro}>
          {birthday.qualitiesIntro.eyebrow}
        </motion.p>
        <motion.h2
          className="display mt-6 text-[clamp(2.5rem,9vw,6rem)] text-ink"
          {...intro}
          transition={{ ...intro.transition, delay: 0.12 }}
        >
          {birthday.qualitiesIntro.title.map((l, k) => (
            <span key={k} className="block">
              {l}
            </span>
          ))}
        </motion.h2>
        <motion.p
          className="hand mt-5 rotate-[-2deg] text-[1.35rem] text-wine/75"
          {...intro}
          transition={{ ...intro.transition, delay: 0.24 }}
        >
          {birthday.qualitiesIntro.hint}
        </motion.p>
      </div>

      {/* ——— carousel ——— */}
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Nine things I love about you"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="mt-[9vh] outline-none"
      >
        <div
          ref={viewportRef}
          data-cursor="drag"
          className="overflow-hidden py-6"
        >
          <motion.div
            className="flex"
            style={{ gap: GAP }}
            animate={{ x: -i * step }}
            transition={
              reduce
                ? { duration: 0.25 }
                : { type: "spring", stiffness: 170, damping: 27, mass: 0.9 }
            }
            drag={reduce ? false : "x"}
            dragConstraints={{
              left: -step * (QS.length - 1),
              right: 0,
            }}
            dragElastic={0.06}
            onDragEnd={onDragEnd}
          >
            {QS.map((q, k) => {
              const active = k === i;
              return (
                <div
                  key={q.title}
                  ref={k === 0 ? slideRef : undefined}
                  aria-hidden={!active}
                  aria-roledescription="slide"
                  aria-label={`${k + 1} of ${QS.length}`}
                  className="w-[min(88vw,820px)] shrink-0"
                >
                  <div className="grid items-center gap-8 md:grid-cols-[0.95fr_1fr] md:gap-12">
                    {/* photo */}
                    <motion.div
                      className="photo-frame relative"
                      style={{
                        rotate: k % 2 === 0 ? "-1.4deg" : "1.4deg",
                        transform: `rotate(${k % 2 === 0 ? "-1.4deg" : "1.4deg"})`,
                        transition: "transform .5s cubic-bezier(.22,1,.36,1)",
                      }}
                      whileHover={reduce ? undefined : { y: -6 }}
                    >
                      <span className="tape -top-3 left-1/2 z-10 -translate-x-1/2 -rotate-2" />
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <Image
                          src={q.image}
                          alt={q.alt}
                          fill
                          sizes="(max-width: 768px) 88vw, 420px"
                          className="photo object-cover"
                        />
                      </div>
                      <span className="eyebrow absolute bottom-3 right-4 text-[8px] text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,.5)]">
                        {birthday.dateShort}
                      </span>
                    </motion.div>

                    {/* words */}
                    <div className="px-1 md:pl-4">
                      <p className="eyebrow text-rose">
                        {String(k + 1).padStart(2, "0")} — {q.category}
                      </p>
                      <h3 className="display mt-4 text-[clamp(2.6rem,8vw,4.6rem)] leading-[1.02] text-ink">
                        {q.title.toUpperCase()}
                        <span className="ml-3 inline-block align-middle text-[0.7em]">
                          {q.emoji}
                        </span>
                      </h3>
                      <p className="serif-body mt-6 max-w-[26ch] italic text-muted">
                        {q.message}
                      </p>
                      <span
                        className="rule mt-8 block w-14 text-ink"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ——— controls ——— */}
        <div className="mx-auto mt-10 flex w-full max-w-[1100px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={i === 0}
              aria-label="Previous"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink transition-colors duration-300 hover:bg-ink hover:text-cream disabled:opacity-30"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={i === QS.length - 1}
              aria-label="Next"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink transition-colors duration-300 hover:bg-ink hover:text-cream disabled:opacity-30"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <p
            className="eyebrow text-[10px] text-muted"
            aria-live="polite"
          >
            {String(i + 1).padStart(2, "0")} / {String(QS.length).padStart(2, "0")}
          </p>

          <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
            {QS.map((q, k) => (
              <button
                key={q.title}
                type="button"
                role="tab"
                aria-selected={k === i}
                aria-label={`${q.title} — slide ${k + 1}`}
                onClick={() => setI(k)}
                className="group p-1.5"
              >
                <span
                  className={`block h-[3px] rounded-full transition-all duration-500 ${
                    k === i ? "w-8 bg-wine" : "w-3 bg-ink/25 group-hover:bg-ink/50"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
