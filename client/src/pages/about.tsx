import { Button } from "../components/button";
import { useAppNavigation } from "../hooks/navigation";

export const About = () => {
	const { goToLogin } = useAppNavigation();
	
	return (
		<>
			<div>About page</div>
			<Button label="Click here to login" clickHandler={ goToLogin } />
		</>
	);
};