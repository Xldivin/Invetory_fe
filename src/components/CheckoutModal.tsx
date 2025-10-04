import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Calculator,
  Receipt,
  X
} from 'lucide-react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { toast } from 'sonner';
import { InvoiceItem } from '../types';
import { ApiCustomer } from '../services/customers';
import { createOrder, CreateOrderRequest } from '../services/orders';
import { useAuth } from '../contexts/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: InvoiceItem[];
  selectedCustomer: ApiCustomer | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  onCompleteSale: (paymentData: any) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  selectedCustomer,
  subtotal,
  taxAmount,
  discountAmount,
  total,
  onCompleteSale
}: CheckoutModalProps) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'bank'>('card');
  const [amountReceived, setAmountReceived] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [change, setChange] = useState(0);

  // Calculate change for cash payments
  const calculateChange = () => {
    const received = parseFloat(amountReceived) || 0;
    const changeAmount = received - total;
    setChange(Math.max(0, changeAmount));
    return changeAmount >= 0;
  };

  // Convert cart items to order items
  const convertToOrderItems = (items: InvoiceItem[]): CreateOrderRequest['items'] => {
    return items.map(item => ({
      product_id: parseInt(item.productId) || 0,
      quantity: item.quantity,
      unit_price: item.unitPrice
    }));
  };

  // Create order after successful payment
  const createOrderFromPayment = async (paymentData: any) => {
    // For walk-in customers, we'll use a default customer ID or handle it differently
    const customerId = selectedCustomer?.user_id || 1; // Default customer ID for walk-in customers

    // Validate that we have items to order
    if (!cartItems || cartItems.length === 0) {
      throw new Error('No items in cart to create order');
    }

    // Validate user and role
    if (!user) {
      throw new Error('User not authenticated');
    }

    const orderItems = convertToOrderItems(cartItems);
    
    // Validate order items
    if (orderItems.some(item => item.product_id === 0)) {
      throw new Error('Invalid product ID in cart items');
    }

    // Determine required fields based on user role
    let shopId: number | undefined;
    let warehouseId: number | undefined;

    if (user.role === 'shop_manager') {
      if (!user.shop_id) {
        throw new Error('Shop ID is required for shop manager but not found in user profile');
      }
      shopId = user.shop_id;
      console.log('Shop manager creating order for shop:', shopId);
    } else if (user.role === 'warehouse_manager') {
      if (!user.warehouse_id) {
        throw new Error('Warehouse ID is required for warehouse manager but not found in user profile');
      }
      warehouseId = user.warehouse_id;
      console.log('Warehouse manager creating order for warehouse:', warehouseId);
    } else {
      // For other roles (admin, tenant_admin, etc.), use both if available
      shopId = user.shop_id || undefined;
      warehouseId = user.warehouse_id || undefined;
      console.log('Admin/other role creating order with shop:', shopId, 'warehouse:', warehouseId);
    }

    // Validate that at least one ID is present
    if (!shopId && !warehouseId) {
      throw new Error('Either shop_id or warehouse_id is required based on user role');
    }

    const orderData: CreateOrderRequest = {
      customer_id: customerId,
      ...(shopId && { shop_id: shopId }),
      ...(warehouseId && { warehouse_id: warehouseId }),
      items: orderItems
    };

    console.log('Creating order with data:', orderData);
    console.log('User role:', user.role);
    console.log('User shop_id:', user.shop_id);
    console.log('User warehouse_id:', user.warehouse_id);
    console.log('Order items (simplified API format):', orderItems);
    console.log('Customer ID:', customerId);
    console.log('Cart items:', cartItems);
    
    return await createOrder(orderData);
  };

  // Get payment options based on method
  const getPaymentOptions = (method: string) => {
    switch (method) {
      case 'flutterwave':
        return "card,ussd,banktransfer,mpesa,mobilemoneyrw,mobilemoneygh,mobilemoneyuganda,mobilemoneyzambia";
      case 'mobile':
        return "mobilemoneyrw,mobilemoneygh,mobilemoneyuganda,mobilemoneyzambia";
      case 'bank':
        return "ussd,banktransfer";
      default:
        return "card,ussd,banktransfer,mpesa,mobilemoneyrw,mobilemoneygh,mobilemoneyuganda,mobilemoneyzambia";
    }
  };

  // Get Flutterwave public key from environment or use test key
  const flutterwavePublicKey = (import.meta as any).env?.VITE_FLUTTERWAVE_PUBLIC_KEY || "FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxx-X";

  // Helper function to generate unique transaction reference
  const generateTxRef = () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const txRef = `pos-${timestamp}-${random}`;
    console.log('Generated tx_ref:', txRef);
    return txRef;
  };

  // Create base config (will be updated dynamically)
  const baseFlutterwaveConfig = {
    public_key: flutterwavePublicKey,
    tx_ref: generateTxRef(), // Ensure tx_ref is always present
    amount: Math.round((total || 0) * 100) / 100,
    currency: "RWF",
    payment_options: getPaymentOptions(paymentMethod),
    customer: {
      email: selectedCustomer?.email || 'pos-customer@example.com',
      phone_number: selectedCustomer?.phone_number || '+250000000000',
      name: selectedCustomer?.full_name || 'Walk-in Customer',
    },
    meta: {
      customer_id: selectedCustomer?.user_id?.toString() || 'walk-in',
      pos_sale: true,
    },
    customizations: {
      title: "POS Sale Payment",
      description: `Payment for ${cartItems.length} item(s) - POS Sale`,
      logo: "https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/flutter.svg",
    },
  };

  const [flutterwaveConfig, setFlutterwaveConfig] = useState(baseFlutterwaveConfig);
  const handleFlutterPayment = useFlutterwave(flutterwaveConfig);

  // Update config when props change
  useEffect(() => {
    const updatedConfig = {
      ...baseFlutterwaveConfig,
      tx_ref: generateTxRef(), // Fresh tx_ref
      amount: Math.round((total || 0) * 100) / 100,
    };
    setFlutterwaveConfig(updatedConfig);
  }, [total, selectedCustomer, cartItems.length, paymentMethod]);

  const handleCashPayment = async () => {
    if (!calculateChange()) {
      toast.error('Insufficient amount received');
      return;
    }

    setIsProcessingPayment(true);
    
    try {
      const paymentData = {
        method: 'cash',
        amount: total,
        amountReceived: parseFloat(amountReceived),
        change: change,
        transactionId: `CASH-${Date.now()}`
      };

      // Create order for cash payment
      const order = await createOrderFromPayment(paymentData);
      console.log('Order created for cash payment:', order);
      
      onCompleteSale({
        ...paymentData,
        orderId: order.id,
        orderNumber: order.order_number
      });
      
      toast.success(`Cash payment completed! Order #${order.order_number} created.`);
      setIsProcessingPayment(false);
      onClose();
    } catch (error) {
      console.error('Error processing cash payment:', error);
      toast.error('Payment successful but order creation failed. Please contact support.');
      setIsProcessingPayment(false);
    }
  };

const handleOnlinePayment = () => {
  if (!total || total <= 0) {
    toast.error("Invalid amount. Please check your cart.");
    return;
  }

  const validAmount = Math.round((total || 0) * 100) / 100;
  if (validAmount < 0.01) {
    toast.error("Amount must be at least 0.01 RWF");
    return;
  }

  const txRef = generateTxRef();

  const freshConfig = {
    ...baseFlutterwaveConfig,
    tx_ref: txRef,
    amount: validAmount,
  };

  console.log("Using fresh Flutterwave config:", freshConfig);

  // ✅ Temporarily close the Dialog first so the overlay disappears
  onClose();

  // Delay slightly to allow the dialog overlay to unmount
  setTimeout(() => {
    const startPayment = useFlutterwave(freshConfig);

    startPayment({
      callback: async (response) => {
        console.log("Flutterwave response:", response);

        if (response.status === "successful") {
          setIsProcessingPayment(true);
          try {
            const paymentData = {
              method: paymentMethod,
              amount: total,
              transactionId: response.transaction_id,
              flutterwaveResponse: response,
            };

             console.log("Creating order after successful payment...");
             const order = await createOrderFromPayment(paymentData);
             console.log("Order created successfully:", order);
             
             toast.success(
               `Payment successful! Order #${order.order_number} created.`
             );
             onCompleteSale({
               ...paymentData,
               orderId: order.order_id,
               orderNumber: order.order_number,
             });
           } catch (error) {
             console.error("Error creating order:", error);
             console.error("Error details:", error.message || error);
             
             // Still complete the sale even if order creation fails
             toast.error(`Payment successful but order creation failed: ${error.message || 'Unknown error'}`);
             
             // Complete the sale with payment data but without order info
             onCompleteSale({
               ...paymentData,
               orderId: null,
               orderNumber: null,
               orderError: error.message || 'Order creation failed'
             });
           } finally {
             setIsProcessingPayment(false);
           }
        } else {
          toast.error(`Payment failed: ${response.status}`);
        }
      },
      onClose: () => {
        console.log("Flutterwave modal closed");
        setIsProcessingPayment(false);
      },
    });
  }, 300);
};



  const handlePayment = () => {
    if (paymentMethod === 'cash') {
      handleCashPayment();
    } else {
      handleOnlinePayment();
    }
  };

  const canProcessPayment = () => {
    if (paymentMethod === 'cash') {
      return calculateChange();
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto" 
        aria-describedby="checkout-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Complete Sale - Payment
          </DialogTitle>
          <DialogDescription id="checkout-description">
            Review your order and select a payment method to complete the sale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Customer:</span>
                  <span className="font-medium">
                    {selectedCustomer?.full_name || 'Walk-in Customer'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Items:</span>
                  <span>{cartItems.length} item(s)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{subtotal.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{taxAmount.toLocaleString()} RWF</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{total.toLocaleString()} RWF</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!canProcessPayment() || isProcessingPayment}
              className="flex-1"
            >
              {isProcessingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4 mr-2" />
                  Complete Sale
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
