import { ChangeEvent } from "react";

interface NumInputProps {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
}

export const NumInput = ({ label, value, onChange, min, max, step = 1 }: NumInputProps) => {
	const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange(parseFloat(e.target.value));
	};

	const clampValue = (nextValue: number) => {
		let clampedValue = nextValue;

		if (min != null) {
			clampedValue = Math.max(min, clampedValue);
		}

		if (max != null) {
			clampedValue = Math.min(max, clampedValue);
		}

		onChange(clampedValue);
	};

	return (
		<div className="input-wrapper">
			{ label && <label>{ label }</label> }
			<div className="number-input">
				<input type="number" value={ value } onChange={ inputChange } min={ min } max={ max } step={ step } />
				<div className="number-input__controls">
					<button
						type="button"
						className="number-input__button"
						aria-label={ `Increase ${label.toLowerCase()}` }
						onClick={ () => clampValue(value + step) }
					>
						<span aria-hidden="true">+</span>
					</button>
					<button
						type="button"
						className="number-input__button"
						aria-label={ `Decrease ${label.toLowerCase()}` }
						onClick={ () => clampValue(value - step) }
					>
						<span aria-hidden="true">-</span>
					</button>
				</div>
			</div>
		</div>
	);
};
