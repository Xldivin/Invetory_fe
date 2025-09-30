import * as React from "react";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag,
  Barcode,
  DollarSign,
  Hash
} from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { getApiUrl, getCommonHeaders, getAuthToken, getTenantId, API_CONFIG } from '../config/api';
import { Product, Category } from '../types';

export function ProductManagement() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useInventory();
  const { logActivity } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingProductApi, setEditingProductApi] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    short_description: '',
    sku: '',
    barcode: '',
    qr_code: '',
    category_id: '',
    brand_id: '',
    supplier_id: '',
    shop_id: '',
    warehouse_id: '',
    cost_price: '',
    selling_price: '',
    discount_price: '',
    tax_rate: '',
    stock_quantity: '',
    min_stock_level: '',
    max_stock_level: '',
    reorder_point: '',
    weight: '',
    dimensions_length: '',
    dimensions_width: '',
    dimensions_height: '',
    color: '',
    size: '',
    status: 'active',
    is_featured: false,
    is_digital: false,
    tags: '',
    meta_title: '',
    meta_description: '',
    primary_image_url: '',
    gallery_images: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parent_category_id: '',
    category_code: '',
    image_url: '',
    sort_order: ''
  });
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      short_description: '',
      sku: '',
      barcode: '',
      qr_code: '',
      category_id: '',
      brand_id: '',
      supplier_id: '',
      shop_id: '',
      warehouse_id: '',
      cost_price: '',
      selling_price: '',
      discount_price: '',
      tax_rate: '',
      stock_quantity: '',
      min_stock_level: '',
      max_stock_level: '',
      reorder_point: '',
      weight: '',
      dimensions_length: '',
      dimensions_width: '',
      dimensions_height: '',
      color: '',
      size: '',
      status: 'active',
      is_featured: false,
      is_digital: false,
      tags: '',
      meta_title: '',
      meta_description: '',
      primary_image_url: '',
      gallery_images: ''
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        const tenantId = getTenantId();

        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS), {
          headers: getCommonHeaders(token, tenantId)
        });
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        const json = await response.json();
        if (json && Array.isArray(json.data)) {
          setApiProducts(json.data);
        } else {
          setApiProducts([]);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const token = getAuthToken();
        const tenantId = getTenantId();

        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES_ROOTS), {
          headers: getCommonHeaders(token, tenantId)
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
        const json = await response.json();
        if (json && Array.isArray(json.data)) {
          setApiCategories(json.data);
        } else {
          setApiCategories([]);
        }
      } catch (e: any) {
        console.error('Failed to load categories:', e?.message || 'Unknown error');
        setApiCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      parent_category_id: '',
      category_code: '',
      image_url: '',
      sort_order: ''
    });
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name || !categoryForm.category_code) return;
    
    try {
      setIsCreatingCategory(true);
      setError(null);
      
      const token = localStorage.getItem('sessionToken') || '';
      const envTenantId = (import.meta as any)?.env?.VITE_TENANT_ID;
      const storedTenantId = localStorage.getItem('tenantId') || localStorage.getItem('tenant_id');
      const tenantId = envTenantId || storedTenantId || '';

      const payload: any = {
        name: categoryForm.name,
        description: categoryForm.description || '',
        category_code: categoryForm.category_code,
        image_url: categoryForm.image_url || '',
        sort_order: Number(categoryForm.sort_order) || 10
      };

      // Add parent_category_id only if it's selected (for child categories)
      if (categoryForm.parent_category_id) {
        payload.parent_category_id = Number(categoryForm.parent_category_id);
      }

      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CATEGORIES), {
        method: 'POST',
        headers: getCommonHeaders(token, tenantId),
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || 'Failed to create category');

      logActivity('category_created', 'categories', { name: payload.name, code: payload.category_code });
      resetCategoryForm();
      setShowAddCategory(false);
      
      // Refresh categories list to show the newly created category
      const categoryResponse = await fetch('https://seba.hanohost.net/api/categories/roots', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(tenantId ? { 'X-Tenant-ID': String(tenantId) } : {}),
          'Accept': 'application/json'
        }
      });
      if (categoryResponse.ok) {
        const categoryJson = await categoryResponse.json();
        if (categoryJson && Array.isArray(categoryJson.data)) {
          setApiCategories(categoryJson.data);
        }
      }
      
    } catch (e: any) {
      setError(e?.message || 'Failed to create category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.sku || !productForm.selling_price) return;
    
    try {
      setIsCreating(true);
      setError(null);
      
      const token = localStorage.getItem('sessionToken') || '';
      const envTenantId = (import.meta as any)?.env?.VITE_TENANT_ID;
      const storedTenantId = localStorage.getItem('tenantId') || localStorage.getItem('tenant_id');
      const tenantId = envTenantId || storedTenantId || '';

      const payload: any = {
      name: productForm.name,
        description: productForm.description || '',
        short_description: productForm.short_description || '',
      sku: productForm.sku,
        barcode: productForm.barcode || '',
        qr_code: productForm.qr_code || '',
        category_id: Number(productForm.category_id) || 1,
        brand_id: Number(productForm.brand_id) || 1,
        supplier_id: Number(productForm.supplier_id) || 1,
        shop_id: Number(productForm.shop_id) || 1,
        warehouse_id: Number(productForm.warehouse_id) || 1,
        cost_price: Number(productForm.cost_price) || 0,
        selling_price: Number(productForm.selling_price),
        discount_price: productForm.discount_price ? Number(productForm.discount_price) : null,
        tax_rate: Number(productForm.tax_rate) || 0,
        stock_quantity: Number(productForm.stock_quantity) || 0,
        min_stock_level: Number(productForm.min_stock_level) || 0,
        max_stock_level: Number(productForm.max_stock_level) || 100,
        reorder_point: Number(productForm.reorder_point) || 0,
        weight: Number(productForm.weight) || 0,
        dimensions_length: Number(productForm.dimensions_length) || 0,
        dimensions_width: Number(productForm.dimensions_width) || 0,
        dimensions_height: Number(productForm.dimensions_height) || 0,
        color: productForm.color || '',
        size: productForm.size || '',
        status: productForm.status || 'active',
        is_featured: Boolean(productForm.is_featured),
        is_digital: Boolean(productForm.is_digital),
        tags: productForm.tags ? productForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        meta_title: productForm.meta_title || productForm.name,
        meta_description: productForm.meta_description || productForm.description,
        primary_image_url: productForm.primary_image_url || '',
        gallery_images: productForm.gallery_images ? productForm.gallery_images.split(',').map((img) => img.trim()).filter(Boolean) : []
      };

      const res = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS), {
        method: 'POST',
        headers: getCommonHeaders(token, tenantId),
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || 'Failed to create product');

      // Add the new product to the list
      const newProduct = json?.data || { ...payload, product_id: Date.now() };
      setApiProducts(prev => [newProduct, ...prev]);
      
      logActivity('product_created', 'products', { name: payload.name, sku: payload.sku });
    resetProductForm();
    setShowAddProduct(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to create product');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditProduct = (product: any) => {
    // API product edit
    if (product && typeof product === 'object' && 'product_id' in product) {
      setEditingProductApi(product);
      setEditingProduct(null);
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        short_description: product.short_description || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        qr_code: product.qr_code || '',
        category_id: String(product.category_id || ''),
        brand_id: String(product.brand_id || ''),
        supplier_id: String(product.supplier_id || ''),
        shop_id: String(product.shop_id || ''),
        warehouse_id: String(product.warehouse_id || ''),
        cost_price: String(product.cost_price ?? ''),
        selling_price: String(product.selling_price ?? ''),
        discount_price: String(product.discount_price ?? ''),
        tax_rate: String(product.tax_rate ?? ''),
        stock_quantity: String(product.stock_quantity ?? ''),
        min_stock_level: String(product.min_stock_level ?? ''),
        max_stock_level: String(product.max_stock_level ?? ''),
        reorder_point: String(product.reorder_point ?? ''),
        weight: String(product.weight ?? ''),
        dimensions_length: String(product.dimensions_length ?? ''),
        dimensions_width: String(product.dimensions_width ?? ''),
        dimensions_height: String(product.dimensions_height ?? ''),
        color: product.color || '',
        size: product.size || '',
        status: product.status || 'active',
        is_featured: Boolean(product.is_featured),
        is_digital: Boolean(product.is_digital),
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        primary_image_url: product.primary_image_url || '',
        gallery_images: Array.isArray(product.gallery_images) ? product.gallery_images.join(', ') : ''
      });
      setShowAddProduct(true);
      return;
    }
    // Local edit (legacy)
    const p = product as Product;
    setEditingProduct(p);
    setEditingProductApi(null);
    setProductForm({
      name: p.name,
      description: p.description || '',
      short_description: '',
      sku: p.sku,
      barcode: p.barcode || '',
      qr_code: '',
      category_id: p.categoryId,
      brand_id: '',
      supplier_id: '',
      shop_id: '',
      warehouse_id: '',
      cost_price: p.cost.toString(),
      selling_price: p.price.toString(),
      discount_price: '',
      tax_rate: '',
      stock_quantity: '',
      min_stock_level: p.minStock.toString(),
      max_stock_level: p.maxStock.toString(),
      reorder_point: '',
      weight: '',
      dimensions_length: '',
      dimensions_width: '',
      dimensions_height: '',
      color: '',
      size: '',
      status: 'active',
      is_featured: false,
      is_digital: false,
      tags: p.tags.join(', '),
      meta_title: '',
      meta_description: '',
      primary_image_url: '',
      gallery_images: ''
    });
    setShowAddProduct(true);
  };

  const handleUpdateProduct = async () => {
    setIsUpdating(true);
    // Update via API if editing API product
    if (editingProductApi) {
      try {
        if (!productForm.name || !productForm.sku) return;
        const token = localStorage.getItem('sessionToken') || '';
        const envTenantId = (import.meta as any)?.env?.VITE_TENANT_ID;
        const storedTenantId = localStorage.getItem('tenantId') || localStorage.getItem('tenant_id');
        const tenantId = envTenantId || storedTenantId || '';

        const payload: any = {
          name: productForm.name,
          description: productForm.description || editingProductApi.description || '',
          short_description: productForm.short_description || editingProductApi.short_description || '',
          sku: productForm.sku,
          barcode: productForm.barcode || editingProductApi.barcode || '',
          qr_code: productForm.qr_code || editingProductApi.qr_code || '',
          category_id: Number(productForm.category_id) || editingProductApi.category_id,
          brand_id: Number(productForm.brand_id) || editingProductApi.brand_id,
          supplier_id: Number(productForm.supplier_id) || editingProductApi.supplier_id,
          shop_id: Number(productForm.shop_id) || editingProductApi.shop_id,
          warehouse_id: Number(productForm.warehouse_id) || editingProductApi.warehouse_id,
          cost_price: Number(productForm.cost_price || editingProductApi.cost_price || 0),
          selling_price: Number(productForm.selling_price || editingProductApi.selling_price || 0),
          discount_price: productForm.discount_price ? Number(productForm.discount_price) : editingProductApi.discount_price ?? null,
          tax_rate: Number(productForm.tax_rate || editingProductApi.tax_rate || 0),
          stock_quantity: Number(productForm.stock_quantity || editingProductApi.stock_quantity || 0),
          min_stock_level: Number(productForm.min_stock_level || editingProductApi.min_stock_level || 0),
          max_stock_level: Number(productForm.max_stock_level || editingProductApi.max_stock_level || 0),
          reorder_point: Number(productForm.reorder_point || editingProductApi.reorder_point || 0),
          weight: Number(productForm.weight || editingProductApi.weight || 0),
          dimensions_length: Number(productForm.dimensions_length || editingProductApi.dimensions_length || 0),
          dimensions_width: Number(productForm.dimensions_width || editingProductApi.dimensions_width || 0),
          dimensions_height: Number(productForm.dimensions_height || editingProductApi.dimensions_height || 0),
          color: productForm.color || editingProductApi.color || '',
          size: productForm.size || editingProductApi.size || '',
          status: productForm.status || editingProductApi.status || 'active',
          is_featured: Boolean(productForm.is_featured),
          is_digital: Boolean(productForm.is_digital),
          tags: productForm.tags ? productForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : (Array.isArray(editingProductApi.tags) ? editingProductApi.tags : []),
          meta_title: productForm.meta_title || editingProductApi.meta_title || productForm.name,
          meta_description: productForm.meta_description || editingProductApi.meta_description || productForm.description || '',
          primary_image_url: productForm.primary_image_url || editingProductApi.primary_image_url || '',
          gallery_images: productForm.gallery_images ? productForm.gallery_images.split(',').map((img) => img.trim()).filter(Boolean) : (Array.isArray(editingProductApi.gallery_images) ? editingProductApi.gallery_images : [])
        };

        const res = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${editingProductApi.product_id}`), {
          method: 'PUT',
          headers: getCommonHeaders(token, tenantId),
          body: JSON.stringify(payload)
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.message || 'Update failed');
        const updated = json?.data || { ...editingProductApi, ...payload };
        setApiProducts(prev => prev.map(p => p.product_id === editingProductApi.product_id ? updated : p));
        logActivity('product_updated', 'products', { id: editingProductApi.product_id, sku: payload.sku });
        resetProductForm();
        setEditingProductApi(null);
        setShowAddProduct(false);
      } catch (e: any) {
        setError(e?.message || 'Failed to update product');
      } finally {
        setIsUpdating(false);
      }
      return;
    }

    // Local update (legacy)
    if (!editingProduct || !productForm.name || !productForm.sku || !productForm.selling_price) return;

    const updates = {
      name: productForm.name,
      sku: productForm.sku,
      description: productForm.description || undefined,
      categoryId: productForm.category_id,
      tags: productForm.tags ? productForm.tags.split(',').map(tag => tag.trim()) : [],
      price: parseFloat(productForm.selling_price),
      cost: parseFloat(productForm.cost_price) || 0,
      minStock: parseInt(productForm.min_stock_level) || 0,
      maxStock: parseInt(productForm.max_stock_level) || 100,
      unit: 'kg',
      barcode: productForm.barcode || undefined
    };

    updateProduct(editingProduct.id, updates);
    logActivity('product_updated', 'products', { name: updates.name, sku: updates.sku });
    resetProductForm();
    setEditingProduct(null);
    setShowAddProduct(false);
    setIsUpdating(false);
  };

  const handleDeleteProduct = async (product: any) => {
    // API delete path
    if (product && 'product_id' in product) {
      if (!confirm(`Delete "${product.name}"?`)) return;
      try {
        const token = getAuthToken();
        const tenantId = getTenantId();
        const res = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${product.product_id}`), {
          method: 'DELETE',
          headers: getCommonHeaders(token, tenantId)
        });
        if (!res.ok) {
          const msg = await res.text().catch(() => 'Delete failed');
          throw new Error(msg || 'Delete failed');
        }
        setApiProducts(prev => prev.filter(p => p.product_id !== product.product_id));
        logActivity('product_deleted', 'products', { id: product.product_id, sku: product.sku });
      } catch (e: any) {
        setError(e?.message || 'Failed to delete product');
      }
      return;
    }
    // Legacy local deletion
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id);
      logActivity('product_deleted', 'products', { name: product.name, sku: product.sku });
    }
  };

  // Use API data only (remove fixed local table)
  const filteredProducts = apiProducts.filter((product: any) => {
    const name = product.name || '';
    const sku = product.sku || '';
    const tags = (product.tags || []);
    const term = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(term) ||
      sku.toLowerCase().includes(term) ||
      tags.some((tag: string) => (tag || '').toLowerCase().includes(term))
    );
  });

  const getCategoryName = (product: any) => {
    return product?.category?.name || 'Uncategorized';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Product Management</h1>
          <p className="text-muted-foreground">Manage your inventory products and categories</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddCategory} onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
            setShowAddCategory(open);
            if (!open) {
              resetCategoryForm();
              setError(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Tag className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Create a parent category or child category under an existing parent
                </p>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="categoryCode">Category Code *</Label>
                  <Input
                    id="categoryCode"
                    value={categoryForm.category_code}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, category_code: e.target.value }))}
                    placeholder="CAT-EXAMPLE"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Category description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="parentCategory">Parent Category</Label>
                  <Select 
                    value={categoryForm.parent_category_id || "none"} 
                    onValueChange={(value: any) => setCategoryForm(prev => ({ ...prev, parent_category_id: value === "none" ? "" : value }))}
                    disabled={loadingCategories}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select parent category (leave empty for top-level)"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Parent (Top-level category)</SelectItem>
                      {apiCategories.map((category) => (
                        <SelectItem key={category.category_id || category.id} value={String(category.category_id || category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                      {apiCategories.length === 0 && !loadingCategories && (
                        <SelectItem value="empty" disabled>No categories available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {loadingCategories 
                      ? "Loading categories from server..." 
                      : "Leave empty to create a parent category, or select a parent to create a child category"
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categorySortOrder">Sort Order</Label>
                    <Input
                      id="categorySortOrder"
                      type="number"
                      value={categoryForm.sort_order}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, sort_order: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryImageUrl">Image URL</Label>
                    <Input
                      id="categoryImageUrl"
                      value={categoryForm.image_url}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Preview:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Type:</strong> {categoryForm.parent_category_id && categoryForm.parent_category_id !== "" ? 'Child Category' : 'Parent Category'}</p>
                    <p><strong>Name:</strong> {categoryForm.name || 'Category Name'}</p>
                    <p><strong>Code:</strong> {categoryForm.category_code || 'CAT-CODE'}</p>
                    {categoryForm.parent_category_id && categoryForm.parent_category_id !== "" && (
                      <p><strong>Under:</strong> {apiCategories.find(c => String(c.category_id || c.id) === categoryForm.parent_category_id)?.name || 'Selected Parent'}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory} disabled={isCreatingCategory || !categoryForm.name || !categoryForm.category_code}>
                  {isCreatingCategory ? 'Creating...' : 'Add Category'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddProduct} onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
            setShowAddProduct(open);
            if (!open) {
              setEditingProduct(null);
              setEditingProductApi(null);
              resetProductForm();
              setError(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct || editingProductApi ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="productSku">SKU *</Label>
                    <Input
                      id="productSku"
                      value={productForm.sku}
                      onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Product SKU"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="productShortDescription">Short Description</Label>
                    <Input
                      id="productShortDescription"
                      value={productForm.short_description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, short_description: e.target.value }))}
                      placeholder="Brief product description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productBarcode">Barcode</Label>
                    <Input
                      id="productBarcode"
                      value={productForm.barcode}
                      onChange={(e) => setProductForm(prev => ({ ...prev, barcode: e.target.value }))}
                      placeholder="123456789012"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productTags">Tags (comma separated)</Label>
                    <Input
                      id="productTags"
                      value={productForm.tags}
                      onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productColor">Color</Label>
                    <Input
                      id="productColor"
                      value={productForm.color}
                      onChange={(e) => setProductForm(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="Product color"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productSize">Size</Label>
                    <Input
                      id="productSize"
                      value={productForm.size}
                      onChange={(e) => setProductForm(prev => ({ ...prev, size: e.target.value }))}
                      placeholder="Product size"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="productSellingPrice">Selling Price *</Label>
                      <Input
                        id="productSellingPrice"
                        type="number"
                        value={productForm.selling_price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, selling_price: e.target.value }))}
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="productCostPrice">Cost Price</Label>
                      <Input
                        id="productCostPrice"
                        type="number"
                        value={productForm.cost_price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, cost_price: e.target.value }))}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="productStockQuantity">Stock Quantity</Label>
                      <Input
                        id="productStockQuantity"
                        type="number"
                        value={productForm.stock_quantity}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productTaxRate">Tax Rate (%)</Label>
                      <Input
                        id="productTaxRate"
                        type="number"
                        value={productForm.tax_rate}
                        onChange={(e) => setProductForm(prev => ({ ...prev, tax_rate: e.target.value }))}
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="productMinStock">Min Stock Level</Label>
                      <Input
                        id="productMinStock"
                        type="number"
                        value={productForm.min_stock_level}
                        onChange={(e) => setProductForm(prev => ({ ...prev, min_stock_level: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productMaxStock">Max Stock Level</Label>
                      <Input
                        id="productMaxStock"
                        type="number"
                        value={productForm.max_stock_level}
                        onChange={(e) => setProductForm(prev => ({ ...prev, max_stock_level: e.target.value }))}
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="productWeight">Weight (kg)</Label>
                    <Input
                      id="productWeight"
                      type="number"
                      value={productForm.weight}
                      onChange={(e) => setProductForm(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="0.0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="productDescription">Description</Label>
                    <Textarea
                      id="productDescription"
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Product description"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                  Cancel
                </Button>
                <Button onClick={editingProduct || editingProductApi ? handleUpdateProduct : handleAddProduct} disabled={isUpdating || isCreating}>
                  {editingProduct || editingProductApi 
                    ? (isUpdating ? 'Updating...' : 'Update Product') 
                    : (isCreating ? 'Creating...' : 'Add Product')
                  }
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge variant="secondary">
          {filteredProducts.length} products
        </Badge>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Manage your product inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <div className="text-sm text-muted-foreground pb-2">Loading products…</div>}
          {error && <div className="text-sm text-destructive pb-2">{error}</div>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product: any) => (
                <TableRow key={product.product_id}>
                  <TableCell>
                    <div>
                      <div className="text-sm">{product.name}</div>
                      {product.description && (
                        <div className="text-xs text-muted-foreground truncate max-w-48">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono text-sm">{product.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCategoryName(product)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      <span>{Number(product.selling_price).toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{product.stock_quantity}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.unit || 'kg'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(product.tags || []).slice(0, 2).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {(product.tags || []).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{(product.tags || []).length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}