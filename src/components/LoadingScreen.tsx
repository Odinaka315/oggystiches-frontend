import { useEffect, useState } from "react";

export default function LoadingScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 2700);
    const t2 = setTimeout(onComplete, 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  const letters = "oggystitches".split("");

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-bg flex flex-col items-center justify-center gap-8 transition-opacity duration-700 ease-in-out ${
        phase === "out"
          ? "opacity-0 pointer-events-none"
          : "opacity-100 pointer-events-auto"
      }`}
    >
      {/* Animated needle + thread */}
      <svg
        width="72"
        height="72"
        viewBox="0 0 72 72"
        fill="none"
        className="overflow-visible"
      >
        {/* Thread path */}
        <path
          d="M 10 62 C 22 35 34 50 46 32 C 54 18 62 8 62 8"
          strokeWidth="1.2"
          strokeLinecap="round"
          className="stroke-muted fill-none"
          style={{
            strokeDasharray: 130,
            strokeDashoffset: 130,
            animation:
              "needleDraw 1.5s cubic-bezier(0.4,0,0.2,1) forwards 0.5s",
          }}
        />
        {/* Needle shaft */}
        <line
          x1="10"
          y1="62"
          x2="62"
          y2="10"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="stroke-accent"
          style={{
            strokeDasharray: 82,
            strokeDashoffset: 82,
            animation:
              "needleDraw 0.75s cubic-bezier(0.4,0,0.2,1) forwards 0.1s",
          }}
        />
        {/* Needle eye */}
        <ellipse
          cx="60.5"
          cy="11.5"
          rx="4"
          ry="2"
          transform="rotate(-45 60.5 11.5)"
          strokeWidth="1.5"
          className="stroke-accent fill-none opacity-0"
          style={{ animation: "fadeIn 0.3s ease forwards 0.85s" }}
        />
        {/* Needle tip dot */}
        <circle
          cx="10"
          cy="62"
          r="2.5"
          className="fill-accent opacity-0"
          style={{ animation: "fadeIn 0.3s ease forwards 0.85s" }}
        />
      </svg>

      {/* Brand name — staggered reveal */}
      <div className="flex items-baseline">
        {letters.map((ch, i) => (
          <span
            key={i}
            className={`font-display text-[clamp(2rem,7vw,3.2rem)] font-black italic inline-block opacity-0 ${
              i < 4 ? "text-fg" : "text-accent"
            }`}
            style={{
              animation: `floatUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards ${
                0.95 + i * 0.055
              }s`,
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* Tagline */}
      <p
        className="font-sans text-[0.62rem] tracking-[0.38em] uppercase text-muted opacity-0"
        style={{ animation: "floatUp 0.5s ease forwards 1.9s" }}
      >
        Crafted for the Extraordinary
      </p>
    </div>
  );
}
