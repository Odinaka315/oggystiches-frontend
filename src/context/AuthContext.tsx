import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api"; // Adjust this path to where your api.ts lives

// 1. Define the shape of your User object
// Inside your AuthContext.tsx or types.ts file:
export interface User {
  id: number;
  email: string;
  username?: string;
  first_name?: string; // 👈 Add this line
  last_name?: string; // 👈 Add this line
  bio?: string; // 👈 Add this line
  profile_image_url?: string; // 👈 Add this line (for the avatar!)
  // ... any other existing properties
}

// 2. Define the context structure
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // The api.ts interceptor automatically attaches the token!
          const response = await api.get<User>("/users/me");
          setUser(response.data);
        } catch (error) {
          console.error("Session expired.");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("token", token);
    setUser(userData);
    navigate("/"); // Send to TixODI home page
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login"); // Send back to login
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook with built-in null checking
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
