import { ChangeEvent } from "react";

interface InputProps {
	value: string;
	onChange: (value: string) => void;
	label: string;
}

export const Input = ({ value, onChange, label}: InputProps) => {
	const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange((e.target.value));
	}
	
	return (
		<div className="flex-column input-wrapper g5">
			{label && <label>{label}</label>}
			<input type="text" value={value} onChange={inputChange}></input>
		</div>
	)
}