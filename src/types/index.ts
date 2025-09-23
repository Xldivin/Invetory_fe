// User and Role Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pin?: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export type UserRole = 'super_admin' | 'admin' | 'warehouse_manager' | 'shop_manager' | 'custom';

export interface CustomRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

// Warehouse Types
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  managerId: string;
  capacity: number;
  description?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  categoryId: string;
  tags: string[];
  price: number;
  cost: number;
  minStock: number;
  maxStock: number;
  unit: string;
  barcode?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductStock {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  lastUpdated: Date;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  icon?: string;
  children?: Category[];
}

// Shop Types
export interface Shop {
  id: string;
  name: string;
  location: string;
  managerId: string;
  warehouseIds: string[];
  settings: ShopSettings;
  createdAt: Date;
}

export interface ShopSettings {
  allowNegativeStock: boolean;
  autoRequestThreshold: number;
  defaultTaxRate: number;
  receiptTemplate: string;
}

export interface StockRequest {
  id: string;
  shopId: string;
  warehouseId: string;
  productId: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  status: 'pending' | 'approved' | 'declined' | 'fulfilled';
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sales Types
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalPurchases: number;
  lastPurchase?: Date;
  loyaltyPoints: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  shopId: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital' | 'credit';
  status: 'draft' | 'paid' | 'cancelled' | 'refunded';
  createdBy: string;
  createdAt: Date;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

// Events and Notifications
export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'notice' | 'alert' | 'reminder' | 'meeting';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate: Date;
  endDate?: Date;
  createdBy: string;
  targetRoles: UserRole[];
  isActive: boolean;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Expenses
export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  parentId?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: Date;
  receipt?: string;
  notes?: string;
  createdBy: string;
  shopId?: string;
  warehouseId?: string;
  createdAt: Date;
}

// Tax Types
export interface TaxEntry {
  id: string;
  period: string;
  sales: number;
  expenses: number;
  taxableIncome: number;
  taxRate: number;
  taxAmount: number;
  status: 'draft' | 'calculated' | 'filed';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Incident Reports
export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'damage' | 'theft' | 'safety' | 'system' | 'other';
  location: string;
  reportedBy: string;
  assignedTo?: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Activity Log
export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityId?: string;
  entityType?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  message: string;
  attachments?: string[];
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  title: string;
  lastMessage?: ChatMessage;
  createdAt: Date;
  updatedAt: Date;
}

// Sync Types
export interface SyncStatus {
  lastSync: Date;
  pendingChanges: number;
  isOnline: boolean;
  syncInProgress: boolean;
}

export interface PendingChange {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: Date;
}