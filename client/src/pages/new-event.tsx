import { useState } from "react";
import { Button } from "../components/button";
import { NumInput } from "../components/num-input";
import { TextInput } from "../components/text-input";
import { CreateEventErrors, EventDetails } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";

export const EventCreation = () => {
	const [eventName, setEventName] = useState('');
	const [eventDescription, setEventDescription] = useState('');
	const [eventWarning, setEventWarning] = useState('');
	const [eventHours, setEventHours] = useState(0);
	const { fetchData, loading } = useFetch<EventDetails>();
	const { goToEvents } = useAppNavigation();
	
	const createEvent = () => {
		if (validateEvent()) {
			saveEvent();
		}
	};
	
	const validateEvent = () => {
		if (eventName.length === 0) {
			handleCreateEventError(CreateEventErrors.INVALID_NAME);
		} else if (eventDescription.length === 0) {
			handleCreateEventError(CreateEventErrors.INVALID_DESCRIPTION);
		} else if (isNaN(eventHours) || eventHours < 1 || eventHours == 0 || eventHours > 24) {
			handleCreateEventError(CreateEventErrors.INVALID_HOURS);
		} else {
			return true;
		}
		
		return false;
	};
	
	const saveEvent = async () => {
		const result = await fetchData('/create-event', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({
				eventName,
				eventDescription,
				eventHours
			})
		});
		
		if (result != null) {
			if (result?.errorCode) {
				handleCreateEventError(result.errorCode);
			} else if (result?.data) {
				goToEvents();
			}
		}
	};
	
	const handleCreateEventError = (errorCode: number) => {
		if (errorCode === CreateEventErrors.INVALID_NAME) {
			setEventWarning('Event name is invalid. Please enter a valid name.');
		} else if (errorCode === CreateEventErrors.INVALID_DESCRIPTION) {
			setEventWarning('Event description is invalid. Please enter a valid description.');
		} else if (errorCode === CreateEventErrors.INVALID_HOURS) {
			setEventWarning('Event hours are invalid. An exvent cannot be longer than 24 hours. Please enter a valid number of hours.');
		}
	};
	
	return (
		<>
			<div>Event Creation Page</div>
			<div className="fc g10 p10">
				<div className={ `textWarning ${!eventWarning ? '' : 'hidden'}` }>{ eventWarning }</div>
				<TextInput label="Event Name" value={ eventName } onChange={ setEventName }></TextInput>
				<TextInput label="Event Description" value={ eventDescription } onChange={ setEventDescription }></TextInput>
				<NumInput label="Event Hours" value={ eventHours } onChange={ setEventHours }></NumInput>
				<Button label={ loading ? 'Creating...' : 'Create Event' } clickHandler={ createEvent }></Button>
			</div>
		</>
	);
};