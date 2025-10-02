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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  Loader2,
  Edit,
  KeyRound
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

// Role management interfaces
interface Role {
  id: string;
  role_id: string;
  name: string;
  display_name?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

interface RoleApiResponse {
  success: boolean;
  data: Role[];
  message?: string;
}

interface RoleForm {
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
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
  
  // Role management state
  const [roles, setRoles] = useState<Role[]>([]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [showEditRole, setShowEditRole] = useState(false);
  const [showRolePermissions, setShowRolePermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  
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

  const [roleForm, setRoleForm] = useState<RoleForm>({
    name: '',
    display_name: '',
    description: '',
    permissions: []
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

  const generateRandomPassword = (length: number = 12) => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()-_=+[]{};:,.<>?';
    const allChars = uppercaseChars + lowercaseChars + numberChars + symbolChars;

    // Ensure password has at least one of each category
    const required = [
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
      lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
      numberChars[Math.floor(Math.random() * numberChars.length)],
      symbolChars[Math.floor(Math.random() * symbolChars.length)]
    ];

    const remainingLength = Math.max(0, length - required.length);
    const remaining = Array.from({ length: remainingLength }, () =>
      allChars[Math.floor(Math.random() * allChars.length)]
    );

    const passwordArray = [...required, ...remaining];
    // Shuffle
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }
    return passwordArray.join('');
  };

  const handleAddUser = async () => {
    if (!userForm.name || !userForm.email) {
      alert('Please fill in all required fields (Full Name and Email)');
      return;
    }

    if (!userForm.generatePin) {
      alert('Enable "Generate random PIN & Password" to create user credentials.');
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      const tenantId = getTenantId();
      
      // Auto-generate credentials when toggle is enabled
      const generatedPin = generateRandomPin();
      const generatedPassword = generateRandomPassword();

      const userData = {
        full_name: userForm.name,
        email: userForm.email,
        password: generatedPassword,
        password_confirmation: generatedPassword,
        role: userForm.role,
        pin: generatedPin,
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
        return transformedTenants; // Return the tenants data
      } else {
        console.error('Failed to fetch tenants:', data.message);
        setTenants([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
      return [];
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
        console.log('=== USER TRANSFORMATION DEBUG ===');
        console.log('Available tenants for matching:', tenants);
        console.log('Users data from API:', data.data);
        
        // Transform API users to our User interface
        const transformedUsers: User[] = data.data.map((apiUser: ApiUser) => {
          // Find tenant information if tenant_id exists
          // Convert both IDs to strings for comparison since API might return numbers
          const tenant = apiUser.tenant_id ? tenants.find(t => t.id === String(apiUser.tenant_id)) : null;
          
          console.log('User transformation debug:', {
            userId: apiUser.user_id,
            tenantId: apiUser.tenant_id,
            tenantIdType: typeof apiUser.tenant_id,
            availableTenants: tenants.map(t => ({ id: t.id, name: t.name, idType: typeof t.id })),
            foundTenant: tenant
          });
          
          return {
            id: apiUser.user_id || apiUser.id || '', // Use user_id first, then id as fallback
            name: apiUser.full_name,
            email: apiUser.email,
            role: apiUser.role,
            pin: apiUser.pin || '',
            createdAt: new Date(apiUser.created_at),
            lastLogin: apiUser.last_login_at ? new Date(apiUser.last_login_at) : undefined,
            tenant: tenant ? { id: tenant.id, name: tenant.name } : undefined
          };
        });
        
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

  // Role management functions
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const url = getApiUrl('/roles');
      const headers = getCommonHeaders(token);
      
      console.log('=== FETCH ROLES DEBUG ===');
      console.log('URL:', url);
      console.log('Headers:', headers);
      console.log('Token present:', !!token);
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data: RoleApiResponse = await response.json();
      console.log('Roles API response:', data);
      
      if (response.ok && data.success) {
        console.log('Fetched roles:', data.data);
        setRoles(data.data);
      } else {
        console.error('Failed to fetch roles:', data.message);
        setRoles([]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!roleForm.name.trim() || !roleForm.display_name.trim()) {
      alert('Please enter both role name and display name');
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      const url = getApiUrl('/roles');
      const headers = getCommonHeaders(token);
      const body = JSON.stringify(roleForm);
      
      console.log('=== ADD ROLE DEBUG ===');
      console.log('Role Form:', roleForm);
      console.log('URL:', url);
      console.log('Headers:', headers);
      console.log('Body:', body);
      console.log('Token present:', !!token);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        await fetchRoles();
        logActivity('role_created', 'roles', { name: roleForm.name });
        setRoleForm({ name: '', display_name: '', description: '', permissions: [] });
        setShowAddRole(false);
        alert('Role created successfully!');
      } else {
        console.error('Add role failed:', data);
        alert(data.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole?.role_id || !roleForm.name.trim() || !roleForm.display_name.trim()) {
      alert('Please enter both role name and display name');
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      const url = getApiUrl(`/roles/${selectedRole.role_id}`);
      const headers = getCommonHeaders(token);
      const body = JSON.stringify(roleForm);
      
      console.log('=== EDIT ROLE DEBUG ===');
      console.log('Selected Role:', selectedRole);
      console.log('Role Form:', roleForm);
      console.log('URL:', url);
      console.log('Headers:', headers);
      console.log('Body:', body);
      console.log('Token present:', !!token);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        await fetchRoles();
        logActivity('role_updated', 'roles', { role_id: selectedRole.role_id, name: roleForm.name });
        setShowEditRole(false);
        setSelectedRole(null);
        setRoleForm({ name: '', display_name: '', description: '', permissions: [] });
        alert('Role updated successfully!');
      } else {
        console.error('Edit role failed:', data);
        alert(data.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (!role.role_id) {
      alert('Error: Role ID is missing. Cannot delete this role.');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      const url = getApiUrl(`/roles/${role.role_id}`);
      const headers = getCommonHeaders(token);
      
      console.log('=== DELETE ROLE DEBUG ===');
      console.log('Role to delete:', role);
      console.log('URL:', url);
      console.log('Headers:', headers);
      console.log('Token present:', !!token);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        await fetchRoles();
        logActivity('role_deleted', 'roles', { role_id: role.role_id, name: role.name });
        alert(`Role "${role.name}" has been deleted successfully.`);
      } else {
        console.error('Delete role failed:', data);
        alert(data.message || 'Failed to delete role');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const token = getAuthToken();
      const url = getApiUrl(`/roles/${roleId}/permissions`);
      const headers = getCommonHeaders(token);
      
      console.log('=== FETCH ROLE PERMISSIONS DEBUG ===');
      console.log('Role ID:', roleId);
      console.log('URL:', url);
      console.log('Headers:', headers);
      console.log('Token present:', !!token);
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        const permissions = data.data?.permissions || [];
        console.log('Fetched permissions:', permissions);
        setRolePermissions(Array.isArray(permissions) ? permissions : []);
      } else {
        console.error('Failed to fetch role permissions:', data.message);
        setRolePermissions([]);
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      setRolePermissions([]);
    }
  };

  const handleUpdateRolePermissions = async (roleId: string, permissions: string[]) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const url = getApiUrl(`/roles/${roleId}/permissions`);
      const headers = getCommonHeaders(token);
      const body = JSON.stringify({ permissions });
      
      console.log('=== UPDATE ROLE PERMISSIONS DEBUG ===');
      console.log('Role ID:', roleId);
      console.log('Permissions:', permissions);
      console.log('URL:', url);
      console.log('Headers:', headers);
      console.log('Body:', body);
      console.log('Token present:', !!token);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        logActivity('role_permissions_updated', 'roles', { 
          role_id: roleId,
          permissions_count: permissions.length 
        });
        setShowRolePermissions(false);
        setSelectedRole(null);
        alert('Role permissions updated successfully!');
      } else {
        console.error('Update role permissions failed:', data);
        alert(data.message || 'Failed to update role permissions');
      }
    } catch (error) {
      console.error('Error updating role permissions:', error);
      alert('Failed to update role permissions');
    } finally {
      setLoading(false);
    }
  };

  const resetRoleForm = () => {
    setRoleForm({ name: '', display_name: '', description: '', permissions: [] });
  };

  // Fetch users, tenants, roles and permissions catalog on component mount
  useEffect(() => {
    console.log('useEffect triggered - hasPermission users.view:', hasPermission('users.view'));
    if (hasPermission('users.view')) {
      console.log('Fetching tenants first, then users, roles and permissions catalog...');
      // Fetch tenants first, then users to ensure tenant data is available for user transformation
      fetchTenants().then(() => {
        fetchUsers();
        fetchRoles();
        fetchPermissionsCatalog();
      });
    } else {
      console.log('No permission to view users, skipping fetch');
    }
  }, [hasPermission]);

  const getRoleBadge = (role: UserRole) => {
    const roleColors: Record<string, string> = {
      super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      tenant_admin: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      warehouse_manager: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      shop_manager: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    };

    const roleNames: Record<string, string> = {
      super_admin: 'Super Admin',
      tenant_admin: 'Tenant Admin',
      admin: 'Admin',
      warehouse_manager: 'Warehouse Manager',
      shop_manager: 'Shop Manager',
      custom: 'Custom Role'
    };

    return (
      <Badge className={roleColors[role] || roleColors.custom}>
        {role === 'super_admin' && <ShieldCheck className="w-3 h-3 mr-1" />}
        {(role === 'admin' || role === 'custom') && <Shield className="w-3 h-3 mr-1" />}
        {roleNames[role] || role}
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

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(roleSearchTerm.toLowerCase()))
  );

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
          <p className="text-muted-foreground">Manage system users, roles and their permissions</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Role Management
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2>Users</h2>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="userRole">Role</Label>
                <Select value={userForm.role} onValueChange={(value: UserRole) => setUserForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUser?.role === 'super_admin' && (
                      <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
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
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Generate random PIN & Password</Label>
                  <p className="text-xs text-muted-foreground">Credentials will be created automatically and can be viewed by admins.</p>
                </div>
                <Switch
                  checked={userForm.generatePin}
                  onCheckedChange={(checked: boolean) => setUserForm(prev => ({ ...prev, generatePin: checked }))}
                />
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
                <TableHead>Tenant</TableHead>
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
                  <TableCell>
                    {user.tenant ? (
                      <Badge variant="outline" className="text-xs">
                        {user.tenant.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No tenant</span>
                    )}
                  </TableCell>
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
        </TabsContent>

        {/* Role Management Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2>Roles</h2>
              <p className="text-muted-foreground">Manage system roles and their permissions</p>
            </div>
            <Dialog open={showAddRole} onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
              setShowAddRole(open);
              if (!open) {
                resetRoleForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button disabled={!hasPermission('users.create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roleName">Role Name *</Label>
                    <Input
                      id="roleName"
                      value={roleForm.name}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., custom_manager"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roleDisplayName">Display Name *</Label>
                    <Input
                      id="roleDisplayName"
                      value={roleForm.display_name}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="e.g., Custom Manager"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roleDescription">Description</Label>
                    <Input
                      id="roleDescription"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter role description"
                    />
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                      {permissionsCatalog.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Loading permissions...</p>
                      ) : (
                        Object.entries(
                          permissionsCatalog.reduce((acc, perm) => {
                            if (perm && perm.module) {
                              if (!acc[perm.module]) acc[perm.module] = [];
                              acc[perm.module].push(perm);
                            }
                            return acc;
                          }, {} as Record<string, PermissionCatalogItem[]>)
                        ).map(([module, permissions]) => (
                          <div key={module} className="space-y-1">
                            <h4 className="text-sm font-medium capitalize">{module}</h4>
                            <div className="space-y-1 ml-2">
                              {permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`add-role-${permission.id}`}
                                    checked={roleForm.permissions.includes(permission.name)}
                                    onCheckedChange={(checked: boolean) => {
                                      if (checked) {
                                        setRoleForm(prev => ({
                                          ...prev,
                                          permissions: [...prev.permissions, permission.name]
                                        }));
                                      } else {
                                        setRoleForm(prev => ({
                                          ...prev,
                                          permissions: prev.permissions.filter(p => p !== permission.name)
                                        }));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`add-role-${permission.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {permission.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <Button onClick={handleAddRole} className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Role
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Role Search */}
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                className="pl-10"
                value={roleSearchTerm}
                onChange={(e) => setRoleSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{filteredRoles.length} Roles</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchRoles()}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Settings className="w-4 h-4 mr-2" />}
                Refresh
              </Button>
            </div>
          </div>

          {/* Roles Table */}
          <Card>
            <CardHeader>
              <CardTitle>System Roles</CardTitle>
              <CardDescription>Manage role definitions and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && roles.length === 0 ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading roles...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.role_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{(role.display_name || role.name).charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{role.display_name || role.name}</div>
                              <div className="text-xs text-muted-foreground">{role.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {role.description || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(role.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRole(role);
                                setRoleForm({ 
                                  name: role.name, 
                                  display_name: role.display_name || role.name,
                                  description: role.description || '',
                                  permissions: []
                                });
                                setShowEditRole(true);
                              }}
                              disabled={!hasPermission('users.edit') || loading}
                              title="Edit Role"
                              className="hover:bg-muted"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRole(role);
                                fetchRolePermissions(role.role_id);
                                if (permissionsCatalog.length === 0) {
                                  fetchPermissionsCatalog();
                                }
                                setShowRolePermissions(true);
                              }}
                              disabled={!hasPermission('users.edit') || loading}
                              title="Manage Permissions"
                              className="hover:bg-muted"
                            >
                              <Shield className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRole(role)}
                              className="text-destructive hover:text-destructive hover:bg-red-50"
                              disabled={!hasPermission('users.delete') || loading}
                              title="Delete Role"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRoles.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No roles found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Edit Role Dialog */}
          <Dialog open={showEditRole} onOpenChange={setShowEditRole}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editRoleName">Role Name *</Label>
                  <Input
                    id="editRoleName"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., custom_manager"
                  />
                </div>
                <div>
                  <Label htmlFor="editRoleDisplayName">Display Name *</Label>
                  <Input
                    id="editRoleDisplayName"
                    value={roleForm.display_name}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="e.g., Custom Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="editRoleDescription">Description</Label>
                  <Input
                    id="editRoleDescription"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter role description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditRole(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditRole} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Role
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Role Permissions Management Dialog */}
          <Dialog open={showRolePermissions} onOpenChange={setShowRolePermissions}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Manage Permissions - {selectedRole?.name}
                </DialogTitle>
                <DialogDescription>
                  Configure the specific permissions for this role.
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
                                id={`role-${permission.id}`}
                                checked={rolePermissions.includes(permission.name)}
                                onCheckedChange={(checked: boolean) => {
                                  if (checked) {
                                    setRolePermissions(prev => [...prev, permission.name]);
                                  } else {
                                    setRolePermissions(prev => prev.filter(p => p !== permission.name));
                                  }
                                }}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <label
                                  htmlFor={`role-${permission.id}`}
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
                  <Button variant="outline" onClick={() => setShowRolePermissions(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => selectedRole && handleUpdateRolePermissions(selectedRole.role_id, rolePermissions)}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update Permissions
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
