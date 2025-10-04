import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useParams } from "react-router-dom";
import { EventDetails, EventSignup, GetEventDetailsPayload, UserDetails } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";

export const EventView = () => {
	const { eventID } = useParams<'eventID'>();
	const { fetchData } = useFetch<GetEventDetailsPayload>();
	const [event, setEvent] = useState<EventDetails>();
	const [eventSignees, setEventSignees] = useState<EventSignup[]>([]);
	const [getEventWarning, setGetEventWarning] = useState('');
	const [eventUsers, setEventUsers] = useState<{ [userID: string]: UserDetails }>({});
	
	const fetchEventDetails = useCallback(async () => {
		const result = await fetchData('/get-event-details', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({
				eventID: eventID || ''
			})
		});
		
		if (result != null) {
			if (result?.errorCode) {
				handleGetEventError();
			} else if (result?.data?.event) {
				setEvent(result.data.event);
				setEventSignees(result.data.signups || []);
				setEventUsers(result.data.users || {});
			}
		}
	}, [fetchData, eventID]);
	
	const handleGetEventError = () => {
		setGetEventWarning('Failed to fetch event. Please try again later.');
	};
	
	useEffect(() => {
		fetchEventDetails();
	}, [fetchEventDetails]);
		
	if (!eventID) {
		return (
			<>
				<div>Invalid Event ID</div>
			</>
		);
	}
	
	return (
		<>
			<div className="fc g10 w100 vertCenter">
				<div className={ `textWarning ${!getEventWarning ? 'hidden' : ''}` }>{ getEventWarning }</div>
				<div className="fc g5 w100 vertCenter">
					<div>{ event?.name }</div>
					<div>Scan the QR to sign up for this event!</div>
					<button onClick={ () => navigator.clipboard.writeText(eventID) }>Delete Event</button>
					<QRCode value={ eventID } />
				</div>
				<div className="fc g5 w100 vertCenter">
					<div>Registered people</div>
					{
						eventSignees.map((signee) => {
							return (
								<div key={ signee.signupID } className="fc g5">
									<div>{ eventUsers[signee.userID].firstName } { eventUsers[signee.userID].lastName }</div>
									<div>Signed up at: { new Date(signee.timestamp).toLocaleString() }</div>
								</div>
							);
						})
					}
				</div>
			</div>
		</>
	);
};