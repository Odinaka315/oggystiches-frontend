// components/admin/Security.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../../services/api";

export default function Security() {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const mutation = useMutation({
    mutationFn: async (payload: {
      old_password: string;
      new_password: string;
    }) => {
      const response = await api.patch("/me/change-password", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || "Password updated successfully.");
      setFormData({ old_password: "", new_password: "", confirm_password: "" });
    },
    onError: (error: any) => {
      // Extract error detail from FastAPI response if it exists
      const errorDetail =
        error.response?.data?.detail ||
        "Failed to update password. Please try again.";
      setValidationError(errorDetail);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError("");
    setSuccessMessage("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccessMessage("");

    // 1. Client-side validation: Check if new passwords match
    if (formData.new_password !== formData.confirm_password) {
      setValidationError("❌ Your new passwords do not match.");
      return;
    }

    // 2. Client-side validation: Prevent empty submissions
    if (!formData.old_password || !formData.new_password) {
      setValidationError("❌ All fields are required.");
      return;
    }

    // 3. Fire the mutation with the exact schema the backend expects
    mutation.mutate({
      old_password: formData.old_password,
      new_password: formData.new_password,
    });
  };

  return (
    <div className="max-w-4xl mx-auto animation-fade-in">
      <div className="mb-10">
        <h1 className="font-display font-black italic text-3xl text-fg mb-2">
          Security Settings
        </h1>
        <p className="font-sans text-sm text-muted">
          Update your atelier credentials and manage your account security.
        </p>
      </div>

      <div className="bg-surface border border-border-col p-6 md:p-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-8 border-b border-border-col pb-4">
          <ShieldCheck className="text-accent" size={24} />
          <h2 className="font-display italic text-xl text-fg">
            Change Password
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Status Messages */}
          {validationError && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 text-red-400 font-sans text-sm">
              <AlertCircle size={18} />
              <p>{validationError}</p>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 text-green-400 font-sans text-sm">
              <CheckCircle2 size={18} />
              <p>{successMessage}</p>
            </div>
          )}

          {/* Form Inputs */}
          <div>
            <label className="block font-sans text-xs tracking-[0.15em] uppercase text-muted mb-2">
              Current Password
            </label>
            <input
              type="password"
              name="old_password"
              value={formData.old_password}
              onChange={handleChange}
              placeholder="Enter your current password"
              className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-3 transition-colors"
            />
          </div>

          <div>
            <label className="block font-sans text-xs tracking-[0.15em] uppercase text-muted mb-2 mt-4">
              New Password
            </label>
            <input
              type="password"
              name="new_password"
              value={formData.new_password}
              onChange={handleChange}
              placeholder="Enter a secure new password"
              className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-3 transition-colors"
            />
          </div>

          <div>
            <label className="block font-sans text-xs tracking-[0.15em] uppercase text-muted mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Type your new password again"
              className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-3 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-6 bg-accent text-bg py-4 font-sans text-xs tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Updating Security..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
