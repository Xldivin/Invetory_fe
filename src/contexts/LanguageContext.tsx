import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.products': 'Products',
    'nav.suppliers': 'Suppliers',
    'nav.pos': 'Point of Sale',
    'nav.warehouses': 'Warehouses',
    'nav.shops': 'Shops',
    'nav.users': 'Users',
    'nav.reports': 'Reports',
    'nav.expenses': 'Expenses',
    'nav.taxes': 'Tax Calculations',
    'nav.incidents': 'Incidents',
    'nav.events': 'Events',
    'nav.chat': 'Chat',
    'nav.logs': 'Activity Logs',
    'nav.settings': 'Settings',
    
    // Common
    'common.search': 'Search',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.total': 'Total',
    'common.quantity': 'Quantity',
    'common.price': 'Price',
    'common.name': 'Name',
    'common.description': 'Description',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of your groundnut inventory operations',
    'dashboard.totalItems': 'Total Items',
    'dashboard.lowStock': 'Low Stock',
    'dashboard.orders': 'Orders',
    'dashboard.revenue': 'Revenue',
    
    // Products
    'products.title': 'Groundnut Management',
    'products.subtitle': 'Manage groundnut varieties and inventory',
    'products.tiragoundnuts': 'Tira Groundnuts',
    'products.whitegoundnuts': 'White Groundnuts',
    'products.redgoundnuts': 'Red Groundnuts',
    'products.varieties': 'Varieties',
    'products.addProduct': 'Add Groundnut Variety',
    
    // Auth
    'auth.login': 'Login',
    'auth.pin': 'PIN',
    'auth.enterPin': 'Enter your 4-digit PIN',
    'auth.invalidPin': 'Invalid PIN',
    
    // Languages
    'lang.english': 'English',
    'lang.spanish': 'Español',
    'lang.french': 'Français',
    'lang.arabic': 'العربية'
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.products': 'Productos',
    'nav.suppliers': 'Proveedores',
    'nav.pos': 'Punto de Venta',
    'nav.warehouses': 'Almacenes',
    'nav.shops': 'Tiendas',
    'nav.users': 'Usuarios',
    'nav.reports': 'Reportes',
    'nav.expenses': 'Gastos',
    'nav.taxes': 'Cálculos de Impuestos',
    'nav.incidents': 'Incidentes',
    'nav.events': 'Eventos',
    'nav.chat': 'Chat',
    'nav.logs': 'Registros de Actividad',
    'nav.settings': 'Configuración',
    
    // Common
    'common.search': 'Buscar',
    'common.add': 'Agregar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.loading': 'Cargando...',
    'common.actions': 'Acciones',
    'common.status': 'Estado',
    'common.date': 'Fecha',
    'common.total': 'Total',
    'common.quantity': 'Cantidad',
    'common.price': 'Precio',
    'common.name': 'Nombre',
    'common.description': 'Descripción',
    
    // Dashboard
    'dashboard.title': 'Panel de Control',
    'dashboard.subtitle': 'Resumen de sus operaciones de inventario de maní',
    'dashboard.totalItems': 'Total de Artículos',
    'dashboard.lowStock': 'Stock Bajo',
    'dashboard.orders': 'Pedidos',
    'dashboard.revenue': 'Ingresos',
    
    // Products
    'products.title': 'Gestión de Maní',
    'products.subtitle': 'Gestionar variedades de maní e inventario',
    'products.tiragoundnuts': 'Maní Tira',
    'products.whitegoundnuts': 'Maní Blanco',
    'products.redgoundnuts': 'Maní Rojo',
    'products.varieties': 'Variedades',
    'products.addProduct': 'Agregar Variedad de Maní',
    
    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.pin': 'PIN',
    'auth.enterPin': 'Ingrese su PIN de 4 dígitos',
    'auth.invalidPin': 'PIN inválido',
    
    // Languages
    'lang.english': 'English',
    'lang.spanish': 'Español',
    'lang.french': 'Français',
    'lang.arabic': 'العربية'
  },
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de Bord',
    'nav.products': 'Produits',
    'nav.suppliers': 'Fournisseurs',
    'nav.pos': 'Point de Vente',
    'nav.warehouses': 'Entrepôts',
    'nav.shops': 'Magasins',
    'nav.users': 'Utilisateurs',
    'nav.reports': 'Rapports',
    'nav.expenses': 'Dépenses',
    'nav.taxes': 'Calculs Fiscaux',
    'nav.incidents': 'Incidents',
    'nav.events': 'Événements',
    'nav.chat': 'Chat',
    'nav.logs': 'Journaux d\'Activité',
    'nav.settings': 'Paramètres',
    
    // Common
    'common.search': 'Rechercher',
    'common.add': 'Ajouter',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.loading': 'Chargement...',
    'common.actions': 'Actions',
    'common.status': 'Statut',
    'common.date': 'Date',
    'common.total': 'Total',
    'common.quantity': 'Quantité',
    'common.price': 'Prix',
    'common.name': 'Nom',
    'common.description': 'Description',
    
    // Dashboard
    'dashboard.title': 'Tableau de Bord',
    'dashboard.subtitle': 'Aperçu de vos opérations d\'inventaire d\'arachides',
    'dashboard.totalItems': 'Total des Articles',
    'dashboard.lowStock': 'Stock Faible',
    'dashboard.orders': 'Commandes',
    'dashboard.revenue': 'Revenus',
    
    // Products
    'products.title': 'Gestion des Arachides',
    'products.subtitle': 'Gérer les variétés d\'arachides et l\'inventaire',
    'products.tiragoundnuts': 'Arachides Tira',
    'products.whitegoundnuts': 'Arachides Blanches',
    'products.redgoundnuts': 'Arachides Rouges',
    'products.varieties': 'Variétés',
    'products.addProduct': 'Ajouter une Variété d\'Arachides',
    
    // Auth
    'auth.login': 'Connexion',
    'auth.pin': 'PIN',
    'auth.enterPin': 'Entrez votre PIN à 4 chiffres',
    'auth.invalidPin': 'PIN invalide',
    
    // Languages
    'lang.english': 'English',
    'lang.spanish': 'Español',
    'lang.french': 'Français',
    'lang.arabic': 'العربية'
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.products': 'المنتجات',
    'nav.suppliers': 'الموردون',
    'nav.pos': 'نقطة البيع',
    'nav.warehouses': 'المستودعات',
    'nav.shops': 'المتاجر',
    'nav.users': 'المستخدمون',
    'nav.reports': 'التقارير',
    'nav.expenses': 'المصروفات',
    'nav.taxes': 'حسابات الضرائب',
    'nav.incidents': 'الحوادث',
    'nav.events': 'الأحداث',
    'nav.chat': 'الدردشة',
    'nav.logs': 'سجلات النشاط',
    'nav.settings': 'الإعدادات',
    
    // Common
    'common.search': 'بحث',
    'common.add': 'إضافة',
    'common.edit': 'تحرير',
    'common.delete': 'حذف',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.loading': 'جاري التحميل...',
    'common.actions': 'الإجراءات',
    'common.status': 'الحالة',
    'common.date': 'التاريخ',
    'common.total': 'المجموع',
    'common.quantity': 'الكمية',
    'common.price': 'السعر',
    'common.name': 'الاسم',
    'common.description': 'الوصف',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.subtitle': 'نظرة عامة على عمليات مخزون الفول السوداني',
    'dashboard.totalItems': 'إجمالي العناصر',
    'dashboard.lowStock': 'مخزون منخفض',
    'dashboard.orders': 'الطلبات',
    'dashboard.revenue': 'الإيرادات',
    
    // Products
    'products.title': 'إدارة الفول السوداني',
    'products.subtitle': 'إدارة أصناف الفول السوداني والمخزون',
    'products.tiragoundnuts': 'فول سوداني تيرا',
    'products.whitegoundnuts': 'فول سوداني أبيض',
    'products.redgoundnuts': 'فول سوداني أحمر',
    'products.varieties': 'الأصناف',
    'products.addProduct': 'إضافة صنف فول سوداني',
    
    // Auth
    'auth.login': 'تسجيل الدخول',
    'auth.pin': 'الرقم السري',
    'auth.enterPin': 'أدخل الرقم السري المكون من 4 أرقام',
    'auth.invalidPin': 'رقم سري غير صحيح',
    
    // Languages
    'lang.english': 'English',
    'lang.spanish': 'Español',
    'lang.french': 'Français',
    'lang.arabic': 'العربية'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en');

  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations] || translations.en;
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}