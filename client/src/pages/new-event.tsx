import { useState } from "react";
import { Button } from "../components/button";
import { NumInput } from "../components/num-input";
import { TextInput } from "../components/text-input";
import { CreateEventErrors, EventDetails } from "../constants/interfaces";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";
import { useToast } from "../hooks/use-toast";

export const EventCreation = () => {
	const [eventName, setEventName] = useState('');
	const [eventDescription, setEventDescription] = useState('');
	const [eventWarning, setEventWarning] = useState('');
	const [eventHours, setEventHours] = useState(0);
	const { fetchData, loading } = useFetch<EventDetails>();
	const { goToEvents } = useAppNavigation();
	const { addToast } = useToast();

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
				addToast('Event created successfully!', 'success');
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
		<div className="form-page">
			<div className="form-card">
				<h2>Create Event</h2>
				{ eventWarning && <div className="text-warning">{ eventWarning }</div> }
				<TextInput label="Event Name" value={ eventName } onChange={ setEventName } />
				<TextInput label="Event Description" value={ eventDescription } onChange={ setEventDescription } />
				<NumInput label="Event Hours" value={ eventHours } onChange={ setEventHours } min={ 1 } max={ 24 } />
				<Button label={ loading ? 'Creating...' : 'Create Event' } clickHandler={ createEvent } disabled={ loading } />
			</div>
		</div>
	);
};
