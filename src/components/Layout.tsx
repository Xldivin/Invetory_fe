import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  Store, 
  Users, 
  FileText, 
  Receipt, 
  Calculator,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  ChevronDown,
  Truck,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from './ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { user, logout, hasPermission } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { 
      id: 'dashboard', 
      label: t('nav.dashboard'), 
      icon: LayoutDashboard, 
      permission: 'dashboard.view' 
    },
    { 
      id: 'products', 
      label: t('nav.products'), 
      icon: Package, 
      permission: 'products.view' 
    },
    { 
      id: 'suppliers', 
      label: t('nav.suppliers'), 
      icon: Truck, 
      permission: 'suppliers.view' 
    },
    { 
      id: 'pos', 
      label: t('nav.pos'), 
      icon: ShoppingCart, 
      permission: 'pos.view' 
    },
    { 
      id: 'warehouses', 
      label: t('nav.warehouses'), 
      icon: Warehouse, 
      permission: 'warehouses.view' 
    },
    { 
      id: 'shops', 
      label: t('nav.shops'), 
      icon: Store, 
      permission: 'shops.view' 
    },
    { 
      id: 'users', 
      label: t('nav.users'), 
      icon: Users, 
      permission: 'users.view' 
    },
    { 
      id: 'reports', 
      label: t('nav.reports'), 
      icon: FileText, 
      permission: 'reports.view' 
    },
    { 
      id: 'expenses', 
      label: t('nav.expenses'), 
      icon: Receipt, 
      permission: 'expenses.view' 
    },
    { 
      id: 'taxes', 
      label: t('nav.taxes'), 
      icon: Calculator, 
      permission: 'taxes.view' 
    },
    { 
      id: 'incidents', 
      label: t('nav.incidents'), 
      icon: AlertTriangle, 
      permission: 'incidents.view' 
    },
    { 
      id: 'events', 
      label: t('nav.events'), 
      icon: Calendar, 
      permission: 'events.view' 
    },
    { 
      id: 'chat', 
      label: t('nav.chat'), 
      icon: MessageSquare, 
      permission: 'chat.view' 
    },
    { 
      id: 'logs', 
      label: t('nav.logs'), 
      icon: Activity, 
      permission: 'logs.view' 
    },
    { 
      id: 'settings', 
      label: t('nav.settings'), 
      icon: Settings, 
      permission: 'settings.view' 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => hasPermission(item.permission));

  const languages = [
    { code: 'en', name: t('lang.english'), flag: '🇺🇸' },
    { code: 'es', name: t('lang.spanish'), flag: '🇪🇸' },
    { code: 'fr', name: t('lang.french'), flag: '🇫🇷' },
    { code: 'ar', name: t('lang.arabic'), flag: '🇸🇦' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-lg">GroundnutPro</h1>
              <p className="text-xs text-muted-foreground">Inventory System</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-hide">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                  ${currentPage === item.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-accent hover:text-accent-foreground'
                  }
                `}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onPageChange('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                {t('nav.settings')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b px-4 py-3 flex items-center justify-between lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <h2 className="text-lg capitalize">
                {filteredMenuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="gap-2"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {theme === 'light' ? 'Dark' : 'Light'}
              </span>
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">{currentLanguage?.flag}</span>
                  <span className="hidden md:inline">{currentLanguage?.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? 'bg-accent' : ''}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu - Mobile Only */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize truncate">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onPageChange('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t('nav.settings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Logout Button - Desktop Only */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="hidden lg:flex gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xl:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}