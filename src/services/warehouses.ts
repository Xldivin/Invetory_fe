import { API_CONFIG, getApiUrl, getAuthToken, getCommonHeaders, getTenantId } from '../config/api';
import { Warehouse } from '../types';

export interface WarehouseCreatePayload {
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone_number?: string;
  email?: string;
  manager_id?: number;
  capacity?: number;
  warehouse_type?: string;
  operating_hours?: string;
  temperature_controlled?: boolean;
  security_level?: string;
}

type WarehouseApi = {
  id: number | string;
  name: string;
  code?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone_number?: string;
  email?: string;
  manager_id?: number | string;
  capacity?: number;
  warehouse_type?: string;
  operating_hours?: string;
  temperature_controlled?: boolean;
  security_level?: string;
  created_at?: string;
  updated_at?: string;
};

const mapApiToWarehouse = (api: WarehouseApi): Warehouse => {
  return {
    id: String(api.id),
    name: api.name,
    code: api.code,
    address: api.address,
    city: api.city,
    state: api.state,
    postal_code: api.postal_code,
    country: api.country,
    phone_number: api.phone_number,
    email: api.email,
    managerId: api.manager_id ? String(api.manager_id) : '',
    capacity: typeof api.capacity === 'number' ? api.capacity : 0,
    warehouse_type: api.warehouse_type,
    operating_hours: api.operating_hours,
    temperature_controlled: api.temperature_controlled,
    security_level: api.security_level,
    createdAt: api.created_at ? new Date(api.created_at) : new Date(),
  };
};

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.WAREHOUSES);
  const token = getAuthToken();
  const tenantId = getTenantId();
  const res = await fetch(url, {
    method: 'GET',
    headers: getCommonHeaders(token, tenantId)
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch warehouses: ${res.status}`);
  }
  const data = await res.json();
  const list: WarehouseApi[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return list.map(mapApiToWarehouse);
}

export async function createWarehouse(payload: WarehouseCreatePayload): Promise<Warehouse> {
  const url = getApiUrl(API_CONFIG.ENDPOINTS.WAREHOUSES);
  const token = getAuthToken();
  const tenantId = getTenantId();
  const res = await fetch(url, {
    method: 'POST',
    headers: getCommonHeaders(token, tenantId),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Failed to create warehouse: ${res.status} ${errText}`);
  }
  const data = await res.json();
  const api: WarehouseApi = data?.data || data;
  return mapApiToWarehouse(api);
}















