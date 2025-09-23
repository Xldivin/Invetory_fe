import React, { useState } from 'react';
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
import { Product, Category } from '../types';

export function ProductManagement() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useInventory();
  const { logActivity } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    tags: '',
    price: '',
    cost: '',
    minStock: '',
    maxStock: '',
    unit: 'piece',
    barcode: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parentId: ''
  });

  const resetProductForm = () => {
    setProductForm({
      name: '',
      sku: '',
      description: '',
      categoryId: '',
      tags: '',
      price: '',
      cost: '',
      minStock: '',
      maxStock: '',
      unit: 'piece',
      barcode: ''
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      parentId: ''
    });
  };

  const handleAddProduct = () => {
    if (!productForm.name || !productForm.sku || !productForm.price) return;

    const productData = {
      name: productForm.name,
      sku: productForm.sku,
      description: productForm.description || undefined,
      categoryId: productForm.categoryId,
      tags: productForm.tags ? productForm.tags.split(',').map(tag => tag.trim()) : [],
      price: parseFloat(productForm.price),
      cost: parseFloat(productForm.cost) || 0,
      minStock: parseInt(productForm.minStock) || 0,
      maxStock: parseInt(productForm.maxStock) || 100,
      unit: productForm.unit,
      barcode: productForm.barcode || undefined,
      images: []
    };

    addProduct(productData);
    logActivity('product_created', 'products', { name: productData.name, sku: productData.sku });
    
    resetProductForm();
    setShowAddProduct(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      categoryId: product.categoryId,
      tags: product.tags.join(', '),
      price: product.price.toString(),
      cost: product.cost.toString(),
      minStock: product.minStock.toString(),
      maxStock: product.maxStock.toString(),
      unit: product.unit,
      barcode: product.barcode || ''
    });
    setShowAddProduct(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct || !productForm.name || !productForm.sku || !productForm.price) return;

    const updates = {
      name: productForm.name,
      sku: productForm.sku,
      description: productForm.description || undefined,
      categoryId: productForm.categoryId,
      tags: productForm.tags ? productForm.tags.split(',').map(tag => tag.trim()) : [],
      price: parseFloat(productForm.price),
      cost: parseFloat(productForm.cost) || 0,
      minStock: parseInt(productForm.minStock) || 0,
      maxStock: parseInt(productForm.maxStock) || 100,
      unit: productForm.unit,
      barcode: productForm.barcode || undefined
    };

    updateProduct(editingProduct.id, updates);
    logActivity('product_updated', 'products', { name: updates.name, sku: updates.sku });
    
    resetProductForm();
    setEditingProduct(null);
    setShowAddProduct(false);
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id);
      logActivity('product_deleted', 'products', { name: product.name, sku: product.sku });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
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
          <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Tag className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Category description"
                  />
                </div>
                <div>
                  <Label htmlFor="parentCategory">Parent Category</Label>
                  <Select value={categoryForm.parentId} onValueChange={(value) => setCategoryForm(prev => ({ ...prev, parentId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => {
                  // Handle category creation
                  resetCategoryForm();
                  setShowAddCategory(false);
                }} className="w-full">
                  Add Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddProduct} onOpenChange={(open) => {
            setShowAddProduct(open);
            if (!open) {
              setEditingProduct(null);
              resetProductForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productSku">SKU</Label>
                    <Input
                      id="productSku"
                      value={productForm.sku}
                      onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                      placeholder="Product SKU"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productCategory">Category</Label>
                    <Select value={productForm.categoryId} onValueChange={(value) => setProductForm(prev => ({ ...prev, categoryId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="productTags">Tags (comma separated)</Label>
                    <Input
                      id="productTags"
                      value={productForm.tags}
                      onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="electronics, featured, new"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productBarcode">Barcode (optional)</Label>
                    <Input
                      id="productBarcode"
                      value={productForm.barcode}
                      onChange={(e) => setProductForm(prev => ({ ...prev, barcode: e.target.value }))}
                      placeholder="123456789012"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="productPrice">Selling Price</Label>
                      <Input
                        id="productPrice"
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productCost">Cost Price</Label>
                      <Input
                        id="productCost"
                        type="number"
                        value={productForm.cost}
                        onChange={(e) => setProductForm(prev => ({ ...prev, cost: e.target.value }))}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="productMinStock">Min Stock</Label>
                      <Input
                        id="productMinStock"
                        type="number"
                        value={productForm.minStock}
                        onChange={(e) => setProductForm(prev => ({ ...prev, minStock: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productMaxStock">Max Stock</Label>
                      <Input
                        id="productMaxStock"
                        type="number"
                        value={productForm.maxStock}
                        onChange={(e) => setProductForm(prev => ({ ...prev, maxStock: e.target.value }))}
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="productUnit">Unit</Label>
                    <Select value={productForm.unit} onValueChange={(value) => setProductForm(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="meter">Meter</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="pack">Pack</SelectItem>
                      </SelectContent>
                    </Select>
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
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                  Cancel
                </Button>
                <Button onClick={editingProduct ? handleUpdateProduct : handleAddProduct}>
                  {editingProduct ? 'Update Product' : 'Add Product'}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Range</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
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
                      {getCategoryName(product.categoryId)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-muted-foreground" />
                      <span>{product.price.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {product.minStock} - {product.maxStock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.unit}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {product.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.tags.length - 2}
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