import { useCallback, useEffect, useState } from "react";
import { EventDetails } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";

export const EventManager = () => {
	const { goToEventQR } = useAppNavigation();
	const { fetchData } = useFetch<EventDetails[]>();
	const [activeEvents, setActiveEvents] = useState<EventDetails[]>([]);
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
			} else if (result?.data) {
				setActiveEvents(result.data);
			}
		}
	}, [fetchData]);
	
	const handleGetEventsError = () => {
		setGetEventsWarning('Username already exists. Please choose another one.');
	};
	
	useEffect(() => {
		fetchEvents();
	}, [fetchEvents]);
	
	return (
		<>
			<div>Select your active events</div>
			<div className="fc g5 p10">
				<div className={ `textWarning ${getEventsWarning ? '' : 'hidden'}` }>{ getEventsWarning }</div>
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