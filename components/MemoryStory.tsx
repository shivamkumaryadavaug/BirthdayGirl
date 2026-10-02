"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { birthday, type Memory } from "@/data/birthday";
import { usePrefersReducedMotion } from "@/lib/hooks";

const EASE = [0.22, 1, 0.36, 1] as const;
const N = birthday.memories.length;

/* decorative scrapbook accents — one every few chapters, never all at once */
const DECOR: Record<number, { src: string; cls: string; w: number }> = {
  2: { src: "/elements/butter.png", cls: "right-[6%] top-[12%] rotate-12", w: 84 },
  5: { src: "/elements/starem.png", cls: "left-[5%] bottom-[16%] -rotate-12", w: 64 },
  8: { src: "/elements/boqey.png", cls: "right-[8%] bottom-[10%] rotate-6", w: 92 },
  11: { src: "/elements/twoStar.png", cls: "left-[7%] top-[14%] -rotate-6", w: 78 },
};

function Chapter({
  memory,
  index,
  t,
}: {
  memory: Memory;
  index: number;
  t: MotionValue<number>;
}) {
  const reduce = usePrefersReducedMotion();
  const variant = index % 4;
  const next = birthday.memories[(index + 1) % N];

  const opacity = useTransform(t, [-0.42, -0.1, 0.64, 0.96], [0, 1, 1, 0]);
  const scale = useTransform(
    t,
    [-0.42, 0.08, 0.64, 1],
    reduce ? [1, 1, 1, 1] : [1.06, 1, 1, 0.94]
  );
  const y = useTransform(
    t,
    [-0.42, 0.05, 0.64, 1],
    reduce ? [0, 0, 0, 0] : [52, 0, 0, -46]
  );
  const textOpacity = useTransform(t, [-0.34, -0.02, 0.58, 0.9], [0, 1, 1, 0]);
  const textY = useTransform(
    t,
    [-0.34, 0.1, 0.58, 1],
    reduce ? [0, 0, 0, 0] : [34, 0, 0, -28]
  );

  const num = String(index + 1).padStart(2, "0");
  const decor = DECOR[index];

  /* every photo, its own composition — no template grids */
  const photoBlock = (() => {
    if (variant === 1)
      return (
        <div className="relative mx-auto w-full max-w-[380px] rotate-[-2.2deg] md:mr-[9%] md:ml-auto md:rotate-[-2.6deg]">
          <span className="tape -top-3 left-1/2 z-10 -translate-x-1/2 -rotate-3" />
          <figure className="polaroid">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={memory.image}
                alt={memory.alt}
                fill
                sizes="(max-width: 768px) 88vw, 400px"
                className="photo object-cover"
              />
            </div>
            <figcaption className="polaroid__caption hand px-1 pt-3 text-center text-[1.4rem] leading-none text-ink/80">
              “{memory.caption}”
            </figcaption>
          </figure>
        </div>
      );

    if (variant === 2)
      return (
        <figure
          className="relative mx-auto w-full max-w-[470px] md:ml-[7%] md:mr-auto"
          style={{
            background: "#e8ded0",
            padding: "clamp(14px, 2.4vw, 26px)",
            boxShadow:
              "0 1px 2px rgba(30,22,16,.12), 0 18px 40px -12px rgba(30,22,16,.32)",
          }}
        >
          <div
            className="relative aspect-[4/5] overflow-hidden outline outline-1 outline-wine/25 md:aspect-[4/5]"
            style={{ outlineOffset: "6px" }}
          >
            <Image
              src={memory.image}
              alt={memory.alt}
              fill
              sizes="(max-width: 768px) 88vw, 470px"
              className="photo object-cover"
            />
          </div>
        </figure>
      );

    if (variant === 3)
      return (
        <div className="relative mx-auto w-full max-w-[420px] md:ml-[10%] md:mr-auto">
          <figure
            className="photo-frame rotate-[0.8deg]"
            style={{ transform: "rotate(0.8deg)" }}
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={memory.image}
                alt={memory.alt}
                fill
                sizes="(max-width: 768px) 88vw, 420px"
                className="photo object-cover"
              />
            </div>
          </figure>
          {/* the next memory, already peeking */}
          <div
            aria-hidden="true"
            className="polaroid absolute -bottom-8 -right-4 hidden w-[132px] rotate-[6deg] md:block"
          >
            <span className="tape tape--rose -top-3 left-1/2 -translate-x-1/2 rotate-6" />
            <Image
              src={next.image}
              alt=""
              width={160}
              height={160}
              className="photo aspect-square w-full object-cover"
              sizes="132px"
            />
          </div>
        </div>
      );

    /* variant 0 — full-bleed cinematic print */
    return (
      <figure className="relative mx-auto w-full max-w-[820px]">
        <div
          className="relative aspect-[4/3] overflow-hidden md:aspect-[16/10] md:h-[62vh] md:w-auto md:max-w-full"
          style={{
            boxShadow: "0 24px 60px -18px rgba(30,22,16,.42)",
          }}
        >
          <Image
            src={memory.image}
            alt={memory.alt}
            fill
            sizes="(max-width: 768px) 92vw, 820px"
            className="photo object-cover"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 100% at 50% 45%, transparent 60%, rgba(23,21,21,.2) 100%)",
            }}
          />
        </div>
      </figure>
    );
  })();

  return (
    <motion.article
      className="absolute inset-0 flex items-center"
      style={{ opacity, scale, y, willChange: "transform, opacity" }}
      aria-hidden={false}
    >
      <div className="mx-auto grid w-full max-w-[1100px] items-center gap-8 px-6 md:grid-cols-[auto_1fr] md:gap-14">
        {/* photo */}
        <motion.div style={{ scale }} className="order-1">
          {photoBlock}
        </motion.div>

        {/* words */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className={
            variant === 1
              ? "order-2 max-w-[26ch] md:pl-[6%]"
              : "order-2 max-w-[26ch]"
          }
        >
          <p className="eyebrow text-rose">
            MEMORY {num} <span className="text-muted">/ {N}</span>
          </p>
          <h3 className="hand mt-4 rotate-[-1.6deg] text-[clamp(1.6rem,4.6vw,2.3rem)] leading-tight text-ink">
            “{memory.caption}”
          </h3>
          <p className="serif-body mt-5 text-muted">{memory.message}</p>
          <span className="rule mt-7 block w-16 text-ink" aria-hidden="true" />
        </motion.div>
      </div>

      {/* occasional scrapbook accent */}
      {decor && (
        <Image
          src={decor.src}
          alt=""
          width={decor.w}
          height={decor.w}
          aria-hidden="true"
          className={`float-slow pointer-events-none absolute hidden opacity-90 md:block ${decor.cls}`}
          style={{ width: decor.w, ["--tilt" as string]: "0deg" }}
        />
      )}
    </motion.article>
  );
}

export default function MemoryStory() {
  const reduce = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(N - 1, Math.max(0, Math.floor(p * N)));
    setIdx((prev) => (prev === i ? prev : i));
  });

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.dataset.label = `MEMORY ${String(idx + 1).padStart(2, "0")} / ${N}`;
    }
  }, [idx]);

  const visible = useMemo(() => [idx - 1, idx, idx + 1].filter((k) => k >= 0 && k < N), [idx]);

  const intro = {
    initial: { opacity: 0, y: reduce ? 0 : 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-18%" },
    transition: { duration: 1, ease: EASE },
  };

  return (
    <section
      ref={sectionRef}
      id="memories"
      data-scene
      data-label="OUR LITTLE MEMORIES"
      aria-label="Our little memories"
    >
      {/* ——— intro ——— */}
      <div className="mx-auto flex min-h-[72vh] w-full max-w-[1100px] flex-col items-start justify-center px-6 md:min-h-[86vh]">
        <motion.p className="eyebrow text-muted" {...intro}>
          {birthday.memoriesIntro.eyebrow}
        </motion.p>
        <motion.h2
          className="display mt-6 text-[clamp(2.7rem,10vw,6.8rem)] text-ink"
          {...intro}
          transition={{ ...intro.transition, delay: 0.12 }}
        >
          {birthday.memoriesIntro.title.map((l, i) => (
            <span key={i} className="block">
              {l}
            </span>
          ))}
        </motion.h2>
        <motion.p
          className="serif-body mt-8 text-muted"
          {...intro}
          transition={{ ...intro.transition, delay: 0.24 }}
        >
          {birthday.memoriesIntro.sub.map((l, i) => (
            <span key={i} className="block">
              {l}
            </span>
          ))}
        </motion.p>
        <motion.p
          className="hand mt-6 rotate-[-2deg] text-[1.4rem] text-wine/75"
          {...intro}
          transition={{ ...intro.transition, delay: 0.36 }}
        >
          {birthday.memoriesIntro.note} ↴
        </motion.p>
      </div>

      {/* ——— the book: one memory per viewport of scroll ——— */}
      <div ref={scrollRef} style={{ height: `${(N + 0.75) * 100}vh` }}>
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          {visible.map((k) => (
            <ChapterWithT
              key={k}
              index={k}
              scrollYProgress={scrollYProgress}
            />
          ))}

          {/* chapter progress */}
          <div
            aria-hidden="true"
            className="absolute bottom-[max(1.4rem,env(safe-area-inset-bottom))] left-1/2 flex -translate-x-1/2 items-center gap-4"
          >
            <span className="eyebrow text-[9px] text-muted">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="h-px w-36 bg-ink/15">
              <div
                className="h-full origin-left bg-wine/70"
                style={{
                  transform: `scaleX(${
                    (idx + 0.5) / N
                  })`,
                  transition: "transform .5s cubic-bezier(.22,1,.36,1)",
                }}
              />
            </div>
            <span className="eyebrow text-[9px] text-muted">{N}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* separates the per-chapter MotionValue creation (hooks rule) */
function ChapterWithT({
  index,
  scrollYProgress,
}: {
  index: number;
  scrollYProgress: MotionValue<number>;
}) {
  const t = useTransform(scrollYProgress, (p) => p * N - index);
  return <Chapter memory={birthday.memories[index]} index={index} t={t} />;
}
