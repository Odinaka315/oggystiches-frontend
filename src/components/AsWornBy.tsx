import { useRef, useEffect, useState, useCallback } from "react";

const clients = [
  {
    name: "Adaeze Okafor",
    handle: "@adaeze.o",
    caption: "The Crown transformed my wedding day entirely.",
    img: "https://images.unsplash.com/photo-1764166904453-79ba54e96b86?w=400&h=520&fit=crop&auto=format",
    rotate: "-2deg",
  },
  {
    name: "Sade Mensah",
    handle: "@sade.m",
    caption: "My canvas dress stopped the whole room.",
    img: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=400&h=520&fit=crop&auto=format",
    rotate: "1.5deg",
  },
  {
    name: "Chioma Eze",
    handle: "@chi.eze",
    caption: "Nothing fits like oggystitches. Absolute magic.",
    img: "https://images.unsplash.com/photo-1779406083900-b6ac80b71b5d?w=400&h=520&fit=crop&auto=format",
    rotate: "-1deg",
  },
  {
    name: "Temi Adeyemi",
    handle: "@temi.a",
    caption: "My Ivory Majesty wig had everyone asking questions.",
    img: "https://images.unsplash.com/photo-1764166904367-ffd389f511f5?w=400&h=520&fit=crop&auto=format",
    rotate: "2.5deg",
  },
  {
    name: "Funke Balogun",
    handle: "@funkeb",
    caption: "The fitting process was unlike anything I'd experienced.",
    img: "https://images.unsplash.com/photo-1596015301017-471ad3599a30?w=400&h=520&fit=crop&auto=format",
    rotate: "-1.5deg",
  },
  {
    name: "Ngozi Uche",
    handle: "@ngozi.u",
    caption: "I wore the Scarlet Sovereignty to the gala. Priceless.",
    img: "https://images.unsplash.com/photo-1644978448908-fc907d2495b2?w=400&h=520&fit=crop&auto=format",
    rotate: "1deg",
  },
];

const all = [...clients, ...clients];

function Polaroid({ client }: { client: (typeof clients)[0] }) {
  return (
    <div
      className="shrink-0 w-[clamp(180px,40vw,230px)] bg-[#FAFAFA] pt-[10px] px-[10px] pb-[44px] shadow-[0_8px_32px_rgba(0,0,0,0.14),0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out cursor-default hover:z-10 hover:shadow-[0_16px_48px_rgba(0,0,0,0.22)]"
      style={{
        transform: `rotate(${client.rotate})`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform =
          "rotate(0deg) scale(1.04)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform =
          `rotate(${client.rotate})`;
      }}
    >
      <div className="w-full pb-[130%] relative overflow-hidden bg-[#E0D8D0]">
        <img
          src={client.img}
          alt={client.name}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover select-none"
        />
      </div>
      <div className="mt-2">
        <p className="font-sans text-[0.72rem] text-[#2A2520] leading-[1.5] mb-1">
          "{client.caption}"
        </p>
        <p className="font-sans text-[0.62rem] text-[#9A9088]">
          {client.handle}
        </p>
      </div>
    </div>
  );
}

export default function AsWornBy() {
  const trackRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragData = useRef({ startX: 0, scrollX: 0, paused: false });

  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    el.classList.add("reveal");
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

  const startDrag = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const style = getComputedStyle(track);
    const matrix = new WebKitCSSMatrix(style.transform);
    dragData.current = { startX: clientX, scrollX: matrix.m41, paused: true };
    track.style.animationPlayState = "paused";
    setIsDragging(true);
  }, []);

  const onDrag = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      const track = trackRef.current;
      if (!track) return;
      const dx = clientX - dragData.current.startX;
      track.style.transform = `translateX(${dragData.current.scrollX + dx}px)`;
    },
    [isDragging],
  );

  const endDrag = useCallback(() => {
    if (!isDragging) return;
    const track = trackRef.current;
    if (!track) return;
    track.style.animationPlayState = "running";
    track.style.transform = "";
    setIsDragging(false);
  }, [isDragging]);

  return (
    <section
      id="WornBy"
      className="py-[clamp(4rem,8vw,7rem)] bg-surface overflow-hidden"
    >
      <div
        ref={headRef}
        className="px-[clamp(1.5rem,5vw,4rem)] mb-12 flex justify-between items-end flex-wrap gap-4"
      >
        <div>
          <p className="font-sans text-[0.62rem] tracking-[0.44em] uppercase text-accent mb-[0.7rem]">
            As Worn By
          </p>
          <h2 className="font-display font-bold italic text-[clamp(2rem,5vw,3.5rem)] text-fg leading-[1.05]">
            Real women.
            <br />
            Real moments.
          </h2>
        </div>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="font-sans text-[0.68rem] tracking-[0.2em] uppercase text-muted no-underline border-b border-border-col pb-[2px] transition-colors duration-200 self-end hover:text-accent"
        >
          @oggystitches &rarr;
        </a>
      </div>

      {/* Draggable marquee */}
      <div
        ref={outerRef}
        className="overflow-hidden py-6 select-none"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={(e) => startDrag(e.clientX)}
        onMouseMove={(e) => onDrag(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        onTouchMove={(e) => {
          e.preventDefault();
          onDrag(e.touches[0].clientX);
        }}
        onTouchEnd={endDrag}
      >
        <div ref={trackRef} className="marquee-track gap-5 px-5">
          {all.map((client, i) => (
            <Polaroid key={i} client={client} />
          ))}
        </div>
      </div>

      <p className="text-center mt-8 font-sans text-[0.62rem] tracking-[0.22em] uppercase text-muted">
        Drag to explore · Tag us to be featured
      </p>
    </section>
  );
}
