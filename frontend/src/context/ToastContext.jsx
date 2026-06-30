import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}


import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ICONS = {
  success: <CheckCircle2 size={20} strokeWidth={2.5} />,
  error: <XCircle size={20} strokeWidth={2.5} />,
  warning: <AlertTriangle size={20} strokeWidth={2.5} />,
  info: <Info size={20} strokeWidth={2.5} />,
};

const DURATION = 3800; 

function ToastItem({ toast, onClose }) {
  
  const progressRef = useRef(null);

  useEffect(() => {
    
    const timer = setTimeout(onClose, DURATION);

    
    if (progressRef.current) {
      progressRef.current.style.animationDuration = `${DURATION}ms`;
    }

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      className={`toast-v2 toast-v2-${toast.type}`}
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.92 }}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
      layout
    >
      
      <span className={`toast-v2-icon toast-v2-icon-${toast.type}`}>
        {ICONS[toast.type] || ICONS.info}
      </span>

      
      <span className="toast-v2-message">{toast.message}</span>

      
      <button className="toast-v2-close" onClick={onClose} aria-label="Închide">
        <X size={14} strokeWidth={2.5} />
      </button>

      
      <div
        ref={progressRef}
        className={`toast-v2-progress toast-v2-progress-${toast.type}`}
      />
    </motion.div>
  );
}
