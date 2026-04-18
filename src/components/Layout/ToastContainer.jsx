import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XOctagon, Bell } from 'lucide-react';

export default function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className={`pointer-events-auto flex items-center gap-4 p-4 rounded-2xl shadow-2xl backdrop-blur-2xl border ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : toast.type === 'danger' 
                  ? 'bg-rose-500/10 border-rose-500/20' 
                  : 'bg-primary/10 border-primary/20'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              toast.type === 'success' 
                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white' 
                : toast.type === 'danger' 
                  ? 'bg-rose-500 shadow-lg shadow-rose-500/20 text-white' 
                  : 'bg-primary shadow-lg shadow-primary/20 text-white'
            }`}>
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
  );
}
