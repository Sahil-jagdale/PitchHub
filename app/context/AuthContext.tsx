"use client";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { useRouter } from "next/navigation";
import { loginUser, signupUser, getMe } from "@/lib/api";

// Define the shape of user
interface User {
  id: string;
  name: string;
  email: string;
  role: "startup" | "investor";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: "startup" | "investor";
  }) => Promise<void>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Persist token in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      getMe(storedToken)
        .then((data) => setUser(data.user))
        .catch(() => logout());
    }
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    const data = await loginUser(email, password);
    if (data?.token && data?.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);

      // Redirect based on role
      if (data.user.role === "startup") router.push("/startup/dashboard");
      else router.push("/investor/dashboard");
    }
  };

  // Signup function
  const signup = async (signupData: {
    name: string;
    email: string;
    password: string;
    role: "startup" | "investor";
  }) => {
    const data = await signupUser(signupData);
    if (data?.token && data?.user) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);

      if (data.user.role === "startup") router.push("/startup/dashboard");
      else router.push("/investor/dashboard");
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
