import { useState } from "react";
import { Button } from "../components/button";
import { Input } from "../components/input";

export const Home = () => {
	const [inputValue, setInputValue] = useState('')
	
	const handleButtonClick = () => {
		console.log('Button clicked!')
		console.log('Input value:', inputValue);
	}
	
	return (
		<>
			<Input value={inputValue} onChange={setInputValue} label="Input label"></Input>
			<Button label="Test Button" clickHandler={handleButtonClick} />
		</>
	)
}