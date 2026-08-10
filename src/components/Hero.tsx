import { useRef, useEffect } from "react";

export function MagneticBtn({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.28;
    const y = (e.clientY - r.top - r.height / 2) * 0.28;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  return (
    <div
      ref={ref}
      className="inline-block transition-transform duration-[350ms] ease-out"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

export default function Hero() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (bgRef.current) {
        bgRef.current.style.transform = `translateY(${window.scrollY * 0.32}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="Home" className="relative h-[100svh] overflow-hidden">
      {/* Animated fluid gradient */}
      <div
        ref={bgRef}
        className="absolute -inset-[18%] will-change-transform"
        style={{
          background:
            "linear-gradient(135deg, var(--fluid-a), var(--fluid-b), var(--fluid-c), var(--fluid-a))",
          backgroundSize: "400% 400%",
          animation: "fluidShift 16s ease infinite",
        }}
      />

      {/* Editorial photo — faded */}
      <div
        // 👇 CHANGED: Added responsive background positioning here
        className="absolute inset-0 bg-cover bg-[75%_15%] md:bg-[center_15%] opacity-20 dark:opacity-40 mix-blend-multiply dark:mix-blend-luminosity"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1547547700-b3954043b1b8?w=1400&h=1000&fit=crop&auto=format)",
        }}
      />
      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-25% to-bg" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at center, transparent 40%, var(--bg) 115%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center pt-24 px-6 pb-16 text-center">
        <p
          className="font-sans text-[0.6rem] tracking-[0.45em] uppercase text-accent mb-8 opacity-0"
          style={{ animation: "floatUp 0.6s ease forwards 0.15s" }}
        >
          Est. 2013 · Lagos
        </p>

        <h1
          className="font-display text-[clamp(3.8rem,16vw,11rem)] font-black italic leading-[0.88] tracking-[-0.03em] text-fg opacity-0"
          style={{
            animation:
              "floatUp 0.9s cubic-bezier(0.22,1,0.36,1) forwards 0.35s",
          }}
        >
          oggy
          <br />
          <span
            style={{
              WebkitTextStroke: "1.5px var(--accent)",
              WebkitTextFillColor: "transparent",
              color: "var(--accent)",
            }}
          >
            stitches
          </span>
        </h1>

        <p
          className="font-sans text-[clamp(0.82rem,1.8vw,1rem)] text-muted mt-10 max-w-[340px] leading-[1.75] opacity-0"
          style={{ animation: "floatUp 0.8s ease forwards 0.75s" }}
        >
          Premium wigs & bespoke couture
          <br />
          for the woman who commands every room.
        </p>

        <div
          className="mt-12 opacity-0"
          style={{ animation: "floatUp 0.8s ease forwards 1.05s" }}
        >
          <MagneticBtn>
            <button className="px-12 py-4 bg-accent-10 backdrop-blur-md border border-accent rounded-[1px] text-fg cursor-pointer font-sans text-[0.75rem] tracking-[0.28em] uppercase transition-all duration-300 ease-in-out hover:bg-accent hover:shadow-[0_8px_40px_var(--accent-20)] hover:-translate-y-[2px]">
              Enter the Atelier
            </button>
          </MagneticBtn>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 flex flex-col items-center gap-[10px] opacity-0"
          style={{ animation: "floatUp 0.7s ease forwards 1.6s" }}
        >
          <div className="w-px h-[54px] bg-gradient-to-b from-accent to-transparent" />
          <p className="font-sans text-[0.55rem] tracking-[0.38em] uppercase text-muted">
            Scroll
          </p>
        </div>
      </div>
    </section>
  );
}
