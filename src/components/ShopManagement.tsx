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
  Store, 
  Plus, 
  MapPin, 
  Users, 
  Package, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Search
} from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';

export function ShopManagement() {
  const { 
    shops, 
    addShop, 
    updateShop, 
    warehouses, 
    products, 
    stockRequests, 
    createStockRequest, 
    updateStockRequest 
  } = useInventory();
  const { user, logActivity } = useAuth();
  
  const [showAddShop, setShowAddShop] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [shopForm, setShopForm] = useState({
    name: '',
    location: '',
    managerId: '',
    warehouseIds: [] as string[],
    allowNegativeStock: false,
    autoRequestThreshold: '5',
    defaultTaxRate: '8.25'
  });

  const [requestForm, setRequestForm] = useState({
    shopId: '',
    warehouseId: '',
    productId: '',
    quantity: '',
    notes: ''
  });

  const resetShopForm = () => {
    setShopForm({
      name: '',
      location: '',
      managerId: '',
      warehouseIds: [],
      allowNegativeStock: false,
      autoRequestThreshold: '5',
      defaultTaxRate: '8.25'
    });
  };

  const resetRequestForm = () => {
    setRequestForm({
      shopId: '',
      warehouseId: '',
      productId: '',
      quantity: '',
      notes: ''
    });
  };

  const handleAddShop = () => {
    if (!shopForm.name || !shopForm.location) return;

    addShop({
      name: shopForm.name,
      location: shopForm.location,
      managerId: user?.id || '',
      warehouseIds: shopForm.warehouseIds,
      settings: {
        allowNegativeStock: shopForm.allowNegativeStock,
        autoRequestThreshold: parseInt(shopForm.autoRequestThreshold),
        defaultTaxRate: parseFloat(shopForm.defaultTaxRate),
        receiptTemplate: 'standard'
      }
    });

    logActivity('shop_created', 'shops', { name: shopForm.name });
    resetShopForm();
    setShowAddShop(false);
  };

  const handleCreateRequest = () => {
    if (!requestForm.shopId || !requestForm.warehouseId || !requestForm.productId || !requestForm.quantity) return;

    createStockRequest({
      shopId: requestForm.shopId,
      warehouseId: requestForm.warehouseId,
      productId: requestForm.productId,
      requestedQuantity: parseInt(requestForm.quantity),
      requestedBy: user?.id || '',
      notes: requestForm.notes
    });

    logActivity('stock_request_created', 'shops', { 
      shop: requestForm.shopId, 
      product: requestForm.productId,
      quantity: parseInt(requestForm.quantity)
    });

    resetRequestForm();
    setShowRequestModal(false);
  };

  const handleRequestAction = (requestId: string, action: 'approve' | 'decline', approvedQuantity?: number) => {
    const request = stockRequests.find(r => r.id === requestId);
    if (!request) return;

    updateStockRequest(requestId, {
      status: action === 'approve' ? 'approved' : 'declined',
      approvedBy: user?.id,
      approvedQuantity: action === 'approve' ? (approvedQuantity || request.requestedQuantity) : undefined
    });

    logActivity(`stock_request_${action}d`, 'shops', { 
      requestId,
      shop: request.shopId,
      product: request.productId
    });
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'declined':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
      case 'fulfilled':
        return <Badge><CheckCircle className="w-3 h-3 mr-1" />Fulfilled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = stockRequests.filter(request => {
    const product = products.find(p => p.id === request.productId);
    const shop = shops.find(s => s.id === request.shopId);
    const warehouse = warehouses.find(w => w.id === request.warehouseId);
    
    const searchLower = searchTerm.toLowerCase();
    return (
      product?.name.toLowerCase().includes(searchLower) ||
      shop?.name.toLowerCase().includes(searchLower) ||
      warehouse?.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Shop Management</h1>
          <p className="text-muted-foreground">Manage retail locations and stock requests</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Request Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Stock Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Shop</Label>
                  <Select value={requestForm.shopId} onValueChange={(value) => setRequestForm(prev => ({ ...prev, shopId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shop" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name} - {shop.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Warehouse</Label>
                  <Select value={requestForm.warehouseId} onValueChange={(value) => setRequestForm(prev => ({ ...prev, warehouseId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name} - {warehouse.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Product</Label>
                  <Select value={requestForm.productId} onValueChange={(value) => setRequestForm(prev => ({ ...prev, productId: value }))}>
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
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={requestForm.quantity}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Enter quantity needed"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={requestForm.notes}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or urgency"
                  />
                </div>
                <Button onClick={handleCreateRequest} className="w-full">
                  Create Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddShop} onOpenChange={setShowAddShop}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Shop
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Shop</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label>Shop Name</Label>
                    <Input
                      value={shopForm.name}
                      onChange={(e) => setShopForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter shop name"
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={shopForm.location}
                      onChange={(e) => setShopForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <Label>Connected Warehouses</Label>
                    <Select onValueChange={(value) => {
                      if (!shopForm.warehouseIds.includes(value)) {
                        setShopForm(prev => ({ 
                          ...prev, 
                          warehouseIds: [...prev.warehouseIds, value] 
                        }));
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {shopForm.warehouseIds.map((warehouseId) => {
                        const warehouse = warehouses.find(w => w.id === warehouseId);
                        return (
                          <Badge 
                            key={warehouseId} 
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setShopForm(prev => ({
                              ...prev,
                              warehouseIds: prev.warehouseIds.filter(id => id !== warehouseId)
                            }))}
                          >
                            {warehouse?.name} ×
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Auto Request Threshold</Label>
                    <Input
                      type="number"
                      value={shopForm.autoRequestThreshold}
                      onChange={(e) => setShopForm(prev => ({ ...prev, autoRequestThreshold: e.target.value }))}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <Label>Default Tax Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={shopForm.defaultTaxRate}
                      onChange={(e) => setShopForm(prev => ({ ...prev, defaultTaxRate: e.target.value }))}
                      placeholder="8.25"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowNegativeStock"
                      checked={shopForm.allowNegativeStock}
                      onChange={(e) => setShopForm(prev => ({ ...prev, allowNegativeStock: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="allowNegativeStock">Allow Negative Stock</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddShop(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddShop}>
                  Add Shop
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="shops" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shops">Shops</TabsTrigger>
          <TabsTrigger value="requests">Stock Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="shops" className="space-y-6">
          {/* Shops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map((shop) => {
              const shopRequests = stockRequests.filter(r => r.shopId === shop.id);
              const pendingRequests = shopRequests.filter(r => r.status === 'pending').length;

              return (
                <Card key={shop.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{shop.name}</CardTitle>
                      <Store className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {shop.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Connected Warehouses:</span>
                        <span>{shop.warehouseIds.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pending Requests:</span>
                        <Badge variant={pendingRequests > 0 ? "destructive" : "secondary"}>
                          {pendingRequests}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax Rate:</span>
                        <span>{shop.settings.defaultTaxRate}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Auto Request:</span>
                        <span>At {shop.settings.autoRequestThreshold} units</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageSquare className="mr-2 h-3 w-3" />
                        Chat
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="secondary">
              {filteredRequests.length} requests
            </Badge>
          </div>

          {/* Stock Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Requests</CardTitle>
              <CardDescription>Manage product transfer requests between shops and warehouses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const shop = shops.find(s => s.id === request.shopId);
                    const warehouse = warehouses.find(w => w.id === request.warehouseId);
                    const product = products.find(p => p.id === request.productId);

                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="text-sm">{shop?.name}</div>
                            <div className="text-xs text-muted-foreground">{shop?.location}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{warehouse?.name}</div>
                            <div className="text-xs text-muted-foreground">{warehouse?.location}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{product?.name}</div>
                            <div className="text-xs text-muted-foreground">{product?.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell>{request.requestedQuantity}</TableCell>
                        <TableCell>{request.approvedQuantity || '-'}</TableCell>
                        <TableCell>{getRequestStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-sm">
                          {request.createdAt.toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && user?.role === 'warehouse_manager' && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleRequestAction(request.id, 'approve')}
                                className="h-8"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRequestAction(request.id, 'decline')}
                                className="h-8"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Decline
                              </Button>
                            </div>
                          )}
                          {request.status !== 'pending' && (
                            <Button size="sm" variant="ghost" className="h-8">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Chat
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}