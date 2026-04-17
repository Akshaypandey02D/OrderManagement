import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-md' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
          />
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`bg-card border border-border rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden pointer-events-auto`}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-sm font-bold text-textMain uppercase tracking-widest">{title}</h3>
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors text-textMuted hover:text-textMain"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {children}
              </div>
              {footer && (
                <div className="p-4 border-t border-border flex justify-end gap-3 bg-black/5 dark:bg-white/5">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function AlertModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'primary' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-textMuted leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-textMuted hover:text-textMain transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95 ${
              variant === 'danger' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-primary shadow-primary/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
