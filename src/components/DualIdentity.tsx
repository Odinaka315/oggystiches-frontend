import { useEffect, useRef } from "react";

export default function DualIdentity() {
  const headerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    el.classList.add("reveal");

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

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    el.classList.add("reveal");

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

  const imageUrl =
    "https://res.cloudinary.com/dwlh1jdu4/image/upload/v1790370485/oggystitches/products/pgnxvfwxpshpneeyofo1.png";

  return (
    <section
      id="MeetTheFace"
      className="py-[clamp(4rem,8vw,7rem)] bg-bg overflow-hidden"
    >
      {/* Header outside the image */}
      <div
        ref={headerRef}
        className="px-[clamp(1.5rem,5vw,4rem)] mb-10 md:mb-14 text-center"
      >
        <p className="font-sans text-[0.62rem] tracking-[0.44em] uppercase text-accent mb-[0.7rem]">
          The Creative Director
        </p>
        <h2 className="font-display font-bold italic text-[clamp(2rem,5vw,3.5rem)] text-fg leading-[1.05]">
          Meet the face
          <br />
          of oggystiches
        </h2>
      </div>

      {/* Image showcase: enlarged and focused on face */}
      <div
        ref={panelRef}
        className="group relative w-full h-[clamp(560px,85vh,920px)] overflow-hidden bg-[#0D0C0A]"
      >
        <img
          src={imageUrl}
          alt="Nwolisa Ogechukwu - Meet the face of oggystitches"
          className="w-full h-full object-cover object-[center_34%] transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
        />

        {/* Minimal gradient at the very bottom so text is legible while the face remains completely unobstructed */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0C0A]/85 via-[#0D0C0A]/25 to-transparent from-0% via-15% to-35% pointer-events-none" />

        {/* Text on the image: styled like the former description paragraph */}
        <div className="absolute bottom-0 left-0 right-0 p-[clamp(1.8rem,5vw,3.5rem)] z-10">
          <p className="font-sans text-[clamp(0.85rem,1.5vw,1.05rem)] text-[#F5F0E8]/90 max-w-2xl leading-[1.75] font-light">
            Nwolisa Ogechukwu is redefining women&apos;s fashion
          </p>
        </div>
      </div>
    </section>
  );
}
