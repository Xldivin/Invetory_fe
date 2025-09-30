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
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Shield, 
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  Settings,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '../types';
import { getApiUrl, getCommonHeaders, getAuthToken, getTenantId, API_CONFIG } from '../config/api';

// Interfaces for API data structures
interface PermissionCatalogItem {
  id: string;
  name: string;
  description: string;
  module: string;
}

// Interface for the actual API response structure
interface PermissionCatalogResponse {
  [module: string]: string[];
}

// API data interfaces
interface ApiUser {
  id?: string;
  user_id?: string;
  full_name: string;
  email: string;
  role: UserRole;
  pin?: string;
  created_at: string;
  last_login_at?: string;
  is_active: boolean;
  tenant_id?: string;
}

interface UsersApiResponse {
  success: boolean;
  data: ApiUser[];
  message?: string;
}

export function UserManagement() {
  const { user: currentUser, logActivity, hasPermission } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active_today' | 'active_week' | 'inactive' | 'never'>('all');
  
  // Permissions management state
  const [permissionsCatalog, setPermissionsCatalog] = useState<PermissionCatalogItem[]>([]);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Tenants state
  const [tenants, setTenants] = useState<Array<{id: string, name: string}>>([]);
  
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'shop_manager' as UserRole,
    pin: '',
    generatePin: true,
    tenant_id: 'none'
  });

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'shop_manager',
      pin: '',
      generatePin: true,
      tenant_id: 'none'
    });
  };

  const generateRandomPin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleAddUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password || !userForm.password_confirmation) {
      alert('Please fill in all required fields (Name, Email, Password, Password Confirmation)');
      return;
    }

    if (userForm.password !== userForm.password_confirmation) {
      alert('Passwords do not match. Please check your password confirmation.');
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      const tenantId = getTenantId();
      
      const userData = {
        full_name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        password_confirmation: userForm.password_confirmation,
        role: userForm.role,
        tenant_id: userForm.tenant_id === 'none' ? undefined : userForm.tenant_id
      };

      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.USERS),
        {
          method: 'POST',
          headers: getCommonHeaders(token, tenantId),
          body: JSON.stringify(userData)
        }
      );

      const data = await response.json();
      console.log('Create user API response:', data);
      
      if (response.ok && data.success) {
        // Refresh users list
        await fetchUsers();
        logActivity('user_created', 'users', { name: userForm.name, role: userForm.role });
    resetUserForm();
    setShowAddUser(false);
        alert('User created successfully!');
      } else {
        console.error('Failed to create user:', data.message);
        alert(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteUser = async (user: User) => {
    console.log('Delete user - user object:', user);
    console.log('Delete user - user.id:', user.id, 'Type:', typeof user.id);
    
    if (user.id === currentUser?.id) {
      alert("You cannot delete your own account");
      return;
    }
    
    if (!user.id || user.id === 'undefined' || user.id === '') {
      alert("Error: User ID is missing. Cannot delete this user.");
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      const tenantId = getTenantId();
      
      console.log('Making delete request to:', getApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${user.id}?all=true`));
      
      const response = await fetch(
        getApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${user.id}?all=true`),
        {
          method: 'DELETE',
          headers: getCommonHeaders(token, tenantId)
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        // Refresh users list
        await fetchUsers();
      logActivity('user_deleted', 'users', { name: user.name, role: user.role });
        alert(`User ${user.name} has been deleted successfully.`);
      } else {
        console.error('Failed to delete user:', data.message);
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // API Functions
  const fetchTenants = async () => {
    try {
      const token = getAuthToken();
      
      console.log('Fetching tenants from:', getApiUrl(API_CONFIG.ENDPOINTS.TENANTS));
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.TENANTS),
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      console.log('Tenants API response:', data);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok && data.success) {
        console.log('Raw tenants data:', data.data);
        // Transform API response to match expected format
        const transformedTenants = data.data.map((tenant: any) => ({
          id: tenant.tenant_id.toString(),
          name: tenant.company_name
        }));
        console.log('Transformed tenants:', transformedTenants);
        setTenants(transformedTenants);
      } else {
        console.error('Failed to fetch tenants:', data.message);
        setTenants([]);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const tenantId = getTenantId();
      
      // Use all=true for super admin to get users from all tenants
      const endpoint = currentUser?.role === 'super_admin' 
        ? `${API_CONFIG.ENDPOINTS.USERS}?all=true`
        : API_CONFIG.ENDPOINTS.USERS;
      
      const response = await fetch(
        getApiUrl(endpoint),
        {
          method: 'GET',
          headers: getCommonHeaders(token, tenantId)
        }
      );

      const data: UsersApiResponse = await response.json();
      console.log('Users API response:', data);
      
      if (response.ok && data.success) {
        // Transform API users to our User interface
        const transformedUsers: User[] = data.data.map((apiUser: ApiUser) => ({
          id: apiUser.user_id || apiUser.id || '', // Use user_id first, then id as fallback
          name: apiUser.full_name,
          email: apiUser.email,
          role: apiUser.role,
          pin: apiUser.pin || '',
          createdAt: new Date(apiUser.created_at),
          lastLogin: apiUser.last_login_at ? new Date(apiUser.last_login_at) : undefined
        }));
        
        console.log('Transformed users:', transformedUsers);
        console.log('First user ID check:', transformedUsers[0]?.id, 'Type:', typeof transformedUsers[0]?.id);
        setUsers(transformedUsers);
      } else {
        console.error('Failed to fetch users:', data.message);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // API Functions for permissions management
  const fetchPermissionsCatalog = async () => {
    try {
      const token = getAuthToken();
      console.log('Fetching permissions catalog...');
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.PERMISSIONS_CATALOG),
        {
          method: 'GET',
          headers: getCommonHeaders(token)
        }
      );

      const data = await response.json();
      console.log('Permissions catalog API response:', data);
      if (response.ok && data.success) {
        const permissions = data.data as PermissionCatalogResponse;
        console.log('Permissions data:', permissions);
        
        // Transform the API response into our expected format
        const transformedPermissions: PermissionCatalogItem[] = [];
        
        Object.entries(permissions).forEach(([module, permissionNames]) => {
          permissionNames.forEach((permissionName) => {
            transformedPermissions.push({
              id: `${module}.${permissionName}`,
              name: permissionName, // Keep the full permission name like "users.view"
              description: `${permissionName.split('.').slice(1).join(' ').replace(/_/g, ' ')} for ${module}`,
              module: module
            });
          });
        });
        
        console.log('Transformed permissions:', transformedPermissions);
        console.log('Setting permissions catalog with', transformedPermissions.length, 'items');
        setPermissionsCatalog(transformedPermissions);
      } else {
        console.error('Failed to fetch permissions catalog:', data.message);
        console.log('Using fallback permissions catalog...');
        createFallbackPermissionsCatalog();
      }
    } catch (error) {
      console.error('Error fetching permissions catalog:', error);
      console.log('Using fallback permissions catalog...');
      createFallbackPermissionsCatalog();
    }
  };

  const createFallbackPermissionsCatalog = () => {
    // Create a fallback permissions catalog based on common permissions
    const fallbackPermissions: PermissionCatalogItem[] = [
      // Users module
      { id: 'users.view', name: 'users.view', description: 'View users', module: 'users' },
      { id: 'users.create', name: 'users.create', description: 'Create users', module: 'users' },
      { id: 'users.edit', name: 'users.edit', description: 'Edit users', module: 'users' },
      { id: 'users.delete', name: 'users.delete', description: 'Delete users', module: 'users' },
      
      // Products module
      { id: 'products.view', name: 'products.view', description: 'View products', module: 'products' },
      { id: 'products.create', name: 'products.create', description: 'Create products', module: 'products' },
      { id: 'products.edit', name: 'products.edit', description: 'Edit products', module: 'products' },
      { id: 'products.delete', name: 'products.delete', description: 'Delete products', module: 'products' },
      { id: 'products.manage_stock', name: 'products.manage_stock', description: 'Manage stock', module: 'products' },
      
      // Categories module
      { id: 'categories.view', name: 'categories.view', description: 'View categories', module: 'categories' },
      { id: 'categories.create', name: 'categories.create', description: 'Create categories', module: 'categories' },
      { id: 'categories.edit', name: 'categories.edit', description: 'Edit categories', module: 'categories' },
      { id: 'categories.delete', name: 'categories.delete', description: 'Delete categories', module: 'categories' },
      
      // Suppliers module
      { id: 'suppliers.view', name: 'suppliers.view', description: 'View suppliers', module: 'suppliers' },
      { id: 'suppliers.create', name: 'suppliers.create', description: 'Create suppliers', module: 'suppliers' },
      { id: 'suppliers.edit', name: 'suppliers.edit', description: 'Edit suppliers', module: 'suppliers' },
      { id: 'suppliers.delete', name: 'suppliers.delete', description: 'Delete suppliers', module: 'suppliers' },
      
      // Orders module
      { id: 'orders.view', name: 'orders.view', description: 'View orders', module: 'orders' },
      { id: 'orders.create', name: 'orders.create', description: 'Create orders', module: 'orders' },
      { id: 'orders.edit', name: 'orders.edit', description: 'Edit orders', module: 'orders' },
      { id: 'orders.delete', name: 'orders.delete', description: 'Delete orders', module: 'orders' },
      
      // Customers module
      { id: 'customers.view', name: 'customers.view', description: 'View customers', module: 'customers' },
      { id: 'customers.create', name: 'customers.create', description: 'Create customers', module: 'customers' },
      
      // Inventory module
      { id: 'inventory.view', name: 'inventory.view', description: 'View inventory', module: 'inventory' },
      { id: 'inventory.manage', name: 'inventory.manage', description: 'Manage inventory', module: 'inventory' },
      
      // Purchases module
      { id: 'purchases.view', name: 'purchases.view', description: 'View purchases', module: 'purchases' },
      { id: 'purchases.create', name: 'purchases.create', description: 'Create purchases', module: 'purchases' },
      
      // Warehouse module
      { id: 'warehouse.manage', name: 'warehouse.manage', description: 'Manage warehouse', module: 'warehouse' },
      { id: 'warehouses.view', name: 'warehouses.view', description: 'View warehouses', module: 'warehouses' },
      { id: 'warehouses.create', name: 'warehouses.create', description: 'Create warehouses', module: 'warehouses' },
      { id: 'warehouses.edit', name: 'warehouses.edit', description: 'Edit warehouses', module: 'warehouses' },
      { id: 'warehouses.delete', name: 'warehouses.delete', description: 'Delete warehouses', module: 'warehouses' },
      
      // Shop module
      { id: 'shop.manage', name: 'shop.manage', description: 'Manage shop', module: 'shop' },
      
      // Reports module
      { id: 'reports.view', name: 'reports.view', description: 'View reports', module: 'reports' },
      
      // Settings module
      { id: 'settings.manage', name: 'settings.manage', description: 'Manage settings', module: 'settings' }
    ];
    
    console.log('Using fallback permissions catalog with', fallbackPermissions.length, 'items');
    setPermissionsCatalog(fallbackPermissions);
  };

  const fetchUserPermissions = async (userId: string) => {
    if (!userId || userId === 'undefined') {
      console.error('Invalid user ID provided:', userId);
      setUserPermissions([]);
      return;
    }
    
    try {
      const token = getAuthToken();
      console.log('Fetching permissions for user ID:', userId); // Debug log
      const response = await fetch(
        getApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${userId}/permissions?all=true`),
        {
          method: 'GET',
          headers: getCommonHeaders(token)
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        // The API returns permissions in data.data.permissions
        const permissions = data.data?.permissions;
        console.log('User permissions loaded:', permissions);
        setUserPermissions(Array.isArray(permissions) ? permissions : []);
      } else {
        console.error('Failed to fetch user permissions:', data.message);
        setUserPermissions([]);
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setUserPermissions([]);
    }
  };

  const handleUpdateUserPermissions = async (userId: string, permissions: string[]) => {
    if (!userId || userId === 'undefined') {
      console.error('Invalid user ID for permissions update:', userId);
      alert('Error: User ID is missing. Cannot update permissions.');
      return;
    }
    
    try {
      setLoading(true);
      const token = getAuthToken();
      console.log('Updating permissions for user ID:', userId, 'Permissions:', permissions); // Debug log
      const response = await fetch(
        getApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${userId}/permissions?all=true`),
        {
          method: 'POST',
          headers: getCommonHeaders(token),
          body: JSON.stringify({ permissions })
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        logActivity('user_permissions_updated', 'users', { 
          user_id: userId,
          permissions_count: permissions.length 
        });
        setShowPermissionsDialog(false);
        setSelectedUser(null);
      } else {
        alert(data.message || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users, tenants and permissions catalog on component mount
  useEffect(() => {
    console.log('useEffect triggered - hasPermission users.view:', hasPermission('users.view'));
    if (hasPermission('users.view')) {
      console.log('Fetching users, tenants and permissions catalog...');
      fetchUsers();
      fetchTenants();
      fetchPermissionsCatalog();
    } else {
      console.log('No permission to view users, skipping fetch');
    }
  }, [hasPermission]);

  const getRoleBadge = (role: UserRole) => {
    const roleColors: Record<UserRole, string> = {
      super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      tenant_admin: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      warehouse_manager: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      shop_manager: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    };

    const roleNames: Record<UserRole, string> = {
      super_admin: 'Super Admin',
      tenant_admin: 'Tenant Admin',
      admin: 'Admin',
      warehouse_manager: 'Warehouse Manager',
      shop_manager: 'Shop Manager',
      custom: 'Custom Role'
    };

    return (
      <Badge className={roleColors[role]}>
        {role === 'super_admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
        {(role === 'admin' || role === 'custom') && <Shield className="w-3 h-3 mr-1" />}
        {roleNames[role]}
      </Badge>
    );
  };

  const filteredUsers = users
    .filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(user => roleFilter === 'all' ? true : user.role === roleFilter)
    .filter(user => {
      if (statusFilter === 'all') return true;
      if (!user.lastLogin) return statusFilter === 'never';
      const daysSinceLogin = Math.floor((new Date().getTime() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      if (statusFilter === 'active_today') return daysSinceLogin === 0;
      if (statusFilter === 'active_week') return daysSinceLogin <= 7;
      return daysSinceLogin > 7; // inactive
    });

  const getStatusBadge = (user: User) => {
    if (!user.lastLogin) {
      return <Badge variant="outline">Never logged in</Badge>;
    }
    const daysSinceLogin = Math.floor((new Date().getTime() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLogin === 0) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Active today</Badge>;
    } else if (daysSinceLogin <= 7) {
      return <Badge variant="secondary">Active this week</Badge>;
    } else {
      return <Badge variant="outline">Inactive</Badge>;
    }
  };

  if (!hasPermission('users.view')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3>Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to view user management.</p>
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
          <h1>User Management</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Dialog open={showAddUser} onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
          setShowAddUser(open);
          if (!open) {
            resetUserForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button disabled={!hasPermission('users.create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add New User
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="userName">Full Name</Label>
                <Input
                  id="userName"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="userEmail">Email</Label>
                <Input
                  id="userEmail"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label htmlFor="userPassword">Password</Label>
                <Input
                  id="userPassword"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="userPasswordConfirm">Confirm Password</Label>
                <Input
                  id="userPasswordConfirm"
                  type="password"
                  value={userForm.password_confirmation}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                  placeholder="Confirm password"
                />
              </div>
              <div>
                <Label htmlFor="userRole">Role</Label>
                <Select value={userForm.role} onValueChange={(value: UserRole) => setUserForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser?.role === 'super_admin' && (
                      <SelectItem value="admin">Admin</SelectItem>
                    )}
                    <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                    <SelectItem value="shop_manager">Shop Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
                  <div>
                <Label htmlFor="userTenant">Tenant (Optional)</Label>
                <Select value={userForm.tenant_id} onValueChange={(value: string) => setUserForm(prev => ({ ...prev, tenant_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tenant (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific tenant</SelectItem>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {tenants.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No tenants available. Check console for API response.
                  </p>
                )}
              </div>
              <Button 
                onClick={handleAddUser} 
                className="w-full"
              >
                Add User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="min-w-[180px]">
            <Label className="sr-only">Role</Label>
            <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                {currentUser?.role === 'super_admin' && (
                  <SelectItem value="admin">Admin</SelectItem>
                )}
                <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                <SelectItem value="shop_manager">Shop Manager</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[180px]">
            <Label className="sr-only">Status</Label>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active_today">Active today</SelectItem>
                <SelectItem value="active_week">Active this week</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="never">Never logged in</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary">{filteredUsers.length} users</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers()}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPins(!showPins)}
          >
            {showPins ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPins ? 'Hide PINs' : 'Show PINs'}
          </Button>
        </div>
      </div>


      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Manage user accounts and access permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>PIN</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell>
                    <code className="text-sm">
                      {showPins ? user.pin || 'N/A' : '••••'}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!user.id) {
                            console.error('User ID is missing:', user);
                            alert('Error: User ID is missing. Cannot manage permissions.');
                            return;
                          }
                          setSelectedUser(user);
                          fetchUserPermissions(user.id);
                          // Fetch permissions catalog if not already loaded
                          if (permissionsCatalog.length === 0) {
                            console.log('Permissions catalog is empty, fetching...');
                            fetchPermissionsCatalog();
                          }
                          setShowPermissionsDialog(true);
                        }}
                        disabled={!hasPermission('users.edit') || loading}
                        title="Manage Permissions"
                        className="hover:bg-muted"
                      >
                        <Shield className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="text-destructive hover:text-destructive hover:bg-red-50"
                        disabled={!hasPermission('users.delete') || user.id === currentUser?.id || loading}
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Permissions Management Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Permissions - {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Configure the specific permissions for this user. Selected permissions will override their default role-based permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!Array.isArray(permissionsCatalog) || permissionsCatalog.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading permissions...</span>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(
                Array.isArray(permissionsCatalog) 
                  ? permissionsCatalog.reduce((acc, perm) => {
                      if (perm && perm.module) {
                        if (!acc[perm.module]) acc[perm.module] = [];
                        acc[perm.module].push(perm);
                      }
                      return acc;
                    }, {} as Record<string, PermissionCatalogItem[]>) 
                  : {}
              ).map(([module, permissions]) => (
                <Card key={module}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base capitalize">{module}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission.id}
                          checked={userPermissions.includes(permission.name)}
                          onCheckedChange={(checked: boolean) => {
                            console.log(`Permission ${permission.name} - checked: ${checked}, in userPermissions: ${userPermissions.includes(permission.name)}`);
                            if (checked) {
                              setUserPermissions(prev => [...prev, permission.name]);
                            } else {
                              setUserPermissions(prev => prev.filter(p => p !== permission.name));
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={permission.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => selectedUser && handleUpdateUserPermissions(selectedUser.id, userPermissions)}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Permissions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
