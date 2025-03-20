import { ChangeEvent } from "react";

interface TextInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

export const TextInput = ({ label, value, onChange }: TextInputProps) => {
	const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange((e.target.value));
	};
	
	return (
		<div className="fc input-wrapper g5">
			{ label && <label>{ label }</label> }
			<input type="text" value={ value } onChange={ inputChange }></input>
		</div>
	);
};