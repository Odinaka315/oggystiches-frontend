// components/admin/Dashboard.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Inbox,
  Star,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import api from "../../services/api";

interface DashboardMetrics {
  totalProducts: number;
  featuredProducts: number;
  unreadInquiries: number;
}

interface ContactMessage {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  message: string;
  inquiry_type: "general" | "bespoke_dress";
  is_read: boolean;
  created_at: string;
}

export default function Dashboard() {
  // Fetch high-level metrics for the dashboard overview
  const {
    data: metrics,
    isLoading: loadingMetrics,
    isError: metricsError,
  } = useQuery<DashboardMetrics>({
    queryKey: ["adminMetrics"],
    queryFn: async () => {
      const response = await api.get<DashboardMetrics>("/admin/metrics");
      return response.data;
    },
  });

  // Fetch the latest inquiries
  const { data: recentInquiries, isLoading: loadingInquiries } = useQuery<
    ContactMessage[]
  >({
    queryKey: ["recentInquiries"],
    queryFn: async () => {
      const response = await api.get<ContactMessage[]>("/contact-messages");
      // Grab only the 5 most recent messages for the dashboard
      return response.data.slice(0, 5);
    },
  });

  const STATS = [
    {
      label: "Total Products",
      value: metrics?.totalProducts || 0,
      icon: ShoppingBag,
      link: "/admin/products",
    },
    {
      label: "Featured Canvas",
      value: metrics?.featuredProducts || 0,
      icon: Star,
      link: "/admin/products?filter=featured",
    },
    {
      label: "Unread Inquiries",
      value: metrics?.unreadInquiries || 0,
      icon: Inbox,
      link: "/admin/inquiries",
      highlight: (metrics?.unreadInquiries || 0) > 0,
    },
  ];

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-6xl mx-auto animation-fade-in">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="font-display font-black italic text-3xl text-fg mb-2">
            Overview
          </h1>
          <p className="font-sans text-sm text-muted">
            Welcome back to the atelier. Here is what is happening today.
          </p>
        </div>
      </div>

      {metricsError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 font-sans text-sm rounded">
          Failed to load dashboard metrics. Please check your connection.
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface border border-border-col p-6 relative group transition-colors duration-300 hover:border-accent"
            >
              <div className="flex justify-between items-start mb-6">
                <div
                  className={`p-3 rounded-full ${
                    stat.highlight
                      ? "bg-accent/10 text-accent"
                      : "bg-bg text-muted"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <Link
                  to={stat.link}
                  className="text-muted transition-colors duration-200 hover:text-accent"
                >
                  <ArrowUpRight size={20} />
                </Link>
              </div>

              <div>
                <p className="font-sans text-xs tracking-[0.15em] uppercase text-muted mb-2">
                  {stat.label}
                </p>
                {loadingMetrics ? (
                  <div className="h-10 w-16 bg-border-col/30 animate-pulse rounded" />
                ) : (
                  <p className="font-display font-bold italic text-4xl text-fg">
                    {stat.value}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div>
        <div className="flex justify-between items-center border-b border-border-col pb-4 mb-6">
          <h2 className="font-sans text-sm tracking-[0.2em] uppercase text-muted">
            Recent Inquiries
          </h2>
          <Link
            to="/admin/inquiries"
            className="flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase text-accent hover:text-fg transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Latest Inquiries List */}
        <div className="bg-surface border border-border-col flex flex-col">
          {loadingInquiries ? (
            <div className="py-16 text-center text-muted font-sans text-sm animate-pulse">
              Loading recent messages...
            </div>
          ) : !recentInquiries || recentInquiries.length === 0 ? (
            <div className="py-16 text-center text-muted font-sans text-sm">
              <Inbox size={32} className="mx-auto text-border-col mb-4" />
              No recent inquiries found.
            </div>
          ) : (
            recentInquiries.map((inquiry, index) => (
              <Link
                key={inquiry.id}
                to="/admin/inquiries"
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 transition-colors duration-200 hover:bg-bg/50 ${
                  index !== recentInquiries.length - 1
                    ? "border-b border-border-col/50"
                    : ""
                } ${!inquiry.is_read ? "bg-accent/5" : ""}`}
              >
                <div className="flex items-start sm:items-center gap-3 mb-2 sm:mb-0">
                  <div className="mt-1.5 sm:mt-0 w-2 h-2 shrink-0 flex items-center justify-center">
                    {!inquiry.is_read && (
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-sans text-sm font-medium ${!inquiry.is_read ? "text-fg" : "text-muted"}`}
                    >
                      {inquiry.first_name} {inquiry.last_name}
                    </p>
                    <p className="font-sans text-xs text-muted/70 mt-0.5 line-clamp-1 sm:max-w-md">
                      {inquiry.message}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 ml-5 sm:ml-0">
                  <span
                    className={`px-2 py-0.5 text-[0.6rem] tracking-wider uppercase rounded-full ${
                      inquiry.inquiry_type === "bespoke_dress"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-bg border border-border-col text-muted"
                    }`}
                  >
                    {inquiry.inquiry_type === "bespoke_dress"
                      ? "Bespoke"
                      : "General"}
                  </span>
                  <span className="font-sans text-[0.65rem] text-muted">
                    {formatDate(inquiry.created_at)}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
