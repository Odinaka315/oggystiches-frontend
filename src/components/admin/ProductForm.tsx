// components/admin/ProductForm.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  UploadCloud,
  Save,
  X,
  Image as ImageIcon,
  Film,
} from "lucide-react";
import api from "../../services/api";

interface MediaPreview {
  file: File;
  url: string;
  type: "image" | "video";
}

export default function ProductForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "ready_to_wear", // Default to the main collection
    is_active: false,
    is_featured: false,
    is_bespoke: false,
  });

  const [media, setMedia] = useState<MediaPreview[]>([]);
  const [mediaError, setMediaError] = useState("");

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      media.forEach((m) => URL.revokeObjectURL(m.url));
    };
  }, [media]);

  const mutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const response = await api.post("/products", payload, {
        headers: {
          // Let the browser set the Content-Type with the multipart boundary
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      navigate("/admin/products");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaError("");
    if (!e.target.files) return;

    const incomingFiles = Array.from(e.target.files);
    let currentImages = media.filter((m) => m.type === "image").length;
    let currentVideos = media.filter((m) => m.type === "video").length;

    const newMedia: MediaPreview[] = [];
    let errorMsg = "";

    for (const file of incomingFiles) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (isImage) {
        if (currentImages < 3) {
          newMedia.push({
            file,
            url: URL.createObjectURL(file),
            type: "image",
          });
          currentImages++;
        } else {
          errorMsg = "Maximum of 3 images allowed.";
        }
      } else if (isVideo) {
        if (currentVideos < 1) {
          newMedia.push({
            file,
            url: URL.createObjectURL(file),
            type: "video",
          });
          currentVideos++;
        } else {
          errorMsg = "Maximum of 1 video allowed.";
        }
      }
    }

    if (errorMsg) setMediaError(errorMsg);
    setMedia((prev) => [...prev, ...newMedia]);

    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (indexToRemove: number) => {
    setMedia((prev) => {
      const newMedia = [...prev];
      URL.revokeObjectURL(newMedia[indexToRemove].url);
      newMedia.splice(indexToRemove, 1);
      return newMedia;
    });
    setMediaError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const imageCount = media.filter((m) => m.type === "image").length;
    if (imageCount < 1) {
      setMediaError("At least 1 image is required.");
      return;
    }

    const payload = new FormData();
    payload.append("title", formData.title);
    payload.append("price", (parseFloat(formData.price) || 0).toString());
    payload.append("description", formData.description);
    payload.append("category", formData.category);
    payload.append("is_active", String(formData.is_active));
    payload.append("is_featured", String(formData.is_featured));
    payload.append("is_bespoke", String(formData.is_bespoke));

    media.forEach((m) => {
      payload.append("files", m.file);
    });

    mutation.mutate(payload);
  };

  return (
    <div className="max-w-5xl mx-auto animation-fade-in px-4 md:px-0 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pt-4 md:pt-0">
        <button
          onClick={() => navigate("/admin/products")}
          className="p-2 text-muted hover:text-accent transition-colors duration-200"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display font-black italic text-2xl md:text-3xl text-fg mb-1">
            Add New Piece
          </h1>
          <p className="font-sans text-xs md:text-sm text-muted">
            Create a new listing for the atelier.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Main Details Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-surface border border-border-col p-6">
            <h2 className="font-sans text-xs tracking-[0.2em] uppercase text-muted mb-6">
              General Information
            </h2>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block font-sans text-sm text-fg mb-2">
                  Piece Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2 transition-colors"
                  placeholder="e.g. The Obsidian Crown"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-sm text-fg mb-2">
                    Price (₦)
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block font-sans text-sm text-fg mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2 transition-colors cursor-pointer appearance-none"
                  >
                    <option
                      value="ready_to_wear"
                      className="bg-surface text-fg"
                    >
                      Ready to Wear
                    </option>
                    <option value="bespoke" className="bg-surface text-fg">
                      Bespoke
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-sans text-sm text-fg mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2 transition-colors resize-none"
                  placeholder="Detail the craftsmanship, fabric, and inspiration..."
                />
              </div>
            </div>
          </div>

          {/* Media Upload Section */}
          <div className="bg-surface border border-border-col p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-sans text-xs tracking-[0.2em] uppercase text-muted">
                Media
              </h2>
              <span className="font-sans text-xs text-muted">
                Max: 3 Images, 1 Video (Min: 1 Image)
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              multiple
              className="hidden"
            />

            {/* Upload Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border-col hover:border-accent transition-colors duration-200 flex flex-col items-center justify-center p-8 mb-6 cursor-pointer bg-bg/30 text-muted hover:text-accent"
            >
              <UploadCloud size={32} className="mb-3" />
              <p className="font-sans text-sm mb-1">
                Click to browse device files
              </p>
              <p className="font-sans text-xs opacity-60">
                PNG, JPG, MP4 supported
              </p>
            </div>

            {mediaError && (
              <p className="text-red-400 font-sans text-xs mb-4">
                {mediaError}
              </p>
            )}

            {/* Media Previews Grid */}
            {media.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {media.map((m, index) => (
                  <div
                    key={index}
                    className="relative aspect-[3/4] bg-bg border border-border-col group overflow-hidden"
                  >
                    {m.type === "image" ? (
                      <img
                        src={m.url}
                        alt="Preview"
                        className="w-full h-full object-cover mix-blend-luminosity opacity-90 transition-all duration-300 group-hover:mix-blend-normal group-hover:opacity-100 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full relative">
                        <video
                          src={m.url}
                          className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-bg/20">
                          <Film size={24} className="text-fg" />
                        </div>
                      </div>
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-2 left-2 bg-bg/80 backdrop-blur-sm p-1 rounded-sm text-fg">
                      {m.type === "image" ? (
                        <ImageIcon size={14} />
                      ) : (
                        <Film size={14} />
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMedia(index);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column (Status & Submit) */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border-col p-6">
            <h2 className="font-sans text-xs tracking-[0.2em] uppercase text-muted mb-6">
              Visibility
            </h2>

            <div className="flex flex-col gap-5 font-sans text-sm text-fg">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="accent-accent w-4 h-4"
                />
                <span className="group-hover:text-accent transition-colors">
                  Publish to Storefront (Active)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="accent-accent w-4 h-4"
                />
                <span className="group-hover:text-accent transition-colors">
                  Feature on Homepage
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="is_bespoke"
                  checked={formData.is_bespoke}
                  onChange={handleChange}
                  className="accent-accent w-4 h-4"
                />
                <span className="group-hover:text-accent transition-colors">
                  Mark as Bespoke Commission
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center justify-center gap-2 w-full bg-accent text-bg px-6 py-4 font-sans text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {mutation.isPending ? "Saving Piece..." : "Save Piece"}
          </button>

          {mutation.isError && (
            <div className="p-3 border border-red-500/50 bg-red-500/10 text-red-500 font-sans text-xs text-center">
              Failed to save product. Please check your connection or media
              sizes.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
