"use client";

import { useEffect, useRef, useState } from "react";
import { useFinePointer } from "@/lib/hooks";

/**
 * Subtle custom cursor — desktop only.
 * Rest state: small dot. Over [data-cursor] targets it expands and shows a word
 * (OPEN / VIEW / PLAY / DRAG / READ). Never mounts on touch devices.
 */
const WORDS: Record<string, string> = {
  open: "OPEN",
  view: "VIEW",
  play: "PLAY",
  pause: "PAUSE",
  drag: "DRAG",
  read: "READ",
  again: "AGAIN",
};

export default function CustomCursor() {
  const fine = useFinePointer();
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [nearLink, setNearLink] = useState(false);

  useEffect(() => {
    if (!fine) return;
    document.documentElement.classList.add("cursor-custom-on");
    return () => document.documentElement.classList.remove("cursor-custom-on");
  }, [fine]);

  useEffect(() => {
    if (!fine) return;
    const dot = dotRef.current;
    if (!dot) return;

    let x = -100;
    let y = -100;
    let tx = x;
    let ty = y;
    let raf = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = "1";
      }
    };
    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el || typeof el.closest !== "function") return;
      const tagged = el.closest<HTMLElement>("[data-cursor]");
      if (tagged) {
        setLabel(WORDS[tagged.dataset.cursor as string] ?? "VIEW");
        return;
      }
      setLabel(null);
      setNearLink(!!el.closest("a, button, [role='slider'], [role='button']"));
    };

    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
    };
  }, [fine]);

  if (!fine) return null;

  const size = label ? 68 : nearLink ? 30 : 11;

  return (
    <div
      ref={dotRef}
      className="cursor-dot"
      style={{
        width: size,
        height: size,
        opacity: 0,
        transition: "width .3s cubic-bezier(.22,1,.36,1), height .3s cubic-bezier(.22,1,.36,1), opacity .3s ease",
      }}
      aria-hidden="true"
    >
      <span
        style={{
          opacity: label ? 1 : 0,
          transition: "opacity .2s ease",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}
