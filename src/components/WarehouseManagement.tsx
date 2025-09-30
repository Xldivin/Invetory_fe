import * as React from 'react';
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
import { ScrollArea } from './ui/scroll-area';

export function WarehouseManagement() {
  const { warehouses, addWarehouse, updateWarehouse, products, stock, updateStock, getStock } = useInventory();
  const { user, logActivity } = useAuth();
  
  const [showAddWarehouse, setShowAddWarehouse] = React.useState(false);
  const [showStockModal, setShowStockModal] = React.useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<string>('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState<string>('');
  const [stockQuantity, setStockQuantity] = React.useState('');
  
  const [warehouseForm, setWarehouseForm] = React.useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone_number: '',
    email: '',
    managerId: '',
    capacity: '',
    warehouse_type: '',
    operating_hours: '',
    temperature_controlled: false,
    security_level: '',
    description: ''
  });

  const resetWarehouseForm = () => {
    setWarehouseForm({
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone_number: '',
      email: '',
      managerId: '',
      capacity: '',
      warehouse_type: '',
      operating_hours: '',
      temperature_controlled: false,
      security_level: '',
      description: ''
    });
  };

  const handleAddWarehouse = async () => {
    if (!warehouseForm.name) return;

    await addWarehouse({
      name: warehouseForm.name,
      code: warehouseForm.code || undefined,
      address: warehouseForm.address || undefined,
      city: warehouseForm.city || undefined,
      state: warehouseForm.state || undefined,
      postal_code: warehouseForm.postal_code || undefined,
      country: warehouseForm.country || undefined,
      phone_number: warehouseForm.phone_number || undefined,
      email: warehouseForm.email || undefined,
      managerId: (user?.id || warehouseForm.managerId || '').toString(),
      capacity: parseFloat(warehouseForm.capacity) || 0,
      warehouse_type: warehouseForm.warehouse_type || undefined,
      operating_hours: warehouseForm.operating_hours || undefined,
      temperature_controlled: warehouseForm.temperature_controlled,
      security_level: warehouseForm.security_level || undefined,
    } as any);

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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Warehouse</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[calc(90vh-6rem)] pr-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="warehouseCode">Code</Label>
                  <Input
                    id="warehouseCode"
                    value={warehouseForm.code}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="WH0001"
                  />
                </div>
                <div>
                  <Label htmlFor="warehouseType">Type</Label>
                  <Input
                    id="warehouseType"
                    value={warehouseForm.warehouse_type}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, warehouse_type: e.target.value }))}
                    placeholder="main | secondary"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="warehouseAddress">Address</Label>
                <Input
                  id="warehouseAddress"
                  value={warehouseForm.address}
                  onChange={(e) => setWarehouseForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Industrial Zone"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="warehouseCity">City</Label>
                  <Input
                    id="warehouseCity"
                    value={warehouseForm.city}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Kigali"
                  />
                </div>
                <div>
                  <Label htmlFor="warehouseState">State</Label>
                  <Input
                    id="warehouseState"
                    value={warehouseForm.state}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Kigali"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="warehousePostal">Postal Code</Label>
                  <Input
                    id="warehousePostal"
                    value={warehouseForm.postal_code}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="0000"
                  />
                </div>
                <div>
                  <Label htmlFor="warehouseCountry">Country</Label>
                  <Input
                    id="warehouseCountry"
                    value={warehouseForm.country}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Rwanda"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="warehousePhone">Phone Number</Label>
                  <Input
                    id="warehousePhone"
                    value={warehouseForm.phone_number}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="+250788123456"
                  />
                </div>
                <div>
                  <Label htmlFor="warehouseEmail">Email</Label>
                  <Input
                    id="warehouseEmail"
                    type="email"
                    value={warehouseForm.email}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="warehouse@company.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="warehouseManager">Manager ID</Label>
                  <Input
                    id="warehouseManager"
                    value={warehouseForm.managerId}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, managerId: e.target.value }))}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="warehouseHours">Operating Hours</Label>
                  <Input
                    id="warehouseHours"
                    value={warehouseForm.operating_hours}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, operating_hours: e.target.value }))}
                    placeholder="24/7"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="warehouseSecurity">Security Level</Label>
                  <Input
                    id="warehouseSecurity"
                    value={warehouseForm.security_level}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, security_level: e.target.value }))}
                    placeholder="high | medium | low"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    id="warehouseTempControlled"
                    type="checkbox"
                    checked={warehouseForm.temperature_controlled}
                    onChange={(e) => setWarehouseForm(prev => ({ ...prev, temperature_controlled: e.target.checked }))}
                  />
                  <Label htmlFor="warehouseTempControlled">Temperature Controlled</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="warehouseCapacity">Capacity</Label>
                <Input
                  id="warehouseCapacity"
                  type="number"
                  value={warehouseForm.capacity}
                  onChange={(e) => setWarehouseForm(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="5000"
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
            </ScrollArea>
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
                  <DialogContent className="max-w-[95vw] md:max-w-lg h-[80vh] overflow-y-auto">
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








// {
//   "name": "Central Warehouse",
//   "code": "WH0001",
//   "address": "123 Industrial Zone",
//   "city": "Kigali",
//   "state": "Kigali",
//   "postal_code": "0000",
//   "country": "Rwanda",
//   "phone_number": "+250788123456",
//   "email": "warehouse@company.com",
//   "manager_id": 1,
//   "capacity": 5000.00,
//   "warehouse_type": "main",
//   "operating_hours": "24/7",
//   "temperature_controlled": true,
//   "security_level": "high"
// }