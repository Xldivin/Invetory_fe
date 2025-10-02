import * as React from "react";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Package, Lock, Mail, User, Phone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl, getCommonHeaders, API_CONFIG } from '../config/api';

export function RegisterForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [success, setSuccess] = useState('');
  const [credentials, setCredentials] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    company_name: '',
    password: '',
    password_confirmation: '',
    subscription_plan: ''
  });
  const [currentStep, setCurrentStep] = useState<number>(1);

  const totalSteps = 3;

  const buildRequestPayload = () => ({
    full_name: credentials.full_name,
    email: credentials.email,
    phone_number: credentials.phone_number,
    company_name: credentials.company_name,
    password: credentials.password,
    password_confirmation: credentials.password_confirmation,
    subscription_plan: credentials.subscription_plan
  });

  const goNext = () => {
    try {
      console.log('=== STEP SUBMISSION PREVIEW ===');
      console.log('Current Step:', currentStep);
      console.log('Payload Preview:', buildRequestPayload());
    } catch {}
    setCurrentStep((s) => Math.min(s + 1, totalSteps));
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  // Helper function to get field errors
  const getFieldError = (fieldName: string) => {
    return fieldErrors[fieldName] ? fieldErrors[fieldName][0] : '';
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});
    setSuccess('');

    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form credentials:', credentials);
    console.log('All fields filled:', {
      full_name: !!credentials.full_name,
      email: !!credentials.email,
      phone_number: !!credentials.phone_number,
      company_name: !!credentials.company_name,
      password: !!credentials.password,
      password_confirmation: !!credentials.password_confirmation,
      subscription_plan: !!credentials.subscription_plan
    });

    // Validation
    if (!credentials.subscription_plan) {
      console.log('Validation failed: Subscription plan missing');
      setError('Please select a subscription plan.');
      setIsLoading(false);
      return;
    }

    if (credentials.password !== credentials.password_confirmation) {
      console.log('Validation failed: Passwords do not match');
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (credentials.password.length < 8) {
      console.log('Validation failed: Password too short');
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const requestPayload = {
        full_name: credentials.full_name,
        email: credentials.email,
        phone_number: credentials.phone_number,
        company_name: credentials.company_name,
        password: credentials.password,
        password_confirmation: credentials.password_confirmation,
        subscription_plan: credentials.subscription_plan
      };

      const requestUrl = getApiUrl(API_CONFIG.ENDPOINTS.REGISTER);
      const requestHeaders = getCommonHeaders();

      console.log('=== REGISTRATION API DEBUG ===');
      console.log('Request URL:', requestUrl);
      console.log('Request Headers:', requestHeaders);
      console.log('Request Payload:', requestPayload);
      console.log('API Config:', API_CONFIG);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestPayload)
      });

      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Response Data:', data);
      
      if (response.ok && data.success) {
        setSuccess('Account created successfully! You can now sign in.');
        // Clear form
        setCredentials({
          full_name: '',
          email: '',
          phone_number: '',
          company_name: '',
          password: '',
          password_confirmation: '',
          subscription_plan: ''
        });
        setCurrentStep(1);
        // Auto redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        console.log('Registration failed - Response not OK');
        console.log('Error details:', data);
        
        // Handle validation errors
        if (data.errors && typeof data.errors === 'object') {
          console.log('Field validation errors:', data.errors);
          setFieldErrors(data.errors);
          setError('Please fix the errors below and try again.');
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.log('=== REGISTRATION ERROR ===');
      console.log('Error type:', typeof err);
      console.log('Error message:', err instanceof Error ? err.message : 'Unknown error');
      console.log('Full error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



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
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <div className="flex gap-1">
                {[1,2,3].map((s) => (
                  <div key={s} className={`h-1.5 w-8 rounded-full ${currentStep >= s ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="full_name"
                      type="text"
                      placeholder="John Doe"
                      className={`pl-10 ${getFieldError('full_name') ? 'border-red-500' : ''}`}
                      value={credentials.full_name}
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        full_name: e.target.value
                      }))}
                      required
                    />
                  </div>
                  {getFieldError('full_name') && (
                    <p className="text-sm text-red-500">{getFieldError('full_name')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@mycompany.com"
                      className={`pl-10 ${getFieldError('email') ? 'border-red-500' : ''}`}
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      required
                    />
                  </div>
                  {getFieldError('email') && (
                    <p className="text-sm text-red-500">{getFieldError('email')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone_number"
                      type="tel"
                      placeholder="+1-555-0123"
                      className="pl-10"
                      value={credentials.phone_number}
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        phone_number: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    type="text"
                    placeholder="My Company LLC"
                    className={getFieldError('company_name') ? 'border-red-500' : ''}
                    value={credentials.company_name}
                    onChange={(e) => setCredentials(prev => ({
                      ...prev,
                      company_name: e.target.value
                    }))}
                    required
                  />
                  {getFieldError('company_name') && (
                    <p className="text-sm text-red-500">{getFieldError('company_name')}</p>
                  )}
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
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subscription_plan">Subscription Plan</Label>
                  <Select
                    value={credentials.subscription_plan}
                    onValueChange={(value: any) => setCredentials(prev => ({
                      ...prev,
                      subscription_plan: value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-muted-foreground">
                  You can change plans later in settings.
                </div>
              </div>
            )}

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

            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button type="button" variant="outline" className="w-1/3" onClick={goBack} disabled={isLoading}>
                  Back
                </Button>
              )}
              {currentStep < totalSteps && (
                <Button
                  type="button"
                  className={currentStep > 1 ? 'w-2/3' : 'w-full'}
                  onClick={goNext}
                  disabled={isLoading}
                >
                  Next
                </Button>
              )}
              {currentStep === totalSteps && (
                <Button type="submit" className={currentStep > 1 ? 'w-2/3' : 'w-full'} disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
