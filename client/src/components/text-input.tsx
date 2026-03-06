import { ChangeEvent } from "react";

interface TextInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	type?: string;
}

export const TextInput = ({ label, value, onChange, type = "text" }: TextInputProps) => {
	const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange((e.target.value));
	};
	
	return (
		<div className="fc input-wrapper g5">
			{ label && <label>{ label }</label> }
			<input type={ type } value={ value } onChange={ inputChange }></input>
		</div>
	);
};