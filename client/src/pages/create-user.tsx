import { useState } from "react";
import { TextInput } from "../components/text-input";
import { CreateUserErrors, UserDetails } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";
import { useCredentials } from "../hooks/use-crendentials";

export const CreateUser = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const { setUser } = useCredentials();
	const [userNameWarning, setUserNameWarning] = useState('');
	const { fetchData, loading } = useFetch<UserDetails>();
	const { goToHome } = useAppNavigation();
	
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
			setUserNameWarning('Username already exists. Please choose another one.');
		}
	};
	
	return (
		<>
			<div className="fc g5 p10">
				<div className={ `textWarning ${!userNameWarning ? '' : 'hidden'}` }>{ userNameWarning }</div>
				<TextInput label={ "Username" } value={ username } onChange={ setUsername }></TextInput>
				<TextInput label={ "Password" } value={ password } onChange={ setPassword } type="password"></TextInput>
				<TextInput label={ "First Name" } value={ firstName } onChange={ setFirstName }></TextInput>
				<TextInput label={ "Last Name" } value={ lastName } onChange={ setLastName }></TextInput>
				<button onClick={ createUser } disabled={ loading }>{ loading ? 'Creating...' : 'Create User' }</button>
			</div>
		</>
	);
};