// components/admin/AdminLayout.tsx
import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  ShoppingBag,
  Inbox,
  LogOut,
  Menu,
  X,
  KeyRound, // <-- Imported new icon
} from "lucide-react";
import api from "../../services/api";

// 1. Define the type for the children prop
interface AdminLayoutProps {
  children: ReactNode;
}

interface DashboardMetrics {
  totalProducts: number;
  featuredProducts: number;
  unreadInquiries: number;
}

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: ShoppingBag },
  { label: "Inquiries", path: "/admin/inquiries", icon: Inbox },
  { label: "Security", path: "/admin/security", icon: KeyRound }, // <-- Added new route
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch metrics to get the unread inquiries count
  const { data: metrics } = useQuery<DashboardMetrics>({
    queryKey: ["adminMetrics"],
    queryFn: async () => {
      const response = await api.get<DashboardMetrics>("/admin/metrics");
      return response.data;
    },
    // Optional: Poll every 30 seconds to keep the badge updated without refreshing
    refetchInterval: 30000,
  });

  const unreadCount = metrics?.unreadInquiries || 0;

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-bg text-fg font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border-col bg-surface z-30">
        <h2 className="font-display font-black italic text-xl text-fg">
          oggy<span className="text-accent">admin</span>
        </h2>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-muted hover:text-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border-col flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-8 flex justify-between items-center">
          <h2 className="font-display font-black italic text-2xl text-fg">
            oggy<span className="text-accent">admin</span>
          </h2>
          {/* Close button for mobile inside the sidebar */}
          <button
            className="md:hidden text-muted hover:text-red-400 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 text-sm tracking-wide transition-colors duration-200 ${
                  isActive
                    ? "bg-accent text-bg"
                    : "text-muted hover:bg-border-col/30 hover:text-fg"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  {item.label}
                </div>

                {/* Unread Inquiries Golden Badge */}
                {item.label === "Inquiries" && unreadCount > 0 && (
                  <span
                    className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? "bg-bg text-accent" : "bg-accent text-bg"
                    }`}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-col">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm text-red-400 hover:bg-red-400/10 transition-colors duration-200"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-bg p-4 md:p-8">
        {/* Render the children here */}
        {children}
      </main>
    </div>
  );
}
