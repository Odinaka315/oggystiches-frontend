import { useEffect, useRef } from "react";

const steps = [
  {
    num: "01",
    title: "The Vision",
    desc: "We begin with a discovery call — your body, your occasion, your aesthetic. No detail is too small; every preference shapes the final garment.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 28 L16 4 L28 28" />
        <path d="M8 20 h16" />
        <circle cx="16" cy="4" r="2" fill="currentColor" strokeWidth="0" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "The Measure",
    desc: "Precise measurements in our studio or via our guided home-kit for clients beyond Lagos and London. Every centimetre is recorded with care.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="12" width="24" height="8" rx="1" />
        <line x1="8" y1="12" x2="8" y2="17" />
        <line x1="12" y1="12" x2="12" y2="15" />
        <line x1="16" y1="12" x2="16" y2="17" />
        <line x1="20" y1="12" x2="20" y2="15" />
        <line x1="24" y1="12" x2="24" y2="17" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "The Fabric",
    desc: "Hand-selected premium fabrics sourced from Lagos, London, and Milan — chosen for your unique commission and the season's finest offerings.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 26 C8 18 14 12 16 6" />
        <path d="M16 6 C18 12 24 18 26 26" />
        <path d="M6 26 Q16 22 26 26" />
        <line x1="16" y1="6" x2="16" y2="26" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "The Stitch",
    desc: "Our master tailors bring your vision to life, stitch by deliberate stitch, with artisanal precision honed over decades of couture craft.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" y1="26" x2="26" y2="6" />
        <circle cx="26" cy="6" r="3" />
        <path d="M6 26 Q12 14 20 18 Q24 20 26 10" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    num: "05",
    title: "The Fitting",
    desc: "Two fittings ensure absolute perfection. Every seam is examined and adjusted until the garment moves with you like a second skin.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 4 C10 4 7 8 7 12 L7 26 L25 26 L25 12 C25 8 22 4 16 4 Z" />
        <line x1="11" y1="4" x2="9" y2="8" />
        <line x1="21" y1="4" x2="23" y2="8" />
        <line x1="7" y1="18" x2="25" y2="18" />
      </svg>
    ),
  },
  {
    num: "06",
    title: "The Reveal",
    desc: "Your garment arrives beautifully packaged in our signature box — ready for the world. A piece worthy of your story, and the next chapter.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="14" width="22" height="14" rx="1" />
        <path d="M5 14 L16 8 L27 14" />
        <path d="M13 14 Q16 10 19 14" />
        <line x1="16" y1="14" x2="16" y2="28" />
      </svg>
    ),
  },
];

function TimelineItem({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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

  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className="timeline-item flex items-start gap-[clamp(1rem,4vw,2.5rem)]"
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      {/* Left: number / icon */}
      <div className="shrink-0 w-12 flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-full border border-border-col flex items-center justify-center text-accent shrink-0 ${
            isEven ? "bg-accent-10" : "bg-transparent"
          }`}
        >
          {step.icon}
        </div>
      </div>

      {/* Right: content */}
      <div className="flex-1 pb-[clamp(2rem,5vw,3.5rem)]">
        <div className="flex items-baseline gap-3 mb-[0.6rem]">
          <span className="font-sans text-[0.6rem] tracking-[0.3em] uppercase text-accent">
            {step.num}
          </span>
          <h3 className="font-display font-semibold italic text-[clamp(1.1rem,2.5vw,1.5rem)] text-fg">
            {step.title}
          </h3>
        </div>
        <p className="font-sans text-[clamp(0.85rem,1.5vw,0.95rem)] text-muted leading-[1.75] max-w-[480px]">
          {step.desc}
        </p>
      </div>
    </div>
  );
}

export default function BespokeProcess() {
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
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
    <section
      id="Process"
      className="py-[clamp(4rem,8vw,8rem)] px-[clamp(1.5rem,5vw,4rem)] bg-bg"
    >
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div
          ref={headRef}
          className="reveal max-w-[560px] mb-[clamp(3rem,6vw,5rem)]"
        >
          <p className="font-sans text-[0.62rem] tracking-[0.44em] uppercase text-accent mb-[0.8rem]">
            The Bespoke Process
          </p>
          <h2 className="font-display font-bold italic text-[clamp(2rem,5vw,3.5rem)] text-fg leading-[1.05]">
            From first sketch
            <br />
            to final stitch.
          </h2>
          <p className="font-sans text-[clamp(0.85rem,1.5vw,0.95rem)] text-muted leading-[1.75] mt-5 max-w-[420px]">
            Every oggystitches piece is a collaboration. Here is how we
            transform your vision into wearable art.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-6 bottom-6 w-px bg-gradient-to-b from-accent to-transparent" />

          {steps.map((step, i) => (
            <TimelineItem key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
