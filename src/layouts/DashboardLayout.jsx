import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, PlusCircle, Bell, Search, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Orders Listing', path: '/orders', icon: ShoppingCart },
    { name: 'Create Order', path: '/orders/new', icon: PlusCircle },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 glass z-20 relative"
          >
            <div className="flex items-center justify-center h-16 border-b border-border">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                OrderFlow
              </h1>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                        isActive
                          ? 'text-white bg-primary/10'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.div
                            layoutId="active-nav-indicator"
                            className="absolute left-0 w-1 h-6 bg-primary rounded-r-md"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-zinc-400 group-hover:text-zinc-300'}`} />
                        <span className="font-medium text-sm">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card/30 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 mr-4 text-zinc-400 rounded-md hover:text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search orders..."
                className="w-64 pl-10 pr-4 py-1.5 bg-zinc-900 border border-zinc-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-background"></span>
            </button>
            <div className="flex items-center space-x-2 pl-4 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              <span className="hidden md:block text-sm font-medium text-zinc-200">Admin</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
