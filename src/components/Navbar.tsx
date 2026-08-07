import { useState, useEffect } from "react";

interface Props {
  dark: boolean;
  onToggleTheme: (x: number, y: number) => void;
}

export default function Navbar({ dark, onToggleTheme }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Handle scroll detection for the glassmorphism navbar
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [menuOpen]);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onToggleTheme(r.left + r.width / 2, r.top + r.height / 2);
  };

  const links = ["Home", "Crown", "Canvas", "Process", "Contact"];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[200] px-8 py-[1.1rem] flex items-center justify-between transition-all duration-400 ease-in-out border-b ${
          scrolled
            ? "bg-bg/80 border-border-col backdrop-blur-md"
            : "bg-transparent border-transparent"
        }`}
      >
        {/* Logo */}
        <a
          href="#"
          className="font-display font-black italic text-xl text-fg no-underline tracking-tighter shrink-0"
        >
          oggy<span className="text-accent">stitches</span>
        </a>

        {/* Desktop links - hidden on mobile, flex on md and up */}
        <div className="hidden md:flex gap-10 items-center">
          {links.map((link) => (
            <a
              key={link}
              href={`/#${link}`}
              className="font-sans text-[0.72rem] tracking-[0.14em] uppercase text-muted no-underline transition-colors duration-200 hover:text-accent"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Theme toggle pill */}
          <button
            onClick={handleToggle}
            aria-label="Toggle light/dark mode"
            className="relative w-[50px] h-[26px] rounded-full border border-border-col bg-surface cursor-pointer transition-colors duration-400 shrink-0"
          >
            <span
              className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-accent flex items-center justify-center text-[9px] leading-none transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{ left: dark ? "26px" : "3px" }}
            >
              {dark ? "☾" : "☀"}
            </span>
          </button>

          {/* Hamburger — hidden on md and up */}
          <button
            onClick={() => setMenuOpen((m) => !m)}
            aria-label="Open menu"
            className="md:hidden bg-transparent border-none cursor-pointer p-1 flex flex-col gap-[5px]"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`block w-[22px] h-[1.5px] bg-fg origin-center transition-all duration-300 ease-in-out ${
                  menuOpen
                    ? i === 0
                      ? "rotate-45 translate-x-[4px] translate-y-[4.5px]"
                      : i === 1
                        ? "scale-x-0 opacity-0"
                        : "-rotate-45 translate-x-[4px] -translate-y-[4.5px]"
                    : "opacity-100"
                }`}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile drawer - hidden on desktop by keeping the logic tied to the hamburger button */}
      <div
        className={`fixed inset-0 z-[190] bg-bg flex flex-col items-center justify-center gap-10 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {links.map((link, i) => (
          <a
            key={link}
            href={`/#${link}`}
            onClick={() => setMenuOpen(false)}
            className={`font-display text-[clamp(1.8rem,8vw,2.5rem)] font-bold italic text-fg no-underline hover:text-accent transition-all duration-400 ease-in-out ${
              menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{
              transitionDelay: `${i * 0.07}s`,
            }}
          >
            {link}
          </a>
        ))}
      </div>
    </>
  );
}
