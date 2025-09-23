import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Warehouse, 
  Plus, 
  MapPin, 
  Users, 
  Package, 
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';

export function WarehouseManagement() {
  const { warehouses, addWarehouse, updateWarehouse, products, stock, updateStock, getStock } = useInventory();
  const { user, logActivity } = useAuth();
  
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState('');
  
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    location: '',
    managerId: '',
    capacity: '',
    description: ''
  });

  const resetWarehouseForm = () => {
    setWarehouseForm({
      name: '',
      location: '',
      managerId: '',
      capacity: '',
      description: ''
    });
  };

  const handleAddWarehouse = () => {
    if (!warehouseForm.name || !warehouseForm.location) return;

    addWarehouse({
      name: warehouseForm.name,
      location: warehouseForm.location,
      managerId: user?.id || '',
      capacity: parseInt(warehouseForm.capacity) || 1000,
      description: warehouseForm.description || undefined
    });

    logActivity('warehouse_created', 'warehouses', { name: warehouseForm.name });
    resetWarehouseForm();
    setShowAddWarehouse(false);
  };

  const handleUpdateStock = () => {
    if (!selectedWarehouse || !selectedProduct || !stockQuantity) return;

    updateStock(selectedWarehouse, selectedProduct, parseInt(stockQuantity));
    logActivity('stock_updated', 'warehouses', { 
      warehouse: selectedWarehouse, 
      product: selectedProduct, 
      quantity: parseInt(stockQuantity) 
    });

    setSelectedProduct('');
    setStockQuantity('');
    setShowStockModal(false);
  };

  const getWarehouseStock = (warehouseId: string) => {
    return stock.filter(s => s.warehouseId === warehouseId);
  };

  const getWarehouseValue = (warehouseId: string) => {
    const warehouseStock = getWarehouseStock(warehouseId);
    return warehouseStock.reduce((total, stockItem) => {
      const product = products.find(p => p.id === stockItem.productId);
      return total + (stockItem.quantity * (product?.cost || 0));
    }, 0);
  };

  const getLowStockItems = (warehouseId: string) => {
    const warehouseStock = getWarehouseStock(warehouseId);
    return warehouseStock.filter(stockItem => {
      const product = products.find(p => p.id === stockItem.productId);
      return product && stockItem.quantity <= product.minStock;
    });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Warehouse Management</h1>
          <p className="text-muted-foreground">Manage warehouses and inventory levels</p>
        </div>
        <Dialog open={showAddWarehouse} onOpenChange={setShowAddWarehouse}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Warehouse</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="warehouseName">Warehouse Name</Label>
                <Input
                  id="warehouseName"
                  value={warehouseForm.name}
                  onChange={(e) => setWarehouseForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter warehouse name"
                />
              </div>
              <div>
                <Label htmlFor="warehouseLocation">Location</Label>
                <Input
                  id="warehouseLocation"
                  value={warehouseForm.location}
                  onChange={(e) => setWarehouseForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="warehouseCapacity">Capacity (sq ft)</Label>
                <Input
                  id="warehouseCapacity"
                  type="number"
                  value={warehouseForm.capacity}
                  onChange={(e) => setWarehouseForm(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="warehouseDescription">Description</Label>
                <Textarea
                  id="warehouseDescription"
                  value={warehouseForm.description}
                  onChange={(e) => setWarehouseForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Warehouse description"
                />
              </div>
              <Button onClick={handleAddWarehouse} className="w-full">
                Add Warehouse
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warehouse Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map((warehouse) => {
          const warehouseStock = getWarehouseStock(warehouse.id);
          const totalItems = warehouseStock.reduce((sum, s) => sum + s.quantity, 0);
          const warehouseValue = getWarehouseValue(warehouse.id);
          const lowStockCount = getLowStockItems(warehouse.id).length;

          return (
            <Card key={warehouse.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                  <Warehouse className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {warehouse.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Items:</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Value:</span>
                  <span>${warehouseValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Low Stock:</span>
                  <Badge variant={lowStockCount > 0 ? "destructive" : "secondary"}>
                    {lowStockCount}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedWarehouse(warehouse.id)}
                >
                  Manage Stock
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stock Management */}
      {selectedWarehouse && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Stock Management</CardTitle>
                <CardDescription>
                  {warehouses.find(w => w.id === selectedWarehouse)?.name}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Update Stock
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Stock Level</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="stockProduct">Product</Label>
                        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="stockQuantity">New Quantity</Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(e.target.value)}
                          placeholder="Enter quantity"
                        />
                      </div>
                      <Button onClick={handleUpdateStock} className="w-full">
                        Update Stock
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={() => setSelectedWarehouse('')}>
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Stock Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Reserved</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const stockInfo = getStock(selectedWarehouse, product.id);
                    const currentStock = stockInfo?.quantity || 0;
                    const reserved = stockInfo?.reservedQuantity || 0;
                    const available = currentStock - reserved;
                    const isLowStock = currentStock <= product.minStock;
                    const stockValue = currentStock * product.cost;

                    return (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell>{currentStock}</TableCell>
                        <TableCell>{reserved}</TableCell>
                        <TableCell>{available}</TableCell>
                        <TableCell>{product.minStock}</TableCell>
                        <TableCell>
                          <Badge variant={isLowStock ? "destructive" : "secondary"}>
                            {isLowStock ? "Low Stock" : "In Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>${stockValue.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stock Overview</CardTitle>
            <CardDescription>Inventory levels across all warehouses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => {
                const totalStock = stock
                  .filter(s => s.productId === product.id)
                  .reduce((sum, s) => sum + s.quantity, 0);
                const isLowStock = totalStock <= product.minStock;

                return (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{totalStock} units</p>
                      <div className="flex items-center gap-1">
                        {isLowStock ? (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        ) : (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        )}
                        <Badge variant={isLowStock ? "destructive" : "secondary"} className="text-xs">
                          {isLowStock ? "Low" : "OK"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Warehouse Analytics</CardTitle>
            <CardDescription>Key performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm">Total Warehouses</p>
                    <p className="text-xs text-muted-foreground">Active locations</p>
                  </div>
                </div>
                <span className="text-xl">{warehouses.length}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm">Total Products</p>
                    <p className="text-xs text-muted-foreground">Unique items</p>
                  </div>
                </div>
                <span className="text-xl">{products.length}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm">Low Stock Alerts</p>
                    <p className="text-xs text-muted-foreground">Items need restocking</p>
                  </div>
                </div>
                <span className="text-xl">
                  {stock.filter(s => {
                    const product = products.find(p => p.id === s.productId);
                    return product && s.quantity <= product.minStock;
                  }).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}