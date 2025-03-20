import { Button } from "../components/button";
import { useAppNavigation } from "../hooks/navigation";

export const Home = () => {
	const { goToEvents, goToNewEvent, goToScanner } = useAppNavigation();
	
	return (
		<>
			<div className="fc g5">
				<Button label="Start an Event" clickHandler={ goToNewEvent } />
				<Button label="Manage Events" clickHandler={ goToEvents } />
				<Button label="Scan QR" clickHandler={ goToScanner } />
			</div>
		</>
	);
};