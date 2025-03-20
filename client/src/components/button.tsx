interface ButtonProps {
	label: string;
	clickHandler: () => void | Promise<void>;
}

export const Button = ({ label, clickHandler }: ButtonProps) => {
	return (
		<div>
			<button className="p10 m5" onClick={ clickHandler }>{ label }</button>
		</div>
	);
};