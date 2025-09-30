/**
 * API Debug Utilities
 * Helper functions to debug API calls and environment configuration
 */

import { API_CONFIG, getApiUrl } from '../config/api';

/**
 * Log current API configuration to console
 */
export const logApiConfig = () => {
  console.group('🔧 API Configuration Debug');
  console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
  console.log('Login URL:', getApiUrl(API_CONFIG.ENDPOINTS.LOGIN));
  console.log('Warehouses URL:', getApiUrl(API_CONFIG.ENDPOINTS.WAREHOUSES));
  console.log('Full API Config:', API_CONFIG);
  console.groupEnd();
};

/**
 * Log fetch request details
 */
export const logApiRequest = (url: string, options: RequestInit) => {
  console.group('📡 API Request');
  console.log('URL:', url);
  console.log('Method:', options.method || 'GET');
  console.log('Headers:', options.headers);
  console.log('Body:', options.body);
  console.groupEnd();
};

/**
 * Log fetch response details
 */
export const logApiResponse = async (response: Response, data?: any) => {
  console.group('📥 API Response');
  console.log('Status:', response.status, response.statusText);
  console.log('OK:', response.ok);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));
  if (data) {
    console.log('Data:', data);
  }
  console.groupEnd();
};



