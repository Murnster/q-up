import { Button } from "../components/button";
import { useAppNavigation } from "../hooks/navigation";
import { useCredentials } from "../hooks/use-crendentials";

export const Profile = () => {
	const { user, setUser } = useCredentials();
	const { goToLogin } = useAppNavigation();

	const handleLogout = async () => {
		await fetch('/logout', {
			method: 'POST',
			credentials: 'include'
		});
		setUser(null);
		goToLogin();
	};

	return (
		<div className="auth-page">
			<div className="auth-card">
				<h2>Profile</h2>
				<p>{ user?.firstName } { user?.lastName }</p>
				<Button label="Logout" clickHandler={ handleLogout } variant="ghost" />
			</div>
		</div>
	);
};
