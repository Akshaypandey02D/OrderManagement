import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, PlusCircle, Bell, Menu, X, User, Package, CheckCircle2, XOctagon, AlertTriangle, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useUIStore } from '../stores/useUIStore';
import ErrorBoundary from '../components/ui/ErrorBoundary';

export default function DashboardLayout() {
  const { notifications, markNotificationsRead, toasts } = useNotificationStore();
  const { theme, toggleTheme, initTheme } = useUIStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleOpenNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen && unreadCount > 0) {
      markNotificationsRead();
    }
  };

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

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Low Stock', path: '/low-stock', icon: AlertTriangle },
    { name: 'Orders Listing', path: '/orders', icon: ShoppingCart },
    { name: 'Create Order', path: '/orders/new', icon: PlusCircle },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-textMain selection:bg-primary/30">
      <motion.aside
        animate={{ width: isExpanded ? 288 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`relative flex flex-col h-full bg-card shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-50 transition-colors duration-500`}
      >
        <div className="flex items-center px-6 h-20 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <span className="text-white font-black text-xl">F</span>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3 text-xl font-black tracking-tight whitespace-nowrap"
              >
                FastFleet<span className="text-primary">.</span>
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={() =>
                  `flex items-center h-12 rounded-xl transition-all duration-300 group relative ${isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/30'
                    : 'text-textMuted hover:text-textMain hover:bg-primary/5'
                  }`
                }
              >
                <div className={`flex items-center justify-center ${isExpanded ? 'w-12 mx-0' : 'w-full'} shrink-0`}>
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-bold text-sm tracking-wide whitespace-nowrap ml-1"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {!isExpanded && (
                  <div className="absolute left-full ml-6 px-3 py-2 bg-textMain text-background text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-[100] translate-x-3 group-hover:translate-x-0 shadow-2xl">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full h-12 flex items-center shadow-sm rounded-xl transition-all duration-300 ${isExpanded
              ? 'bg-primary/10 text-primary hover:bg-primary hover:text-white px-4'
              : 'justify-center bg-primary/10 text-primary hover:bg-primary hover:text-white'
              }`}
          >
            {isExpanded ? (
              <>
                <X className="w-5 h-5 shrink-0" />
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 font-bold text-sm whitespace-nowrap"
                >
                  Collapse Sidebar
                </motion.span>
              </>
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </motion.aside>

      <div className="flex flex-col flex-1 min-w-0 bg-background/50 relative">
        <header className="flex items-center justify-between h-20 px-8 bg-transparent z-40 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-black uppercase tracking-widest text-textMuted opacity-50">System Console</span>
          </div>

          <div className="flex items-center gap-4 p-2 bg-card/40 backdrop-blur-xl rounded-2xl shadow-sm border border-white/10 dark:border-white/5">
            <button
              onClick={toggleTheme}
              className="p-2.5 text-textMuted hover:text-textMain hover:bg-white/10 rounded-xl transition-all duration-300"
              title="Toggle Theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </AnimatePresence>
            </button>

            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => useUIStore.getState().setCurrency('INR')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${useUIStore(s => s.currency) === 'INR' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-textMuted hover:text-textMain'}`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => useUIStore.getState().setCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${useUIStore(s => s.currency) === 'USD' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-textMuted hover:text-textMain'}`}
              >
                $ USD
              </button>
            </div>

            <div className="relative">
              <button
                onClick={handleOpenNotifications}
                className="relative p-2.5 text-textMuted hover:text-textMain hover:bg-white/10 rounded-xl transition-all duration-300"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-card"></span>
                )}
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-card dark:bg-zinc-900 shadow-2xl rounded-2xl border border-border overflow-hidden z-[100]"
                  >
                    <div className="p-4 border-b border-white/5 font-black text-textMain text-xs uppercase tracking-widest flex justify-between items-center">
                      <span>Pulse Feed</span>
                      {unreadCount > 0 && <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px]">{unreadCount}</span>}
                    </div>
                    <div className="max-h-80 overflow-y-auto no-scrollbar pb-2">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-textMuted font-medium italic">No incoming data packets.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                            <div className="flex gap-4">
                              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`} />
                              <div>
                                <p className="text-sm text-textMain font-bold leading-tight">{n.message}</p>
                                <p className="text-[10px] text-textMuted font-black opacity-40 mt-1 uppercase">{n.date}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 px-4 py-1.5 bg-primary/10 rounded-xl border border-primary/20 group cursor-pointer transition-all duration-300 hover:bg-primary/20">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden xl:block">
                <p className="text-[10px] font-black uppercase text-primary tracking-tighter leading-none">Access Level</p>
                <p className="text-xs font-bold text-textMain mt-0.5">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4 pointer-events-none">
          <AnimatePresence mode="popLayout">
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                className={`pointer-events-auto flex items-center gap-4 p-4 rounded-2xl shadow-2xl backdrop-blur-2xl border ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : toast.type === 'danger' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-primary/10 border-primary/20'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white' : toast.type === 'danger' ? 'bg-rose-500 shadow-lg shadow-rose-500/20 text-white' : 'bg-primary shadow-lg shadow-primary/20 text-white'}`}>
                  {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : toast.type === 'danger' ? <XOctagon className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase tracking-widest opacity-40 leading-none mb-1">{toast.type || 'info'}</h5>
                  <p className="text-sm font-bold text-textMain">{toast.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative p-8">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

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
