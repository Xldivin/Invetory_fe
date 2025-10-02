import * as React from "react";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  Building2,
  Mail,
  Phone,
  Calendar,
  Globe,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  ArrowLeft,
  Settings,
  Loader2,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  Edit,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Package,
  ShoppingCart,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '../types';
import { getApiUrl, getCommonHeaders, getAuthToken, API_CONFIG } from '../config/api';

// Interfaces
interface Tenant {
  tenant_id: string;
  tenant_code: string;
  company_name: string;
  subscription_plan: 'trial' | 'basic' | 'premium' | 'enterprise';
  contact_person: string;
  email: string;
  status?: 'active' | 'inactive';
  custom_domain?: string;
  phone_number?: string;
  company_size?: string;
  created_at: string;
  is_active: boolean;
}

interface TenantUser {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  pin?: string;
  created_at: string;
  last_login_at?: string;
  is_active: boolean;
}

interface TenantStats {
  tenant: {
    id: number;
    name: string;
    code: string;
    status: string;
    subscription_plan: string;
    created_at: string;
  };
  overview: {
    total_users: number;
    total_products: number;
    total_orders: number;
    total_revenue: number;
    total_warehouses: number;
    total_shops: number;
  };
  recent_activity: {
    orders_last_30_days: number;
    users_created_last_30_days: number;
  };
  breakdowns: {
    order_status: {
      pending: number;
      confirmed: number;
      shipped: number;
      delivered: number;
      cancelled: number;
    };
    user_roles: {
      tenant_admin: number;
      warehouse_manager: number;
      shop_manager: number;
      staff: number;
    };
  };
  trends: {
    monthly_revenue: Record<string, number>;
  };
  top_products: Array<{
    product_name: string;
    revenue: number;
    quantity_sold: number;
  }>;
  generated_at: string;
}

interface TenantActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

interface TenantDetailsPageProps {
  tenantId: string;
  onBack: () => void;
}

export function TenantDetailsPage({ tenantId, onBack }: TenantDetailsPageProps) {
  const { user: currentUser, logActivity, hasPermission } = useAuth();
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([]);
  const [tenantStats, setTenantStats] = useState<TenantStats | null>(null);
  const [activities, setActivities] = useState<TenantActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  // Fetch tenant details
  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(
        getApiUrl(`${API_CONFIG.ENDPOINTS.TENANTS}/${tenantId}`),
        {
          method: 'GET',
          headers: getCommonHeaders(token)
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setTenant(data.data);
      } else {
        console.error('Failed to fetch tenant details:', data.message);
        alert(data.message || 'Failed to fetch tenant details');
      }
    } catch (error) {
      console.error('Error fetching tenant details:', error);
      alert('Failed to fetch tenant details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tenant users
  const fetchTenantUsers = async () => {
    try {
      setUsersLoading(true);
      const token = getAuthToken();
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.USERS),
        {
          method: 'GET',
          headers: {
            ...getCommonHeaders(token),
            'X-Tenant-ID': tenantId
          }
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setTenantUsers(data.data || []);
      } else {
        console.error('Failed to fetch tenant users:', data.message);
        setTenantUsers([]);
      }
    } catch (error) {
      console.error('Error fetching tenant users:', error);
      setTenantUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch tenant statistics
  const fetchTenantStats = async () => {
    try {
      setStatsLoading(true);
      const token = getAuthToken();
      const response = await fetch(
        getApiUrl(`${API_CONFIG.ENDPOINTS.TENANTS}/${tenantId}/stats`),
        {
          method: 'GET',
          headers: {
            ...getCommonHeaders(token),
            'X-Tenant-ID': tenantId
          }
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setTenantStats(data.data);
      } else {
        console.error('Failed to fetch tenant stats:', data.message);
        // Set fallback data if API fails
        setTenantStats({
          tenant: {
            id: parseInt(tenantId),
            name: tenant?.company_name || 'Unknown',
            code: tenant?.tenant_code || 'N/A',
            status: tenant?.is_active ? 'active' : 'inactive',
            subscription_plan: tenant?.subscription_plan || 'basic',
            created_at: tenant?.created_at || new Date().toISOString()
          },
          overview: {
            total_users: tenantUsers.length,
            total_products: 0,
            total_orders: 0,
            total_revenue: 0,
            total_warehouses: 0,
            total_shops: 0
          },
          recent_activity: {
            orders_last_30_days: 0,
            users_created_last_30_days: 0
          },
          breakdowns: {
            order_status: {
              pending: 0,
              confirmed: 0,
              shipped: 0,
              delivered: 0,
              cancelled: 0
            },
            user_roles: {
              tenant_admin: 0,
              warehouse_manager: 0,
              shop_manager: 0,
              staff: 0
            }
          },
          trends: {
            monthly_revenue: {}
          },
          top_products: [],
          generated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching tenant stats:', error);
      // Set fallback data on error
      setTenantStats({
        tenant: {
          id: parseInt(tenantId),
          name: tenant?.company_name || 'Unknown',
          code: tenant?.tenant_code || 'N/A',
          status: tenant?.is_active ? 'active' : 'inactive',
          subscription_plan: tenant?.subscription_plan || 'basic',
          created_at: tenant?.created_at || new Date().toISOString()
        },
        overview: {
          total_users: tenantUsers.length,
          total_products: 0,
          total_orders: 0,
          total_revenue: 0,
          total_warehouses: 0,
          total_shops: 0
        },
        recent_activity: {
          orders_last_30_days: 0,
          users_created_last_30_days: 0
        },
        breakdowns: {
          order_status: {
            pending: 0,
            confirmed: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
          },
          user_roles: {
            tenant_admin: 0,
            warehouse_manager: 0,
            shop_manager: 0,
            staff: 0
          }
        },
        trends: {
          monthly_revenue: {}
        },
        top_products: [],
        generated_at: new Date().toISOString()
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch tenant activities (mock data for now)
  const fetchTenantActivities = async () => {
    try {
      setActivitiesLoading(true);
      // Mock activities data - replace with actual API call
      const mockActivities: TenantActivity[] = [
        {
          id: '1',
          action: 'User Login',
          user: 'John Doe',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          details: 'Logged in from web browser'
        },
        {
          id: '2',
          action: 'Product Added',
          user: 'Jane Smith',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          details: 'Added new product: iPhone 15 Pro'
        },
        {
          id: '3',
          action: 'Order Created',
          user: 'Mike Johnson',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          details: 'Created order #ORD-001 for $299.99'
        },
        {
          id: '4',
          action: 'User Created',
          user: 'Admin',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          details: 'Created new user: Sarah Wilson'
        }
      ];
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching tenant activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchTenantDetails();
      fetchTenantUsers();
      fetchTenantStats();
      fetchTenantActivities();
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantUsers.length > 0) {
      fetchTenantStats();
    }
  }, [tenantUsers]);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="destructive">
        <AlertCircle className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
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
        {roleNames[role] || role}
      </Badge>
    );
  };

  const filteredUsers = tenantUsers.filter(user =>
    (user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(userSearchTerm.toLowerCase())) &&
    (roleFilter === 'all' ? true : user.role === roleFilter)
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading tenant details...</span>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3>Tenant Not Found</h3>
            <p className="text-muted-foreground">The requested tenant could not be found.</p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tenants
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{tenant.company_name}</h1>
            <p className="text-muted-foreground">Tenant Details & Analytics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(tenant.is_active)}
          {getSubscriptionPlanBadge(tenant.subscription_plan)}
        </div>
      </div>

       {/* Tenant Overview Cards */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Total Users</p>
                 <p className="text-2xl font-bold">{tenantStats?.overview.total_users || 0}</p>
               </div>
               <Users className="h-8 w-8 text-blue-600" />
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Total Products</p>
                 <p className="text-2xl font-bold">{tenantStats?.overview.total_products || 0}</p>
               </div>
               <Package className="h-8 w-8 text-green-600" />
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Total Revenue</p>
                 <p className="text-2xl font-bold">${tenantStats?.overview.total_revenue?.toLocaleString() || 0}</p>
               </div>
               <DollarSign className="h-8 w-8 text-green-600" />
             </div>
           </CardContent>
         </Card>
         <Card>
           <CardContent className="p-4">
             <div className="flex items-center justify-between">
               <div>
                 <p className="text-sm text-muted-foreground">Total Orders</p>
                 <p className="text-2xl font-bold">{tenantStats?.overview.total_orders || 0}</p>
               </div>
               <ShoppingCart className="h-8 w-8 text-purple-600" />
             </div>
           </CardContent>
         </Card>
       </div>

       {/* Main Content Tabs */}
       <Tabs defaultValue="overview" className="w-full">
         <TabsList className="grid w-full grid-cols-2">
           <TabsTrigger value="overview" className="flex items-center gap-2">Overview</TabsTrigger>
           <TabsTrigger value="users" className="flex items-center gap-2">Users</TabsTrigger>
         </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tenant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Tenant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tenant ID</Label>
                    <p className="text-sm">{tenant.tenant_id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tenant Code</Label>
                    <p className="text-sm">{tenant.tenant_code}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Company Name</Label>
                  <p className="text-sm">{tenant.company_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
                    <p className="text-sm">{tenant.contact_person}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Company Size</Label>
                    <p className="text-sm">{tenant.company_size || 'Not specified'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {tenant.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {tenant.phone_number || 'Not provided'}
                    </p>
                  </div>
                </div>
                {tenant.custom_domain && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Custom Domain</Label>
                    <p className="text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {tenant.custom_domain}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(tenant.created_at).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

             {/* Quick Stats */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <TrendingUp className="w-5 h-5" />
                   Quick Stats
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label className="text-sm font-medium text-muted-foreground">Warehouses</Label>
                     <p className="text-2xl font-bold">{tenantStats?.overview.total_warehouses || 0}</p>
                   </div>
                   <div>
                     <Label className="text-sm font-medium text-muted-foreground">Shops</Label>
                     <p className="text-2xl font-bold">{tenantStats?.overview.total_shops || 0}</p>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <Label className="text-sm font-medium text-muted-foreground">Orders (30 days)</Label>
                     <p className="text-2xl font-bold">{tenantStats?.recent_activity.orders_last_30_days || 0}</p>
                   </div>
                   <div>
                     <Label className="text-sm font-medium text-muted-foreground">New Users (30 days)</Label>
                     <p className="text-2xl font-bold">{tenantStats?.recent_activity.users_created_last_30_days || 0}</p>
                   </div>
                 </div>
                 <div className="pt-4 border-t">
                   <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                   <p className="text-sm flex items-center gap-2">
                     <Clock className="w-4 h-4" />
                     {tenantStats?.generated_at ? new Date(tenantStats.generated_at).toLocaleString() : 'No data available'}
                   </p>
                 </div>
               </CardContent>
             </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">

          {/* User Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                <SelectItem value="shop_manager">Shop Manager</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPins(!showPins)}
            >
              {showPins ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showPins ? 'Hide PINs' : 'Show PINs'}
            </Button>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              {usersLoading ? (
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{user.full_name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                        <TableCell>
                          <code className="text-sm">
                            {showPins ? user.pin || 'N/A' : '••••'}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && !usersLoading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 }
