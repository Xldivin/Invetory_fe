/**
 * API Configuration
 * Centralized configuration for all API calls
 */

// Get API URL from environment variables with fallback
const getBaseApiUrl = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  
  if (envApiUrl) {
    return envApiUrl;
  }
  
  // Fallback to localhost with /api if environment variable is not set
  return 'https://seba.hanohost.net/api';
  
};

export const API_CONFIG = {
  BASE_URL: getBaseApiUrl(),
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGIN_PIN: '/auth/login-pin', 
    LOGOUT: '/auth/logout',
    
    // Product endpoints
    PRODUCTS: '/products',
    PRODUCTS_STATS: '/products/stats',
    
    // Category endpoints
    CATEGORIES: '/categories',
    CATEGORIES_ROOTS: '/categories/roots',
    
    // Supplier endpoints
    SUPPLIERS: '/suppliers',
    
    // Warehouse endpoints
    WAREHOUSES: '/warehouses',

    // Users endpoints
    USERS: '/users',
    
    // Tenants endpoints
    TENANTS: '/tenants',
    PERMISSIONS_CATALOG: '/permissions-catalog',
  }
};

/**
 * Get full API URL for an endpoint
 * @param endpoint - The endpoint path
 * @returns Full URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Common headers for API requests
 * @param token - Optional authorization token
 * @param tenantId - Optional tenant ID
 * @returns Headers object
 */
export const getCommonHeaders = (token?: string, tenantId?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (tenantId) {
    headers['X-Tenant-ID'] = String(tenantId);
  }
  
  return headers;
};

/**
 * Get tenant ID from environment or localStorage
 * @returns Tenant ID or empty string
 */
export const getTenantId = (): string => {
  const envTenantId = import.meta.env.VITE_TENANT_ID;
  const storedTenantId = localStorage.getItem('tenantId') || localStorage.getItem('tenant_id');
  return envTenantId || storedTenantId || '';
};

/**
 * Get authentication token from localStorage
 * @returns Token or empty string
 */
export const getAuthToken = (): string => {
  return localStorage.getItem('sessionToken') || '';
};
