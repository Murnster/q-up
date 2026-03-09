interface ButtonProps {
	label: string;
	clickHandler: () => void | Promise<void>;
	variant?: 'primary' | 'danger' | 'ghost';
	disabled?: boolean;
}

export const Button = ({ label, clickHandler, variant = 'primary', disabled }: ButtonProps) => {
	return (
		<button className={ `btn btn--${variant}` } onClick={ clickHandler } disabled={ disabled }>
			{ label }
		</button>
	);
};
