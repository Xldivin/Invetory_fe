import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Users,
  Warehouse,
  Activity
} from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

// Mock chart data
const recentSalesData = [
  { month: 'Jan', amount: 12400, orders: 45 },
  { month: 'Feb', amount: 19000, orders: 52 },
  { month: 'Mar', amount: 15600, orders: 48 },
  { month: 'Apr', amount: 22100, orders: 61 },
  { month: 'May', amount: 18900, orders: 55 },
  { month: 'Jun', amount: 25300, orders: 68 }
];

const groundnutSalesData = [
  { variety: 'Tira', sales: 1200, percentage: 35 },
  { variety: 'White', sales: 980, percentage: 28 },
  { variety: 'Red', sales: 750, percentage: 22 },
  { variety: 'Mixed', sales: 520, percentage: 15 }
];

export function Dashboard({ onPageChange }: DashboardProps) {
  const { products, stock, invoices, warehouses, shops, syncStatus } = useInventory();
  const { user, hasPermission } = useAuth();
  const { t } = useLanguage();

  // Calculate metrics
  const totalProducts = products.length;
  const totalStock = stock.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = stock.filter(stockItem => {
    const product = products.find(p => p.id === stockItem.productId);
    return product && stockItem.quantity <= product.minStock;
  }).length;

  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const totalOrders = invoices.length;
  const pendingOrders = invoices.filter(invoice => invoice.status === 'pending').length;

  const recentActivities = [
    { id: 1, action: 'New order received from Kano Traders', time: '2 hours ago', type: 'order' },
    { id: 2, action: 'Stock updated for Tira Groundnuts', time: '4 hours ago', type: 'stock' },
    { id: 3, action: 'Low stock alert: Red Groundnuts', time: '6 hours ago', type: 'alert' },
    { id: 4, action: 'Invoice #INV-001 paid', time: '1 day ago', type: 'payment' },
    { id: 5, action: 'New customer registered', time: '2 days ago', type: 'customer' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case 'stock': return <Package className="w-4 h-4 text-green-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-purple-500" />;
      case 'customer': return <Users className="w-4 h-4 text-cyan-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1>{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={syncStatus.isOnline ? "default" : "destructive"}>
            {syncStatus.isOnline ? "Online" : "Offline"}
          </Badge>
          {syncStatus.pendingChanges > 0 && (
            <Badge variant="outline">
              {syncStatus.pendingChanges} pending
            </Badge>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onPageChange('products')}>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.totalItems')}</p>
                <p className="text-2xl lg:text-3xl">{totalStock.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">+12.5% vs last month</span>
                </div>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onPageChange('warehouses')}>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.lowStock')}</p>
                <p className="text-2xl lg:text-3xl">{lowStockItems}</p>
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-500">Needs attention</span>
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onPageChange('pos')}>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.orders')}</p>
                <p className="text-2xl lg:text-3xl">{totalOrders}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-blue-500">{pendingOrders} pending</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onPageChange('reports')}>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.revenue')}</p>
                <p className="text-2xl lg:text-3xl">{totalRevenue.toLocaleString()} RWF</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">+8.2% vs last month</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentSalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'amount' ? `${value.toLocaleString()} RWF` : value,
                    name === 'amount' ? 'Revenue' : 'Orders'
                  ]} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: '#8884d8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groundnut Varieties Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Groundnut Varieties</CardTitle>
            <CardDescription>Sales by variety this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groundnutSalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="variety" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value.toLocaleString()} RWF`, 'Sales']} />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>System overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Warehouse className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm">Active Warehouses</p>
                    <p className="text-xs text-muted-foreground">Storage facilities</p>
                  </div>
                </div>
                <span className="text-xl">{warehouses.length}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm">Product Varieties</p>
                    <p className="text-xs text-muted-foreground">Groundnut types</p>
                  </div>
                </div>
                <span className="text-xl">{totalProducts}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm">Active Shops</p>
                    <p className="text-xs text-muted-foreground">Retail locations</p>
                  </div>
                </div>
                <span className="text-xl">{shops.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {hasPermission('pos.view') && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => onPageChange('pos')}
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="text-sm">New Sale</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => onPageChange('products')}
              >
                <Package className="w-6 h-6" />
                <span className="text-sm">Add Product</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => onPageChange('warehouses')}
              >
                <Warehouse className="w-6 h-6" />
                <span className="text-sm">Check Stock</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => onPageChange('reports')}
              >
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm">View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}