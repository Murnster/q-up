import QRCode from "react-qr-code";
import { useParams } from "react-router-dom";

export const EventQR = () => {
	const { eventID } = useParams<'eventID'>();
	
	// TODO: Better event checking invalidation
	if (!eventID || Number.isNaN(+eventID)) {
		return (
			<>
				<div>Invalid Event ID</div>
			</>
		);
	}
	
	return (
		<>
			<div className="fc g5 w100 vertCenter">
				<div>Event QR</div>
				<QRCode value={ eventID } />
			</div>
		</>
	);
};