import { motion } from 'framer-motion';
import { cn } from './Button';

export const Skeleton = ({ className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={cn('bg-border/50 rounded-md', className)}
      {...props}
    />
  );
};
