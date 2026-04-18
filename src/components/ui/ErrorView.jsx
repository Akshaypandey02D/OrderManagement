import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export const ErrorView = ({ 
  title = "Module Failure", 
  message = "A critical error occurred while synchronizing this module's data.",
  onRetry,
  resetPath = "/dashboard"
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] backdrop-blur-md"
    >
      <div className="w-20 h-20 rounded-3xl bg-rose-500 flex items-center justify-center text-white mb-6 shadow-xl shadow-rose-500/20 animate-pulse">
        <AlertCircle className="w-10 h-10" />
      </div>
      
      <h3 className="text-2xl font-black text-textMain tracking-tight mb-3">{title}</h3>
      <p className="text-sm text-textMuted font-medium max-w-sm mx-auto mb-8 leading-relaxed">
        {message}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {onRetry && (
          <Button 
            onClick={onRetry}
            className="rounded-2xl px-8 h-12 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Attempt Re-sync
          </Button>
        )}
        <Link to={resetPath}>
          <Button 
            variant="secondary"
            className="rounded-2xl px-8 h-12 border-rose-500/20 hover:bg-rose-500/10 text-rose-500 font-bold"
          >
            <Home className="w-4 h-4 mr-2" /> Return to Base
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};
