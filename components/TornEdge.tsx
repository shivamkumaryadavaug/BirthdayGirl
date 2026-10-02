"use client";

/** A torn-paper seam between two differently-coloured scenes. */
export default function TornEdge({
  fill,
  flip = false,
  className = "",
}: {
  fill: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 4"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 h-[18px] w-full md:h-[26px] ${
        flip ? "-bottom-[17px] md:-bottom-[25px]" : "-top-[17px] md:-top-[25px]"
      } ${className}`}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
    >
      <path
        d="M0,0 L100,0 L100,1.1 C96.5,1.5 97.8,2.6 93.9,2.7 C90,2.9 91.5,1.6 87.4,2.1 C83.3,2.6 84.6,3.6 80.1,3.5 C75.6,3.4 76.9,2.2 72.3,2.5 C67.7,2.8 69.4,3.9 64.6,3.8 C59.8,3.7 61.2,2.4 56.5,2.6 C51.8,2.8 53.4,3.8 48.7,3.7 C44,3.6 45.2,2.3 40.6,2.5 C36,2.7 37.6,3.7 32.9,3.6 C28.2,3.5 29.5,2.2 25,2.4 C20.5,2.6 21.9,3.6 17.4,3.5 C12.9,3.4 14.2,2.1 10.3,2.3 C6.4,2.5 7.6,3.4 4.1,3.3 C1.6,3.2 2.4,2.4 0,2.6 Z"
        fill={fill}
      />
    </svg>
  );
}
