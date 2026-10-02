"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import TornEdge from "./TornEdge";
import { birthday } from "@/data/birthday";
import { usePrefersReducedMotion } from "@/lib/hooks";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function LetterScene() {
  const reduce = usePrefersReducedMotion();
  const letterRef = useRef<HTMLDivElement>(null);
  const inView = useInView(letterRef, { once: true, margin: "-22%" });

  const intro = {
    initial: { opacity: 0, y: reduce ? 0 : 26 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-15%" },
    transition: { duration: 1, ease: EASE },
  };

  return (
    <section
      id="letter"
      data-scene
      data-label="THE LETTER"
      className="relative overflow-hidden bg-cream py-[15vh]"
      aria-label="A letter for you"
    >
      <TornEdge fill="#141110" />

      <div className="mx-auto w-full max-w-[760px] px-6">
        <motion.p className="eyebrow text-muted" {...intro}>
          {birthday.letter.eyebrow}
        </motion.p>
        <motion.h2
          className="display mt-6 text-[clamp(2.4rem,9vw,5.6rem)] text-ink"
          {...intro}
          transition={{ ...intro.transition, delay: 0.12 }}
        >
          {birthday.letter.title.map((l, i) => (
            <span key={i} className="block">
              {l}
            </span>
          ))}
        </motion.h2>

        {/* ——— the physical letter ——— */}
        <div
          ref={letterRef}
          className="relative mt-[10vh] md:mt-[12vh]"
          style={{ perspective: 1400 }}
        >
          {/* the old torn paper it was found with */}
          <Image
            src="/elements/paper.png"
            alt=""
            width={440}
            height={570}
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-8 -right-3 w-[170px] rotate-[5deg] opacity-90 md:-right-14 md:w-[220px]"
            sizes="220px"
          />

          <motion.div
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, rotateX: -34, y: 70 }
            }
            animate={inView ? { opacity: 1, rotateX: 0, y: 0 } : undefined}
            transition={
              reduce
                ? { duration: 0.8 }
                : { duration: 1.5, ease: EASE }
            }
            style={{ transformOrigin: "top center", willChange: "transform" }}
          >
            <div className="paper-sheet paper-fibre deckled relative rotate-[-0.5deg] px-6 py-10 sm:px-10 sm:py-12 md:px-14 md:py-16">
              {/* fold crease */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-[36%] h-10"
                style={{
                  background:
                    "linear-gradient(180deg, transparent, rgba(120,96,66,0.09), transparent)",
                }}
              />

              <motion.div
                initial="hidden"
                animate={inView ? "show" : "hidden"}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.16, delayChildren: reduce ? 0.2 : 0.9 } },
                }}
                className="relative"
              >
                {[
                  <p key="g" className="hand text-[clamp(1.7rem,5vw,2.3rem)] text-wine">
                    {birthday.letter.greeting}
                  </p>,
                  ...birthday.letter.paragraphs.map((p, i) => (
                    <p
                      key={i}
                      className="serif-body mt-6 text-ink/85 first:mt-8"
                    >
                      {p}
                    </p>
                  )),
                  <div key="c" className="mt-10">
                    {birthday.letter.closing.map((line, i) => (
                      <p
                        key={i}
                        className="serif-body italic text-ink"
                      >
                        {line}
                      </p>
                    ))}
                  </div>,
                ].map((node, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: reduce ? 0 : 14 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.8, ease: EASE },
                      },
                    }}
                  >
                    {node}
                  </motion.div>
                ))}

                {/* signature with a drawn underline */}
                <motion.div
                  className="mt-12"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { duration: 0.9, ease: EASE },
                    },
                  }}
                >
                  <p className="hand inline-block text-[clamp(2.1rem,6vw,2.9rem)] text-ink">
                    {birthday.letter.signature}
                  </p>
                  <svg
                    viewBox="0 0 220 14"
                    className="mt-1 h-3 w-[190px] text-wine/70"
                    aria-hidden="true"
                  >
                    <motion.path
                      d="M4 9 C 60 3, 120 12, 216 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                      transition={{
                        duration: reduce ? 0.3 : 1.3,
                        ease: EASE,
                        delay: reduce ? 0.3 : 1.9,
                      }}
                    />
                  </svg>
                </motion.div>
              </motion.div>

              {/* pinned postscript */}
              <div className="absolute -bottom-9 right-4 w-[210px] rotate-[2.5deg] sm:right-8">
                <span className="tape tape--rose -top-3 left-1/2 -translate-x-1/2 rotate-2" />
                <div className="paper-fibre rounded-[3px] bg-[#f3ead8] px-4 py-3 shadow-[0_10px_22px_-8px_rgba(60,45,30,.4)]">
                  <p className="hand text-[1.15rem] leading-snug text-ink/80">
                    {birthday.letter.postscript}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="h-20" />
      </div>
    </section>
  );
}
