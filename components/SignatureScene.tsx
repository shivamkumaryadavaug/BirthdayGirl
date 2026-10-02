"use client";

import { motion } from "framer-motion";
import TornEdge from "./TornEdge";
import { birthday } from "@/data/birthday";
import { usePrefersReducedMotion } from "@/lib/hooks";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function SignatureScene({ onReplay }: { onReplay: () => void }) {
  const reduce = usePrefersReducedMotion();

  const step = (d: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-18%" },
    transition: { duration: 1, ease: EASE, delay: d },
  });

  return (
    <section
      id="ending"
      data-scene
      data-label="THE END — FOR NOW"
      className="relative overflow-hidden bg-cream pb-[10vh] pt-[16vh] text-ink"
      aria-label="That's our little story"
    >
      <TornEdge fill="#141110" />

      <div className="mx-auto flex min-h-[80vh] w-full max-w-[860px] flex-col items-center justify-center px-6 text-center">
        <motion.h2
          className="display text-[clamp(2.5rem,10vw,6.4rem)]"
          {...step(0)}
        >
          {birthday.ending.title.map((l, i) => (
            <span key={i} className="block">
              {l}
            </span>
          ))}
        </motion.h2>

        <div className="mt-14 space-y-4">
          {birthday.ending.lines.map((l, i) => (
            <motion.p
              key={i}
              className="serif-body text-muted"
              {...step(0.25 + i * 0.15)}
            >
              {l}
            </motion.p>
          ))}
        </div>

        <motion.p
          className="display mt-16 text-[clamp(2.4rem,9vw,5.4rem)] italic text-wine"
          {...step(0.8)}
        >
          {birthday.ending.final}
        </motion.p>

        <motion.div className="mt-14" {...step(1)}>
          <p className="hand text-[clamp(2.2rem,7vw,3.2rem)] text-ink">
            {birthday.ending.signature}
          </p>
          <svg
            viewBox="0 0 220 14"
            className="mx-auto mt-1 h-3 w-[200px] text-rose"
            aria-hidden="true"
          >
            <motion.path
              d="M4 9 C 60 3, 120 12, 216 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: reduce ? 0.3 : 1.4, ease: EASE, delay: 1.1 }}
            />
          </svg>
        </motion.div>

        <motion.button
          type="button"
          onClick={onReplay}
          data-cursor="again"
          className="btn-ghost btn-ghost--ink mt-[9vh]"
          {...step(1.35)}
        >
          ↻ {birthday.ending.replay}
        </motion.button>

        <motion.p
          className="mt-[8vh] text-[9px] uppercase tracking-[0.3em] text-muted/70"
          {...step(1.6)}
        >
          {birthday.ending.footer}
        </motion.p>
      </div>
    </section>
  );
}
