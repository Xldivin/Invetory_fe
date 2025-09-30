import * as React from "react";
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Calculator, 
  Plus, 
  Edit, 
  Save, 
  FileText, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TaxEntry } from '../types';

// Mock tax entries
const mockTaxEntries: TaxEntry[] = [
  {
    id: '1',
    period: '2024-Q1',
    sales: 125000,
    expenses: 45000,
    taxableIncome: 80000,
    taxRate: 21,
    taxAmount: 16800,
    status: 'filed',
    createdBy: '2',
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  },
  {
    id: '2',
    period: '2024-Q2',
    sales: 145000,
    expenses: 52000,
    taxableIncome: 93000,
    taxRate: 21,
    taxAmount: 19530,
    status: 'calculated',
    createdBy: '2',
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-01')
  },
  {
    id: '3',
    period: '2024-Q3',
    sales: 0,
    expenses: 0,
    taxableIncome: 0,
    taxRate: 21,
    taxAmount: 0,
    status: 'draft',
    createdBy: '2',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-01')
  }
];

export function TaxCalculations() {
  const { user, logActivity, hasPermission } = useAuth();
  
  const [taxEntries, setTaxEntries] = useState<TaxEntry[]>(mockTaxEntries);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TaxEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [entryForm, setEntryForm] = useState({
    period: '',
    sales: '',
    expenses: '',
    taxRate: '21'
  });

  const resetEntryForm = () => {
    setEntryForm({
      period: '',
      sales: '',
      expenses: '',
      taxRate: '21'
    });
  };

  const calculateTax = (sales: number, expenses: number, rate: number) => {
    const taxableIncome = sales - expenses;
    const taxAmount = (taxableIncome * rate) / 100;
    return { taxableIncome, taxAmount };
  };

  const handleAddEntry = () => {
    if (!entryForm.period) return;

    const sales = parseFloat(entryForm.sales) || 0;
    const expenses = parseFloat(entryForm.expenses) || 0;
    const taxRate = parseFloat(entryForm.taxRate);
    const { taxableIncome, taxAmount } = calculateTax(sales, expenses, taxRate);

    const newEntry: TaxEntry = {
      id: Date.now().toString(),
      period: entryForm.period,
      sales,
      expenses,
      taxableIncome,
      taxRate,
      taxAmount,
      status: 'draft',
      createdBy: user?.id || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTaxEntries(prev => [newEntry, ...prev]);
    logActivity('tax_entry_created', 'taxes', { period: newEntry.period });
    
    resetEntryForm();
    setShowAddEntry(false);
  };

  const handleEditEntry = (entry: TaxEntry) => {
    setEditingEntry(entry);
    setIsEditing(true);
  };

  const handleSaveEntry = (entryId: string, updatedData: Partial<TaxEntry>) => {
    setTaxEntries(prev => prev.map(entry => {
      if (entry.id === entryId) {
        const sales = updatedData.sales || entry.sales;
        const expenses = updatedData.expenses || entry.expenses;
        const taxRate = updatedData.taxRate || entry.taxRate;
        const { taxableIncome, taxAmount } = calculateTax(sales, expenses, taxRate);
        
        const updated = {
          ...entry,
          ...updatedData,
          taxableIncome,
          taxAmount,
          updatedAt: new Date()
        };

        logActivity('tax_entry_updated', 'taxes', { period: updated.period });
        return updated;
      }
      return entry;
    }));
    
    setEditingEntry(null);
    setIsEditing(false);
  };

  const handleCalculateEntry = (entryId: string) => {
    setTaxEntries(prev => prev.map(entry => {
      if (entry.id === entryId && entry.status === 'draft') {
        const updated = { ...entry, status: 'calculated' as const, updatedAt: new Date() };
        logActivity('tax_entry_calculated', 'taxes', { period: updated.period });
        return updated;
      }
      return entry;
    }));
  };

  const handleFileEntry = (entryId: string) => {
    setTaxEntries(prev => prev.map(entry => {
      if (entry.id === entryId && entry.status === 'calculated') {
        const updated = { ...entry, status: 'filed' as const, updatedAt: new Date() };
        logActivity('tax_entry_filed', 'taxes', { period: updated.period });
        return updated;
      }
      return entry;
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'calculated':
        return <Badge variant="secondary"><Calculator className="w-3 h-3 mr-1" />Calculated</Badge>;
      case 'filed':
        return <Badge><CheckCircle className="w-3 h-3 mr-1" />Filed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const currentYear = new Date().getFullYear();
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const totalTaxOwed = taxEntries
    .filter(entry => entry.status === 'calculated' || entry.status === 'filed')
    .reduce((sum, entry) => sum + entry.taxAmount, 0);

  const totalTaxPaid = taxEntries
    .filter(entry => entry.status === 'filed')
    .reduce((sum, entry) => sum + entry.taxAmount, 0);

  const pendingTax = totalTaxOwed - totalTaxPaid;

  if (!hasPermission('taxes.view')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3>Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to view tax calculations.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Tax Calculations</h1>
          <p className="text-muted-foreground">Manage quarterly tax calculations and filings</p>
        </div>
        <Dialog open={showAddEntry} onOpenChange={setShowAddEntry}>
          <DialogTrigger asChild>
            <Button disabled={!hasPermission('taxes.edit')}>
              <Plus className="mr-2 h-4 w-4" />
              New Tax Period
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tax Period</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tax Period</Label>
                <Select value={entryForm.period} onValueChange={(value: any) => setEntryForm(prev => ({ ...prev, period: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => 
                      quarters.map(quarter => (
                        <SelectItem key={`${year}-${quarter}`} value={`${year}-${quarter}`}>
                          {year} {quarter}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Sales</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={entryForm.sales}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, sales: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Total Expenses</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={entryForm.expenses}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, expenses: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label>Tax Rate (%)</Label>
                <Select value={entryForm.taxRate} onValueChange={(value: any) => setEntryForm(prev => ({ ...prev, taxRate: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15%</SelectItem>
                    <SelectItem value="21">21%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="28">28%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {entryForm.sales && entryForm.expenses && entryForm.taxRate && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Taxable Income:</span>
                      <span>${(parseFloat(entryForm.sales) - parseFloat(entryForm.expenses)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Estimated Tax:</span>
                      <span>${(((parseFloat(entryForm.sales) - parseFloat(entryForm.expenses)) * parseFloat(entryForm.taxRate)) / 100).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
              <Button onClick={handleAddEntry} className="w-full">
                Add Tax Period
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tax Owed</p>
                <p className="text-2xl">${totalTaxOwed.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-500">Current year</span>
                </div>
              </div>
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tax Paid</p>
                <p className="text-2xl">${totalTaxPaid.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">Filed returns</span>
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
                <p className="text-sm text-muted-foreground">Pending Tax</p>
                <p className="text-2xl">${pendingTax.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-500">Needs filing</span>
                </div>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="entries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="entries">Tax Entries</TabsTrigger>
          <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-6">
          {/* Tax Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Periods</CardTitle>
              <CardDescription>Manage your quarterly tax calculations and filings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Taxable Income</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Tax Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">{entry.period}</TableCell>
                      <TableCell>
                        {editingEntry?.id === entry.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={entry.sales}
                            className="w-24"
                            onBlur={(e) => {
                              const sales = parseFloat(e.target.value) || 0;
                              handleSaveEntry(entry.id, { sales });
                            }}
                          />
                        ) : (
                          <span className="text-sm">${entry.sales.toLocaleString()}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingEntry?.id === entry.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={entry.expenses}
                            className="w-24"
                            onBlur={(e) => {
                              const expenses = parseFloat(e.target.value) || 0;
                              handleSaveEntry(entry.id, { expenses });
                            }}
                          />
                        ) : (
                          <span className="text-sm">${entry.expenses.toLocaleString()}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">${entry.taxableIncome.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        {editingEntry?.id === entry.id ? (
                          <Select 
                            defaultValue={entry.taxRate.toString()}
                            onValueChange={(value: string) => {
                              const taxRate = parseFloat(value);
                              handleSaveEntry(entry.id, { taxRate });
                            }}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15%</SelectItem>
                              <SelectItem value="21">21%</SelectItem>
                              <SelectItem value="25">25%</SelectItem>
                              <SelectItem value="28">28%</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-sm">{entry.taxRate}%</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">${entry.taxAmount.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {hasPermission('taxes.edit') && (
                            <>
                              {editingEntry?.id === entry.id ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingEntry(null);
                                    setIsEditing(false);
                                  }}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditEntry(entry)}
                                  disabled={entry.status === 'filed'}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {entry.status === 'draft' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCalculateEntry(entry.id)}
                                >
                                  <Calculator className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {entry.status === 'calculated' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFileEntry(entry.id)}
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
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

        <TabsContent value="calculator" className="space-y-6">
          {/* Tax Calculator */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Calculator</CardTitle>
              <CardDescription>Calculate estimated taxes for planning purposes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Annual Sales Revenue</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter total sales"
                      id="calc-sales"
                    />
                  </div>
                  <div>
                    <Label>Annual Business Expenses</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter total expenses"
                      id="calc-expenses"
                    />
                  </div>
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Select defaultValue="21">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15%</SelectItem>
                        <SelectItem value="21">21%</SelectItem>
                        <SelectItem value="25">25%</SelectItem>
                        <SelectItem value="28">28%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      const sales = parseFloat((document.getElementById('calc-sales') as HTMLInputElement)?.value) || 0;
                      const expenses = parseFloat((document.getElementById('calc-expenses') as HTMLInputElement)?.value) || 0;
                      const rate = 21; // Get from select
                      const { taxableIncome, taxAmount } = calculateTax(sales, expenses, rate);
                      
                      // Update result display
                      const resultElement = document.getElementById('calc-result');
                      if (resultElement) {
                        resultElement.innerHTML = `
                          <div class="space-y-2">
                            <div class="flex justify-between">
                              <span>Gross Revenue:</span>
                              <span>$${sales.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between">
                              <span>Business Expenses:</span>
                              <span>$${expenses.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between font-medium">
                              <span>Taxable Income:</span>
                              <span>$${taxableIncome.toLocaleString()}</span>
                            </div>
                            <div class="flex justify-between font-bold text-lg">
                              <span>Estimated Tax Owed:</span>
                              <span>$${taxAmount.toLocaleString()}</span>
                            </div>
                            <div class="text-sm text-muted-foreground">
                              <p>Quarterly Payment: $${(taxAmount / 4).toLocaleString()}</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Tax
                  </Button>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4>Tax Calculation Results</h4>
                  <div id="calc-result" className="mt-4 text-center text-muted-foreground">
                    Enter your financial information to calculate estimated taxes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Planning Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Planning Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h5 className="text-sm font-medium">Quarterly Payments</h5>
                    <p className="text-sm text-muted-foreground">
                      Make quarterly estimated tax payments to avoid penalties and spread out your tax burden.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <h5 className="text-sm font-medium">Track Deductions</h5>
                    <p className="text-sm text-muted-foreground">
                      Keep detailed records of business expenses to maximize your deductions.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <h5 className="text-sm font-medium">Plan Ahead</h5>
                    <p className="text-sm text-muted-foreground">
                      Review your tax situation regularly and adjust your quarterly payments as needed.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h5 className="text-sm font-medium">Professional Help</h5>
                    <p className="text-sm text-muted-foreground">
                      Consider consulting with a tax professional for complex situations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}