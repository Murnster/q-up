import { useAppNavigation } from "../hooks/navigation";
import { useCredentials } from "../hooks/use-crendentials";
import { Button } from "./button";
import { Logo } from "./logo";

interface NavBarProps {
	title: string;
	activeEventsCount?: number;
}

export const NavBar = ({ title, activeEventsCount }: NavBarProps) => {
	const { goToEvents, goToHome, goToLogin, goToUserCreation, goToProfile } = useAppNavigation();
	const { user } = useCredentials();

	return (
		<nav className="navbar">
			<button className="navbar__left" type="button" onClick={ goToHome } aria-label="Go to home">
				<Logo />
				<h1>{ title }</h1>
			</button>
			<div className="navbar__center">
				{  }
			</div>
			<div className="navbar__right">
				{ user ? (
					<>
						{ typeof activeEventsCount === "number" && (
							<button
								className="navbar__stat"
								type="button"
								onClick={ goToEvents }
								aria-label={ `View ${activeEventsCount} active events` }
							>
								<span className="navbar__stat-label">Active Events</span>
								<span className="navbar__stat-value">{ activeEventsCount }</span>
							</button>
						) }
						<button
							className="navbar__profile"
							type="button"
							onClick={ goToProfile }
							aria-label="Profile"
						>
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
								<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
							</svg>
						</button>
					</>
				) : (
					<>
						<Button label="Login" clickHandler={ goToLogin } variant="ghost" />
						<Button label="Sign Up" clickHandler={ goToUserCreation } variant="primary" />
					</>
				) }
			</div>
		</nav>
	);
};
