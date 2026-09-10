/**
 * NotificationToast.jsx – Contextual alert notifications
 *
 * A stack of slide-in toasts at bottom-left:
 *  - "success"  → emerald
 *  - "warning"  → amber
 *  - "error"    → crimson
 *  - "info"     → blue
 *
 * Usage:
 *   import { useToast, ToastContainer } from './NotificationToast';
 *   const { addToast } = useToast();
 *   addToast('Plot loaded!', 'success');
 */
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

const TOAST_COLORS = {
  success: {
    bar:    'bg-emerald-500',
    icon:   '✅',
    border: 'border-emerald-500/30',
    label:  'text-emerald-400',
  },
  warning: {
    bar:    'bg-amber-500',
    icon:   '⚠️',
    border: 'border-amber-500/30',
    label:  'text-amber-400',
  },
  error: {
    bar:    'bg-red-500',
    icon:   '❌',
    border: 'border-red-500/30',
    label:  'text-red-400',
  },
  info: {
    bar:    'bg-accent-blue',
    icon:   'ℹ️',
    border: 'border-accent-blue/30',
    label:  'text-blue-400',
  },
};

function Toast({ id, message, type = 'info', onDismiss }) {
  const cfg = TOAST_COLORS[type] ?? TOAST_COLORS.info;

  return (
    <div
      className={`relative flex items-start gap-3 bg-background-card border ${cfg.border} rounded-2xl shadow-card px-4 py-3 max-w-xs w-full animate-slide-up overflow-hidden`}
      role="alert"
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar} rounded-l-2xl`} />
      <span className="flex-shrink-0 text-base">{cfg.icon}</span>
      <p className="text-xs text-slate-200 leading-relaxed flex-1">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 text-slate-500 hover:text-white transition-colors text-xs"
      >
        ✕
      </button>
    </div>
  );
}

let _uid = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++_uid;
    setToasts(t => [...t.slice(-3), { id, message, type }]); // max 4 visible
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ addToast, dismiss }}>
      {children}
      {/* Toast Stack */}
      <div className="fixed bottom-24 left-4 z-[80] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>');
  return ctx;
}
