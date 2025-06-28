"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, UserPlus, Shield, Users } from "lucide-react";
import type { User, ClientProfile } from "@/types";

export default function ClientManagementPage() {
  const { user, users, clientProfiles, createClientProfile, updateClientProfile, assignCaseToStaff, cases } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ClientProfile | null>(null);
  const [formData, setFormData] = useState({
    userId: "",
    businessType: "",
    industry: "",
    annualRevenue: "",
    numberOfEmployees: "",
    riskProfile: "low" as "low" | "medium" | "high",
    notes: "",
    assignedStaffId: "",
    onboardingStatus: "not-started" as "not-started" | "in-progress" | "completed" | "on-hold",
  });

  // Only allow admin users to access this page
  if (user?.role !== "admin") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const clientUsers = users.filter(u => u.role === "client");
  const staffUsers = users.filter(u => u.role === "staff");

  const handleCreateProfile = async () => {
    try {
      await createClientProfile(formData);
      toast({
        title: "Client Profile Created",
        description: "Successfully created client profile",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client profile",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!selectedProfile) return;
    
    try {
      await updateClientProfile(selectedProfile.id, formData);
      
      // If staff assignment changed, also update the case assignment
      if (formData.assignedStaffId && formData.assignedStaffId !== selectedProfile.assignedStaffId) {
        const clientCase = cases.find(c => c.clientId === selectedProfile.userId);
        if (clientCase) {
          await assignCaseToStaff(clientCase.id, formData.assignedStaffId);
        }
      }
      
      toast({
        title: "Client Profile Updated",
        description: "Successfully updated client profile",
      });
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update client profile",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      userId: "",
      businessType: "",
      industry: "",
      annualRevenue: "",
      numberOfEmployees: "",
      riskProfile: "low",
      notes: "",
      assignedStaffId: "",
      onboardingStatus: "not-started",
    });
    setSelectedProfile(null);
  };

  const openEditDialog = (profile: ClientProfile) => {
    setSelectedProfile(profile);
    setFormData({
      userId: profile.userId,
      businessType: profile.businessType || "",
      industry: profile.industry || "",
      annualRevenue: profile.annualRevenue || "",
      numberOfEmployees: profile.numberOfEmployees || "",
      riskProfile: profile.riskProfile || "low",
      notes: profile.notes || "",
      assignedStaffId: profile.assignedStaffId || "",
      onboardingStatus: profile.onboardingStatus,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in-progress": return "secondary";
      case "on-hold": return "destructive";
      default: return "outline";
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Client Management</h1>
          <p className="text-muted-foreground">Manage client profiles and onboarding status</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Client Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Client Profile</DialogTitle>
              <DialogDescription>
                Create a detailed profile for a client to track their onboarding and business information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">Client</Label>
                <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientUsers.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="businessType" className="text-right">Business Type</Label>
                <Input
                  id="businessType"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Individual, Company, Trust"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="industry" className="text-right">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="col-span-3"
                  placeholder="e.g., Technology, Finance, Healthcare"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="revenue" className="text-right">Annual Revenue</Label>
                <Select value={formData.annualRevenue} onValueChange={(value) => setFormData({ ...formData, annualRevenue: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under R1M">Under R1M</SelectItem>
                    <SelectItem value="R1M - R5M">R1M - R5M</SelectItem>
                    <SelectItem value="R5M - R10M">R5M - R10M</SelectItem>
                    <SelectItem value="R10M - R50M">R10M - R50M</SelectItem>
                    <SelectItem value="Over R50M">Over R50M</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="employees" className="text-right">Employees</Label>
                <Select value={formData.numberOfEmployees} onValueChange={(value) => setFormData({ ...formData, numberOfEmployees: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select employee count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (Individual)</SelectItem>
                    <SelectItem value="2-10">2-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="200+">200+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="risk" className="text-right">Risk Profile</Label>
                <Select value={formData.riskProfile} onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, riskProfile: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="staff" className="text-right">Assigned Staff</Label>
                <Select value={formData.assignedStaffId} onValueChange={(value) => setFormData({ ...formData, assignedStaffId: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffUsers.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name} ({staff.department})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={formData.onboardingStatus} onValueChange={(value: any) => setFormData({ ...formData, onboardingStatus: value })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="col-span-3"
                  placeholder="Additional notes about the client..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProfile}>Create Profile</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client Profiles
          </CardTitle>
          <CardDescription>
            Manage detailed client information and track onboarding progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Business Type</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Risk Profile</TableHead>
                <TableHead>Assigned Staff</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientProfiles.map((profile) => {
                const client = users.find(u => u.id === profile.userId);
                const assignedStaff = users.find(u => u.id === profile.assignedStaffId);
                
                return (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{client?.name || "Unknown"}</TableCell>
                    <TableCell>{profile.businessType || "-"}</TableCell>
                    <TableCell>{profile.industry || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(profile.riskProfile || "low")}>
                        {profile.riskProfile || "Low"} Risk
                      </Badge>
                    </TableCell>
                    <TableCell>{assignedStaff?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(profile.onboardingStatus)}>
                        {profile.onboardingStatus.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(profile)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Client Profile</DialogTitle>
            <DialogDescription>
              Update client information and onboarding status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-businessType" className="text-right">Business Type</Label>
              <Input
                id="edit-businessType"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-industry" className="text-right">Industry</Label>
              <Input
                id="edit-industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-revenue" className="text-right">Annual Revenue</Label>
              <Select value={formData.annualRevenue} onValueChange={(value) => setFormData({ ...formData, annualRevenue: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Under R1M">Under R1M</SelectItem>
                  <SelectItem value="R1M - R5M">R1M - R5M</SelectItem>
                  <SelectItem value="R5M - R10M">R5M - R10M</SelectItem>
                  <SelectItem value="R10M - R50M">R10M - R50M</SelectItem>
                  <SelectItem value="Over R50M">Over R50M</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-employees" className="text-right">Employees</Label>
              <Select value={formData.numberOfEmployees} onValueChange={(value) => setFormData({ ...formData, numberOfEmployees: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 (Individual)</SelectItem>
                  <SelectItem value="2-10">2-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="200+">200+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-risk" className="text-right">Risk Profile</Label>
              <Select value={formData.riskProfile} onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, riskProfile: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-staff" className="text-right">Assigned Staff</Label>
              <Select value={formData.assignedStaffId} onValueChange={(value) => setFormData({ ...formData, assignedStaffId: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {staffUsers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} ({staff.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">Status</Label>
              <Select value={formData.onboardingStatus} onValueChange={(value: any) => setFormData({ ...formData, onboardingStatus: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile}>Update Profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}