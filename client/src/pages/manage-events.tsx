import { useCallback, useEffect, useState } from "react";
import { EventDetails, GetEventsPayload } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";

export const EventManager = () => {
	const { goToEventQR } = useAppNavigation();
	const { fetchData } = useFetch<GetEventsPayload>();
	const [events, setEvents] = useState<EventDetails[]>([]);
	const [getEventsWarning, setGetEventsWarning] = useState('');
	
	const fetchEvents = useCallback(async () => {
		const result = await fetchData('/get-events', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
		});
		
		if (result != null) {
			if (result?.errorCode) {
				handleGetEventsError();
			} else if (result?.data?.events) {
				setEvents(result.data.events);
			}
		}
	}, [fetchData]);
	
	const handleGetEventsError = () => {
		setGetEventsWarning('Failed to fetch events. Please try again later.');
	};
	
	useEffect(() => {
		fetchEvents();
	}, [fetchEvents]);
	
	const now = Date.now();
	const activeEvents = events.filter(e => e.endTime > now);
	const endedEvents = events.filter(e => e.endTime <= now);
	
	return (
		<>
			<div>Select your active events</div>
			<div className="fc g5 p10">
				<div className={ `textWarning ${!getEventsWarning ? 'hidden' : ''}` }>{ getEventsWarning }</div>
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
			{ endedEvents.length > 0 && (
				<>
					<div style={{ color: '#999', marginTop: '20px' }}>Ended Events</div>
					<div className="fc g5 p10" style={{ opacity: 0.6 }}>
						{
							endedEvents.map((event) => {
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
			) }
		</>
	);
};