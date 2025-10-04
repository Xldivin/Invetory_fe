import { getApiUrl, getCommonHeaders, getAuthToken, getTenantId, API_CONFIG } from '../config/api';

export interface Customer {
  user_id: number;
  tenant_id: number;
  full_name: string;
  email: string;
  email_verified_at?: string | null;
  phone_number?: string;
  address?: string;
  role: string;
  warehouse_id?: number | null;
  shop_id?: number | null;
  is_active: boolean;
  last_login?: string;
  profile_image_url?: string | null;
  date_of_birth?: string;
  gender?: string;
  emergency_contact?: string;
  salary?: number | null;
  hire_date?: string | null;
  permissions: string[];
  access_level: string;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
  customer_profile?: any | null;
  orders: any[];
}

export interface CreateCustomerRequest {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number: string;
}

export interface CreateCustomerResponse {
  success: boolean;
  data: Customer | { customer: Customer };
  message?: string;
}

export interface GetCustomersResponse {
  success: boolean;
  data: Customer[];
  message?: string;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
  tenant?: {
    id: number;
    name: string;
    code: string;
  };
}

/**
 * Generate a random password for new customers
 */
export const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

/**
 * Get all customers
 */
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const token = getAuthToken();
    const tenantId = getTenantId();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = getApiUrl('/customers');
    const headers = getCommonHeaders(token, tenantId);

    console.log('=== GET CUSTOMERS API DEBUG ===');
    console.log('Request URL:', url);
    console.log('Request Headers:', headers);

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const data: GetCustomersResponse = await response.json();
    console.log('Response Data:', data);

    if (response.ok && data.success) {
      return data.data;
    } else {
      console.error('Failed to fetch customers:', data.message);
      throw new Error(data.message || 'Failed to fetch customers');
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Create a new customer
 */
export const createCustomer = async (customerData: {
  full_name: string;
  email: string;
  phone_number: string;
}): Promise<Customer> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Generate random password
    const password = generateRandomPassword();
    
    const payload: CreateCustomerRequest = {
      full_name: customerData.full_name,
      email: customerData.email,
      password: password,
      password_confirmation: password,
      phone_number: customerData.phone_number
    };

    const url = getApiUrl('/customers');
    const headers = getCommonHeaders(token, getTenantId());

    console.log('=== CREATE CUSTOMER API DEBUG ===');
    console.log('Request URL:', url);
    console.log('Request Headers:', headers);
    console.log('Request Payload:', payload);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Raw Response Data:', data);
    console.log('Response Data Type:', typeof data);
    console.log('Data Structure:', {
      hasSuccess: 'success' in data,
      hasData: 'data' in data,
      dataType: typeof data.data,
      dataIsArray: Array.isArray(data.data),
      dataKeys: data.data ? Object.keys(data.data) : 'no data'
    });

    if (response.ok && data.success) {
      // Handle different response structures
      let customer: Customer;
      
      if (Array.isArray(data.data)) {
        // If data is an array, take the first item
        customer = data.data[0];
        console.log('Extracted from array:', customer);
      } else if (typeof data.data === 'object' && data.data !== null) {
        if ('customer' in data.data) {
          // If data has a customer property
          customer = data.data.customer;
          console.log('Extracted from customer property:', customer);
        } else {
          // If data is directly the customer object
          customer = data.data as Customer;
          console.log('Using data directly as customer:', customer);
        }
      } else {
        console.error('Unexpected data structure:', data.data);
        throw new Error('Unexpected response structure from server');
      }
      
      console.log('Final extracted customer:', customer);
      return customer;
    } else {
      console.error('Failed to create customer:', data.message);
      throw new Error(data.message || 'Failed to create customer');
    }
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};
