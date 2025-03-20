import { ChangeEvent } from "react";

interface NumInputProps {
	label: string;
	value: number;
	onChange: (value: number) => void;
}

export const NumInput = ({ label, value, onChange }: NumInputProps) => {
	const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange(parseFloat(e.target.value));
	};
	
	return (
		<div className="fc input-wrapper g5">
			{ label && <label>{ label }</label> }
			<input type="number" value={ value } onChange={ inputChange }></input>
		</div>
	);
};