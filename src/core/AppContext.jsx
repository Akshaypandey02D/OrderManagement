import { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from './useNotifications';

const AppContext = createContext();

const initialAppOrders = [];
const initialAppProducts = [];

export const AppProvider = ({ children }) => {
  const [orders, setOrdersState] = useState([]);
  const [products, setProductsState] = useState([]);
  const { notifications, toasts, dispatchNotification, markNotificationsRead } = useNotifications();
  const [isLoaded, setIsLoaded] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const savedOrders = localStorage.getItem('appOrders');
    if (!savedOrders) {
      localStorage.setItem('appOrders', JSON.stringify(initialAppOrders));
      setOrdersState(initialAppOrders);
    } else {
      setOrdersState(JSON.parse(savedOrders));
    }

    const savedProducts = localStorage.getItem('appProducts');
    if (!savedProducts) {
      localStorage.setItem('appProducts', JSON.stringify(initialAppProducts));
      setProductsState(initialAppProducts);
    } else {
      setProductsState(JSON.parse(savedProducts));
    }

    
    setIsLoaded(true);
  }, []);

  const setOrders = (newOrders) => {
    setOrdersState(newOrders);
    localStorage.setItem('appOrders', JSON.stringify(newOrders));
  };

  const setProducts = (newProducts) => {
    setProductsState(newProducts);
    localStorage.setItem('appProducts', JSON.stringify(newProducts));
  };
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!isLoaded) return null;

  return (
    <AppContext.Provider value={{
      orders, setOrders,
      products, setProducts,
      notifications, dispatchNotification, markNotificationsRead,
      toasts, theme, toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
