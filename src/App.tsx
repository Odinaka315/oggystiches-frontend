import { useState, useEffect, useCallback } from "react";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DualIdentity from "./components/DualIdentity";
import CrownCollection from "./components/CrownCollection";
import CanvasCollection from "./components/CanvasCollection";
import BespokeProcess from "./components/BespokeProcess";
import AsWornBy from "./components/AsWornBy";
import Footer from "./components/Footer";
import Manifesto from "./components/Manifesto";

export default function App() {
  // 1. Explicitly type as <boolean> so TypeScript knows 'd' is a boolean
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      // 2. Safely parse the JSON
      return savedTheme !== null ? JSON.parse(savedTheme) : false; // Default to false (light mode)
    } catch (error) {
      // 3. If there's a JSON error (like the old "dark" string), clear it and default to false
      localStorage.removeItem("theme");
      return false;
    }
  });

  const [loaded, setLoaded] = useState(false);
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    id: number;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(dark));
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const handleToggleTheme = useCallback((x: number, y: number) => {
    setRipple({ x, y, id: Date.now() });

    // Because of useState<boolean>, TypeScript now knows 'd' is a boolean here!
    setTimeout(() => setDark((d) => !d), 220);
    setTimeout(() => setRipple(null), 900);
  }, []);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

      {/* Theme-flip ripple overlay */}
      {ripple && (
        <div
          key={ripple.id}
          className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden"
        >
          <div
            className="absolute w-6 h-6 rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              background: dark ? "#FAF7F2" : "#0D0C0A",
              transform: "translate(-50%, -50%) scale(0)",
              animation:
                "rippleExpand 0.8s cubic-bezier(0.22,1,0.36,1) forwards",
            }}
          />
        </div>
      )}

      <div
        className={`transition-opacity duration-700 ease-in-out delay-100 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <Navbar dark={dark} onToggleTheme={handleToggleTheme} />
        <main>
          <Hero />
          <Manifesto />
          <DualIdentity />
          <CrownCollection />
          <CanvasCollection />
          <BespokeProcess />
          <AsWornBy />
          <Footer />
        </main>
      </div>
    </>
  );
}
