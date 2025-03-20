import { useAppNavigation } from "../hooks/navigation";
import { Button } from "./button";

interface NavBarProps {
	title: string;
}

export const NavBar = ({ title }: NavBarProps) => {
	const { goBack } = useAppNavigation();
	
	return (
		<div className="navbar fr">
			<div className="navbarTitle fr g10 vertCenter">
				<Button label="Back" clickHandler={ goBack } />
				<h1>{ title }</h1>
			</div>
			<div className="navbarActions">
				<Button label="Button" clickHandler={ () => console.log('Hiya') } />
			</div>
		</div>
	);
};