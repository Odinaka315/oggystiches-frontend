// components/admin/Login.tsx
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { useServerWarmup } from "../../context/ServerWarmupContext";
import api from "../../services/api";

interface TokenResponse {
  access_token: string;
  token_type: string;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isWaking } = useServerWarmup();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const tokenResponse = await api.post<TokenResponse>(
        "/auth/login",
        params,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      const token = tokenResponse.data.access_token;

      const userResponse = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        token: token,
        user: userResponse.data,
      };
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate("/admin"); // Redirects to the admin page upon successful login
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      loginMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-10">
          <h1 className="font-display font-black italic text-4xl text-fg mb-2">
            oggy<span className="text-accent">stitches</span>
          </h1>
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-muted">
            Atelier Management
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <input
            type="email"
            required
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loginMutation.isPending}
            className="bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-3 transition-colors duration-300 disabled:opacity-50"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loginMutation.isPending}
              className="w-full bg-transparent border-b border-border-col focus:border-accent outline-none font-sans text-sm text-fg py-3 pr-10 transition-colors duration-300 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors duration-200"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {loginMutation.isError && (
            <p className="font-sans text-xs text-red-400 text-center mt-2">
              Incorrect email or password. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-4 bg-transparent border border-accent font-sans text-[0.68rem] tracking-[0.22em] uppercase text-accent py-4 transition-all duration-300 hover:bg-accent hover:text-bg disabled:opacity-50 disabled:cursor-wait"
          >
            {loginMutation.isPending
              ? isWaking
                ? "Waking server up (~45s)..."
                : "Authenticating..."
              : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
