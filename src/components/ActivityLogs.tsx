import * as React from "react";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User,
  Package,
  ShoppingCart,
  AlertTriangle,
  Settings,
  MessageSquare,
  FileText,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ActivityLog } from '../types';

export function ActivityLogs() {
  const { user, hasPermission } = useAuth();
  
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7');

  useEffect(() => {
    // Load activity logs from localStorage
    const storedLogs = localStorage.getItem('activityLogs');
    if (storedLogs) {
      const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
      setLogs(parsedLogs);
    }
  }, []);

  const getActionIcon = (action: string, module: string) => {
    if (action.includes('login') || action.includes('logout')) {
      return <User className="w-4 h-4 text-blue-500" />;
    }
    
    switch (module) {
      case 'products':
        return <Package className="w-4 h-4 text-green-500" />;
      case 'pos':
      case 'sales':
        return <ShoppingCart className="w-4 h-4 text-purple-500" />;
      case 'warehouses':
        return <Settings className="w-4 h-4 text-orange-500" />;
      case 'incidents':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-cyan-500" />;
      case 'reports':
        return <FileText className="w-4 h-4 text-indigo-500" />;
      case 'users':
        return <Shield className="w-4 h-4 text-pink-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('created') || action.includes('added')) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Create</Badge>;
    } else if (action.includes('updated') || action.includes('edited')) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Update</Badge>;
    } else if (action.includes('deleted') || action.includes('removed')) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Delete</Badge>;
    } else if (action.includes('login')) {
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">Login</Badge>;
    } else if (action.includes('logout')) {
      return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">Logout</Badge>;
    } else {
      return <Badge variant="outline">{action.split('_')[0]}</Badge>;
    }
  };

  const formatActionDescription = (log: ActivityLog) => {
    const baseAction = log.action.replace(/_/g, ' ');
    let description = `${baseAction} in ${log.module}`;
    
    if (log.details) {
      if (log.details.name) {
        description += `: ${log.details.name}`;
      } else if (log.details.title) {
        description += `: ${log.details.title}`;
      } else if (log.details.description) {
        description += `: ${log.details.description}`;
      }
    }
    
    return description;
  };

  const filteredLogs = logs.filter(log => {
    const daysAgo = parseInt(dateRange);
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - daysAgo);
    
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = userFilter === 'all' || log.userId === userFilter;
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    const matchesDate = log.timestamp >= dateFilter;
    
    return matchesSearch && matchesUser && matchesModule && matchesAction && matchesDate;
  });

  const uniqueUsers = [...new Set(logs.map(log => ({ id: log.userId, name: log.userName })))];
  const uniqueModules = [...new Set(logs.map(log => log.module))];
  const actionTypes = ['create', 'update', 'delete', 'login', 'logout'];

  const handleExportLogs = () => {
    const csvContent = [
      'Timestamp,User,Action,Module,Details',
      ...filteredLogs.map(log => 
        `${log.timestamp.toISOString()},"${log.userName}","${log.action}","${log.module}","${JSON.stringify(log.details).replace(/"/g, '""')}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getLogStats = () => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return {
      total: logs.length,
      today: logs.filter(log => log.timestamp >= startOfDay).length,
      users: uniqueUsers.length,
      modules: uniqueModules.length
    };
  };

  const stats = getLogStats();

  if (!hasPermission('logs.view')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3>Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to view activity logs.</p>
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
          <h1>Activity Logs</h1>
          <p className="text-muted-foreground">Monitor all system activities and user actions</p>
        </div>
        <Button onClick={handleExportLogs} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Activities</p>
                <p className="text-2xl">{stats.total.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Activities</p>
                <p className="text-2xl">{stats.today}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl">{stats.users}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Modules Used</p>
                <p className="text-2xl">{stats.modules}</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {uniqueModules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    <div>
                      <div>{log.timestamp.toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs">
                        {log.userName.charAt(0)}
                      </div>
                      <span className="text-sm">{log.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action, log.module)}
                      {getActionBadge(log.action)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {log.module}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatActionDescription(log)}
                  </TableCell>
                  <TableCell>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          alert(JSON.stringify(log.details, null, 2));
                        }}
                      >
                        View Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Activity className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>No activities found matching your filters</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}