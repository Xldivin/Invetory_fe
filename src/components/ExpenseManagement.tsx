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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  DollarSign,
  Calendar,
  Receipt,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  FileText,
  Tag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Expense, ExpenseCategory } from '../types';

// Mock data for expenses and categories
const mockCategories: ExpenseCategory[] = [
  { id: '1', name: 'Office Supplies', description: 'Paper, pens, stationery', color: '#3b82f6' },
  { id: '2', name: 'Utilities', description: 'Electricity, water, internet', color: '#10b981' },
  { id: '3', name: 'Rent', description: 'Property rental costs', color: '#f59e0b' },
  { id: '4', name: 'Transportation', description: 'Fuel, delivery, shipping', color: '#ef4444' },
  { id: '5', name: 'Marketing', description: 'Advertising, promotions', color: '#8b5cf6' },
  { id: '6', name: 'Equipment', description: 'Hardware, tools, machinery', color: '#06b6d4' },
  { id: '7', name: 'Maintenance', description: 'Repairs, cleaning, upkeep', color: '#f97316' }
];

const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Office paper and supplies',
    amount: 156.50,
    categoryId: '1',
    date: new Date('2024-03-15'),
    notes: 'Monthly office supply purchase',
    createdBy: '2',
    shopId: '1',
    createdAt: new Date('2024-03-15')
  },
  {
    id: '2',
    description: 'Electricity bill',
    amount: 485.20,
    categoryId: '2',
    date: new Date('2024-03-14'),
    notes: 'March electricity bill',
    createdBy: '2',
    warehouseId: '1',
    createdAt: new Date('2024-03-14')
  },
  {
    id: '3',
    description: 'Warehouse rent',
    amount: 2500.00,
    categoryId: '3',
    date: new Date('2024-03-01'),
    notes: 'Monthly warehouse rental',
    createdBy: '2',
    warehouseId: '1',
    createdAt: new Date('2024-03-01')
  }
];

export function ExpenseManagement() {
  const { user, logActivity } = useAuth();
  
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [categories, setCategories] = useState<ExpenseCategory[]>(mockCategories);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    receipt: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    parentId: ''
  });

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      amount: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      receipt: ''
    });
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      color: '#3b82f6',
      parentId: ''
    });
  };

  const handleAddExpense = () => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.categoryId) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      categoryId: expenseForm.categoryId,
      date: new Date(expenseForm.date),
      notes: expenseForm.notes || undefined,
      receipt: expenseForm.receipt || undefined,
      createdBy: user?.id || '',
      createdAt: new Date()
    };

    setExpenses(prev => [newExpense, ...prev]);
    logActivity('expense_created', 'expenses', { 
      description: newExpense.description, 
      amount: newExpense.amount 
    });
    
    resetExpenseForm();
    setShowAddExpense(false);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      categoryId: expense.categoryId,
      date: expense.date.toISOString().split('T')[0],
      notes: expense.notes || '',
      receipt: expense.receipt || ''
    });
    setShowAddExpense(true);
  };

  const handleUpdateExpense = () => {
    if (!editingExpense || !expenseForm.description || !expenseForm.amount || !expenseForm.categoryId) return;

    const updatedExpense = {
      ...editingExpense,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      categoryId: expenseForm.categoryId,
      date: new Date(expenseForm.date),
      notes: expenseForm.notes || undefined,
      receipt: expenseForm.receipt || undefined
    };

    setExpenses(prev => prev.map(e => e.id === editingExpense.id ? updatedExpense : e));
    logActivity('expense_updated', 'expenses', { 
      description: updatedExpense.description, 
      amount: updatedExpense.amount 
    });
    
    resetExpenseForm();
    setEditingExpense(null);
    setShowAddExpense(false);
  };

  const handleDeleteExpense = (expense: Expense) => {
    if (confirm(`Are you sure you want to delete "${expense.description}"?`)) {
      setExpenses(prev => prev.filter(e => e.id !== expense.id));
      logActivity('expense_deleted', 'expenses', { 
        description: expense.description, 
        amount: expense.amount 
      });
    }
  };

  const handleAddCategory = () => {
    if (!categoryForm.name) return;

    const newCategory: ExpenseCategory = {
      id: Date.now().toString(),
      name: categoryForm.name,
      description: categoryForm.description || undefined,
      color: categoryForm.color,
      parentId: categoryForm.parentId || undefined
    };

    setCategories(prev => [...prev, newCategory]);
    logActivity('expense_category_created', 'expenses', { name: newCategory.name });
    
    resetCategoryForm();
    setShowAddCategory(false);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.categoryId === selectedCategory;
    
    const daysAgo = parseInt(dateRange);
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - daysAgo);
    const matchesDate = expense.date >= dateFilter;
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyAverage = totalExpenses / Math.max(1, parseInt(dateRange) / 30);

  const expensesByCategory = categories.map(category => {
    const categoryExpenses = filteredExpenses.filter(e => e.categoryId === category.id);
    const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      ...category,
      total,
      count: categoryExpenses.length
    };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const predefinedColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1'
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Expense Management</h1>
          <p className="text-muted-foreground">Track and categorize business expenses</p>
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
                <DialogTitle>Add Expense Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category Name</Label>
                  <Input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Category description"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          categoryForm.color === color ? 'border-gray-800 dark:border-gray-200' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setCategoryForm(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddCategory} className="w-full">
                  Add Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddExpense} onOpenChange={(open) => {
            setShowAddExpense(open);
            if (!open) {
              setEditingExpense(null);
              resetExpenseForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? 'Edit Expense' : 'Add New Expense'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Description</Label>
                  <Input
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter expense description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={expenseForm.categoryId} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={expenseForm.notes}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes (optional)"
                  />
                </div>
                <div>
                  <Label>Receipt (optional)</Label>
                  <Input
                    value={expenseForm.receipt}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, receipt: e.target.value }))}
                    placeholder="Receipt number or reference"
                  />
                </div>
                <Button 
                  onClick={editingExpense ? handleUpdateExpense : handleAddExpense} 
                  className="w-full"
                >
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl">RWF {totalExpenses.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">+12% from last period</span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Average</p>
                    <p className="text-2xl">RWF {monthlyAverage.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingDown className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500">-5% from last month</span>
                    </div>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl">{filteredExpenses.length}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Receipt className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-500">This period</span>
                    </div>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Track and manage your business expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div>
                          <div className="text-sm">{expense.description}</div>
                          {expense.notes && (
                            <div className="text-xs text-muted-foreground truncate max-w-48">
                              {expense.notes}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: getCategoryColor(expense.categoryId),
                            color: getCategoryColor(expense.categoryId)
                          }}
                        >
                          {getCategoryName(expense.categoryId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">RWF {expense.amount.toFixed(2)}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {expense.date.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {expense.receipt ? (
                          <Badge variant="secondary">{expense.receipt}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No receipt</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExpense(expense)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExpense(expense)}
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown by Category</CardTitle>
              <CardDescription>Spending analysis for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expensesByCategory.map((category) => {
                  const percentage = (category.total / totalExpenses) * 100;
                  
                  return (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm">{category.name}</span>
                          <Badge variant="outline">{category.count} expenses</Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-sm">RWF {category.total.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: category.color,
                            width: `${percentage}%`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => {
              const categoryExpenses = expenses.filter(e => e.categoryId === category.id);
              const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
              
              return (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="text-sm">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Spent:</span>
                        <span>RWF {total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transactions:</span>
                        <span>{categoryExpenses.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}