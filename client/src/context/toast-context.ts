import { createContext } from "react";

export interface Toast {
	id: string;
	message: string;
	variant: "success" | "error" | "info";
	duration: number;
}

export interface ToastContextType {
	addToast: (message: string, variant?: Toast["variant"], duration?: number) => void;
	removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);
