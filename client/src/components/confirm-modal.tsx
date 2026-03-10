import { useEffect, useRef } from "react";

interface ConfirmModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "primary" | "danger";
	onConfirm: () => void;
	onCancel: () => void;
}

export const ConfirmModal = ({
	isOpen,
	title,
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	variant = "primary",
	onConfirm,
	onCancel,
}: ConfirmModalProps) => {
	const confirmRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (isOpen) {
			confirmRef.current?.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onCancel();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onCancel]);

	if (!isOpen) {
		return null;
	}

	return (
		<div className="confirm-modal__backdrop" onClick={ onCancel }>
			<div className="confirm-modal" onClick={ (e) => e.stopPropagation() }>
				<h2 className="confirm-modal__title">{ title }</h2>
				<p className="confirm-modal__message">{ message }</p>
				<div className="confirm-modal__actions">
					<button className="btn btn--ghost" onClick={ onCancel }>
						{ cancelLabel }
					</button>
					<button
						ref={ confirmRef }
						className={ `btn btn--${variant}` }
						onClick={ onConfirm }
					>
						{ confirmLabel }
					</button>
				</div>
			</div>
		</div>
	);
};
