import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  Filter
} from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';

export function Reports() {
  const { products, stock, warehouses, shops, invoices } = useInventory();
  const { logActivity } = useAuth();
  
  const [dateRange, setDateRange] = useState('30');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedShop, setSelectedShop] = useState('all');
  const [reportType, setReportType] = useState('overview');

  // Mock data for charts - In real app, this would be calculated from actual data
  const salesData = [
    { month: 'Jan', sales: 12000, orders: 45 },
    { month: 'Feb', sales: 19000, orders: 52 },
    { month: 'Mar', sales: 15000, orders: 48 },
    { month: 'Apr', sales: 22000, orders: 61 },
    { month: 'May', sales: 18000, orders: 55 },
    { month: 'Jun', sales: 25000, orders: 68 }
  ];

  const inventoryData = [
    { name: 'Electronics', value: 45, color: '#8884d8' },
    { name: 'Furniture', value: 30, color: '#82ca9d' },
    { name: 'Supplies', value: 15, color: '#ffc658' },
    { name: 'Others', value: 10, color: '#ff7300' }
  ];

  const stockMovementData = [
    { day: 'Mon', inbound: 120, outbound: 95 },
    { day: 'Tue', inbound: 85, outbound: 110 },
    { day: 'Wed', inbound: 140, outbound: 125 },
    { day: 'Thu', inbound: 95, outbound: 90 },
    { day: 'Fri', inbound: 160, outbound: 145 },
    { day: 'Sat', inbound: 75, outbound: 65 },
    { day: 'Sun', inbound: 45, outbound: 35 }
  ];

  const topSellingProducts = [
    { name: 'Laptop Computer', sold: 156, revenue: 155844 },
    { name: 'Office Chair', sold: 89, revenue: 26699 },
    { name: 'Desk Organizer', sold: 134, revenue: 4020 },
    { name: 'Monitor Stand', sold: 67, revenue: 10050 },
    { name: 'Keyboard', sold: 245, revenue: 19600 }
  ];

  const lowStockItems = stock.filter(s => {
    const product = products.find(p => p.id === s.productId);
    return product && s.quantity <= product.minStock;
  });

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalOrders = invoices.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const handleExportReport = (type: string) => {
    logActivity('report_exported', 'reports', { type, dateRange });
    // In real app, this would generate and download the actual report
    alert(`Exporting ${type} report for the last ${dateRange} days...`);
  };

  const getStockStatus = () => {
    const totalProducts = products.length;
    const inStock = stock.filter(s => s.quantity > 0).length;
    const lowStock = lowStockItems.length;
    const outOfStock = totalProducts - inStock;

    return { totalProducts, inStock, lowStock, outOfStock };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive business insights and reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Warehouse</Label>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Shop</Label>
              <Select value={selectedShop} onValueChange={setSelectedShop}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shops</SelectItem>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="sales">Sales Analysis</SelectItem>
                  <SelectItem value="inventory">Inventory Status</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl">RWF {totalRevenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">+12.5%</span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl">{totalOrders}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">+8.2%</span>
                    </div>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Order Value</p>
                    <p className="text-2xl">RWF {averageOrderValue.toFixed(0)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingDown className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">-2.1%</span>
                    </div>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Low Stock Items</p>
                    <p className="text-2xl">{stockStatus.lowStock}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3 text-orange-500" />
                      <span className="text-xs text-orange-500">Need attention</span>
                    </div>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Monthly sales and order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Distribution</CardTitle>
                <CardDescription>Product categories breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={inventoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {inventoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          {/* Sales Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sales Performance</CardTitle>
                    <CardDescription>Revenue and order trends</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('sales')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performers this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSellingProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sold} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">RWF {product.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl">{stockStatus.totalProducts}</p>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl text-green-600">{stockStatus.inStock}</p>
                  <p className="text-sm text-muted-foreground">In Stock</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl text-orange-600">{stockStatus.lowStock}</p>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl text-red-600">{stockStatus.outOfStock}</p>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Stock Movement</CardTitle>
                    <CardDescription>Daily inbound vs outbound</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExportReport('inventory')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stockMovementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="inbound" fill="#82ca9d" name="Inbound" />
                    <Bar dataKey="outbound" fill="#8884d8" name="Outbound" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lowStockItems.slice(0, 5).map((stockItem) => {
                    const product = products.find(p => p.id === stockItem.productId);
                    if (!product) return null;

                    return (
                      <div key={stockItem.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{stockItem.quantity} units</p>
                          <Badge variant="destructive" className="text-xs">
                            Min: {product.minStock}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {lowStockItems.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Package className="mx-auto h-8 w-8 mb-2" />
                      <p>All items are adequately stocked</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Performance</CardTitle>
                <CardDescription>Efficiency metrics by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {warehouses.map((warehouse) => (
                    <div key={warehouse.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="text-sm">{warehouse.name}</p>
                        <p className="text-xs text-muted-foreground">{warehouse.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">95% efficiency</p>
                        <Badge variant="secondary">High performer</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shop Performance</CardTitle>
                <CardDescription>Sales metrics by retail location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shops.map((shop) => (
                    <div key={shop.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="text-sm">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">{shop.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">RWF 25,000 revenue</p>
                        <Badge variant="secondary">Good performance</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}