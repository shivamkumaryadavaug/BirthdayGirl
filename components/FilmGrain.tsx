"use client";

/**
 * Film grain — sits above everything (including the envelope),
 * pointer-events none, opacity low enough to be felt rather than noticed.
 * Animation is disabled automatically under prefers-reduced-motion (CSS).
 */
export default function FilmGrain() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
