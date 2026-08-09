import { useState, useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";

// Storefront Components
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

// Admin Components (Ensure you create these files next)
import Login from "./components/admin/Login";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import Products from "./components/admin/Products";
import ProductForm from "./components/admin/ProductForm";
import Inquiries from "./components/admin/Inquiries";

export default function App() {
  const [dark, setDark] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      return savedTheme !== null ? JSON.parse(savedTheme) : false;
    } catch (error) {
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
    setTimeout(() => setDark((d) => !d), 220);
    setTimeout(() => setRipple(null), 900);
  }, []);

  // 1. Group the entire storefront into a single variable/component
  // to keep the router block below clean.
  const Storefront = (
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
  );

  return (
    <>
      {/* Keep the global loading screen and ripple at the top level */}
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}

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

      {/* 2. Define the Routing Architecture */}
      <Routes>
        {/* Public Storefront */}
        <Route path="/" element={Storefront} />

        {/* Public Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Protected Admin Shell */}
        {/* Protected Admin Shell (Dashboard) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Shell (Products) */}
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Products />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ProductForm />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Shell (Inquiries) */}
        <Route
          path="/admin/inquiries"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Inquiries />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
