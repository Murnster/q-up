import { useAppNavigation } from "../hooks/navigation";
import { useCredentials } from "../hooks/use-crendentials";
import { Button } from "./button";

interface NavBarProps {
	title: string;
}

export const NavBar = ({ title }: NavBarProps) => {
	const { goBack, goToLogin, goToUserCreation } = useAppNavigation();
	const { user, setUser } = useCredentials();
	
	const handleLogout = () => {
		setUser(null);
		goToLogin();
	};
	
	return (
		<div className="navbar fr">
			<div className="navbarTitle fr g10 vertCenter">
				<Button label="Back" clickHandler={ goBack } />
				<h1>{ title }</h1>
			</div>
			<div className="navbarActions fr g5">
				{ user ? (
					<Button label="Logout" clickHandler={ handleLogout } />
				) : (
					<>
						<Button label="Login" clickHandler={ goToLogin } />
						<Button label="Sign Up" clickHandler={ goToUserCreation } />
					</>
				) }
			</div>
		</div>
	);
};