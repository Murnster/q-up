import { useState } from "react";
import { Button } from "../components/button";
import { TextInput } from "../components/text-input";
import { UserDetails } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";
import { useCredentials } from "../hooks/use-crendentials";
import { useToast } from "../hooks/use-toast";

export const Login = () => {
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const { setUser } = useCredentials();
	const { fetchData, loading } = useFetch<UserDetails>();
	const { goToHome } = useAppNavigation();
	const { addToast } = useToast();

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
				addToast('Invalid username or password.', 'error');
			} else if (result?.data) {
				setUser(result.data);
				goToHome();
			}
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-card">
				<h2>Login</h2>
				<TextInput label="Username" value={ username } onChange={ setUsername } />
				<TextInput label="Password" value={ password } onChange={ setPassword } type="password" />
				<Button label={ loading ? 'Logging in...' : 'Login' } clickHandler={ doLogin } disabled={ loading } />
			</div>
		</div>
	);
};
