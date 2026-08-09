import { useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

// Types matching your FastAPI ProductOut schema
interface ProductImageOut {
  id: number;
  image_url: string;
  is_primary: boolean;
}

interface ProductOut {
  id: number;
  title: string;
  price: number;
  is_featured: boolean;
  images: ProductImageOut[];
}

// Fallback data (updated from wigs to dresses)
const fallbackDresses = [
  {
    id: 1,
    name: "Ivory Majesty",
    price: "₦85,000",
    tag: "Bestseller",
    img: "https://images.unsplash.com/photo-1764166904453-79ba54e96b86?w=600&h=820&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Midnight Goddess",
    price: "₦92,000",
    tag: "New",
    img: "https://images.unsplash.com/photo-1644978448908-fc907d2495b2?w=600&h=820&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Crimson Reverie",
    price: "₦78,000",
    tag: "Limited",
    img: "https://images.unsplash.com/photo-1710020492920-e22d37ebe1b1?w=600&h=820&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Desert Queen",
    price: "₦88,000",
    tag: "",
    img: "https://images.unsplash.com/photo-1764166904367-ffd389f511f5?w=600&h=820&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Silk Reverie",
    price: "₦95,000",
    tag: "Exclusive",
    img: "https://images.unsplash.com/photo-1659631743158-372f7d1bd143?w=600&h=820&fit=crop&auto=format",
  },
];

export default function CrownCollection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Fetch bespoke products from the database
  const { data: dbProducts, isError } = useQuery<ProductOut[]>({
    queryKey: ["products", { is_bespoke: true }],
    queryFn: async () => {
      // Adjust the base URL if your FastAPI backend is hosted elsewhere
      const res = await api.get<ProductOut[]>(
        "/products/storefront?is_bespoke=true",
      );
      return res.data;
    },
  });

  // Map DB products to UI format, or use fallback if DB is empty/loading
  const displayData =
    dbProducts && dbProducts.length > 0
      ? dbProducts.map((p) => {
          const primaryImg =
            p.images.find((img) => img.is_primary) || p.images[0];
          return {
            id: p.id,
            name: p.title,
            price: `₦${p.price.toLocaleString()}`, // Format float to Naira string
            tag: p.is_featured ? "Featured" : "",
            img: primaryImg
              ? primaryImg.image_url
              : "https://via.placeholder.com/600x820?text=No+Image",
          };
        })
      : fallbackDresses;

  const updateScale = useCallback(() => {
    const c = scrollRef.current;
    if (!c) return;
    const cx = c.scrollLeft + c.clientWidth / 2;
    c.querySelectorAll<HTMLElement>("[data-card]").forEach((card) => {
      const cardCx = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cx - cardCx);
      const max = c.clientWidth * 0.65;
      const t = Math.max(0, 1 - dist / max);
      card.style.transform = `scale(${0.87 + 0.13 * t})`;
      card.style.opacity = `${0.55 + 0.45 * t}`;
    });
  }, []);

  // Ensure scale updates when data finishes loading and renders
  useEffect(() => {
    updateScale();
  }, [displayData, updateScale]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScale, { passive: true });
    updateScale();
    return () => el.removeEventListener("scroll", updateScale);
  }, [updateScale]);

  useEffect(() => {
    const el = headerRef.current;
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

  // Drag-to-scroll
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current!;
    el.style.cursor = "grabbing";
    const startX = e.clientX - el.scrollLeft;
    const onMove = (ev: MouseEvent) => {
      el.scrollLeft = ev.clientX - startX;
    };
    const onUp = () => {
      el.style.cursor = "grab";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <section
      id="Crown"
      className="py-[clamp(4rem,8vw,7rem)] bg-bg overflow-hidden"
    >
      {/* Header */}
      <div
        ref={headerRef}
        className="px-[clamp(1.5rem,5vw,4rem)] mb-14 flex justify-between items-end flex-wrap gap-4"
      >
        <div>
          <p className="font-sans text-[0.62rem] tracking-[0.44em] uppercase text-accent mb-[0.7rem]">
            The Bespoke Collection
          </p>
          <h2 className="font-display font-bold italic text-[clamp(2rem,5vw,3.5rem)] text-fg leading-[1.05]">
            Dresses that crown
            <br />
            your every chapter.
          </h2>
        </div>
        <a
          href="#"
          className="font-sans text-[0.68rem] tracking-[0.2em] uppercase text-muted no-underline border-b border-border-col pb-[2px] transition-colors duration-200 self-end hover:text-accent"
        >
          View All &rarr;
        </a>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-[18px] overflow-x-auto overflow-y-visible snap-x snap-mandatory pb-8 pt-6 cursor-grab"
        style={{ paddingInline: "max(1.5rem, calc(50% - 185px))" }}
        onMouseDown={onMouseDown}
      >
        {displayData.map((item) => (
          <div
            key={item.id}
            data-card
            className="shrink-0 w-[clamp(270px,74vw,370px)] snap-center origin-bottom transition-all duration-[350ms] ease-out"
          >
            {/* Image Wrapper */}
            <div className="group relative pb-[128%] overflow-hidden bg-surface shadow-[var(--shadow-soft)]">
              <img
                src={item.img}
                alt={item.name}
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-600 ease-in-out select-none group-hover:scale-[1.04]"
              />
              {item.tag && (
                <span className="absolute top-[14px] left-[14px] bg-accent text-bg font-sans text-[0.58rem] tracking-[0.22em] uppercase px-[10px] py-[4px]">
                  {item.tag}
                </span>
              )}
            </div>

            {/* Info row */}
            <div className="flex items-center justify-between pt-[1.1rem] px-1 pb-0">
              <div>
                <h3 className="font-display italic text-[1.1rem] font-semibold text-fg mb-1">
                  {item.name}
                </h3>
                <p className="font-sans text-[0.88rem] text-accent font-medium">
                  {item.price}
                </p>
              </div>
              <button className="font-sans text-[0.65rem] tracking-[0.14em] uppercase bg-transparent border border-border-col text-fg px-4 py-2 cursor-pointer shrink-0 transition-colors duration-200 ease-in-out hover:bg-accent hover:border-accent hover:text-bg">
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
