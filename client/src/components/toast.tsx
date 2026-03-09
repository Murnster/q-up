import { Toast } from "../context/toast-context";

interface ToastContainerProps {
	toasts: Toast[];
	onDismiss: (id: string) => void;
}

export const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
	if (toasts.length === 0) {
		return null;
	}

	return (
		<div className="toast-container">
			{ toasts.map(toast => (
				<ToastItem key={ toast.id } toast={ toast } onDismiss={ onDismiss } />
			)) }
		</div>
	);
};

interface ToastItemProps {
	toast: Toast;
	onDismiss: (id: string) => void;
}

const ToastItem = ({ toast, onDismiss }: ToastItemProps) => {
	return (
		<div
			className={ `toast toast--${toast.variant}` }
			onClick={ () => onDismiss(toast.id) }
		>
			<span className="toast__icon">
				{ toast.variant === "success" && (
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
				) }
				{ toast.variant === "error" && (
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
					</svg>
				) }
				{ toast.variant === "info" && (
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
						<circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
						<path d="M8 5V5.5M8 7.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
					</svg>
				) }
			</span>
			<span className="toast__message">{ toast.message }</span>
		</div>
	);
};
