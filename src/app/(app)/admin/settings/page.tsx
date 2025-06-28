"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Shield, Settings, Save, Database, Mail, Section as Security } from "lucide-react";

export default function SystemSettingsPage() {
  const { user, addAuditLog } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    systemName: "FICA Flow",
    systemDescription: "Client FICA Onboarding Management System",
    maxFileSize: "5",
    allowedFileTypes: "pdf,jpg,jpeg,png",
    emailNotifications: true,
    auditLogging: true,
    autoBackup: true,
    sessionTimeout: "30",
    passwordMinLength: "8",
    requireTwoFactor: false,
    maintenanceMode: false,
    debugMode: false,
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

  const handleSaveSettings = () => {
    // In a real application, this would save to a backend
    addAuditLog({
      userId: user?.id || 'system',
      action: "Update System Settings",
      entityType: "system",
      entityId: "settings",
      details: "System settings updated by administrator",
    });

    toast({
      title: "Settings Saved",
      description: "System settings have been updated successfully.",
    });
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">System Settings</h1>
          <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
        </div>
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic system configuration and display settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) => handleInputChange("systemName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange("sessionTimeout", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="systemDescription">System Description</Label>
              <Textarea
                id="systemDescription"
                value={settings.systemDescription}
                onChange={(e) => handleInputChange("systemDescription", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              File Upload Settings
            </CardTitle>
            <CardDescription>
              Configure file upload restrictions and allowed file types.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleInputChange("maxFileSize", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) => handleInputChange("allowedFileTypes", e.target.value)}
                  placeholder="pdf,jpg,jpeg,png"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Security className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security policies and authentication requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleInputChange("passwordMinLength", e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requireTwoFactor"
                  checked={settings.requireTwoFactor}
                  onCheckedChange={(checked) => handleInputChange("requireTwoFactor", checked)}
                />
                <Label htmlFor="requireTwoFactor">Require Two-Factor Authentication</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              System Features
            </CardTitle>
            <CardDescription>
              Enable or disable various system features and notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                />
                <Label htmlFor="emailNotifications">Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auditLogging"
                  checked={settings.auditLogging}
                  onCheckedChange={(checked) => handleInputChange("auditLogging", checked)}
                />
                <Label htmlFor="auditLogging">Audit Logging</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => handleInputChange("autoBackup", checked)}
                />
                <Label htmlFor="autoBackup">Automatic Backup</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developer Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Developer Settings</CardTitle>
            <CardDescription>
              Advanced settings for development and debugging.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="debugMode"
                checked={settings.debugMode}
                onCheckedChange={(checked) => handleInputChange("debugMode", checked)}
              />
              <Label htmlFor="debugMode">Debug Mode</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}