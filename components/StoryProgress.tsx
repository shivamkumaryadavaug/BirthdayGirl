"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Minimal story progress:
 *  - a 2px hairline at the very top (overall progress)
 *  - a small fixed chip with the current scene label (reads [data-scene][data-label])
 *  - a quiet vertical rail on large screens
 * The memory section keeps its own data-label updated ("MEMORY 04 / 12").
 */
export default function StoryProgress() {
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("");
  const chipRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress(p);

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-scene]")
      );
      let current: HTMLElement | null = null;
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= window.innerHeight * 0.55) current = s;
      }
      setLabel(current?.dataset.label ?? "");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (railFillRef.current) {
      railFillRef.current.style.transform = `scaleY(${progress})`;
    }
  }, [progress]);

  return (
    <>
      {/* top hairline */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left"
        style={{
          background: "linear-gradient(90deg, #b37a80, #c98f94)",
          transform: `scaleX(${progress})`,
        }}
      />

      {/* vertical rail — large screens */}
      <div
        aria-hidden="true"
        className="fixed left-7 top-1/2 z-[70] hidden -translate-y-1/2 lg:block"
      >
        <div className="flex items-center gap-4">
          <div className="relative h-[34vh] w-px bg-ink/15">
            <div
              ref={railFillRef}
              className="absolute inset-x-0 top-0 h-full origin-top bg-rose"
              style={{ transform: "scaleY(0)" }}
            />
          </div>
          <span
            className="eyebrow whitespace-nowrap text-[9px] text-muted"
            style={{ writingMode: "vertical-rl" }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* label chip — always visible, adapts via blend mode */}
      <div
        ref={chipRef}
        className="fixed z-[70] mix-blend-difference"
        style={{
          left: "max(1rem, env(safe-area-inset-left))",
          bottom: "calc(max(1rem, env(safe-area-inset-bottom)) + 0.25rem)",
        }}
        aria-live="polite"
      >
        <span className="rounded-full bg-white px-3.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.28em] text-black">
          {label}
        </span>
      </div>
    </>
  );
}
