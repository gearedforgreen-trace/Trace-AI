// Simple toast implementation
"use client";

import { useState, useEffect } from "react";

type ToastVariant = "default" | "destructive" | "success";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// Simple in-memory store for toasts
const toasts: Toast[] = [];
let listeners: (() => void)[] = [];

// Notify all listeners when toasts change
const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export function toast(options: ToastOptions) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant || "default",
    duration: options.duration || 5000,
  };

  toasts.push(newToast);
  notifyListeners();

  // Auto-dismiss after duration
  setTimeout(() => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.splice(index, 1);
      notifyListeners();
    }
  }, newToast.duration);

  return id;
}

export function useToast() {
  const [_toasts, setToasts] = useState<Toast[]>(toasts);

  useEffect(() => {
    const handleChange = () => {
      setToasts([...toasts]);
    };

    listeners.push(handleChange);
    return () => {
      listeners = listeners.filter((listener) => listener !== handleChange);
    };
  }, []);

  const dismiss = (id: string) => {
    const index = toasts.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.splice(index, 1);
      notifyListeners();
    }
  };

  return {
    toasts: _toasts,
    toast,
    dismiss,
  };
}
