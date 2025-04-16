
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("auth_user");
      }
    }
  }, []);

  const login = async (email: string, password: string, remember: boolean) => {
    // In a real app, this would make an API call to validate credentials
    // For demo purposes, we'll mock authentication
    if (email && password) {
      const mockUser = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      
      if (remember) {
        localStorage.setItem("auth_user", JSON.stringify(mockUser));
      } else {
        // Use sessionStorage if "remember me" is not checked
        sessionStorage.setItem("auth_user", JSON.stringify(mockUser));
      }
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    // In a real app, this would register a new user via API
    // For demo purposes, we'll simulate a successful signup
    if (name && email && password) {
      const mockUser = {
        id: `user_${Date.now()}`,
        email,
        name,
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem("auth_user", JSON.stringify(mockUser));
    } else {
      throw new Error("Please fill all required fields");
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("auth_user");
  };

  const forgotPassword = async (email: string) => {
    // In a real app, this would trigger a password reset email
    // Here we'll just simulate the process
    if (!email) {
      throw new Error("Email is required");
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Password reset requested for: ${email}`);
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
