import { EventDetails, EventSignup } from "./interfaces";

export const getActiveEventsCount = (
	events: EventDetails[],
	userID: string,
	signups: { [eventID: string]: EventSignup[] }
) => {
	const now = Date.now();

	return events.filter((event) => {
		if (event.endTime <= now) {
			return false;
		}
		const isCreator = event.createdBy === userID;
		const isSignedUp = signups[event.eventID]?.some((s) => s.userID === userID) ?? false;
		return isCreator || isSignedUp;
	}).length;
};
