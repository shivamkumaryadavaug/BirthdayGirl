"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Envelope from "./Envelope";
import BirthdayHero from "./BirthdayHero";
import HeroMemory from "./HeroMemory";
import MemoryStory from "./MemoryStory";
import LoveGallery from "./LoveGallery";
import MusicScene from "./MusicScene";
import LetterScene from "./LetterScene";
import FutureWishes from "./FutureWishes";
import FinalReveal from "./FinalReveal";
import SignatureScene from "./SignatureScene";
import StoryProgress from "./StoryProgress";
import FilmGrain from "./FilmGrain";
import CustomCursor from "./CustomCursor";

type Phase = "envelope" | "story";

export default function Experience() {
  const [phase, setPhase] = useState<Phase>("envelope");

  /* the world is still until the gift is opened */
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow =
      phase === "envelope" ? "hidden" : "";
    document.body.style.overflow = phase === "envelope" ? "hidden" : "";
    if (phase === "envelope") window.scrollTo(0, 0);
  }, [phase]);

  const openGift = useCallback(() => setPhase("story"), []);

  /* move focus into the story once the gift is open */
  useEffect(() => {
    if (phase !== "story") return;
    const main = document.getElementById("story");
    if (main) {
      main.focus({ preventScroll: true });
    }
  }, [phase]);

  const replay = useCallback(() => {
    window.scrollTo(0, 0);
    setPhase("envelope");
  }, []);

  return (
    <>
      <AnimatePresence>
        {phase === "envelope" && <Envelope key="envelope" onOpened={openGift} />}
      </AnimatePresence>

      {phase === "story" && (
        <main id="story" tabIndex={-1} className="relative outline-none">
          <BirthdayHero />
          <HeroMemory />
          <MemoryStory />
          <LoveGallery />
          <MusicScene />
          <LetterScene />
          <FutureWishes />
          <FinalReveal />
          <SignatureScene onReplay={replay} />
          <StoryProgress />
        </main>
      )}

      <FilmGrain />
      <CustomCursor />
    </>
  );
}
