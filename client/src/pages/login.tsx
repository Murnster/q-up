import { useState } from "react";
import { TextInput } from "../components/text-input";
import { UserDetails } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";

interface LoginProps {
	setUser: (user: UserDetails) => void;
}

export const Login = ({ setUser }: LoginProps) => {
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const { fetchData } = useFetch<UserDetails>();
	const { goToHome } = useAppNavigation();
	
	const doLogin = async () => {
		const result = await fetchData('/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({
				username,
				password
			})
		});
		
		if (result != null) {
			if (result?.errorCode) {
				// handleCreateUserError(result.errorCode);
			} else if (result?.data) {
				setUser(result.data);
				goToHome();
			}
		}
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