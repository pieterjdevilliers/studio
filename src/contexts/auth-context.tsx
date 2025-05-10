"use client";

import type { User, UserRole, ClientCase } from "@/types";
import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>; // Add actual login logic type
  logout: () => void;
  register: (name: string, email: string, pass: string, role: UserRole) => Promise<boolean>;
  // Mock data storage for users and cases
  users: User[];
  cases: ClientCase[];
  setCases: React.Dispatch<React.SetStateAction<ClientCase[]>>;
  addCase: (newCase: ClientCase) => void;
  updateCase: (updatedCase: ClientCase) => void;
  activeCase: ClientCase | null;
  setActiveCase: React.Dispatch<React.SetStateAction<ClientCase | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data (replace with actual API calls in a real app)
const MOCK_USERS: User[] = [
  { id: "client1", email: "client@example.com", role: "client", name: "Test Client" },
  { id: "staff1", email: "staff@example.com", role: "staff", name: "Test Staff" },
];

const MOCK_CASES: ClientCase[] = [
    {
        id: "case1",
        clientId: "client1",
        clientName: "Test Client Individual",
        clientType: "Individual",
        formData: { 
            fullName: "Test Client Individual", 
            idNumber: "123456789",
            residentialAddress: "123 Main St, Anytown",
        },
        documents: [],
        status: "Pending Submission",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Mock data state
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [cases, setCases] = useState<ClientCase[]>(MOCK_CASES);
  const [activeCase, setActiveCase] = useState<ClientCase | null>(null);


  useEffect(() => {
    // Check for saved user in localStorage (basic session persistence)
    const savedUser = localStorage.getItem("ficaUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Mock login: find user by email. In real app, call API and verify password.
    const foundUser = users.find((u) => u.email === email);
    if (foundUser) {
      // Mock password check - in real app, this is done by backend
      setUser(foundUser);
      localStorage.setItem("ficaUser", JSON.stringify(foundUser));
      setIsLoading(false);
      router.push("/dashboard");
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const register = async (name: string, email: string, pass: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    if (users.find(u => u.email === email)) {
      setIsLoading(false);
      return false; // User already exists
    }
    const newUser: User = { id: `user-${Date.now()}`, email, role, name };
    setUsers(prevUsers => [...prevUsers, newUser]); 
    // In a real app, save to backend. Here, we just log in the new user.
    setUser(newUser);
    localStorage.setItem("ficaUser", JSON.stringify(newUser));
    setIsLoading(false);
    router.push("/dashboard");
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ficaUser");
    setActiveCase(null);
    router.push("/");
  };

  const addCase = useCallback((newCase: ClientCase) => {
    setCases(prev => [...prev, newCase]);
  }, []);

  const updateCase = useCallback((updatedCase: ClientCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    if (activeCase?.id === updatedCase.id) {
      setActiveCase(updatedCase);
    }
  }, [activeCase]);


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        users, // Exposing mock users for now
        cases, 
        setCases,
        addCase,
        updateCase,
        activeCase,
        setActiveCase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
