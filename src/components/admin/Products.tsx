// components/admin/Products.tsx
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  AlertTriangle,
  Save,
  UploadCloud,
  Image as ImageIcon,
  Film,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

interface ProductImage {
  id: number;
  image_url: string;
  is_video_snippet: boolean;
}

interface AdminProduct {
  id: number;
  title: string;
  price: number;
  description?: string;
  category?: string;
  is_active: boolean;
  is_featured: boolean;
  is_bespoke: boolean;
  images?: ProductImage[];
}

interface MediaPreview {
  file: File;
  url: string;
  type: "image" | "video";
}

export default function Products() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // --- UI States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
  }>({
    isOpen: false,
    id: null,
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AdminProduct>>({});

  // Media Editing States
  const [existingMedia, setExistingMedia] = useState<ProductImage[]>([]);
  const [newMedia, setNewMedia] = useState<MediaPreview[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);
  const [mediaError, setMediaError] = useState("");

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      newMedia.forEach((m) => URL.revokeObjectURL(m.url));
    };
  }, [newMedia]);

  // Fetch all products
  const {
    data: products,
    isLoading,
    isError,
  } = useQuery<AdminProduct[]>({
    queryKey: ["adminProducts"],
    queryFn: async () => {
      const response = await api.get<AdminProduct[]>("/products/admin");
      return response.data;
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      setDeleteModal({ isOpen: false, id: null });
    },
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: async (payload: FormData) => {
      const id = payload.get("id");
      const response = await api.put(`/products/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      setEditModalOpen(false);
    },
  });

  // Handlers
  const confirmDelete = () => {
    if (deleteModal.id !== null) {
      deleteMutation.mutate(deleteModal.id);
    }
  };

  const openEditModal = (product: AdminProduct) => {
    setEditForm(product);
    setExistingMedia(product.images || []);
    setNewMedia([]);
    setRemovedMediaIds([]);
    setMediaError("");
    setEditModalOpen(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setEditForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- Media Editing Handlers ---
  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaError("");
    if (!e.target.files) return;

    const incomingFiles = Array.from(e.target.files);

    let currentImages =
      existingMedia.filter((m) => !m.is_video_snippet).length +
      newMedia.filter((m) => m.type === "image").length;
    let currentVideos =
      existingMedia.filter((m) => m.is_video_snippet).length +
      newMedia.filter((m) => m.type === "video").length;

    const addedMedia: MediaPreview[] = [];
    let errorMsg = "";

    for (const file of incomingFiles) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (isImage) {
        if (currentImages < 3) {
          addedMedia.push({
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
          addedMedia.push({
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
    setNewMedia((prev) => [...prev, ...addedMedia]);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const removeExistingMedia = (index: number) => {
    const target = existingMedia[index];
    setRemovedMediaIds((prev) => [...prev, target.id]);
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
    setMediaError("");
  };

  const removeNewMedia = (index: number) => {
    setNewMedia((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
    setMediaError("");
  };

  // --- Submit Handler ---
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const imageCount =
      existingMedia.filter((m) => !m.is_video_snippet).length +
      newMedia.filter((m) => m.type === "image").length;
    if (imageCount < 1) {
      setMediaError("At least 1 image is required.");
      return;
    }

    const payload = new FormData();
    payload.append("id", editForm.id!.toString());
    payload.append("title", editForm.title || "");
    payload.append(
      "price",
      (parseFloat(editForm.price as any) || 0).toString(),
    );
    payload.append("description", editForm.description || "");
    payload.append("category", editForm.category || "ready_to_wear");
    payload.append("is_active", String(editForm.is_active));
    payload.append("is_featured", String(editForm.is_featured));
    payload.append("is_bespoke", String(editForm.is_bespoke));

    removedMediaIds.forEach((id) => {
      payload.append("removed_image_ids", id.toString());
    });
    newMedia.forEach((m) => {
      payload.append("files", m.file);
    });

    editMutation.mutate(payload);
  };

  // --- Search & Pagination Logic ---
  const filteredProducts =
    products?.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  return (
    <div className="max-w-7xl mx-auto animation-fade-in relative">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div>
          <h1 className="font-display font-black italic text-3xl text-fg mb-2">
            Collections
          </h1>
          <p className="font-sans text-sm text-muted">
            Manage your inventory, bespoke listings, and featured pieces.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/products/new")}
          className="flex items-center gap-2 bg-accent text-bg px-6 py-3 font-sans text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors duration-200"
        >
          <Plus size={16} /> Add New Piece
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-surface border border-border-col p-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
            className="w-full bg-transparent border-none outline-none font-sans text-sm text-fg pl-10 py-1 placeholder:text-muted/50"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-border-col overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-col text-muted font-sans text-xs uppercase tracking-[0.15em]">
              <th className="p-4 font-normal">Piece</th>
              <th className="p-4 font-normal">Price</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Type</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-sans text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  <div className="animate-pulse">
                    Loading atelier inventory...
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-red-400">
                  Failed to load products. Please check your connection.
                </td>
              </tr>
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No pieces found matching your search.
                </td>
              </tr>
            ) : (
              currentItems.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border-col/50 hover:bg-bg/50 transition-colors duration-150"
                >
                  <td className="p-4 font-medium text-fg">{product.title}</td>
                  <td className="p-4 text-muted">
                    ₦{product.price.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-[0.65rem] tracking-wider uppercase rounded-full ${
                        product.is_active
                          ? "bg-green-500/10 text-green-500"
                          : "bg-muted/10 text-muted"
                      }`}
                    >
                      {product.is_active ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {product.is_featured && (
                        <span className="text-accent text-[0.65rem] uppercase tracking-wider border border-accent/30 px-2 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                      {product.is_bespoke && (
                        <span className="text-blue-400 text-[0.65rem] uppercase tracking-wider border border-blue-400/30 px-2 py-0.5 rounded">
                          Bespoke
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-muted hover:text-accent transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({ isOpen: true, id: product.id })
                        }
                        className="text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border-col w-full max-w-sm p-6 shadow-2xl animation-fade-in">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle size={24} />
              <h2 className="font-display font-bold italic text-xl">
                Delete Piece?
              </h2>
            </div>
            <p className="font-sans text-sm text-muted mb-8">
              This action cannot be undone. Are you sure you want to permanently
              remove this piece?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                disabled={deleteMutation.isPending}
                className="flex-1 border border-border-col py-3 font-sans text-xs tracking-[0.15em] uppercase text-muted hover:text-fg hover:bg-border-col/30 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 text-white py-3 font-sans text-xs tracking-[0.15em] uppercase hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto pt-24 pb-12">
          <div className="bg-surface border border-border-col w-full max-w-2xl p-6 shadow-2xl animation-fade-in">
            <div className="flex justify-between items-center mb-6 border-b border-border-col pb-4">
              <h2 className="font-display font-bold italic text-2xl text-fg">
                Edit Details
              </h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-muted hover:text-fg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-sm text-fg mb-2">
                    Piece Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={editForm.title || ""}
                    onChange={handleEditChange}
                    className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2 transition-colors"
                  />
                </div>
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
                    value={editForm.price || ""}
                    onChange={handleEditChange}
                    className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-sm text-fg mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={editForm.description || ""}
                  onChange={handleEditChange}
                  className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-2 transition-colors resize-none"
                />
              </div>

              {/* Media Edit Section */}
              <div className="border border-border-col p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-sans text-xs tracking-[0.2em] uppercase text-muted">
                    Media Files
                  </h3>
                  <span className="font-sans text-[0.65rem] text-muted">
                    Max 3 Images, 1 Video
                  </span>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                  {/* Render Existing Media */}
                  {existingMedia.map((m, index) => (
                    <div
                      key={`existing-${m.id}`}
                      className="relative aspect-[3/4] bg-bg border border-border-col group"
                    >
                      {m.is_video_snippet ? (
                        <div className="w-full h-full relative">
                          <video
                            src={m.image_url}
                            className="w-full h-full object-cover opacity-70"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-bg/20">
                            <Film size={20} className="text-fg" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={m.image_url}
                          alt="Existing"
                          className="w-full h-full object-cover opacity-90"
                        />
                      )}
                      <div className="absolute top-1 left-1 bg-bg/80 p-1 rounded-sm text-fg">
                        <CloudIcon size={12} isVideo={m.is_video_snippet} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingMedia(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Render New Media */}
                  {newMedia.map((m, index) => (
                    <div
                      key={`new-${index}`}
                      className="relative aspect-[3/4] bg-bg border border-accent group"
                    >
                      {m.type === "video" ? (
                        <div className="w-full h-full relative">
                          <video
                            src={m.url}
                            className="w-full h-full object-cover opacity-70"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-bg/20">
                            <Film size={20} className="text-accent" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={m.url}
                          alt="New"
                          className="w-full h-full object-cover opacity-90"
                        />
                      )}
                      <div className="absolute top-1 left-1 bg-accent/90 p-1 rounded-sm text-bg">
                        <NewIcon size={12} isVideo={m.type === "video"} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewMedia(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Upload Trigger */}
                  {existingMedia.length + newMedia.length < 4 && (
                    <div
                      onClick={() => editFileInputRef.current?.click()}
                      className="aspect-[3/4] border-2 border-dashed border-border-col hover:border-accent flex flex-col items-center justify-center cursor-pointer text-muted hover:text-accent transition-colors bg-bg/30"
                    >
                      <UploadCloud size={20} className="mb-2" />
                      <span className="font-sans text-[0.65rem] text-center px-2">
                        Add File
                      </span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={handleEditFileSelect}
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                />
                {mediaError && (
                  <p className="text-red-400 font-sans text-xs mt-2">
                    {mediaError}
                  </p>
                )}
              </div>

              <div className="border border-border-col p-4 flex flex-col sm:flex-row sm:items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editForm.is_active || false}
                    onChange={handleEditChange}
                    className="accent-accent w-4 h-4"
                  />
                  <span className="font-sans text-sm text-fg group-hover:text-accent">
                    Active (Public)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={editForm.is_featured || false}
                    onChange={handleEditChange}
                    className="accent-accent w-4 h-4"
                  />
                  <span className="font-sans text-sm text-fg group-hover:text-accent">
                    Featured
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="is_bespoke"
                    checked={editForm.is_bespoke || false}
                    onChange={handleEditChange}
                    className="accent-accent w-4 h-4"
                  />
                  <span className="font-sans text-sm text-fg group-hover:text-accent">
                    Bespoke
                  </span>
                </label>
              </div>

              {editMutation.isError && (
                <p className="text-red-400 font-sans text-xs text-center">
                  Failed to update piece. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={editMutation.isPending}
                className="flex items-center justify-center gap-2 w-full bg-accent text-bg px-6 py-4 font-sans text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-all duration-200 disabled:opacity-50"
              >
                <Save size={16} />{" "}
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components for the media grid badges
function CloudIcon({ size, isVideo }: { size: number; isVideo: boolean }) {
  return isVideo ? <Film size={size} /> : <ImageIcon size={size} />;
}
function NewIcon({ size, isVideo }: { size: number; isVideo: boolean }) {
  return isVideo ? <Film size={size} /> : <ImageIcon size={size} />;
}
