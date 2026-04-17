import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Zap, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { mockDataService } from '../services/mockDataService';
import { useProductStore } from '../stores/useProductStore';
import { useOrderStore } from '../stores/useOrderStore';

export default function MockDataOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const { products } = useProductStore();
  const { orders } = useOrderStore();

  useEffect(() => {
    // Show only if both stores are completely empty and it hasn't been dismissed
    const hasBeenDismissed = localStorage.getItem('onboarding-dismissed');
    if (products.length === 0 && orders.length === 0 && !hasBeenDismissed) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [products.length, orders.length]);

  const handleInject = () => {
    mockDataService.generateMockData();
    setIsOpen(false);
    localStorage.setItem('onboarding-dismissed', 'true');
  };

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('onboarding-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleDismiss}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-white/10 shadow-2xl rounded-3xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 -translate-y-1/2 translate-x-1/2" />
            
            <div className="p-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-primary/20">
                <Database className="w-8 h-8" />
              </div>
              
              <h2 className="text-3xl font-black tracking-tight text-textMain mb-4">
                Welcome to FastFleet<span className="text-primary">.</span>
              </h2>
              
              <p className="text-textMuted leading-relaxed mb-8">
                Your console is currently empty. Would you like to initialize the system with <span className="text-primary font-bold">Mock Data</span> to explore the features?
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-textMain">Instant Dashboard</p>
                    <p className="text-xs text-textMuted">Populate analytics and recent orders instantly.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-textMain">Complete Inventory</p>
                    <p className="text-xs text-textMuted">A standard catalog with stock levels and status.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleInject}
                  className="w-full py-6 text-base font-black uppercase tracking-widest rounded-2xl group"
                >
                  Generate Mock Data <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleDismiss}
                  className="w-full py-4 text-xs font-bold text-textMuted hover:text-textMain"
                >
                  No thanks, I'll add my own
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
