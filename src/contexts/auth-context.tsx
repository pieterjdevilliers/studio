"use client";

import type { User, UserRole, ClientCase, Task, AuditLog, ClientProfile, StaffProfile } from "@/types";
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
  tasks: Task[];
  auditLogs: AuditLog[];
  clientProfiles: ClientProfile[];
  staffProfiles: StaffProfile[];
  setCases: React.Dispatch<React.SetStateAction<ClientCase[]>>;
  addCase: (newCase: ClientCase) => void;
  updateCase: (updatedCase: ClientCase) => void;
  activeCase: ClientCase | null;
  setActiveCase: React.Dispatch<React.SetStateAction<ClientCase | null>>;
  // Development helpers
  switchUser: (userId: string) => void;
  // Admin functions
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<User>;
  deleteUser: (userId: string) => Promise<boolean>;
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<Task>;
  assignCaseToStaff: (caseId: string, staffId: string) => Promise<boolean>;
  createClientProfile: (profileData: Omit<ClientProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ClientProfile>;
  updateClientProfile: (profileId: string, profileData: Partial<ClientProfile>) => Promise<ClientProfile>;
  createStaffProfile: (profileData: Omit<StaffProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<StaffProfile>;
  updateStaffProfile: (profileId: string, profileData: Partial<StaffProfile>) => Promise<StaffProfile>;
  addAuditLog: (logData: Omit<AuditLog, 'id' | 'timestamp'>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data (replace with actual API calls in a real app)
const MOCK_USERS: User[] = [
  { 
    id: "admin1", 
    email: "admin@example.com", 
    role: "admin", 
    name: "System Administrator",
    contactNumber: "+27 11 123 4567",
    department: "IT Administration",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: "client1", 
    email: "client@example.com", 
    role: "client", 
    name: "Test Client",
    contactNumber: "+27 11 234 5678",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: "staff1", 
    email: "staff@example.com", 
    role: "staff", 
    name: "Test Staff",
    contactNumber: "+27 11 345 6789",
    department: "Compliance",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: "dev-client", 
    email: "dev-client@test.com", 
    role: "client", 
    name: "Development Client",
    contactNumber: "+27 11 456 7890",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: "dev-staff", 
    email: "dev-staff@test.com", 
    role: "staff", 
    name: "Development Staff",
    contactNumber: "+27 11 567 8901",
    department: "Onboarding",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
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
        assignedStaffId: "staff1",
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
        assignedStaffId: "dev-staff",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

const MOCK_TASKS: Task[] = [
  {
    id: "task1",
    title: "Review Client Documentation",
    description: "Review and verify all submitted documents for case1",
    assignedToId: "staff1",
    assignedById: "admin1",
    clientId: "client1",
    caseId: "case1",
    priority: "high",
    status: "pending",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task2",
    title: "Conduct Risk Assessment",
    description: "Perform comprehensive risk assessment for company client",
    assignedToId: "dev-staff",
    assignedById: "admin1",
    clientId: "dev-client",
    caseId: "case2",
    priority: "medium",
    status: "in-progress",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const MOCK_CLIENT_PROFILES: ClientProfile[] = [
  {
    id: "profile1",
    userId: "client1",
    businessType: "Individual",
    industry: "Professional Services",
    riskProfile: "low",
    assignedStaffId: "staff1",
    onboardingStatus: "in-progress",
    notes: "Standard individual client onboarding",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "profile2",
    userId: "dev-client",
    businessType: "Company",
    industry: "Technology",
    annualRevenue: "R1M - R5M",
    numberOfEmployees: "10-50",
    riskProfile: "medium",
    assignedStaffId: "dev-staff",
    onboardingStatus: "in-progress",
    notes: "Technology company requiring enhanced due diligence",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const MOCK_STAFF_PROFILES: StaffProfile[] = [
  {
    id: "staffprofile1",
    userId: "staff1",
    department: "Compliance",
    position: "Compliance Officer",
    accessLevel: "advanced",
    maxCaseLoad: 20,
    currentCaseLoad: 5,
    skills: ["FICA Compliance", "Risk Assessment", "Document Review"],
    availability: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "staffprofile2",
    userId: "dev-staff",
    department: "Onboarding",
    position: "Onboarding Specialist",
    accessLevel: "basic",
    maxCaseLoad: 15,
    currentCaseLoad: 3,
    skills: ["Client Onboarding", "Documentation", "Customer Service"],
    availability: "available",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // For development: automatically log in as admin user
  const [user, setUser] = useState<User | null>(MOCK_USERS[0]); // Default to admin
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Mock data state
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [cases, setCases] = useState<ClientCase[]>(MOCK_CASES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [clientProfiles, setClientProfiles] = useState<ClientProfile[]>(MOCK_CLIENT_PROFILES);
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>(MOCK_STAFF_PROFILES);
  const [activeCase, setActiveCase] = useState<ClientCase | null>(null);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const addAuditLog = useCallback((logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    const foundUser = users.find((u) => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("ficaUser", JSON.stringify(foundUser));
      addAuditLog({
        userId: foundUser.id,
        action: "User Login",
        entityType: "user",
        entityId: foundUser.id,
        details: `User ${foundUser.name} logged in`,
      });
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
      return false;
    }
    const newUser: User = { 
      id: `user-${Date.now()}`, 
      email, 
      role, 
      name,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.id
    };
    setUsers(prevUsers => [...prevUsers, newUser]); 
    setUser(newUser);
    localStorage.setItem("ficaUser", JSON.stringify(newUser));
    addAuditLog({
      userId: user?.id || 'system',
      action: "User Registration",
      entityType: "user",
      entityId: newUser.id,
      details: `New user ${newUser.name} registered with role ${newUser.role}`,
    });
    setIsLoading(false);
    router.push("/dashboard");
    return true;
  };

  const logout = () => {
    if (user) {
      addAuditLog({
        userId: user.id,
        action: "User Logout",
        entityType: "user",
        entityId: user.id,
        details: `User ${user.name} logged out`,
      });
    }
    setUser(MOCK_USERS[0]);
    setActiveCase(null);
    router.push("/dashboard");
  };

  const switchUser = useCallback((userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      setActiveCase(null);
      localStorage.setItem("ficaUser", JSON.stringify(foundUser));
    }
  }, [users]);

  // Admin functions
  const createUser = useCallback(async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user?.id,
      isActive: true,
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog({
      userId: user?.id || 'system',
      action: "Create User",
      entityType: "user",
      entityId: newUser.id,
      details: `Created new user: ${newUser.name} (${newUser.role})`,
    });
    return newUser;
  }, [user, addAuditLog]);

  const updateUser = useCallback(async (userId: string, userData: Partial<User>): Promise<User> => {
    const updatedUser = { ...userData, updatedAt: new Date().toISOString() };
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updatedUser } : u));
    const user_updated = users.find(u => u.id === userId);
    addAuditLog({
      userId: user?.id || 'system',
      action: "Update User",
      entityType: "user",
      entityId: userId,
      details: `Updated user: ${user_updated?.name}`,
    });
    return user_updated as User;
  }, [user, users, addAuditLog]);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    const userToDelete = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog({
      userId: user?.id || 'system',
      action: "Delete User",
      entityType: "user",
      entityId: userId,
      details: `Deleted user: ${userToDelete?.name}`,
    });
    return true;
  }, [user, users, addAuditLog]);

  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [...prev, newTask]);
    addAuditLog({
      userId: user?.id || 'system',
      action: "Create Task",
      entityType: "task",
      entityId: newTask.id,
      details: `Created task: ${newTask.title} assigned to ${users.find(u => u.id === newTask.assignedToId)?.name}`,
    });
    return newTask;
  }, [user, users, addAuditLog]);

  const updateTask = useCallback(async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
    const updatedTask = { ...taskData, updatedAt: new Date().toISOString() };
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedTask } : t));
    const task = tasks.find(t => t.id === taskId);
    addAuditLog({
      userId: user?.id || 'system',
      action: "Update Task",
      entityType: "task",
      entityId: taskId,
      details: `Updated task: ${task?.title}`,
    });
    return task as Task;
  }, [user, tasks, addAuditLog]);

  const assignCaseToStaff = useCallback(async (caseId: string, staffId: string): Promise<boolean> => {
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, assignedStaffId: staffId, updatedAt: new Date().toISOString() } : c));
    const caseData = cases.find(c => c.id === caseId);
    const staffMember = users.find(u => u.id === staffId);
    addAuditLog({
      userId: user?.id || 'system',
      action: "Assign Case",
      entityType: "case",
      entityId: caseId,
      details: `Assigned case ${caseData?.clientName} to ${staffMember?.name}`,
    });
    return true;
  }, [user, cases, users, addAuditLog]);

  const createClientProfile = useCallback(async (profileData: Omit<ClientProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientProfile> => {
    const newProfile: ClientProfile = {
      ...profileData,
      id: `profile-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setClientProfiles(prev => [...prev, newProfile]);
    addAuditLog({
      userId: user?.id || 'system',
      action: "Create Client Profile",
      entityType: "client",
      entityId: newProfile.id,
      details: `Created client profile for user ${users.find(u => u.id === newProfile.userId)?.name}`,
    });
    return newProfile;
  }, [user, users, addAuditLog]);

  const updateClientProfile = useCallback(async (profileId: string, profileData: Partial<ClientProfile>): Promise<ClientProfile> => {
    const updatedProfile = { ...profileData, updatedAt: new Date().toISOString() };
    setClientProfiles(prev => prev.map(p => p.id === profileId ? { ...p, ...updatedProfile } : p));
    const profile = clientProfiles.find(p => p.id === profileId);
    addAuditLog({
      userId: user?.id || 'system',
      action: "Update Client Profile",
      entityType: "client",
      entityId: profileId,
      details: `Updated client profile for ${users.find(u => u.id === profile?.userId)?.name}`,
    });
    return profile as ClientProfile;
  }, [user, clientProfiles, users, addAuditLog]);

  const createStaffProfile = useCallback(async (profileData: Omit<StaffProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<StaffProfile> => {
    const newProfile: StaffProfile = {
      ...profileData,
      id: `staffprofile-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStaffProfiles(prev => [...prev, newProfile]);
    addAuditLog({
      userId: user?.id || 'system',
      action: "Create Staff Profile",
      entityType: "user",
      entityId: newProfile.id,
      details: `Created staff profile for ${users.find(u => u.id === newProfile.userId)?.name}`,
    });
    return newProfile;
  }, [user, users, addAuditLog]);

  const updateStaffProfile = useCallback(async (profileId: string, profileData: Partial<StaffProfile>): Promise<StaffProfile> => {
    const updatedProfile = { ...profileData, updatedAt: new Date().toISOString() };
    setStaffProfiles(prev => prev.map(p => p.id === profileId ? { ...p, ...updatedProfile } : p));
    const profile = staffProfiles.find(p => p.id === profileId);
    addAuditLog({
      userId: user?.id || 'system',
      action: "Update Staff Profile",
      entityType: "user",
      entityId: profileId,
      details: `Updated staff profile for ${users.find(u => u.id === profile?.userId)?.name}`,
    });
    return profile as StaffProfile;
  }, [user, staffProfiles, users, addAuditLog]);

  const addCase = useCallback((newCase: ClientCase) => {
    setCases(prev => [...prev, newCase]);
    addAuditLog({
      userId: user?.id || 'system',
      action: "Create Case",
      entityType: "case",
      entityId: newCase.id,
      details: `Created new case for ${newCase.clientName}`,
    });
  }, [user, addAuditLog]);

  const updateCase = useCallback((updatedCase: ClientCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    if (activeCase?.id === updatedCase.id) {
      setActiveCase(updatedCase);
    }
    addAuditLog({
      userId: user?.id || 'system',
      action: "Update Case",
      entityType: "case",
      entityId: updatedCase.id,
      details: `Updated case for ${updatedCase.clientName} - Status: ${updatedCase.status}`,
    });
  }, [activeCase, user, addAuditLog]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        isLoading,
        login,
        logout,
        register,
        users,
        cases, 
        tasks,
        auditLogs,
        clientProfiles,
        staffProfiles,
        setCases,
        addCase,
        updateCase,
        activeCase,
        setActiveCase,
        switchUser,
        createUser,
        updateUser,
        deleteUser,
        createTask,
        updateTask,
        assignCaseToStaff,
        createClientProfile,
        updateClientProfile,
        createStaffProfile,
        updateStaffProfile,
        addAuditLog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};