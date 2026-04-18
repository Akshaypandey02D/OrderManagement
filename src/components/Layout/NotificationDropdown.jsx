import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationDropdown({ isOpen, notifications, unreadCount }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          className="absolute right-0 mt-4 w-80 bg-card dark:bg-zinc-900 shadow-2xl rounded-2xl border border-border overflow-hidden z-[100]"
        >
          <div className="p-4 border-b border-white/5 font-black text-textMain text-xs uppercase tracking-widest flex justify-between items-center">
            <span>Pulse Feed</span>
            {unreadCount > 0 && <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px]">{unreadCount}</span>}
          </div>
          <div className="max-h-80 overflow-y-auto no-scrollbar pb-2">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-textMuted font-medium italic">No incoming data packets.</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                  <div className="flex gap-4">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`} />
                    <div>
                      <p className="text-sm text-textMain font-bold leading-tight">{n.message}</p>
                      <p className="text-[10px] text-textMuted font-black opacity-40 mt-1 uppercase">{n.date}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
