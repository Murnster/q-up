import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "../components/button";
import { useAppNavigation } from "../hooks/navigation";

export const Home = () => {
	const { goToEvents, goToNewEvent } = useAppNavigation();
	
	return (
		<>
			<div className="fc g5">
				<Button label="Start an Event" clickHandler={ goToNewEvent } />
				<Button label="Manage Events" clickHandler={ goToEvents } />
				{ /* <Button label="Scan QR" clickHandler={ QRScanner } /> */ }
				{ /* TODO Make scanner page and pass this component there! */ }
				<Scanner onScan={ (result) => console.log(result) } />
			</div>
		</>
	);
};