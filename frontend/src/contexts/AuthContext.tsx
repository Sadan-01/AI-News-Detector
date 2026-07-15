import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, TokenData, APIResponse } from "../types/api";
import { api } from "../services/api";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: any) => Promise<boolean>;
  registerUser: (payload: any) => Promise<boolean>;
  logout: () => void;
  updateProfileState: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on reload
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          setToken(savedToken);
          // Set authorization header manually for this initialization call
          api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
          
          const response = await api.get<APIResponse<User>>("/auth/me");
          if (response.data.success && response.data.data) {
            setUser(response.data.data);
            setIsAuthenticated(true);
          } else {
            // Failed to fetch profile, clear session
            clearSession();
          }
        } catch (error) {
          console.error("Failed to restore session", error);
          clearSession();
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const clearSession = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete api.defaults.headers.common["Authorization"];
  };

  const login = async (payload: any): Promise<boolean> => {
    try {
      const response = await api.post<APIResponse<TokenData>>("/auth/login", payload);
      if (response.data.success && response.data.data) {
        const { access_token, user: userData } = response.data.data;
        localStorage.setItem("token", access_token);
        setToken(access_token);
        setUser(userData);
        setIsAuthenticated(true);
        // Set standard authorization header
        api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        toast.success(response.data.message || "Welcome back!");
        return true;
      }
      return false;
    } catch (error) {
      // Error is already toasted by response interceptor
      return false;
    }
  };

  const registerUser = async (payload: any): Promise<boolean> => {
    try {
      const response = await api.post<APIResponse<User>>("/auth/register", payload);
      if (response.data.success && response.data.data) {
        toast.success("Account created successfully!");
        
        // Auto-login after registration by calling login directly
        const loginSuccess = await login({
          email: payload.email,
          password: payload.password,
        });
        return loginSuccess;
      }
      return false;
    } catch (error) {
      // Error is already toasted
      return false;
    }
  };

  const logout = () => {
    clearSession();
    toast.success("Logged out successfully");
  };

  const updateProfileState = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        registerUser,
        logout,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
