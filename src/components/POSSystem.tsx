import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  User, 
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  Calculator,
  Package
} from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';
import { Customer, InvoiceItem } from '../types';

export function POSSystem() {
  const { products, customers, addCustomer, addInvoice } = useInventory();
  const { user, logActivity } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital' | 'credit'>('cash');
  const [discount, setDiscount] = useState(0);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cartItems.find(item => item.productId === productId);
    
    if (existingItem) {
      setCartItems(prev => prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
        total: product.price
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, quantity, total: quantity * item.unitPrice }
        : item
    ));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxRate = 8.25; // Default tax rate
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim()) return;
    
    addCustomer({
      name: newCustomer.name,
      email: newCustomer.email || undefined,
      phone: newCustomer.phone || undefined,
      address: newCustomer.address || undefined
    });
    
    setNewCustomer({ name: '', email: '', phone: '', address: '' });
    setShowNewCustomer(false);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    addInvoice({
      customerId: selectedCustomer?.id,
      shopId: '1', // Current shop
      items: cartItems,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      paymentMethod,
      status: 'paid',
      createdBy: user?.id || ''
    });

    logActivity('sale_completed', 'pos', {
      total,
      itemCount: cartItems.length,
      customer: selectedCustomer?.name || 'Walk-in'
    });

    // Clear cart and reset
    clearCart();
    setSelectedCustomer(null);
    setDiscount(0);
    setShowCheckout(false);
  };

  return (
    <div className="h-full p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(product.id)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm truncate mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{product.sku}</p>
                  <div className="flex items-center justify-between">
                    <span>{product.price.toLocaleString()} RWF</span>
                    <Button size="sm" variant="secondary">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cart and Checkout Section */}
        <div className="space-y-4">
          {/* Customer Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select onValueChange={(value) => {
                const customer = customers.find(c => c.id === value);
                setSelectedCustomer(customer || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    Add New Customer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customerName">Name</Label>
                      <Input
                        id="customerName"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">Phone</Label>
                      <Input
                        id="customerPhone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1-555-0123"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerAddress">Address</Label>
                      <Input
                        id="customerAddress"
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="123 Main St, City, State"
                      />
                    </div>
                    <Button onClick={handleAddCustomer} className="w-full">
                      Add Customer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Cart ({cartItems.length})</CardTitle>
                {cartItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Cart is empty</p>
                  <p className="text-sm">Add products to get started</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.unitPrice.toLocaleString()} RWF each
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-sm text-right min-w-0">
                        {item.total.toLocaleString()} RWF
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals and Checkout */}
          {cartItems.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{subtotal.toLocaleString()} RWF</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount ({discount}%):</span>
                      <span>-{discountAmount.toLocaleString()} RWF</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax ({taxRate}%):</span>
                    <span>{taxAmount.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Total:</span>
                    <span>{total.toLocaleString()} RWF</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Discount %</Label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('cash')}
                      className="h-12"
                    >
                      <Banknote className="w-4 h-4 mr-2" />
                      Cash
                    </Button>
                    <Button
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('card')}
                      className="h-12"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Card
                    </Button>
                    <Button
                      variant={paymentMethod === 'digital' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('digital')}
                      className="h-12"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Digital
                    </Button>
                    <Button
                      variant={paymentMethod === 'credit' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('credit')}
                      className="h-12"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Credit
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full h-12"
                  size="lg"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Complete Sale
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}