import * as React from "react";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Shield, 
  CheckCircle2,
  UserPlus,
  Settings,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole, Permission } from '../types';
import { getApiUrl, getCommonHeaders, getAuthToken, getTenantId, API_CONFIG } from '../config/api';

// Interfaces for API data structures
interface Tenant {
  tenant_id: string;
  tenant_code: string;
  company_name: string;
  subscription_plan: 'trial' | 'basic' | 'premium' | 'enterprise';
  contact_person: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

interface TenantForm {
  tenant_code: string;
  company_name: string;
  subscription_plan: 'trial' | 'basic' | 'premium' | 'enterprise';
  contact_person: string;
  email: string;
}

export function TenantManagement() {
  const { user: currentUser, logActivity, hasPermission } = useAuth();
  
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [tenantForm, setTenantForm] = useState<TenantForm>({
    tenant_code: '',
    company_name: '',
    subscription_plan: 'trial',
    contact_person: '',
    email: ''
  });

  // API Functions
  const fetchTenants = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.TENANTS),
        {
          method: 'GET',
          headers: getCommonHeaders(token)
        }
      );

      const data = await response.json();
      console.log('Tenants API response:', data); // Debug log
      if (response.ok && data.success) {
        const tenantsData = data.data;
        console.log('Tenants data:', tenantsData); // Debug log
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
      } else {
        console.error('Failed to fetch tenants:', data.message);
        setTenants([]);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchTenants();
    }
  }, [currentUser]);

  const resetTenantForm = () => {
    setTenantForm({
      tenant_code: '',
      company_name: '',
      subscription_plan: 'trial',
      contact_person: '',
      email: ''
    });
  };

  const handleAddTenant = async () => {
    if (!tenantForm.tenant_code || !tenantForm.company_name || !tenantForm.contact_person || !tenantForm.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.TENANTS),
        {
          method: 'POST',
          headers: getCommonHeaders(token),
          body: JSON.stringify(tenantForm)
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        await fetchTenants(); // Refresh the list
        logActivity('tenant_created', 'tenants', { 
          tenant_code: tenantForm.tenant_code, 
          company_name: tenantForm.company_name,
          email: tenantForm.email
        });
        resetTenantForm();
        setShowAddTenant(false);
      } else {
        alert(data.message || 'Failed to create tenant');
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      alert('Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (!tenant.tenant_id) {
      console.error('Cannot delete tenant without ID:', tenant);
      alert('Error: Tenant ID is missing. Cannot delete this tenant.');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${tenant.company_name}?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(
        getApiUrl(`${API_CONFIG.ENDPOINTS.TENANTS}/${tenant.tenant_id}`),
        {
          method: 'DELETE',
          headers: getCommonHeaders(token)
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        await fetchTenants(); // Refresh the list
        logActivity('tenant_deleted', 'tenants', { 
          company_name: tenant.company_name, 
          tenant_code: tenant.tenant_code,
          tenant_id: tenant.tenant_id 
        });
      } else {
        alert(data.message || 'Failed to delete tenant');
      }
    } catch (error) {
      console.error('Error deleting tenant:', error);
      alert('Failed to delete tenant');
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = (tenants || []).filter(tenant =>
    tenant.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.tenant_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (tenant: Tenant) => {
    return tenant.is_active ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );
  };

  const getSubscriptionPlanBadge = (plan: string) => {
    const planColors: Record<string, string> = {
      trial: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      premium: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      enterprise: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
    };

    return (
      <Badge className={planColors[plan] || planColors.trial}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </Badge>
    );
  };

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3>Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to view tenant management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Tenant Management</h1>
          <p className="text-muted-foreground">Manage tenant organizations and their subscription plans</p>
        </div>
        <Dialog open={showAddTenant} onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
          setShowAddTenant(open);
          if (!open) {
            resetTenantForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button disabled={!hasPermission('users.create') || loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Add Tenant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Add New Tenant
              </DialogTitle>
              <DialogDescription>
                Create a new tenant organization with subscription plan and contact details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenantCode">Tenant Code *</Label>
                  <Input
                    id="tenantCode"
                    value={tenantForm.tenant_code}
                    onChange={(e) => setTenantForm(prev => ({ ...prev, tenant_code: e.target.value }))}
                    placeholder="COMP001"
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="subscriptionPlan">Subscription Plan *</Label>
                  <Select value={tenantForm.subscription_plan} onValueChange={(value: 'trial' | 'basic' | 'premium' | 'enterprise') => setTenantForm(prev => ({ ...prev, subscription_plan: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={tenantForm.company_name}
                  onChange={(e) => setTenantForm(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Enter company name"
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={tenantForm.contact_person}
                  onChange={(e) => setTenantForm(prev => ({ ...prev, contact_person: e.target.value }))}
                  placeholder="Enter contact person name"
                  maxLength={150}
                />
              </div>

              <div>
                <Label htmlFor="tenantEmail">Email *</Label>
                <Input
                  id="tenantEmail"
                  type="email"
                  value={tenantForm.email}
                  onChange={(e) => setTenantForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@company.com"
                  maxLength={150}
                />
              </div>

              <Button 
                onClick={handleAddTenant} 
                className="w-full"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Tenant
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">{filteredTenants.length} Tenants</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTenants()}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </div>

      {/* Tenant Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tenants</p>
                <p className="text-2xl">{(tenants || []).length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tenants</p>
                <p className="text-2xl">{(tenants || []).filter(t => t.is_active).length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trial Plans</p>
                <p className="text-2xl">{(tenants || []).filter(t => t.subscription_plan === 'trial').length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Premium+ Plans</p>
                <p className="text-2xl">{(tenants || []).filter(t => ['premium', 'enterprise'].includes(t.subscription_plan)).length}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tenants</CardTitle>
          <CardDescription>Manage tenant organizations and their subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && tenants.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading tenants...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Tenant Code</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.tenant_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{tenant.company_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{tenant.company_name}</div>
                          <div className="text-xs text-muted-foreground">{tenant.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tenant.tenant_code}
                      </Badge>
                    </TableCell>
                    <TableCell>{getSubscriptionPlanBadge(tenant.subscription_plan)}</TableCell>
                    <TableCell className="text-sm">{tenant.contact_person}</TableCell>
                    <TableCell>{getStatusBadge(tenant)}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTenant(tenant)}
                          className="text-destructive hover:text-destructive hover:bg-red-50"
                          disabled={!hasPermission('users.delete') || loading}
                          title="Delete Tenant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTenants.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No tenants found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}