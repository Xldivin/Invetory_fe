import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  Warehouse, 
  Shop, 
  ProductStock, 
  Category, 
  Customer, 
  Invoice,
  StockRequest,
  SyncStatus
} from '../types';

interface InventoryContextType {
  // Products
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Warehouses
  warehouses: Warehouse[];
  addWarehouse: (warehouse: Omit<Warehouse, 'id' | 'createdAt'>) => void;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  
  // Shops
  shops: Shop[];
  addShop: (shop: Omit<Shop, 'id' | 'createdAt'>) => void;
  updateShop: (id: string, updates: Partial<Shop>) => void;
  
  // Stock
  stock: ProductStock[];
  updateStock: (warehouseId: string, productId: string, quantity: number) => void;
  getStock: (warehouseId: string, productId: string) => ProductStock | undefined;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'totalPurchases' | 'loyaltyPoints'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  
  // Invoices
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => void;
  
  // Stock Requests
  stockRequests: StockRequest[];
  createStockRequest: (request: Omit<StockRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateStockRequest: (id: string, updates: Partial<StockRequest>) => void;
  
  // Sync
  syncStatus: SyncStatus;
  sync: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  // Mock data for development
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Tira Groundnuts Premium Grade',
      sku: 'GN-TIRA-001',
      description: 'Premium quality Tira groundnuts, carefully selected and processed',
      category: 'Premium Groundnuts',
      subcategory: 'Tira Variety',
      price: 45.99,
      cost: 32.00,
      minStock: 50,
      maxStock: 500,
      unit: 'kg',
      weight: 1.0,
      dimensions: { length: 30, width: 20, height: 10 },
      tags: ['premium', 'tira', 'organic'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-01')
    },
    {
      id: '2',
      name: 'White Groundnuts Export Quality',
      sku: 'GN-WHITE-002',
      description: 'Export quality white groundnuts, perfect for international markets',
      category: 'Export Groundnuts',
      subcategory: 'White Variety',
      price: 52.99,
      cost: 38.50,
      minStock: 75,
      maxStock: 750,
      unit: 'kg',
      weight: 1.0,
      dimensions: { length: 30, width: 20, height: 10 },
      tags: ['export', 'white', 'premium'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-03-05')
    },
    {
      id: '3',
      name: 'Red Groundnuts Local Grade',
      sku: 'GN-RED-003',
      description: 'High-quality red groundnuts for local market distribution',
      category: 'Local Groundnuts',
      subcategory: 'Red Variety',
      price: 38.50,
      cost: 25.75,
      minStock: 40,
      maxStock: 400,
      unit: 'kg',
      weight: 1.0,
      dimensions: { length: 30, width: 20, height: 10 },
      tags: ['local', 'red', 'affordable'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-10')
    },
    {
      id: '4',
      name: 'Mixed Groundnuts Value Pack',
      sku: 'GN-MIX-004',
      description: 'Mixed variety groundnuts pack for wholesale distribution',
      category: 'Wholesale Groundnuts',
      subcategory: 'Mixed Variety',
      price: 42.00,
      cost: 28.00,
      minStock: 30,
      maxStock: 300,
      unit: 'kg',
      weight: 1.0,
      dimensions: { length: 35, width: 25, height: 12 },
      tags: ['mixed', 'wholesale', 'bulk'],
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-03-12')
    },
    {
      id: '5',
      name: 'Organic Groundnuts Certified',
      sku: 'GN-ORG-005',
      description: 'Certified organic groundnuts with full traceability',
      category: 'Organic Groundnuts',
      subcategory: 'Certified Organic',
      price: 65.99,
      cost: 48.00,
      minStock: 25,
      maxStock: 250,
      unit: 'kg',
      weight: 1.0,
      dimensions: { length: 30, width: 20, height: 10 },
      tags: ['organic', 'certified', 'premium', 'traceable'],
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-03-08')
    }
  ]);

  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Premium Groundnuts',
      description: 'High-quality premium groundnut varieties',
      parentId: undefined,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Export Groundnuts',
      description: 'Export quality groundnuts for international markets',
      parentId: undefined,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '3',
      name: 'Local Groundnuts',
      description: 'Quality groundnuts for local market distribution',
      parentId: undefined,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '4',
      name: 'Wholesale Groundnuts',
      description: 'Bulk groundnuts for wholesale distribution',
      parentId: undefined,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '5',
      name: 'Organic Groundnuts',
      description: 'Certified organic groundnut products',
      parentId: undefined,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '6',
      name: 'Tira Variety',
      description: 'Tira groundnut varieties',
      parentId: '1',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '7',
      name: 'White Variety',
      description: 'White groundnut varieties',
      parentId: '2',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '8',
      name: 'Red Variety',
      description: 'Red groundnut varieties',
      parentId: '3',
      createdAt: new Date('2024-01-01')
    }
  ]);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: '1',
      name: 'Main Processing Center',
      location: 'Industrial District, Kano',
      managerId: '3',
      capacity: 5000,
      description: 'Primary groundnut processing and storage facility',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Export Hub Warehouse',
      location: 'Port Area, Lagos',
      managerId: '3',
      capacity: 3000,
      description: 'Specialized warehouse for export quality groundnuts',
      createdAt: new Date('2024-01-10')
    }
  ]);

  const [shops, setShops] = useState<Shop[]>([
    {
      id: '1',
      name: 'Groundnut Mart Downtown',
      location: 'Central Market, Kano',
      managerId: '4',
      warehouseIds: ['1'],
      settings: {
        allowNegativeStock: false,
        autoRequestThreshold: 10,
        defaultTaxRate: 7.5,
        receiptTemplate: 'standard'
      },
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Premium Nuts Outlet',
      location: 'Victoria Island, Lagos',
      managerId: '4',
      warehouseIds: ['2'],
      settings: {
        allowNegativeStock: false,
        autoRequestThreshold: 15,
        defaultTaxRate: 7.5,
        receiptTemplate: 'premium'
      },
      createdAt: new Date('2024-01-15')
    }
  ]);

  const [stock, setStock] = useState<ProductStock[]>([
    { id: '1', warehouseId: '1', productId: '1', quantity: 150, reservedQuantity: 10, lastUpdated: new Date() },
    { id: '2', warehouseId: '1', productId: '2', quantity: 200, reservedQuantity: 25, lastUpdated: new Date() },
    { id: '3', warehouseId: '1', productId: '3', quantity: 120, reservedQuantity: 15, lastUpdated: new Date() },
    { id: '4', warehouseId: '2', productId: '2', quantity: 300, reservedQuantity: 40, lastUpdated: new Date() },
    { id: '5', warehouseId: '2', productId: '5', quantity: 80, reservedQuantity: 5, lastUpdated: new Date() },
  ]);

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Kano Traders Association',
      email: 'info@kanotraders.ng',
      phone: '+234-803-123-4567',
      address: 'Sabon Gari Market, Kano',
      type: 'business',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Lagos Export Company',
      email: 'orders@lagosexport.com',
      phone: '+234-801-234-5678',
      address: 'Apapa Industrial Estate, Lagos',
      type: 'business',
      createdAt: new Date('2024-01-05')
    },
    {
      id: '3',
      name: 'Amina Mohammed',
      email: 'amina.mohammed@email.com',
      phone: '+234-802-345-6789',
      address: 'Garki District, Abuja',
      type: 'individual',
      createdAt: new Date('2024-02-01')
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      customerId: '1',
      customerName: 'Kano Traders Association',
      items: [
        { productId: '1', productName: 'Tira Groundnuts Premium Grade', quantity: 20, price: 45.99, total: 919.80 },
        { productId: '3', productName: 'Red Groundnuts Local Grade', quantity: 15, price: 38.50, total: 577.50 }
      ],
      subtotal: 1497.30,
      tax: 112.30,
      total: 1609.60,
      status: 'paid',
      paymentMethod: 'bank_transfer',
      createdBy: '4',
      createdAt: new Date('2024-03-01'),
      paidAt: new Date('2024-03-02')
    },
    {
      id: '2',
      customerId: '2',
      customerName: 'Lagos Export Company',
      items: [
        { productId: '2', productName: 'White Groundnuts Export Quality', quantity: 50, price: 52.99, total: 2649.50 },
        { productId: '5', productName: 'Organic Groundnuts Certified', quantity: 10, price: 65.99, total: 659.90 }
      ],
      subtotal: 3309.40,
      tax: 248.21,
      total: 3557.61,
      status: 'pending',
      paymentMethod: 'cash',
      createdBy: '4',
      createdAt: new Date('2024-03-10')
    }
  ]);

  const [stockRequests, setStockRequests] = useState<StockRequest[]>([]);
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSync: new Date(),
    pendingChanges: 0,
    isOnline: navigator.onLine,
    syncInProgress: false
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setSyncStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id 
        ? { ...product, ...updates, updatedAt: new Date() }
        : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const addWarehouse = (warehouseData: Omit<Warehouse, 'id' | 'createdAt'>) => {
    const newWarehouse: Warehouse = {
      ...warehouseData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setWarehouses(prev => [...prev, newWarehouse]);
  };

  const updateWarehouse = (id: string, updates: Partial<Warehouse>) => {
    setWarehouses(prev => prev.map(warehouse => 
      warehouse.id === id ? { ...warehouse, ...updates } : warehouse
    ));
  };

  const addShop = (shopData: Omit<Shop, 'id' | 'createdAt'>) => {
    const newShop: Shop = {
      ...shopData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setShops(prev => [...prev, newShop]);
  };

  const updateShop = (id: string, updates: Partial<Shop>) => {
    setShops(prev => prev.map(shop => 
      shop.id === id ? { ...shop, ...updates } : shop
    ));
  };

  const updateStock = (warehouseId: string, productId: string, quantity: number) => {
    setStock(prev => {
      const existingStock = prev.find(s => s.warehouseId === warehouseId && s.productId === productId);
      if (existingStock) {
        return prev.map(s => 
          s.id === existingStock.id 
            ? { ...s, quantity, lastUpdated: new Date() }
            : s
        );
      } else {
        return [...prev, {
          id: Date.now().toString(),
          warehouseId,
          productId,
          quantity,
          reservedQuantity: 0,
          lastUpdated: new Date()
        }];
      }
    });
  };

  const getStock = (warehouseId: string, productId: string) => {
    return stock.find(s => s.warehouseId === warehouseId && s.productId === productId);
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalPurchases' | 'loyaltyPoints'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      totalPurchases: 0,
      loyaltyPoints: 0
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === id ? { ...customer, ...updates } : customer
    ));
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'>) => {
    const invoiceNumber = `INV-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: Date.now().toString(),
      invoiceNumber,
      createdAt: new Date()
    };
    setInvoices(prev => [...prev, newInvoice]);
  };

  const createStockRequest = (requestData: Omit<StockRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const newRequest: StockRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setStockRequests(prev => [...prev, newRequest]);
  };

  const updateStockRequest = (id: string, updates: Partial<StockRequest>) => {
    setStockRequests(prev => prev.map(request => 
      request.id === id 
        ? { ...request, ...updates, updatedAt: new Date() }
        : request
    ));
  };

  const sync = async () => {
    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSyncStatus(prev => ({
      ...prev,
      syncInProgress: false,
      lastSync: new Date(),
      pendingChanges: 0
    }));
  };

  return (
    <InventoryContext.Provider value={{
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      warehouses,
      addWarehouse,
      updateWarehouse,
      shops,
      addShop,
      updateShop,
      stock,
      updateStock,
      getStock,
      customers,
      addCustomer,
      updateCustomer,
      invoices,
      addInvoice,
      stockRequests,
      createStockRequest,
      updateStockRequest,
      syncStatus,
      sync
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}