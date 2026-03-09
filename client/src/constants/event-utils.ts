import { EventDetails } from "./interfaces";

export const getActiveEventsCount = (events: EventDetails[]) => {
	const now = Date.now();

	return events.filter((event) => event.endTime > now).length;
};
