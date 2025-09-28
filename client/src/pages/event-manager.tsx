import { useEffect, useState } from "react";
import { useAppNavigation } from "../hooks/navigation";

interface Event {
	eventID: number;
	name: string;
	description: string;
}

export const EventManager = () => {
	const { goToEventQR } = useAppNavigation();
	const [activeEvents, setActiveEvents] = useState<Event[]>([]);
	
	const fetchEvents = () => {
		console.log('Fetch Events');
		
		// TODO Network request to fetch events
		setActiveEvents([{ eventID: 1, name: 'Event', description: 'Event Description' }]);
	};
	
	useEffect(() => {
		fetchEvents();
	}, []);
	
	return (
		<>
			<div>Select your active events</div>
			<div className="fc g5 p10">
				{
					activeEvents.map((event) => {
						return (
							<div key={ event.eventID } onClick={ () => goToEventQR(event.eventID) } className="fc g5">
								<div data-eventid={ event.eventID }>{ event.name }</div>
								<div>{ event.description }</div>
							</div>
						);
					})
				}
			</div>
		</>
	);
};