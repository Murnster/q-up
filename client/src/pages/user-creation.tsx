import { useState } from "react";
import { TextInput } from "../components/text-input";
import { CreateUserErrors, UserDetails } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";

interface CreateUserProps {
	setUser: (user: UserDetails) => void;
}

export const CreateUser = ({ setUser }: CreateUserProps) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [userNameWarning, setUserNameWarning] = useState('');
	const { fetchData } = useFetch<UserDetails>();
	const { goToHome } = useAppNavigation();
	
	const createUser = async () => {
		console.log(username, password, firstName, lastName);
		
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
			<div className="fc g5">
				<div className="hidden textWarning">{ userNameWarning }</div>
				<TextInput label={ "Username" } value={ username } onChange={ setUsername }></TextInput>
				<TextInput label={ "Password" } value={ password } onChange={ setPassword }></TextInput>
				<TextInput label={ "First Name" } value={ firstName } onChange={ setFirstName }></TextInput>
				<TextInput label={ "Last Name" } value={ lastName } onChange={ setLastName }></TextInput>
				<button onClick={ createUser }>Create User</button>
			</div>
		</>
	);
};