import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

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

const fallbackDresses = [
  {
    id: 1,
    name: "Scarlet Sovereignty",
    price: "₦145,000",
    img: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?w=600&h=820&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Obsidian Reverie",
    price: "₦168,000",
    img: "https://images.unsplash.com/photo-1568251188392-ae32f898cb3b?w=600&h=700&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Ivory Ascension",
    price: "₦132,000",
    img: "https://images.unsplash.com/photo-1610312774212-6bde94e8c0b0?w=600&h=860&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Sand & Silk",
    price: "₦158,000",
    img: "https://images.unsplash.com/photo-1551621955-fa07d4b1376b?w=600&h=900&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Midnight Sonata",
    price: "₦175,000",
    img: "https://images.unsplash.com/photo-1596015301017-471ad3599a30?w=600&h=820&fit=crop&auto=format",
  },
  {
    id: 6,
    name: "Graphite Grace",
    price: "₦138,000",
    img: "https://images.unsplash.com/photo-1626987563563-951cdde62bd3?w=600&h=780&fit=crop&auto=format",
  },
];

export default function CanvasCollection() {
  const headRef = useRef<HTMLDivElement>(null);

  // Fetch featured products from the database
  const { data: dbProducts } = useQuery({
    queryKey: ["products", { is_featured: true }],
    queryFn: async () => {
      // Adjust the base URL if your FastAPI backend is hosted elsewhere
      const res = await fetch(
        "http://localhost:8000/products/storefront?is_featured=true",
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json() as Promise<ProductOut[]>;
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
            img: primaryImg
              ? primaryImg.image_url
              : "https://via.placeholder.com/600x820?text=No+Image",
          };
        })
      : fallbackDresses;

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

  return (
    <section
      id="Canvas"
      className="py-[clamp(4rem,8vw,7rem)] px-[clamp(1.5rem,5vw,4rem)] bg-card-bg"
    >
      {/* Header */}
      <div
        ref={headRef}
        className="mb-12 flex justify-between items-end flex-wrap gap-4"
      >
        <div>
          <p className="font-sans text-[0.62rem] tracking-[0.44em] uppercase text-accent mb-[0.7rem]">
            The Canvas Collection
          </p>
          <h2 className="font-display font-bold italic text-[clamp(2rem,5vw,3.5rem)] text-fg leading-[1.05]">
            Dresses that tell
            <br />
            your story.
          </h2>
        </div>
        <button className="font-sans text-[0.68rem] tracking-[0.2em] uppercase bg-transparent border border-border-col text-fg px-[22px] py-[10px] cursor-pointer transition-colors duration-250 ease-in-out self-end hover:bg-accent hover:border-accent hover:text-bg">
          Commission Yours
        </button>
      </div>

      {/* Grid: columns (desktop) / horizontal scroll (mobile) */}
      <div className="canvas-grid">
        {displayData.map((dress) => (
          <div key={dress.id} className="canvas-card group">
            <div className="relative w-full pb-[130%] overflow-hidden bg-surface shadow-[var(--shadow-soft)]">
              <img
                src={dress.img}
                alt={dress.name}
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] select-none group-hover:scale-[1.07]"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-[#0d0c0a]/55 opacity-0 transition-opacity duration-[350ms] ease-in-out flex flex-col items-center justify-center gap-3 group-hover:opacity-100">
                <div className="w-12 h-12 rounded-full border border-[#f5f0e8]/45 flex items-center justify-center group-hover:[animation:pulse-ring_2s_ease_infinite]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(245,240,232,0.85)"
                    strokeWidth="1.5"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
                <p className="font-sans text-[0.6rem] tracking-[0.24em] uppercase text-[#f5f0e8]/65">
                  Preview Fabric
                </p>
              </div>
            </div>

            <div className="pt-4 px-[0.1rem] pb-0">
              <h3 className="font-display italic text-[1.05rem] font-semibold text-fg mb-[0.3rem]">
                {dress.name}
              </h3>
              <p className="font-sans text-[0.88rem] text-accent">
                {dress.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
