// import React, { useState } from 'react';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Label } from './ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { Package, Lock, Mail } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';

// export function LoginForm() {
//   const { login, loginWithPin } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//   const [credentials, setCredentials] = useState({
//     email: '',
//     password: ''
//   });

//   const [pin, setPin] = useState('');

//   const handleEmailLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       const success = await login(credentials.email, credentials.password);
//       if (!success) {
//         setError('Invalid email or password');
//       }
//     } catch (err) {
//       setError('Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePinLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       const success = await loginWithPin(pin);
//       if (!success) {
//         setError('Invalid PIN');
//       }
//     } catch (err) {
//       setError('Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handlePinChange = (value: string) => {
//     if (value.length <= 4 && /^\d*$/.test(value)) {
//       setPin(value);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
//             <Package className="w-6 h-6 text-primary-foreground" />
//           </div>
//           <CardTitle>Inventory Management</CardTitle>
//           <CardDescription>
//             Sign in to access your dashboard
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <Tabs defaultValue="email" className="w-full">
//             <TabsList className="grid w-full grid-cols-2">
//               <TabsTrigger value="email">Email</TabsTrigger>
//               <TabsTrigger value="pin">Quick PIN</TabsTrigger>
//             </TabsList>

//             <TabsContent value="email" className="space-y-4">
//               <form onSubmit={handleEmailLogin} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email</Label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="email"
//                       type="email"
//                       placeholder="admin@example.com"
//                       className="pl-10"
//                       value={credentials.email}
//                       onChange={(e) => setCredentials(prev => ({
//                         ...prev,
//                         email: e.target.value
//                       }))}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="password">Password</Label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="password"
//                       type="password"
//                       placeholder="Enter your password"
//                       className="pl-10"
//                       value={credentials.password}
//                       onChange={(e) => setCredentials(prev => ({
//                         ...prev,
//                         password: e.target.value
//                       }))}
//                       required
//                     />
//                   </div>
//                 </div>

//                 {error && (
//                   <div className="text-sm text-destructive text-center">
//                     {error}
//                   </div>
//                 )}

//                 <Button type="submit" className="w-full" disabled={isLoading}>
//                   {isLoading ? 'Signing in...' : 'Sign in'}
//                 </Button>
//               </form>
//             </TabsContent>

//             <TabsContent value="pin" className="space-y-4">
//               <form onSubmit={handlePinLogin} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="pin">4-Digit PIN</Label>
//                   <Input
//                     id="pin"
//                     type="text"
//                     placeholder="Enter your PIN"
//                     className="text-center text-2xl tracking-widest"
//                     value={pin}
//                     onChange={(e) => handlePinChange(e.target.value)}
//                     maxLength={4}
//                     required
//                   />
//                 </div>

//                 {error && (
//                   <div className="text-sm text-destructive text-center">
//                     {error}
//                   </div>
//                 )}

//                 <Button type="submit" className="w-full" disabled={isLoading || pin.length !== 4}>
//                   {isLoading ? 'Signing in...' : 'Quick Access'}
//                 </Button>
//               </form>
//             </TabsContent>
//           </Tabs>

//           <div className="mt-6 text-center text-sm text-muted-foreground">
//             <p>Demo credentials:</p>
//             <p>Email: admin@example.com | Password: password</p>
//             <p>PIN: 1234 (Super Admin) | 5678 (Admin) | 9012 (Warehouse) | 3456 (Shop)</p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


import * as React from "react";
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Package, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginForm() {
  const { login, loginWithPin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'pin'>('email');
  const [error, setError] = useState('');

  // Get the intended destination from location state, default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const [pin, setPin] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(credentials.email, credentials.password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await loginWithPin(pin);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid PIN');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (value: string) => {
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value);
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
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="email"
            value={activeTab}
            onValueChange={(v: string) => setActiveTab(v as 'email' | 'pin')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="pin">Quick PIN</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
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

                {error && activeTab === 'email' && (
                  <div className="text-sm text-destructive text-center">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="pin" className="space-y-4">
              <form onSubmit={handlePinLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin">4-Digit PIN</Label>
                  <Input
                    id="pin"
                    type="text"
                    placeholder="Enter your PIN"
                    className="text-center text-2xl tracking-widest"
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    maxLength={4}
                    required
                  />
                </div>

                {error && activeTab === 'pin' && (
                  <div className="text-sm text-destructive text-center">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || pin.length !== 4}>
                  {isLoading ? 'Signing in...' : 'Quick Access'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo: use your backend credentials</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}