import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../constants/routes';

const routeHelper = (route: string, idToAppend: number) => {
	return route.replace(':eventID', idToAppend.toString());
};

export const useAppNavigation = () => {
	const navigate = useNavigate();
	
	return {
		goToHome: () => navigate(AppRoutes.HOME, { replace: true }),
		goToEvents: () => navigate(AppRoutes.EVENTS),
		goToNewEvent: () => navigate(AppRoutes.NEW_EVENT),
		goToLogin: () => navigate(AppRoutes.LOGIN),
		goToScanner: () => navigate(AppRoutes.SCANNER),
		goToEventQR: (eventID: number) => navigate(routeHelper(AppRoutes.EVENT_QR, eventID)),
		goBack: () => navigate(-1) // TODO: Fix the back button to go back to parent page, not actually history
	};
};