import { getApiUrl, getCommonHeaders, getAuthToken, getTenantId, API_CONFIG } from '../config/api';

export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateOrderRequest {
  customer_id: number;
  shop_id?: number;
  warehouse_id?: number;
  items: OrderItem[];
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    customer_id: number;
    shop_id: number;
    tenant_id: number;
    order_number: string;
    order_date: string;
    status: string;
    payment_status: string;
    subtotal: string;
    tax_amount: string;
    discount_amount: string;
    shipping_amount: string;
    total_amount: string;
    updated_at: string;
    created_at: string;
    order_id: number;
    customer: any;
    shop: any;
    warehouse: any;
    items: any[];
  };
  tenant: {
    id: number;
    name: string;
    code: string;
  };
}

/**
 * Create a new order
 */
export const createOrder = async (orderData: CreateOrderRequest): Promise<CreateOrderResponse['data']> => {
  try {
    const token = getAuthToken();
    const tenantId = getTenantId();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = getApiUrl('/orders');
    const headers = getCommonHeaders(token, tenantId);

    console.log('=== CREATE ORDER API DEBUG ===');
    console.log('Request URL:', url);
    console.log('Request Headers:', headers);
    console.log('Request Payload:', orderData);
    console.log('Token:', token);
    console.log('Tenant ID:', tenantId);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const data: CreateOrderResponse = await response.json();
    console.log('Response Data:', data);

    if (response.ok && data.success) {
      console.log('Order created successfully:', data.data);
      return data.data;
    } else {
      console.error('Failed to create order:', data.message);
      console.error('Response status:', response.status);
      console.error('Response data:', data);
      throw new Error(data.message || `Failed to create order. Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};


