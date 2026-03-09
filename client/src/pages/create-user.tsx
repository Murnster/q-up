import { useState } from "react";
import { Button } from "../components/button";
import { TextInput } from "../components/text-input";
import { CreateUserErrors, UserDetails } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";
import { useCredentials } from "../hooks/use-crendentials";
import { useToast } from "../hooks/use-toast";

export const CreateUser = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const { setUser } = useCredentials();
	const { fetchData, loading } = useFetch<UserDetails>();
	const { goToHome } = useAppNavigation();
	const { addToast } = useToast();

	const createUser = async () => {
		const result = await fetchData('/create-user', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({
				username,
				password,
				firstName,
				lastName
			})
		});

		if (result != null) {
			if (result?.errorCode) {
				handleCreateUserError(result.errorCode);
			} else if (result?.data) {
				setUser(result.data);
				goToHome();
			}
		}
	};

	const handleCreateUserError = (errorCode: number) => {
		if (errorCode === CreateUserErrors.USERNAME_EXISTS) {
			addToast('Username already exists. Please choose another one.', 'error');
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-card">
				<h2>Create Account</h2>
				<TextInput label="Username" value={ username } onChange={ setUsername } />
				<TextInput label="Password" value={ password } onChange={ setPassword } type="password" />
				<TextInput label="First Name" value={ firstName } onChange={ setFirstName } />
				<TextInput label="Last Name" value={ lastName } onChange={ setLastName } />
				<Button label={ loading ? 'Creating...' : 'Create Account' } clickHandler={ createUser } disabled={ loading } />
			</div>
		</div>
	);
};
