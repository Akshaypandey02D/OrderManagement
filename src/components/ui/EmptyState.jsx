import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export const EmptyState = ({ 
  icon: Icon = Package, 
  title = "No Data Found", 
  description = "There are no records matching your current criteria.",
  actionLabel,
  actionLink 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-[2.5rem] bg-card/10 backdrop-blur-sm"
    >
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-black text-textMain tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-textMuted font-medium max-w-xs mx-auto mb-8">{description}</p>
      
      {actionLabel && actionLink && (
        <Link to={actionLink}>
          <Button size="lg" className="rounded-full px-8 shadow-xl shadow-primary/20">
            {actionLabel}
          </Button>
        </Link>
      )}
    </motion.div>
  );
};
