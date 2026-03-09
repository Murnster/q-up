import { useCallback, useState } from "react";
import { ToastContainer } from "../components/toast";
import { Toast, ToastContext } from "./toast-context";

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const removeToast = useCallback((id: string) => {
		setToasts(prev => prev.filter(t => t.id !== id));
	}, []);

	const addToast = useCallback((message: string, variant: Toast["variant"] = "info", duration: number = 4000) => {
		const id = crypto.randomUUID();
		const toast: Toast = { id, message, variant, duration };

		setToasts(prev => {
			const next = [...prev, toast];
			if (next.length > 5) {
				return next.slice(-5);
			}
			return next;
		});

		setTimeout(() => {
			removeToast(id);
		}, duration);
	}, [removeToast]);

	return (
		<ToastContext.Provider value={{ addToast, removeToast }}>
			{ children }
			<ToastContainer toasts={ toasts } onDismiss={ removeToast } />
		</ToastContext.Provider>
	);
};
