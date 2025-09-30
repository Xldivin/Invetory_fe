// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { User, UserRole, ActivityLog } from '../types';

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<boolean>;
//   loginWithPin: (pin: string) => Promise<boolean>;
//   logout: () => void;
//   hasPermission: (permission: string) => boolean;
//   logActivity: (action: string, module: string, details?: any) => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Mock users for demo
// const mockUsers: User[] = [
//   {
//     id: '1',
//     name: 'Super Admin',
//     email: 'superadmin@example.com',
//     role: 'super_admin',
//     pin: '1234',
//     createdAt: new Date('2024-01-01'),
//     lastLogin: new Date()
//   },
//   {
//     id: '2',
//     name: 'John Admin',
//     email: 'admin@example.com',
//     role: 'admin',
//     pin: '5678',
//     createdAt: new Date('2024-01-01'),
//     lastLogin: new Date()
//   },
//   {
//     id: '3',
//     name: 'Mike Warehouse',
//     email: 'warehouse@example.com',
//     role: 'warehouse_manager',
//     pin: '9012',
//     createdAt: new Date('2024-01-01'),
//     lastLogin: new Date()
//   },
//   {
//     id: '4',
//     name: 'Sarah Shop',
//     email: 'shop@example.com',
//     role: 'shop_manager',
//     pin: '3456',
//     createdAt: new Date('2024-01-01'),
//     lastLogin: new Date()
//   }
// ];

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

//   useEffect(() => {
//     // Check for stored user session
//     const storedUser = localStorage.getItem('inventoryUser');
//     if (storedUser) {
//       setUser(JSON.parse(storedUser));
//     }
//   }, []);

//   const login = async (email: string, password: string): Promise<boolean> => {
//     // Mock authentication
//     const foundUser = mockUsers.find(u => u.email === email);
//     if (foundUser && password === 'password') {
//       const updatedUser = { ...foundUser, lastLogin: new Date() };
//       setUser(updatedUser);
//       localStorage.setItem('inventoryUser', JSON.stringify(updatedUser));
//       logActivity('login', 'auth', { method: 'email_password' });
//       return true;
//     }
//     return false;
//   };

//   const loginWithPin = async (pin: string): Promise<boolean> => {
//     const foundUser = mockUsers.find(u => u.pin === pin);
//     if (foundUser) {
//       const updatedUser = { ...foundUser, lastLogin: new Date() };
//       setUser(updatedUser);
//       localStorage.setItem('inventoryUser', JSON.stringify(updatedUser));
//       logActivity('login', 'auth', { method: 'pin' });
//       return true;
//     }
//     return false;
//   };

//   const logout = () => {
//     if (user) {
//       logActivity('logout', 'auth');
//     }
//     setUser(null);
//     localStorage.removeItem('inventoryUser');
//   };

//   const hasPermission = (permission: string): boolean => {
//     if (!user) return false;

//     // Define role-based permissions
//     const rolePermissions: Record<UserRole, string[]> = {
//       super_admin: [
//         'dashboard.view', 'users.view', 'users.create', 'users.edit', 'users.delete',
//         'logs.view', 'settings.view'
//       ], // Only specific permissions for super admin - no chat, events, incidents, taxes, pos, products, warehouses, shops, expenses
//       admin: [
//         'dashboard.view', 'users.view', 'users.create', 'users.edit', 'users.delete',
//         'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
//         'shops.view', 'shops.create', 'shops.edit', 'shops.delete',
//         'products.view', 'products.create', 'products.edit', 'products.delete',
//         'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
//         'reports.view', 'expenses.view', 'expenses.create', 'taxes.view', 'taxes.edit',
//         'events.view', 'events.create', 'events.edit', 'pos.view',
//         'logs.view', 'settings.view'
//       ], // Removed chat and incidents from admin
//       warehouse_manager: [
//         'dashboard.view', 'products.view', 'products.edit', 'stock.view', 'stock.edit',
//         'requests.view', 'requests.approve', 'reports.view',
//         'incidents.create', 'settings.view'
//       ], // Removed chat from warehouse manager
//       shop_manager: [
//         'dashboard.view', 'products.view', 'sales.create', 'customers.view', 'customers.create',
//         'requests.create', 'expenses.view', 'expenses.create',
//         'incidents.create', 'pos.view', 'settings.view'
//       ], // Removed chat from shop manager
//       custom: [] // Would be defined per custom role
//     };

//     const permissions = rolePermissions[user.role] || [];
//     return permissions.includes('*') || permissions.includes(permission);
//   };

//   const logActivity = (action: string, module: string, details?: any) => {
//     if (!user) return;

//     const log: ActivityLog = {
//       id: Date.now().toString(),
//       userId: user.id,
//       userName: user.name,
//       action,
//       module,
//       details: details || {},
//       timestamp: new Date()
//     };

//     setActivityLogs(prev => [log, ...prev]);

//     // Store in localStorage for persistence
//     const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
//     existingLogs.unshift(log);
//     // Keep only last 1000 logs
//     if (existingLogs.length > 1000) {
//       existingLogs.splice(1000);
//     }
//     localStorage.setItem('activityLogs', JSON.stringify(existingLogs));
//   };

//   return (
//     <AuthContext.Provider value={{
//       user,
//       login,
//       loginWithPin,
//       logout,
//       hasPermission,
//       logActivity
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }


import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl, getCommonHeaders, API_CONFIG } from '../config/api';
import { logApiConfig, logApiRequest, logApiResponse } from '../utils/apiDebug';

type UserRole = 'super_admin' | 'tenant_admin' | 'admin' | 'warehouse_manager' | 'shop_manager' | 'custom';

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: Date;
  permissions?: string[];
  warehouse_id?: number | null;
  shop_id?: number | null;
  profile_image_url?: string | null;
};

type ActivityLog = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: any;
  timestamp: Date;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithPin: (pin: string) => Promise<boolean>;
  logout: () => Promise<void> | void;
  hasPermission: (permission: string) => boolean;
  logActivity: (action: string, module: string, details?: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TENANT_CODE = undefined;

function shapeUserFromBackend(data: any): User {
  const u = data?.user || data; // supports me/profile endpoints too
  return {
    id: String(u?.id ?? u?.user_id ?? ''),
    name: u?.full_name ?? u?.name ?? '',
    email: u?.email ?? '',
    role: (u?.role ?? 'custom') as UserRole,
    lastLogin: new Date(),
    permissions: u?.permissions ?? [],
    warehouse_id: u?.warehouse_id ?? null,
    shop_id: u?.shop_id ?? null,
    profile_image_url: u?.profile_image_url ?? null
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('inventoryUser');
    const token = localStorage.getItem('sessionToken');
    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch { }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Debug logging
      logApiConfig();
      
      const url = getApiUrl(API_CONFIG.ENDPOINTS.LOGIN);
      const headers = getCommonHeaders();
      const body = JSON.stringify({
        email,
        password,
        ...(TENANT_CODE ? { tenant_code: TENANT_CODE } : {})
      });
      
      logApiRequest(url, { method: 'POST', headers, body });
      
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body
      });

      const json = await res.json().catch(() => null);
      logApiResponse(res, json);
      
      if (!res.ok || !json?.success) {
        console.error('❌ Login failed:', res.status, res.statusText, json);
        return false;
      }

      const shaped = shapeUserFromBackend(json.data);
      const token = json.data?.session?.token as string | undefined;
      if (!token) return false;

      setUser(shaped);
      localStorage.setItem('inventoryUser', JSON.stringify(shaped));
      localStorage.setItem('sessionToken', token);

      logActivity('login', 'auth', { method: 'email_password' });
      return true;
    } catch {
      return false;
    }
  };

  const loginWithPin = async (pin: string): Promise<boolean> => {
    try {
      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN_PIN), {
        method: 'POST',
        headers: getCommonHeaders(),
        body: JSON.stringify({
          pin,
          ...(TENANT_CODE ? { tenant_code: TENANT_CODE } : {})
        })
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) return false;

      const shaped = shapeUserFromBackend(json.data);
      const token = json.data?.session?.token as string | undefined;
      if (!token) return false;

      setUser(shaped);
      localStorage.setItem('inventoryUser', JSON.stringify(shaped));
      localStorage.setItem('sessionToken', token);
      logActivity('login', 'auth', { method: 'pin' });
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('sessionToken') || undefined;
    try {
      if (token) {
        await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGOUT), {
          method: 'POST',
          headers: getCommonHeaders(token)
        });
      }
    } catch { }
    if (user) {
      logActivity('logout', 'auth');
    }
    setUser(null);
    localStorage.removeItem('inventoryUser');
    localStorage.removeItem('sessionToken');
  };
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Prefer backend-provided permissions if present
    const perms = user.permissions ?? [];
    if (perms.includes('*') || perms.includes(permission)) return true;

    // Fallback role-based permissions (keep in sync with backend expectations)
    const rolePermissions: Record<UserRole, string[]> = {
      super_admin: [
        'dashboard.view', 'users.view', 'users.create', 'users.edit', 'users.delete',
        'logs.view', 'settings.view'
      ],
      tenant_admin: [
        'dashboard.view', 'products.view', 'products.create', 'products.edit', 'products.delete',
        'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
        'pos.view', 'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
        'shops.view', 'shops.create', 'shops.edit', 'shops.delete',
        'users.view', 'users.create', 'users.edit', 'users.delete',
        'reports.view', 'expenses.view', 'expenses.create', 'expenses.edit', 'expenses.delete',
        'taxes.view', 'taxes.create', 'taxes.edit', 'taxes.delete',
        'events.view', 'events.create', 'events.edit', 'events.delete',
        'logs.view', 'settings.view'
      ],
      admin: [
        'dashboard.view', 'users.view', 'users.create', 'users.edit', 'users.delete',
        'warehouses.view', 'warehouses.create', 'warehouses.edit', 'warehouses.delete',
        'shops.view', 'shops.create', 'shops.edit', 'shops.delete',
        'products.view', 'products.create', 'products.edit', 'products.delete',
        'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
        'reports.view', 'expenses.view', 'expenses.create', 'taxes.view', 'taxes.edit',
        'events.view', 'events.create', 'events.edit', 'pos.view',
        'logs.view', 'settings.view'
      ],
      warehouse_manager: [
        'dashboard.view', 'products.view', 'products.edit', 'stock.view', 'stock.edit',
        'requests.view', 'requests.approve', 'reports.view',
        'incidents.create', 'settings.view'
      ],
      shop_manager: [
        'dashboard.view', 'products.view', 'sales.create', 'customers.view', 'customers.create',
        'requests.create', 'expenses.view', 'expenses.create',
        'incidents.create', 'pos.view', 'settings.view'
      ],
      custom: []
    };

    const fallbackPerms = rolePermissions[user.role] || [];
    return fallbackPerms.includes('*') || fallbackPerms.includes(permission);
  };

  const logActivity = (action: string, module: string, details?: any) => {
    if (!user) return;

    const log: ActivityLog = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      action,
      module,
      details: details || {},
      timestamp: new Date()
    };

    setActivityLogs(prev => [log, ...prev]);

    try {
      const existingLogs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
      existingLogs.unshift(log);
      if (existingLogs.length > 1000) existingLogs.splice(1000);
      localStorage.setItem('activityLogs', JSON.stringify(existingLogs));
    } catch { }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithPin,
      logout,
      hasPermission,
      logActivity
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}