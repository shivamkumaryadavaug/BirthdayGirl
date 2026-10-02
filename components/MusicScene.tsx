"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import TornEdge from "./TornEdge";
import { birthday } from "@/data/birthday";
import { formatTime, usePrefersReducedMotion } from "@/lib/hooks";

const EASE = [0.22, 1, 0.36, 1] as const;
const LYRICS = birthday.song.lyrics;

export default function MusicScene() {
  const reduce = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio(birthday.song.src);
      a.preload = "none";
      a.loop = true;
      a.addEventListener("loadedmetadata", () => setDuration(a.duration || 0));
      a.addEventListener("error", () => setFailed(true));
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  const tick = useCallback(() => {
    const a = audioRef.current;
    if (a) setCurrent(a.currentTime);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
    cancelAnimationFrame(rafRef.current);
  }, []);

  const play = useCallback(() => {
    if (failed) return;
    const a = getAudio();
    a.muted = muted;
    a.play()
      .then(() => {
        setPlaying(true);
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(() => setFailed(true));
  }, [failed, getAudio, muted, tick]);

  const toggle = useCallback(() => {
    if (playing) pause();
    else play();
  }, [pause, play, playing]);

  /* stop cleanly when the scene scrolls away or the tab hides */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.12 && playing) pause();
      },
      { threshold: [0, 0.12, 0.5] }
    );
    io.observe(el);
    const onVis = () => {
      if (document.hidden && playing) pause();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(rafRef.current);
      audioRef.current?.pause();
    };
  }, [pause, playing]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  /* seeking */
  const seekTo = useCallback(
    (clientX: number) => {
      const a = audioRef.current;
      const bar = barRef.current;
      if (!a || !bar || !duration) return;
      const r = bar.getBoundingClientRect();
      const frac = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      a.currentTime = frac * duration;
      setCurrent(a.currentTime);
    },
    [duration]
  );

  const onBarPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    seekTo(e.clientX);
  };
  const onBarPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 1) seekTo(e.clientX);
  };
  const onBarKey = (e: React.KeyboardEvent) => {
    const a = audioRef.current;
    if (!a) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      a.currentTime = Math.min(duration, a.currentTime + 5);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      a.currentTime = Math.max(0, a.currentTime - 5);
    }
  };

  const frac = duration ? current / duration : 0;
  const activeLyric = Math.min(
    LYRICS.length - 1,
    Math.floor(frac * (LYRICS.length + 0.4))
  );

  const intro = {
    initial: { opacity: 0, y: reduce ? 0 : 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-15%" },
    transition: { duration: 1, ease: EASE },
  };

  return (
    <section
      ref={sectionRef}
      id="song"
      data-scene
      data-label="OUR SONG"
      className="relative overflow-hidden bg-night pb-[16vh] pt-[14vh] text-cream"
      aria-label="Our song"
    >
      <TornEdge fill="#ece2d2" />

      {/* faint stage light for the vinyl */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 45% at 72% 42%, rgba(201,143,148,0.14), transparent 70%)",
        }}
      />

      <div className="mx-auto grid w-full max-w-[1100px] items-center gap-16 px-6 md:grid-cols-2 md:gap-10">
        {/* ——— left: heading + player + lyrics ——— */}
        <div className="min-w-0">
          <motion.p className="eyebrow text-rose" {...intro}>
            {birthday.song.eyebrow}
          </motion.p>
          <motion.h2
            className="display mt-6 text-[clamp(3rem,12vw,7rem)]"
            {...intro}
            transition={{ ...intro.transition, delay: 0.12 }}
          >
            {birthday.song.title.map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </motion.h2>
          <motion.p
            className="hand mt-5 rotate-[-2deg] text-[1.4rem] text-rose/90"
            {...intro}
            transition={{ ...intro.transition, delay: 0.22 }}
          >
            {birthday.song.note}
          </motion.p>

          {/* player */}
          <motion.div
            className="mt-12 max-w-[460px] rounded-[14px] border border-cream/15 bg-[#1d1917]/80 p-5 md:p-6"
            {...intro}
            transition={{ ...intro.transition, delay: 0.3 }}
            style={{
              boxShadow: "0 24px 48px -20px rgba(0,0,0,.6)",
            }}
          >
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={toggle}
                data-cursor={playing ? "pause" : "play"}
                aria-pressed={playing}
                aria-label={playing ? "Pause music" : "Play music"}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cream/40 transition-all duration-300 hover:border-cream hover:bg-cream hover:text-ink"
              >
                {playing ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <rect x="2.5" y="1.5" width="3.6" height="13" rx="1" />
                    <rect x="9.9" y="1.5" width="3.6" height="13" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M3.5 1.8v12.4c0 .8.9 1.3 1.6.9l9.6-6.2c.6-.4.6-1.4 0-1.8L5.1.9c-.7-.4-1.6.1-1.6.9z" />
                  </svg>
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 items-end gap-[3px]" aria-hidden="true">
                    {[0, 1, 2].map((b) => (
                      <span
                        key={b}
                        className={`eq-bar w-[3px] rounded-sm bg-rose ${playing ? "eq-bar--on" : ""}`}
                        style={{
                          height: `${[9, 12, 7][b]}px`,
                          animationDelay: `${b * 0.18}s`,
                        }}
                      />
                    ))}
                  </span>
                  <p className="hand truncate text-[1.25rem] text-cream">
                    {birthday.song.trackTitle}
                  </p>
                </div>
                <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.24em] text-cream/45">
                  {birthday.song.trackNote}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-pressed={muted}
                aria-label={muted ? "Unmute" : "Mute"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream/25 text-cream/70 transition-colors duration-300 hover:border-cream/60 hover:text-cream"
              >
                {muted ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M11 5 6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M11 5 6 9H2v6h4l5 4V5z" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M18.5 5.5a9.5 9.5 0 0 1 0 13" />
                  </svg>
                )}
              </button>
            </div>

            {/* seek bar */}
            <div
              ref={barRef}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration) || 0}
              aria-valuenow={Math.round(current)}
              aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
              onPointerDown={onBarPointerDown}
              onPointerMove={onBarPointerMove}
              onKeyDown={onBarKey}
              className="group mt-5 cursor-pointer py-2"
            >
              <div className="relative h-[3px] w-full rounded-full bg-cream/15">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-rose"
                  style={{ width: `${frac * 100}%` }}
                />
                <div
                  className="absolute top-1/2 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100"
                  style={{ left: `${frac * 100}%` }}
                />
              </div>
            </div>
            <div className="mt-1 flex justify-between text-[10px] tabular-nums tracking-[0.18em] text-cream/45">
              <span>{formatTime(current)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </motion.div>

          <motion.p
            className="mt-5 text-[10px] uppercase tracking-[0.26em] text-cream/35"
            {...intro}
            transition={{ ...intro.transition, delay: 0.4 }}
          >
            {failed ? "song file missing — add it at public/music/our-song.mp3" : birthday.song.hint}
          </motion.p>

          {/* lyrics — appear gradually while it plays */}
          <div aria-label="Lyrics" className="mt-12 space-y-3 md:mt-16">
            {LYRICS.map((line, k) => {
              const state = !playing && current === 0 ? "idle" : k < activeLyric ? "past" : k === activeLyric ? "active" : "future";
              return (
                <p
                  key={k}
                  className={`serif-body italic transition-all duration-1000 ${
                    state === "active"
                      ? "translate-x-2 text-cream opacity-100"
                      : state === "past"
                        ? "text-cream/50"
                        : "text-cream/20"
                  }`}
                  aria-hidden={state === "future"}
                >
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        {/* ——— right: the vinyl ——— */}
        <motion.div
          className="relative mx-auto min-w-0 w-full max-w-[420px]"
          initial={{ opacity: 0, scale: reduce ? 1 : 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          {/* turntable pool of light */}
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 aspect-square w-[112%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(245,240,232,0.07), transparent 62%)",
            }}
          />
          <div
            className={`vinyl relative mx-auto aspect-square w-[78%] ${playing && !reduce ? "vinyl--playing" : ""}`}
            data-cursor={playing ? "pause" : "play"}
            role="button"
            tabIndex={0}
            aria-label={playing ? "Pause music" : "Play music"}
            onClick={toggle}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle();
              }
            }}
          >
            <Image
              src="/elements/disk.png"
              alt=""
              width={640}
              height={640}
              aria-hidden="true"
              className="h-full w-full select-none object-contain"
              style={{
                filter: "drop-shadow(0 26px 44px rgba(0,0,0,.55))",
              }}
              draggable={false}
            />
          </div>

          {/* scrapbook clippings around the player */}
          <div
            aria-hidden="true"
            className="polaroid absolute -right-2 top-[6%] w-[104px] rotate-[7deg] md:-right-6 md:w-[128px]"
          >
            <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-3" />
            <Image
              src="/elements/billa2.png"
              alt=""
              width={220}
              height={220}
              className="aspect-square w-full object-cover"
              sizes="128px"
              draggable={false}
            />
          </div>
          <Image
            src="/elements/note1.png"
            alt=""
            width={130}
            height={130}
            aria-hidden="true"
            className="absolute -left-1 top-[2%] w-[64px] -rotate-[10deg] opacity-90 md:-left-4 md:w-[78px]"
            draggable={false}
          />
          <Image
            src="/elements/fwine.png"
            alt=""
            width={150}
            height={220}
            aria-hidden="true"
            className="absolute -bottom-6 left-[4%] w-[72px] rotate-[5deg] opacity-90 md:w-[92px]"
            draggable={false}
          />
        </motion.div>
      </div>
    </section>
  );
}
