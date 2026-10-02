"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { birthday } from "@/data/birthday";
import { usePrefersReducedMotion } from "@/lib/hooks";

/* ——— elegant paper confetti: soft falling pieces, never an explosion ——— */
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLORS = ["#f5f0e8", "#e8ded0", "#c98f94", "#b37a80", "#d9c3b8"];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    type Piece = {
      x: number; y: number; vy: number; w: number; h: number;
      amp: number; freq: number; phase: number;
      rot: number; vr: number; color: string; opacity: number;
    };
    let pieces: Piece[] = [];
    let raf = 0;
    let running = true;
    let W = 0;
    let H = 0;

    const resize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const makePiece = (spawnTop: boolean): Piece => ({
      x: Math.random() * W,
      y: spawnTop ? -20 - Math.random() * 80 : Math.random() * H,
      vy: 22 + Math.random() * 26,
      w: 4.5 + Math.random() * 5,
      h: 7 + Math.random() * 8,
      amp: 8 + Math.random() * 18,
      freq: 0.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 1.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.45 + Math.random() * 0.5,
    });

    const draw = (p: Piece, t: number) => {
      ctx.save();
      ctx.translate(p.x + Math.sin(t * p.freq + p.phase) * p.amp, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    };

    if (reduce) {
      /* a still, quiet scattering — no movement at all */
      const render = () => {
        if (activeRef.current && pieces.length < 90) {
          pieces = Array.from({ length: 90 }, () => makePiece(false));
        } else if (!activeRef.current) {
          pieces = [];
        }
        ctx.clearRect(0, 0, W, H);
        pieces.forEach((p) => draw(p, 0));
      };
      const interval = setInterval(render, 300);
      return () => {
        clearInterval(interval);
        window.removeEventListener("resize", resize);
      };
    }

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (activeRef.current && pieces.length < 95 && Math.random() < 0.5) {
        pieces.push(makePiece(true));
        if (pieces.length > 95) pieces = pieces.slice(-95);
      }
      ctx.clearRect(0, 0, W, H);
      pieces = pieces.filter((p) => p.y < H + 40);
      for (const p of pieces) {
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        draw(p, now / 1000);
      }
      if (running) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const io = new IntersectionObserver(([e]) => {
      const visibleAgain = e.isIntersecting;
      if (visibleAgain && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!visibleAgain && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(canvas);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

export default function FinalReveal() {
  const reduce = usePrefersReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const r = p > 0.58;
    setRevealed((prev) => (prev === r ? prev : r));
  });

  /* three quiet build-up lines, then the reveal that stays */
  const l0o = useTransform(scrollYProgress, [0.03, 0.1, 0.12, 0.17], [0, 1, 1, 0]);
  const l0y = useTransform(scrollYProgress, [0.03, 0.13, 0.17], reduce ? [0, 0, 0] : [26, 0, -22]);
  const l1o = useTransform(scrollYProgress, [0.22, 0.29, 0.31, 0.36], [0, 1, 1, 0]);
  const l1y = useTransform(scrollYProgress, [0.22, 0.32, 0.36], reduce ? [0, 0, 0] : [26, 0, -22]);
  const l2o = useTransform(scrollYProgress, [0.41, 0.48, 0.5, 0.55], [0, 1, 1, 0]);
  const l2y = useTransform(scrollYProgress, [0.41, 0.51, 0.55], reduce ? [0, 0, 0] : [26, 0, -22]);

  const revealOpacity = useTransform(scrollYProgress, [0.6, 0.72], [0, 1]);
  const revealScale = useTransform(
    scrollYProgress,
    [0.6, 0.85],
    reduce ? [1, 1] : [0.94, 1]
  );
  const revealY = useTransform(
    scrollYProgress,
    [0.6, 0.85],
    reduce ? [0, 0] : [40, 0]
  );
  const glow = useTransform(scrollYProgress, [0.58, 0.8], [0, 1]);

  return (
    <section
      id="reveal"
      data-scene
      data-label="ONE MORE THING"
      className="relative bg-night text-cream"
      aria-label="One more thing"
    >
      <div ref={scrollRef} style={{ height: "460vh" }}>
        <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden px-6">
          {/* soft light behind the reveal */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: glow,
              background:
                "radial-gradient(65% 50% at 50% 52%, rgba(201,143,148,0.16), transparent 70%)",
            }}
          />

          {/* build-up lines */}
          <motion.p
            className="serif-body absolute max-w-[26ch] text-center italic text-cream/85"
            style={{ opacity: l0o, y: l0y }}
          >
            {birthday.reveal.lines[0]}
          </motion.p>
          <motion.p
            className="serif-body absolute max-w-[26ch] text-center italic text-cream/85"
            style={{ opacity: l1o, y: l1y }}
          >
            {birthday.reveal.lines[1]}
          </motion.p>
          <motion.p
            className="display absolute max-w-[22ch] text-center text-[clamp(1.9rem,7vw,4.2rem)] italic"
            style={{ opacity: l2o, y: l2y }}
          >
            {birthday.reveal.lines[2]}
          </motion.p>

          {/* the reveal */}
          <motion.div
            className="relative text-center"
            style={{
              opacity: revealOpacity,
              scale: revealScale,
              y: revealY,
              willChange: "transform, opacity",
            }}
            aria-live="polite"
          >
            <Confetti active={revealed} />
            <p className="eyebrow mb-8 text-rose">
              {birthday.date} — REMEMBER THIS
            </p>
            <h2 className="display text-[clamp(2.9rem,13vw,9rem)] leading-[1.02]">
              {birthday.reveal.title[0]}
              <span className="mt-2 block italic text-rose">
                {birthday.reveal.title[1]}
              </span>
            </h2>
            <p className="hand mt-10 rotate-[-2.5deg] text-[clamp(1.5rem,4.5vw,2.2rem)] text-cream/75">
              every single one, sweety.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
