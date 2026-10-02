"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { birthday } from "@/data/birthday";
import { usePrefersReducedMotion } from "@/lib/hooks";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Scene 03 — one strong photograph, given room to breathe. */
export default function HeroMemory() {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const imgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.09, 1]);
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-36, 36]);
  const capY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -50]);

  return (
    <section
      ref={ref}
      id="hero-memory"
      data-scene
      data-label="WHERE IT BEGINS"
      className="relative overflow-hidden px-5 py-[16vh] md:px-10 md:py-[18vh]"
      aria-label="A memory that deserves its own space"
    >
      <div className="mx-auto w-full max-w-[1160px]">
        {/* caption — outer carries scroll parallax, inner carries the entrance */}
        <motion.div className="mb-10 md:mb-14 md:pl-[6%]" style={{ y: capY }}>
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 1, ease: EASE }}
          >
          <p className="eyebrow text-muted">
            {birthday.heroMemory.caption.join(" ")}
          </p>
          <p className="serif-body mt-4 max-w-[24ch] text-ink">
            {birthday.heroMemory.line}
          </p>
          <p className="hand mt-3 rotate-[-2deg] text-[1.35rem] text-wine/75">
            (the very first page)
          </p>
          </motion.div>
        </motion.div>

        {/* the photograph */}
        <motion.figure
          className="photo-frame relative mx-auto w-full max-w-[960px] rotate-[-0.4deg]"
          initial={{ opacity: 0, y: reduce ? 0 : 46 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 1.15, ease: EASE }}
        >
          <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4] md:aspect-[16/10]">
            <motion.div
              className="absolute inset-0"
              style={{ scale: imgScale, y: imgY, willChange: "transform" }}
            >
              <Image
                src={birthday.heroMemory.image}
                alt={birthday.heroMemory.alt}
                fill
                priority
                sizes="(max-width: 768px) 96vw, 80vw"
                className="photo object-cover"
              />
            </motion.div>
            {/* quiet cinematic vignette on the print itself */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 100% at 50% 45%, transparent 62%, rgba(23,21,21,0.16) 100%)",
              }}
            />
          </div>
          <figcaption className="flex items-baseline justify-between pt-3">
            <span className="eyebrow text-[9px] text-muted">
              {birthday.dateShort} · WHERE IT ALL BEGAN
            </span>
            <span className="eyebrow text-[9px] text-muted">Nº 00</span>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
