import * as React from "react";
import { useEffect, useState } from 'react';
import { Plus, Edit, Eye, Trash2, Search, Filter, MapPin, Phone, Mail, Calendar, Users, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { API_CONFIG, getApiUrl, getCommonHeaders, getAuthToken, getTenantId } from '../config/api';

interface Supplier {
  supplier_id: number;
  tenant_id: number;
  name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  country: string;
  tax_number: string;
  payment_terms: string;
  credit_limit: number;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products_count: number;
  purchases_count: number;
}

// API Functions
const fetchSuppliers = async (): Promise<{ data: Supplier[]; total: number; current_page: number; last_page: number }> => {
  try {
    const token = getAuthToken();
    const tenantId = getTenantId();
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SUPPLIERS), {
      method: 'GET',
      headers: getCommonHeaders(token, tenantId),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API Response:', result); // Debug log
    
    // Handle different response structures
    if (result.data && Array.isArray(result.data.data)) {
      return result.data;
    } else if (Array.isArray(result.data)) {
      return {
        data: result.data,
        total: result.total || result.data.length,
        current_page: result.current_page || 1,
        last_page: result.last_page || 1
      };
    } else {
      console.warn('Unexpected API response structure:', result);
      return {
        data: [],
        total: 0,
        current_page: 1,
        last_page: 1
      };
    }
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
};

const createSupplier = async (supplierData: Partial<Supplier>): Promise<Supplier> => {
  try {
    const token = getAuthToken();
    const tenantId = getTenantId();
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SUPPLIERS), {
      method: 'POST',
      headers: getCommonHeaders(token, tenantId),
      body: JSON.stringify(supplierData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};

const updateSupplier = async (supplierId: number, supplierData: Partial<Supplier>): Promise<Supplier> => {
  try {
    const token = getAuthToken();
    const tenantId = getTenantId();
    const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.SUPPLIERS)}/${supplierId}`, {
      method: 'PUT',
      headers: getCommonHeaders(token, tenantId),
      body: JSON.stringify(supplierData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating supplier:', error);
    throw error;
  }
};

const deleteSupplier = async (supplierId: number): Promise<void> => {
  try {
    const token = getAuthToken();
    const tenantId = getTenantId();
    const response = await fetch(`${getApiUrl(API_CONFIG.ENDPOINTS.SUPPLIERS)}/${supplierId}`, {
      method: 'DELETE',
      headers: getCommonHeaders(token, tenantId),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting supplier:', error);
    throw error;
  }
};

export function SupplierManagement() {
  const { user, logActivity } = useAuth();
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Supplier>>({});

  // Fetch suppliers on component mount
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchSuppliers();
        const suppliersData = result.data || [];
        setSuppliers(suppliersData);
        setFilteredSuppliers(suppliersData);
      } catch (err) {
        setError('Failed to load suppliers');
        console.error('Error loading suppliers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  useEffect(() => {
    let filtered = suppliers || [];

    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.is_active === (statusFilter === 'active'));
    }

    setFilteredSuppliers(filtered);
  }, [suppliers, searchTerm, statusFilter]);

  const handleAddSupplier = async () => {
    if (!formData.name || !formData.contact_person || !formData.email || !formData.phone_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newSupplier = await createSupplier(formData);
      setSuppliers(prev => [...prev, newSupplier]);
      setFilteredSuppliers(prev => [...prev, newSupplier]);
      setFormData({});
      setIsAddDialogOpen(false);
      logActivity('create', 'suppliers', { supplierId: newSupplier.supplier_id, supplierName: newSupplier.name });
      toast.success('Supplier added successfully');
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error('Failed to create supplier');
    }
  };

  const handleEditSupplier = async () => {
    if (!selectedSupplier || !formData.name || !formData.contact_person || !formData.email || !formData.phone_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updatedSupplier = await updateSupplier(selectedSupplier.supplier_id, formData);
      setSuppliers(prev => prev.map(supplier =>
        supplier.supplier_id === selectedSupplier.supplier_id
          ? updatedSupplier
          : supplier
      ));
      setFilteredSuppliers(prev => prev.map(supplier =>
        supplier.supplier_id === selectedSupplier.supplier_id
          ? updatedSupplier
          : supplier
      ));

      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
      setFormData({});
      logActivity('update', 'suppliers', { supplierId: selectedSupplier.supplier_id });
      toast.success('Supplier updated successfully');
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast.error('Failed to update supplier');
    }
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (window.confirm(`Are you sure you want to delete ${supplier.name}?`)) {
      try {
        await deleteSupplier(supplier.supplier_id);
        setSuppliers(prev => prev.filter(s => s.supplier_id !== supplier.supplier_id));
        setFilteredSuppliers(prev => prev.filter(s => s.supplier_id !== supplier.supplier_id));
        logActivity('delete', 'suppliers', { supplierId: supplier.supplier_id, supplierName: supplier.name });
        toast.success('Supplier deleted successfully');
      } catch (error) {
        console.error('Error deleting supplier:', error);
        toast.error('Failed to delete supplier');
      }
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };


  const resetForm = () => {
    setFormData({});
    setSelectedSupplier(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData(supplier);
    setIsEditDialogOpen(true);
  };

  const openDetailsDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Supplier Management</h1>
          <p className="text-muted-foreground">Manage your groundnut suppliers and vendors</p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
                <p className="text-2xl font-bold">{suppliers?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
                <p className="text-2xl font-bold">{suppliers?.filter(s => s.is_active).length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{suppliers?.reduce((sum, s) => sum + (Number(s.products_count) || 0), 0) || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading suppliers...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      {!loading && !error && (
        <Card>
        <CardHeader>
          <CardTitle>Suppliers ({filteredSuppliers?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filteredSuppliers || []).map((supplier) => (
                  <TableRow key={supplier.supplier_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.city}, {supplier.country}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.contact_person}</p>
                        <p className="text-sm text-muted-foreground">{supplier.phone_number}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(supplier.is_active)}</TableCell>
                    <TableCell>{supplier.products_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDetailsDialog(supplier)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSupplier(supplier)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Supplier Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter supplier name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                value={formData.contact_person || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder="Enter contact person"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone *</Label>
              <Input
                id="phone_number"
                value={formData.phone_number || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country || 'Rwanda'}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Enter country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_number">Tax Number</Label>
              <Input
                id="tax_number"
                value={formData.tax_number || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_number: e.target.value }))}
                placeholder="Enter tax number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                placeholder="e.g., Net 30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit_limit">Credit Limit (RWF)</Label>
              <Input
                id="credit_limit"
                type="number"
                value={formData.credit_limit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter credit limit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter rating (0-5)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSupplier}>Add Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Supplier Name *</Label>
              <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter supplier name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact_person">Contact Person *</Label>
              <Input
                id="edit-contact_person"
                value={formData.contact_person || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder="Enter contact person"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone_number">Phone *</Label>
              <Input
                id="edit-phone_number"
                value={formData.phone_number || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Input
                id="edit-city"
                value={formData.city || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country">Country</Label>
              <Input
                id="edit-country"
                value={formData.country || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                placeholder="Enter country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tax_number">Tax Number</Label>
              <Input
                id="edit-tax_number"
                value={formData.tax_number || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tax_number: e.target.value }))}
                placeholder="Enter tax number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-payment_terms">Payment Terms</Label>
              <Input
                id="edit-payment_terms"
                value={formData.payment_terms || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                placeholder="e.g., Net 30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-credit_limit">Credit Limit (RWF)</Label>
              <Input
                id="edit-credit_limit"
                type="number"
                value={formData.credit_limit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter credit limit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rating">Rating</Label>
              <Input
                id="edit-rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter rating (0-5)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-is_active">Status</Label>
              <Select
                value={formData.is_active ? 'active' : 'inactive'}
                onValueChange={(value: string) => setFormData(prev => ({ ...prev, is_active: value === 'active' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSupplier}>Update Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedSupplier.name}</h3>
                    <p className="text-muted-foreground">{getStatusBadge(selectedSupplier.is_active)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedSupplier.phone_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedSupplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedSupplier.address}, {selectedSupplier.city}, {selectedSupplier.country}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{selectedSupplier.products_count}</p>
                    <p className="text-sm text-muted-foreground">Products</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span> {new Date(selectedSupplier.created_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(selectedSupplier.updated_at).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Tax Number:</span> {selectedSupplier.tax_number}
                </div>
                <div>
                  <span className="font-medium">Payment Terms:</span> {selectedSupplier.payment_terms}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            {selectedSupplier && (
              <Button onClick={() => openEditDialog(selectedSupplier)}>
                Edit Supplier
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
