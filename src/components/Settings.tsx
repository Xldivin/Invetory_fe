import * as React from "react";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database,
  Globe,
  Palette,
  Download,
  Upload,
  RotateCcw,
  Save,
  Mail,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Settings() {
  const { user, logActivity } = useAuth();
  
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'Inventory Pro',
    companyEmail: 'admin@inventorypro.com',
    companyPhone: '+1-555-0123',
    timezone: 'America/New_York',
    currency: 'USD',
    language: 'en',
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    lowStockAlerts: true,
    orderNotifications: true,
    systemMaintenanceAlerts: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordRequirements: 'medium',
    loginAttempts: 5,
    
    // System Settings
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    maintenanceMode: false,
    debugMode: false,
    
    // Display Settings
    theme: 'system',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    itemsPerPage: 25,
    
    // Business Settings
    defaultTaxRate: 8.25,
    lowStockThreshold: 10,
    autoRequestEnabled: true,
    inventoryMethod: 'fifo'
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // In real app, this would save to database
    localStorage.setItem('appSettings', JSON.stringify(settings));
    logActivity('settings_updated', 'settings', { updatedBy: user?.name });
    toast.success('Settings saved successfully');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSettings({
        companyName: 'Inventory Pro',
        companyEmail: 'admin@inventorypro.com',
        companyPhone: '+1-555-0123',
        timezone: 'America/New_York',
        currency: 'USD',
        language: 'en',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        lowStockAlerts: true,
        orderNotifications: true,
        systemMaintenanceAlerts: true,
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordRequirements: 'medium',
        loginAttempts: 5,
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetention: 365,
        maintenanceMode: false,
        debugMode: false,
        theme: 'system',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        itemsPerPage: 25,
        defaultTaxRate: 8.25,
        lowStockThreshold: 10,
        autoRequestEnabled: true,
        inventoryMethod: 'fifo'
      });
      logActivity('settings_reset', 'settings', { resetBy: user?.name });
      toast.success('Settings reset to defaults');
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    logActivity('settings_exported', 'settings');
    toast.success('Settings exported successfully');
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          logActivity('settings_imported', 'settings', { importedBy: user?.name });
          toast.success('Settings imported successfully');
        } catch (error) {
          toast.error('Invalid settings file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>System Settings</h1>
          <p className="text-muted-foreground">Configure your inventory management system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Basic company details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => handleSettingChange('companyEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={settings.companyPhone}
                    onChange={(e) => handleSettingChange('companyPhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value: any) => handleSettingChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value: any) => handleSettingChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={(value: any) => handleSettingChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import/Export Settings</CardTitle>
              <CardDescription>Backup and restore your system configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button onClick={handleExportSettings} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Settings
                </Button>
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="hidden"
                    id="import-settings"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="import-settings" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Import Settings
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how you receive system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked: any) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked: any) => handleSettingChange('smsNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked: any) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when items are running low</p>
                  </div>
                  <Switch
                    id="lowStockAlerts"
                    checked={settings.lowStockAlerts}
                    onCheckedChange={(checked: any) => handleSettingChange('lowStockAlerts', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="orderNotifications">Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about new orders and status changes</p>
                  </div>
                  <Switch
                    id="orderNotifications"
                    checked={settings.orderNotifications}
                    onCheckedChange={(checked: any) => handleSettingChange('orderNotifications', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="systemMaintenanceAlerts">System Maintenance Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified about system maintenance</p>
                  </div>
                  <Switch
                    id="systemMaintenanceAlerts"
                    checked={settings.systemMaintenanceAlerts}
                    onCheckedChange={(checked: any) => handleSettingChange('systemMaintenanceAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to accounts</p>
                  </div>
                  <Switch
                    id="twoFactorAuth"
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked: any) => handleSettingChange('twoFactorAuth', checked)}
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                    <Input
                      id="loginAttempts"
                      type="number"
                      value={settings.loginAttempts}
                      onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="passwordRequirements">Password Requirements</Label>
                  <Select value={settings.passwordRequirements} onValueChange={(value: any) => handleSettingChange('passwordRequirements', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minimum 6 characters</SelectItem>
                      <SelectItem value="medium">Medium - 8+ chars with numbers</SelectItem>
                      <SelectItem value="high">High - 12+ chars with symbols</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Configure system-level settings and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup">Automatic Backups</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup system data</p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={settings.autoBackup}
                    onCheckedChange={(checked: any) => handleSettingChange('autoBackup', checked)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select value={settings.backupFrequency} onValueChange={(value: any) => handleSettingChange('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dataRetention">Data Retention (days)</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={settings.dataRetention}
                      onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable maintenance mode to restrict access</p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked: any) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="debugMode">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable debug logging for troubleshooting</p>
                  </div>
                  <Switch
                    id="debugMode"
                    checked={settings.debugMode}
                    onCheckedChange={(checked: any) => handleSettingChange('debugMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Display Preferences
              </CardTitle>
              <CardDescription>Customize the appearance and layout of the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value: any) => handleSettingChange('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="itemsPerPage">Items Per Page</Label>
                  <Select value={settings.itemsPerPage.toString()} onValueChange={(value: string) => handleSettingChange('itemsPerPage', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(value: any) => handleSettingChange('dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select value={settings.timeFormat} onValueChange={(value: any) => handleSettingChange('timeFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Rules</CardTitle>
              <CardDescription>Configure business logic and operational settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                  <Input
                    id="defaultTaxRate"
                    type="number"
                    step="0.01"
                    value={settings.defaultTaxRate}
                    onChange={(e) => handleSettingChange('defaultTaxRate', parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => handleSettingChange('lowStockThreshold', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="inventoryMethod">Inventory Method</Label>
                  <Select value={settings.inventoryMethod} onValueChange={(value: any) => handleSettingChange('inventoryMethod', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
                      <SelectItem value="lifo">LIFO (Last In, First Out)</SelectItem>
                      <SelectItem value="average">Weighted Average</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoRequestEnabled">Auto Stock Requests</Label>
                  <p className="text-sm text-muted-foreground">Automatically create stock requests when inventory is low</p>
                </div>
                <Switch
                  id="autoRequestEnabled"
                  checked={settings.autoRequestEnabled}
                  onCheckedChange={(checked: any) => handleSettingChange('autoRequestEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}