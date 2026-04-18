import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';

export default function Sidebar({ items, isExpanded, setIsExpanded, openMenus, toggleMenu, onCreateOrderClick }) {
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: isExpanded ? 288 : 80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full bg-card shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-50 transition-colors duration-500"
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
              className="ml-3 text-xl font-black tracking-tight whitespace-nowrap text-textMain"
            >
              FastFleet<span className="text-primary">.</span>
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 no-scrollbar scroll-smooth">
        {items.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isOpen = openMenus.includes(item.name);
          const isChildActive = hasChildren && item.children.some(child => location.pathname === child.path);
          const isParentActive = !hasChildren && (item.end ? location.pathname === item.path : location.pathname.startsWith(item.path));

          if (hasChildren) {
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => isExpanded && toggleMenu(item.name)}
                  className={`w-full flex items-center h-12 rounded-xl transition-all duration-300 group relative ${isChildActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-textMuted hover:text-textMain hover:bg-primary/5'
                    }`}
                >
                  <div className={`flex items-center justify-center ${isExpanded ? 'w-12' : 'w-full'} shrink-0`}>
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isChildActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  </div>
                  {isExpanded && (
                    <>
                      <span className="font-bold text-sm tracking-wide ml-1 flex-1 text-left">{item.name}</span>
                      {isOpen ? <ChevronDown className="w-4 h-4 mr-4 opacity-50" /> : <ChevronRight className="w-4 h-4 mr-4 opacity-50" />}
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-12 space-y-2 py-2 pr-2">
                        {item.children.map(child => (
                          <NavLink
                            key={child.name}
                            to={child.path}
                            className={({ isActive }) =>
                              `flex items-center h-10 rounded-lg px-4 transition-all duration-300 text-xs font-black tracking-tight ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-textMuted hover:text-textMain hover:bg-white/5'}`
                            }
                          >
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              onClick={item.name === 'Create Order' ? onCreateOrderClick : undefined}
              className={({ isActive }) =>
                `flex items-center h-12 rounded-xl transition-all duration-300 group relative ${isActive
                  ? 'bg-primary text-white shadow-xl shadow-primary/30'
                  : 'text-textMuted hover:text-textMain hover:bg-primary/5'
                }`
              }
            >
              <div className={`flex items-center justify-center ${isExpanded ? 'w-12 mx-0' : 'w-full'} shrink-0`}>
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
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
  );
}
