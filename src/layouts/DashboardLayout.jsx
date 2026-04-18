import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, PlusCircle, Package } from 'lucide-react';
import { Suspense } from 'react';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useUIStore } from '../stores/useUIStore';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import MockDataOnboarding from '../components/MockDataOnboarding';

// Extracted Components
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import ToastContainer from '../components/Layout/ToastContainer';

export default function DashboardLayout() {
  const { notifications, markNotificationsRead, toasts } = useNotificationStore();
  const { theme, toggleTheme, initTheme } = useUIStore();
  const location = useLocation();

  const [isExpanded, setIsExpanded] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Screen size management
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clear order draft if we navigate away from the create order page
  useEffect(() => {
    if (location.pathname !== '/orders/new') {
      localStorage.removeItem('order-form-draft');
    }
  }, [location.pathname]);

  const handleOpenNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen && unreadCount > 0) {
      markNotificationsRead();
    }
  };

  const handleCreateOrderClick = () => {
    localStorage.removeItem('order-form-draft');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
    {
      name: 'Inventory',
      icon: Package,
      children: [
        { name: 'Products', path: '/products' },
        { name: 'Low Stock', path: '/low-stock' },
      ]
    },
    { name: 'Orders', path: '/orders', icon: ShoppingCart, end: true },
    { name: 'Create Order', path: '/orders/new', icon: PlusCircle },
  ];

  const [openMenus, setOpenMenus] = useState(['Inventory']);

  const toggleMenu = (name) => {
    setOpenMenus(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-textMain selection:bg-primary/30">
      <Sidebar 
        items={navItems}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        openMenus={openMenus}
        toggleMenu={toggleMenu}
        onCreateOrderClick={handleCreateOrderClick}
      />

      <div className="flex flex-col flex-1 min-w-0 bg-background/50 relative">
        <Header 
          theme={theme}
          toggleTheme={toggleTheme}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          notifications={notifications}
          unreadCount={unreadCount}
          onOpenNotifications={handleOpenNotifications}
        />

        <ToastContainer toasts={toasts} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-8 scroll-smooth">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

          <MockDataOnboarding />

          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            }>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
