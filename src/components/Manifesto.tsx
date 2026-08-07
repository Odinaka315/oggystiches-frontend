import { useEffect, useRef } from "react";

export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Add the base reveal class from your index.css
    el.classList.add("reveal");

    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.2 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      className="bg-bg py-[clamp(6rem,12vw,10rem)] px-[clamp(1.5rem,5vw,4rem)] flex justify-center items-center text-center"
      id="Manifesto"
    >
      <div ref={ref} className="max-w-[850px] flex flex-col items-center">
        {/* Eyebrow text */}
        <span className="font-sans text-[0.62rem] tracking-[0.44em] uppercase text-accent mb-8 block">
          The Manifesto
        </span>

        {/* Editorial Pull-Quote */}
        <h2 className="font-display font-bold italic text-[clamp(1.8rem,4vw,3.5rem)] text-fg leading-[1.2] mb-10">
          "We do not simply sew fabric; <br className="hidden md:block" /> we
          sculpt identity."
        </h2>

        {/* Elegant vertical divider */}
        <div className="w-px h-12 bg-gradient-to-b from-accent/50 to-transparent mb-10" />

        {/* Supporting Philosophy */}
        <p className="font-sans text-[clamp(0.85rem,1.5vw,1rem)] text-muted leading-[1.85] max-w-[580px]">
          oggystitches was born from a singular belief: every woman deserves a
          garment as unapologetic as she is. By blending time-honored couture
          techniques with an avant-garde vision, we create bespoke pieces that
          don't just dress a body—they command the room.
        </p>
      </div>
    </section>
  );
}
