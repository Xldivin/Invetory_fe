import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Switch } from './ui/switch';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserRole } from '../types';

// Mock users data - In real app, this would come from Supabase
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@example.com',
    role: 'super_admin',
    pin: '1234',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '2',
    name: 'John Admin',
    email: 'admin@example.com',
    role: 'admin',
    pin: '5678',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '3',
    name: 'Mike Warehouse',
    email: 'warehouse@example.com',
    role: 'warehouse_manager',
    pin: '9012',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '4',
    name: 'Sarah Shop',
    email: 'shop@example.com',
    role: 'shop_manager',
    pin: '3456',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: '5',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'shop_manager',
    pin: '7890',
    createdAt: new Date('2024-02-15'),
    lastLogin: new Date('2024-03-10')
  }
];

export function UserManagement() {
  const { user: currentUser, logActivity, hasPermission } = useAuth();
  
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPins, setShowPins] = useState(false);
  
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'shop_manager' as UserRole,
    pin: '',
    generatePin: true
  });

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      role: 'shop_manager',
      pin: '',
      generatePin: true
    });
  };

  const generateRandomPin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleAddUser = () => {
    if (!userForm.name || !userForm.email) return;

    const pin = userForm.generatePin ? generateRandomPin() : userForm.pin;
    
    const newUser: User = {
      id: Date.now().toString(),
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      pin: pin,
      createdAt: new Date(),
      lastLogin: undefined
    };

    setUsers(prev => [...prev, newUser]);
    logActivity('user_created', 'users', { name: newUser.name, role: newUser.role });
    
    resetUserForm();
    setShowAddUser(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      pin: user.pin || '',
      generatePin: false
    });
    setShowAddUser(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser || !userForm.name || !userForm.email) return;

    const updatedUser = {
      ...editingUser,
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      pin: userForm.pin
    };

    setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
    logActivity('user_updated', 'users', { name: updatedUser.name, role: updatedUser.role });
    
    resetUserForm();
    setEditingUser(null);
    setShowAddUser(false);
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      alert("You cannot delete your own account");
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
      logActivity('user_deleted', 'users', { name: user.name, role: user.role });
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roleColors = {
      super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      warehouse_manager: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      shop_manager: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    };

    const roleNames = {
      super_admin: 'Super Admin',
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (user: User) => {
    const daysSinceLogin = user.lastLogin 
      ? Math.floor((new Date().getTime() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    if (!user.lastLogin) {
      return <Badge variant="outline">Never logged in</Badge>;
    } else if (daysSinceLogin === 0) {
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
        <Dialog open={showAddUser} onOpenChange={(open) => {
          setShowAddUser(open);
          if (!open) {
            setEditingUser(null);
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
                {editingUser ? 'Edit User' : 'Add New User'}
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
                      <SelectItem value="admin">Admin</SelectItem>
                    )}
                    <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                    <SelectItem value="shop_manager">Shop Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="generatePin"
                    checked={userForm.generatePin}
                    onCheckedChange={(checked) => setUserForm(prev => ({ ...prev, generatePin: checked }))}
                  />
                  <Label htmlFor="generatePin">Generate random PIN</Label>
                </div>
                {!userForm.generatePin && (
                  <div>
                    <Label htmlFor="userPin">4-Digit PIN</Label>
                    <Input
                      id="userPin"
                      type="text"
                      maxLength={4}
                      value={userForm.pin}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) {
                          setUserForm(prev => ({ ...prev, pin: e.target.value }));
                        }
                      }}
                      placeholder="1234"
                    />
                  </div>
                )}
              </div>
              <Button 
                onClick={editingUser ? handleUpdateUser : handleAddUser} 
                className="w-full"
              >
                {editingUser ? 'Update User' : 'Add User'}
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
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">{filteredUsers.length} users</Badge>
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

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl">{users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shop Managers</p>
                <p className="text-2xl">{users.filter(u => u.role === 'shop_manager').length}</p>
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warehouse Managers</p>
                <p className="text-2xl">{users.filter(u => u.role === 'warehouse_manager').length}</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Manage user accounts and access permissions</CardDescription>
        </CardHeader>
        <CardContent>
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
                        onClick={() => handleEditUser(user)}
                        disabled={!hasPermission('users.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="text-destructive hover:text-destructive"
                        disabled={!hasPermission('users.delete') || user.id === currentUser?.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}