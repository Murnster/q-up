import { useState } from "react";
import { TextInput } from "../components/text-input";
import { UserDetails } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";
import { useCredentials } from "../hooks/use-crendentials";

export const Login = () => {
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const { setUser } = useCredentials();
	const { fetchData, loading } = useFetch<UserDetails>();
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
				// TODO: Error handling
			} else if (result?.data) {
				setUser(result.data);
				goToHome();
			}
		}
	};
	
	return (
		<>
			<div className="fc g5 p10">
				<TextInput label={ "Username" } value={ username } onChange={ setUsername }></TextInput>
				<TextInput label={ "Password" } value={ password } onChange={ setPassword } type="password"></TextInput>
				<button onClick={ doLogin } disabled={ loading }>{ loading ? 'Logging in...' : 'Login' }</button>
			</div>
		</>
	);
};