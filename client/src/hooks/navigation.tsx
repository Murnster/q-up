import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../constants/routes';

const routeHelper = (route: string, idToAppend: string | number) => {
	return route.replace(':eventID', idToAppend.toString());
};

export const useAppNavigation = () => {
	const navigate = useNavigate();
	
	return {
		goToHome: () => navigate(AppRoutes.HOME, { replace: true }),
		goToEvents: () => navigate(AppRoutes.EVENTS),
		goToNewEvent: () => navigate(AppRoutes.NEW_EVENT),
		goToLogin: () => navigate(AppRoutes.LOGIN),
		goToUserCreation: () => navigate(AppRoutes.USER_CREATION),
		goToScanner: () => navigate(AppRoutes.SCANNER),
		goToEventQR: (eventID: string) => navigate(routeHelper(AppRoutes.EVENT_QR, eventID)),
		goToProfile: () => navigate(AppRoutes.PROFILE),
	};
};