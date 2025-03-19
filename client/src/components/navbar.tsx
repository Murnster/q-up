import { useNavigate } from "react-router-dom";
import { Button } from "./button";

interface NavBarProps {
	title: string;
}

export const NavBar = ({title}: NavBarProps) => {
	const navigate = useNavigate();
	
	return (
		<div className="navbar flex-row">
			<div className="navbarTitle flex-row">
				<h1>{title}</h1>
			</div>
			<div className="navbarActions">
				<Button label="Login" clickHandler={() => navigate('/login')} />
			</div>
		</div>
	)
}