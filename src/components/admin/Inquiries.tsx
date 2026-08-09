// components/admin/Inquiries.tsx
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import api from "../../services/api";

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

export default function Inquiries() {
  const queryClient = useQueryClient();

  // --- UI States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactMessage | null>(
    null,
  );

  // --- Filter States ---
  const [inquiryType, setInquiryType] = useState<string>(""); // "" | "general" | "bespoke_dress"
  const [dateMode, setDateMode] = useState<"any" | "specific" | "range">("any");
  const [specificDate, setSpecificDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Reset to page 1 whenever a filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [inquiryType, dateMode, specificDate, startDate, endDate, searchTerm]);

  // --- Fetch Inquiries with Query Params ---
  const {
    data: inquiries,
    isLoading,
    isError,
  } = useQuery<ContactMessage[]>({
    queryKey: [
      "adminInquiries",
      inquiryType,
      dateMode,
      specificDate,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (inquiryType) {
        params.append("inquiry_type", inquiryType);
      }

      if (dateMode === "specific" && specificDate) {
        params.append("specific_date", specificDate);
      } else if (dateMode === "range") {
        // Append time to ensure FastAPI's datetime parser registers the full bounds of the day
        if (startDate) params.append("start_date", `${startDate}T00:00:00`);
        if (endDate) params.append("end_date", `${endDate}T23:59:59`);
      }

      const response = await api.get<ContactMessage[]>(
        `/contact-messages/?${params.toString()}`,
      );
      return response.data;
    },
  });

  // --- Mark as Read Mutation ---
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.patch(`/contact-messages/${id}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInquiries"] });
    },
  });

  // --- Search & Pagination Logic ---
  const filteredInquiries =
    inquiries?.filter(
      (inquiry) =>
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInquiries.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // --- Handlers ---
  const handleViewInquiry = (inquiry: ContactMessage) => {
    setSelectedInquiry(inquiry);
    if (!inquiry.is_read) {
      markAsReadMutation.mutate(inquiry.id);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-7xl mx-auto animation-fade-in relative">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display font-black italic text-3xl text-fg mb-2">
          Inbox
        </h1>
        <p className="font-sans text-sm text-muted">
          Manage general inquiries and bespoke commissions.
        </p>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-surface border border-border-col mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none font-sans text-sm text-fg pl-10 py-1 placeholder:text-muted/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 font-sans text-xs tracking-wider uppercase transition-colors border ${
              showFilters
                ? "bg-accent/10 border-accent text-accent"
                : "border-border-col text-muted hover:text-fg"
            }`}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-t border-border-col bg-bg/30">
            {/* Inquiry Type Filter */}
            <div>
              <label className="block font-sans text-xs tracking-[0.2em] uppercase text-muted mb-2">
                Type
              </label>
              <select
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2 cursor-pointer appearance-none"
              >
                <option value="" className="bg-surface text-fg">
                  All Types
                </option>
                <option value="general" className="bg-surface text-fg">
                  General Inquiry
                </option>
                <option value="bespoke_dress" className="bg-surface text-fg">
                  Bespoke Commission
                </option>
              </select>
            </div>

            {/* Date Mode Filter */}
            <div>
              <label className="block font-sans text-xs tracking-[0.2em] uppercase text-muted mb-2">
                Date Filter
              </label>
              <select
                value={dateMode}
                onChange={(e) => {
                  setDateMode(e.target.value as any);
                  setSpecificDate("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2 cursor-pointer appearance-none"
              >
                <option value="any" className="bg-surface text-fg">
                  Any Time
                </option>
                <option value="specific" className="bg-surface text-fg">
                  Specific Date
                </option>
                <option value="range" className="bg-surface text-fg">
                  Date Range
                </option>
              </select>
            </div>

            {/* Dynamic Date Inputs based on Date Mode */}
            <div className="flex gap-4 items-end">
              {dateMode === "specific" && (
                <div className="w-full">
                  <label className="block font-sans text-xs tracking-[0.2em] uppercase text-muted mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2"
                  />
                </div>
              )}

              {dateMode === "range" && (
                <>
                  <div className="w-full">
                    <label className="block font-sans text-xs tracking-[0.2em] uppercase text-muted mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2"
                    />
                  </div>
                  <div className="w-full">
                    <label className="block font-sans text-xs tracking-[0.2em] uppercase text-muted mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-border-col overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-col text-muted font-sans text-xs uppercase tracking-[0.15em]">
              <th className="p-4 font-normal">Sender</th>
              <th className="p-4 font-normal">Type</th>
              <th className="p-4 font-normal">Date</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-sans text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted">
                  <div className="animate-pulse">Loading inbox...</div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-red-400">
                  Failed to load inquiries.
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted">
                  No inquiries found matching your filters.
                </td>
              </tr>
            ) : (
              currentItems.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  className={`border-b border-border-col/50 transition-colors duration-150 ${
                    !inquiry.is_read
                      ? "bg-accent/5 hover:bg-accent/10"
                      : "hover:bg-bg/50"
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {!inquiry.is_read && (
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                      )}
                      <div>
                        <p
                          className={`font-medium ${!inquiry.is_read ? "text-fg" : "text-muted"}`}
                        >
                          {inquiry.first_name} {inquiry.last_name}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {inquiry.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-[0.65rem] tracking-wider uppercase rounded-full ${inquiry.inquiry_type === "bespoke_dress" ? "bg-blue-500/10 text-blue-400" : "bg-surface border border-border-col text-muted"}`}
                    >
                      {inquiry.inquiry_type === "bespoke_dress"
                        ? "Bespoke"
                        : "General"}
                    </span>
                  </td>
                  <td className="p-4 text-muted">
                    {formatDate(inquiry.created_at)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleViewInquiry(inquiry)}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-muted hover:text-accent transition-colors"
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border-col">
            <span className="font-sans text-xs text-muted">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-border-col text-muted hover:text-fg hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border border-border-col text-muted hover:text-fg hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Inquiry Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-24 pb-12 overflow-y-auto">
          <div className="bg-surface border border-border-col w-full max-w-2xl p-6 md:p-8 shadow-2xl animation-fade-in relative">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-6 right-6 text-muted hover:text-fg transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="font-display font-bold italic text-2xl text-fg mb-6 pr-8">
              {selectedInquiry.inquiry_type === "bespoke_dress"
                ? "Bespoke Commission"
                : "General Inquiry"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-6 border-b border-border-col">
              <div>
                <span className="block font-sans text-xs tracking-[0.2em] uppercase text-muted mb-1">
                  From
                </span>
                <p className="font-sans text-sm text-fg">
                  {selectedInquiry.first_name} {selectedInquiry.last_name}
                </p>
              </div>
              <div>
                <span className="block font-sans text-xs tracking-[0.2em] uppercase text-muted mb-1">
                  Email
                </span>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="font-sans text-sm text-accent hover:underline"
                >
                  {selectedInquiry.email}
                </a>
              </div>
              <div className="md:col-span-2">
                <span className="block font-sans text-xs tracking-[0.2em] uppercase text-muted mb-1">
                  Received
                </span>
                <p className="font-sans text-sm text-fg">
                  {formatDate(selectedInquiry.created_at)}
                </p>
              </div>
            </div>
            <div>
              <span className="block font-sans text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Message
              </span>
              <div className="bg-bg border border-border-col p-6 rounded-sm">
                <p className="font-sans text-sm text-fg whitespace-pre-wrap leading-relaxed">
                  {selectedInquiry.message}
                </p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border-col text-right">
              <a
                href={`mailto:${selectedInquiry.email}?subject=Re: Inquiry to Oggystitches`}
                className="inline-flex items-center justify-center bg-accent text-bg px-8 py-3 font-sans text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors"
              >
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
