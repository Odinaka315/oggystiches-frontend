import { useEffect, useRef } from "react";

// The hook remains mostly identical, as it relies on the scroll-reveal CSS
// classes we already defined in index.css
function useReveal(dir: "up" | "left" | "right" = "up") {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.add(
      dir === "up" ? "reveal" : dir === "left" ? "reveal-left" : "reveal-right",
    );

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.12 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [dir]);

  return ref;
}

function Panel({
  tag,
  title,
  subtitle,
  cta,
  img,
  delay = 0,
}: {
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  img: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // We statically added 'reveal' to className below,
    // so we only need to handle the observer here
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group reveal relative overflow-hidden min-h-[clamp(420px,65vh,680px)] cursor-pointer"
      style={{ transitionDelay: delay ? `${delay}s` : "0s" }}
    >
      {/* Background Image - now uses group-hover for the scale effect */}
      <div
        className="absolute inset-0 bg-cover bg-[center_top] transition-transform duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
        style={{ backgroundImage: `url(${img})` }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(13,12,10,0.1)_0%,rgba(13,12,10,0.82)_100%)]" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-[clamp(1.8rem,5vw,3.5rem)]">
        <p className="font-sans text-[0.62rem] tracking-[0.42em] uppercase text-accent mb-[0.8rem]">
          {tag}
        </p>
        <h2 className="font-display text-[clamp(2rem,4.5vw,3.8rem)] font-bold italic text-[#F5F0E8] leading-none mb-4">
          {title}
        </h2>
        <p className="font-sans text-[clamp(0.82rem,1.5vw,0.92rem)] text-[#F5F0E8]/65 max-w-[300px] leading-[1.7] mb-7">
          {subtitle}
        </p>
        <span className="font-sans text-[0.68rem] tracking-[0.22em] uppercase text-accent border-b border-accent pb-[2px] cursor-pointer">
          {cta} &rarr;
        </span>
      </div>
    </div>
  );
}

export default function DualIdentity() {
  const headRef = useReveal("up");

  return (
    <section className="bg-bg">
      {/* Header strip */}
      <div
        ref={headRef}
        className="text-center pt-[clamp(3rem,6vw,5rem)] px-[clamp(1.5rem,5vw,4rem)] pb-[clamp(2rem,4vw,3rem)]"
      >
        <p className="font-sans text-[0.62rem] tracking-[0.44em] uppercase text-muted mb-4">
          Two Worlds. One House.
        </p>
        <h2 className="font-display text-[clamp(1.6rem,4vw,2.8rem)] font-semibold italic text-fg leading-[1.2]">
          Discover your identity
        </h2>
      </div>

      {/* Two-panel split */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[2px]">
        <Panel
          tag="Collection I"
          title="The Crown"
          subtitle="Handcrafted premium wigs that reshape your silhouette and command every room you enter."
          cta="Explore Wigs"
          img="https://images.unsplash.com/photo-1764166904453-79ba54e96b86?w=900&h=1100&fit=crop&auto=format"
          delay={0}
        />
        <Panel
          tag="Collection II"
          title="The Canvas"
          subtitle="Bespoke dresses tailored to your body, your story, your moment. Each stitch, intentional."
          cta="Explore Dresses"
          img="https://images.unsplash.com/photo-1551621955-fa07d4b1376b?w=900&h=1100&fit=crop&auto=format"
          delay={0.15}
        />
      </div>
    </section>
  );
}
