import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { routesConfig } from './routesConfig';
import { motion } from 'framer-motion';

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center h-full w-full min-h-[400px]">
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4"
    >
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-sm font-black uppercase tracking-widest text-textMuted opacity-50 animate-pulse">
        Synchronizing Matrix...
      </span>
    </motion.div>
  </div>
);

export default function AppRoutes() {
  const element = useRoutes(routesConfig);
  return element;
}
