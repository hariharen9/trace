import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function ToastContainer() {
  const { toasts, isSidebarCollapsed } = useApp();

  return (
    <div className={`fixed z-[9999] flex flex-col gap-[7px] items-center pointer-events-none transition-all duration-300
      max-md:top-20 max-md:bottom-auto max-md:left-1/2 max-md:-translate-x-1/2
      md:bottom-[80px] md:-translate-x-1/2
      ${isSidebarCollapsed ? 'md:left-1/2' : 'md:left-[calc(50vw+170px)]'}`}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function Toast({ toast }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 2700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`bg-elevated border rounded-full py-[9px] px-[17px] text-t1 text-[13px] font-medium flex items-center gap-[7px] pointer-events-auto whitespace-nowrap
        ${toast.type === 'ok' ? 'border-[rgba(16,185,129,0.32)]' : 'border-b2'}`}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 6px 28px rgba(0,0,0,.4)',
        animation: exiting ? 'toast-out 0.28s ease forwards' : 'toast-in 0.28s cubic-bezier(0.34,1.56,0.64,1) both',
      }}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${toast.type === 'ok' ? 'bg-mint' : 'bg-primary'}`} />
      {toast.msg}
    </div>
  );
}
