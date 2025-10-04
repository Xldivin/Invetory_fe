import * as React from "react";
import { useEffect, useState } from 'react';
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
import { InvoiceItem } from '../types';
import { getApiUrl, getCommonHeaders, getAuthToken, getTenantId, API_CONFIG } from '../config/api';
import { getCustomers, createCustomer, Customer as ApiCustomer } from '../services/customers';
import { CheckoutModal } from './CheckoutModal';
import { toast } from 'sonner';

export function POSSystem() {
  const { products, addInvoice } = useInventory();
  const { user, logActivity } = useAuth();

  // Validate user has required fields for their role
  const validateUserRole = () => {
    if (!user) {
      return { isValid: false, error: 'User not authenticated' };
    }

    if (user.role === 'shop_manager' && !user.shop_id) {
      return { isValid: false, error: 'Shop ID is required for shop manager but not found in user profile' };
    }

    if (user.role === 'warehouse_manager' && !user.warehouse_id) {
      return { isValid: false, error: 'Warehouse ID is required for warehouse manager but not found in user profile' };
    }

    if (user.role !== 'shop_manager' && user.role !== 'warehouse_manager' && !user.shop_id && !user.warehouse_id) {
      return { isValid: false, error: 'Either shop_id or warehouse_id is required for order creation' };
    }

    return { isValid: true, error: null };
  };
  
  // API products state
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // API customers state
  const [apiCustomers, setApiCustomers] = useState<ApiCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ApiCustomer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital' | 'credit'>('cash');
  const [discount, setDiscount] = useState(0);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Load customers from API
  const loadCustomers = async () => {
    setCustomersLoading(true);
    setError(null);
    try {
      const customersData = await getCustomers();
      setApiCustomers(customersData);
      console.log('Loaded customers:', customersData);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers');
    } finally {
      setCustomersLoading(false);
    }
  };

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getAuthToken();
        const tenantId = getTenantId();

        console.log('🛒 POS: Fetching products from:', getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS));

        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS), {
          headers: getCommonHeaders(token, tenantId)
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const json = await response.json();
        console.log('🛒 POS: Products response:', json);
        
        if (json && json.success && Array.isArray(json.data)) {
          setApiProducts(json.data);
        } else {
          console.warn('🛒 POS: Unexpected response format:', json);
          setApiProducts([]);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load products');
        console.error('🛒 POS: Failed to load products:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Use API products if available, fallback to context products
  const allProducts = apiProducts.length > 0 ? apiProducts : products;
  
  const filteredProducts = allProducts.filter(product =>
    (product.name || product.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.sku || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (productId: string) => {
    // Look for product in API products first, then fallback to context products
    const product = allProducts.find(p => 
      (p.id === productId) || 
      (p.product_id && String(p.product_id) === productId)
    );
    if (!product) return;
    
    // Debug logging for price information
    console.log('Adding product to cart:', {
      productId,
      productName: product.name || product.product_name,
      costPrice: product.cost_price,
      price: product.price,
      retailPrice: product.retail_price,
      finalPrice: product.cost_price || product.price || product.retail_price || 0
    });

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
        productId: product.id || String(product.product_id),
        productName: product.name || product.product_name,
        quantity: 1,
        unitPrice: product.cost_price || product.price || product.retail_price || 0,
        discount: 0,
        total: product.cost_price || product.price || product.retail_price || 0
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

  // Debug logging for totals
  console.log('Cart totals calculation:', {
    cartItems: cartItems.length,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    cartItemsDetails: cartItems.map(item => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total
    }))
  });

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.email.trim()) {
      setError('Name and email are required');
      return;
    }
    
    setCustomersLoading(true);
    setError(null);
    
    try {
      const createdCustomer = await createCustomer({
        full_name: newCustomer.name,
        email: newCustomer.email,
        phone_number: newCustomer.phone || ''
      });
      
      console.log('Customer created successfully:', createdCustomer);
      
      if (createdCustomer) {
        // Add to local state
        setApiCustomers(prev => [...prev, createdCustomer]);
      }
      
      // Reset form and close dialog
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
      setShowNewCustomer(false);
      
      // Refresh the customers list to ensure we have the latest data
      loadCustomers();
    } catch (err) {
      console.error('Error creating customer:', err);
      setError('Failed to create customer');
    } finally {
      setCustomersLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    // Validate user role before proceeding
    const validation = validateUserRole();
    if (!validation.isValid) {
      toast.error(validation.error);
      console.error('User role validation failed:', validation.error);
      return;
    }

    setShowCheckoutModal(true);
  };

  const handleCompleteSale = (paymentData: any) => {
    // Process the sale with payment data
    addInvoice({
      customerId: selectedCustomer?.user_id?.toString(),
      shopId: '1', // Current shop
      items: cartItems,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      paymentMethod: paymentData.method,
      status: 'paid',
      createdBy: user?.id || '',
      ...(paymentData.transactionId && { transactionId: paymentData.transactionId }),
      ...(paymentData && { paymentData: paymentData })
    });

    logActivity('sale_completed', 'pos', {
      total,
      itemCount: cartItems.length,
      customer: selectedCustomer?.full_name || 'Walk-in',
      paymentMethod: paymentData.method,
      transactionId: paymentData.transactionId,
      orderId: paymentData.orderId,
      orderNumber: paymentData.orderNumber
    });

    // Show success message with order details
    if (paymentData.orderNumber) {
      toast.success(`Sale completed! Order #${paymentData.orderNumber} created.`);
    }

    // Clear cart and reset
    clearCart();
    setSelectedCustomer(null);
    setDiscount(0);
    setShowCheckoutModal(false);
  };

  return (
    <div className="h-full p-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Data source indicator */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {apiProducts.length > 0 
                  ? `📡 API Products (${apiProducts.length})` 
                  : `💾 Local Products (${products.length})`
                }
              </span>
              {filteredProducts.length !== allProducts.length && (
                <span>Showing {filteredProducts.length} of {allProducts.length}</span>
              )}
            </div>
          </div>

          {/* Loading/Error States */}
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2 animate-pulse" />
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Package className="w-12 h-12 text-destructive mx-auto mb-2" />
                <p className="text-destructive mb-2">Failed to load products</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => {
                  const productId = product.id || String(product.product_id);
                  const productName = product.name || product.product_name;
                  const productSku = product.sku || product.product_sku || 'No SKU';
                  const productPrice = product.cost_price || product.price || product.retail_price || 0;
                  
                  return (
                    <Card 
                      key={productId} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addToCart(productId)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm truncate mb-1" title={productName}>
                          {productName}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">{productSku}</p>
                        <div className="flex items-center justify-between">
                          <span>{productPrice.toLocaleString()} RWF</span>
                          <Button size="sm" variant="secondary">
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full flex items-center justify-center p-8">
                  <div className="text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No products found</p>
                    {searchTerm && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search term
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart and Checkout Section */}
        <div className="space-y-4">
          {/* Customer Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select onValueChange={(value: string) => {
                const customer = apiCustomers.find(c => c.user_id.toString() === value);
                setSelectedCustomer(customer || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={customersLoading ? "Loading customers..." : "Select customer"} />
                </SelectTrigger>
                <SelectContent>
                  {apiCustomers.map((customer) => (
                    <SelectItem key={customer.user_id} value={customer.user_id.toString()}>
                      {customer.full_name}
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
                    {error && (
                      <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="customerName">Name *</Label>
                      <Input
                        id="customerName"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Customer name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                        required
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
                    <Button 
                      onClick={handleAddCustomer} 
                      className="w-full" 
                      disabled={customersLoading}
                    >
                      {customersLoading ? 'Creating...' : 'Add Customer'}
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
          {cartItems.length > 0 ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{subtotal.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax ({taxRate}%):</span>
                    <span>{taxAmount.toLocaleString()} RWF</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total:</span>
                    <span className="text-lg">{total.toLocaleString()} RWF</span>
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
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Add items to cart to see totals</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cartItems={cartItems}
        selectedCustomer={selectedCustomer}
        subtotal={subtotal}
        taxAmount={taxAmount}
        discountAmount={discountAmount}
        total={total}
        onCompleteSale={handleCompleteSale}
      />
    </div>
  );
}