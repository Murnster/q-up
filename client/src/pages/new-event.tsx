import { useState } from "react";
import { Button } from "../components/button";
import { NumInput } from "../components/num-input";
import { TextInput } from "../components/text-input";

export const EventCreation = () => {
	const [eventName, setEventName] = useState('');
	const [eventDescription, setEventDescription] = useState('');
	const [eventHours, setEventHours] = useState(0);
	
	// TODO Create event - validate event during creation
	const createEvent = () => {
		console.log('Create Event');
		
		if (validateEvent()) {
			console.log('Event is valid');
			saveEvent();
		}
	};
	
	// TODO Valid event
	
	const validateEvent = () => {
		console.log('Validate Event');
		return true;
	};
	
	const saveEvent = () => {
		console.log('Save Event');
		// TODO Network request to save event
		// TODO handle failures?
	};
	
	// TODO navigate to event page?
	
	return (
		<>
			<div>Event Creation Page</div>
			<div className="fc g10">
				<TextInput label="Event Name" value={ eventName } onChange={ setEventName }></TextInput>
				<TextInput label="Event Description" value={ eventDescription } onChange={ setEventDescription }></TextInput>
				<NumInput label="Event Hours" value={ eventHours } onChange={ setEventHours }></NumInput>
				<Button label="Create Event" clickHandler={ createEvent }></Button>
			</div>
		</>
	);
};