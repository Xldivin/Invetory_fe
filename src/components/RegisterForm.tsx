import * as React from "react";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Package, Lock, Mail, User, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl, getCommonHeaders, API_CONFIG } from '../config/api';

interface Tenant {
  tenant_id: string;
  company_name: string;
  tenant_code: string;
}

export function RegisterForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);

  const [credentials, setCredentials] = useState({
    full_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    tenant_id: '',
    role: 'customer'
  });


  // Fetch tenants on component mount
  React.useEffect(() => {
    const fetchTenants = async () => {
      try {
        setTenantsLoading(true);
        const response = await fetch(
          getApiUrl(API_CONFIG.ENDPOINTS.TENANTS),
          {
            method: 'GET',
            headers: getCommonHeaders()
          }
        );

        const data = await response.json();
        if (response.ok && data.success) {
          console.log('Fetched tenants:', data.data);
          setTenants(data.data || []);
        } else {
          console.error('Failed to fetch tenants:', data.message);
          setTenants([]);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
        setTenants([]);
      } finally {
        setTenantsLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (credentials.password !== credentials.password_confirmation) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (credentials.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (!credentials.tenant_id) {
      setError('Please select a tenant');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.USERS),
        {
          method: 'POST',
          headers: getCommonHeaders(),
          body: JSON.stringify({
            full_name: credentials.full_name,
            email: credentials.email,
            password: credentials.password,
            password_confirmation: credentials.password_confirmation,
            role: credentials.role,
            tenant_id: parseInt(credentials.tenant_id)
          })
        }
      );

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Account created successfully! You can now sign in.');
        // Clear form
        setCredentials({
          full_name: '',
          email: '',
          password: '',
          password_confirmation: '',
          tenant_id: '',
          role: 'customer'
        });
        // Auto redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Debug logging
  console.log('Current credentials.tenant_id:', credentials.tenant_id, 'Type:', typeof credentials.tenant_id);
  console.log('Available tenants:', tenants);
  console.log('Tenants loading:', tenantsLoading);
  console.log('Tenants length:', tenants.length);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>
            Create your account to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleEmailRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10"
                      value={credentials.full_name}
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        full_name: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      className="pl-10"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenant_id">Select Tenant</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={credentials.tenant_id}
                      onValueChange={(value: any) => {
                        console.log('Selected tenant ID:', value, 'Type:', typeof value);
                        console.log('Available tenants:', tenants.map(t => ({ id: t.tenant_id, type: typeof t.tenant_id, name: t.company_name })));
                        console.log('Current credentials:', credentials);
                        setCredentials(prev => ({
                          ...prev,
                          tenant_id: value
                        }));
                      }}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenantsLoading ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Loading tenants...
                          </div>
                        ) : tenants.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No tenants available
                          </div>
                        ) : (
                          tenants.map((tenant) => (
                            <SelectItem key={tenant.tenant_id} value={tenant.tenant_id}>
                              {tenant.company_name} ({tenant.tenant_code})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Debug display */}

                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        password: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password_confirmation"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={credentials.password_confirmation}
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        password_confirmation: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>

                 {error && (
                   <div className="text-sm text-destructive text-center">
                     {error}
                   </div>
                 )}

                 {success && (
                   <div className="text-sm text-green-600 text-center">
                     {success}
                   </div>
                 )}

                 <Button type="submit" className="w-full" disabled={isLoading}>
                   {isLoading ? 'Creating account...' : 'Create Account'}
                 </Button>
               </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
