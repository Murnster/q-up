import { useState } from "react";
import { TextInput } from "../components/text-input";
import { useAppNavigation } from "../hooks/navigation";

interface LoginProps {
	setToken: (token: string) => void;
}

export const Login = ({ setToken }: LoginProps) => {
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const { goToHome } = useAppNavigation();
	
	const doLogin = () => {
		console.log(username, password);
		const token = '1234567890';
		
		// do api call here
		
		if (token.length) {
			setToken(token);
		}
		
		// redirect to home page
		goToHome();
	};
	
	return (
		<>
			<div className="fc g5">
				<TextInput label={ "Username" } value={ username } onChange={ setUsername }></TextInput>
				<TextInput label={ "Password" } value={ password } onChange={ setPassword }></TextInput>
				<button onClick={ doLogin }>Login</button>
			</div>
		</>
	);
};