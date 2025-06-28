"use client";

import type { User, UserRole, ClientCase } from "@/types";
import React, { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
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
  // Development helpers
  switchUser: (userId: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data (replace with actual API calls in a real app)
const MOCK_USERS: User[] = [
  { id: "client1", email: "client@example.com", role: "client", name: "Test Client" },
  { id: "staff1", email: "staff@example.com", role: "staff", name: "Test Staff" },
  { id: "dev-client", email: "dev-client@test.com", role: "client", name: "Development Client" },
  { id: "dev-staff", email: "dev-staff@test.com", role: "staff", name: "Development Staff" },
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
    },
    {
        id: "case2",
        clientId: "dev-client",
        clientName: "Development Client Company",
        clientType: "Company",
        formData: { 
            registeredCompanyName: "Dev Test Company Ltd", 
            registrationNumber: "2023/123456/07",
            registeredAddress: "456 Business Ave, Corporate City",
        },
        documents: [],
        status: "Information Submitted",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // For development: automatically log in as a default user
  const [user, setUser] = useState<User | null>(MOCK_USERS[0]); // Default to first client
  const [isLoading, setIsLoading] = useState(false); // Set to false for immediate access
  const router = useRouter();

  // Mock data state
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [cases, setCases] = useState<ClientCase[]>(MOCK_CASES);
  const [activeCase, setActiveCase] = useState<ClientCase | null>(null);

  useEffect(() => {
    // For development: skip localStorage check and use default user
    // In production, you would check localStorage here
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Mock login: find user by email
    const foundUser = users.find((u) => u.email === email);
    if (foundUser) {
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
    setUser(newUser);
    localStorage.setItem("ficaUser", JSON.stringify(newUser));
    setIsLoading(false);
    router.push("/dashboard");
    return true;
  };

  const logout = () => {
    // For development: switch back to default user instead of logging out
    setUser(MOCK_USERS[0]);
    setActiveCase(null);
    router.push("/dashboard");
  };

  // Development helper to switch between users
  const switchUser = useCallback((userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      setActiveCase(null);
      localStorage.setItem("ficaUser", JSON.stringify(foundUser));
    }
  }, [users]);

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
        isAuthenticated: true, // Always authenticated for development
        isLoading,
        login,
        logout,
        register,
        users,
        cases, 
        setCases,
        addCase,
        updateCase,
        activeCase,
        setActiveCase,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};