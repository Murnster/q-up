import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '../constants';

export const useAppNavigation = () => {
	const navigate = useNavigate();
	
	return {
		goToHome: () => navigate(AppRoutes.HOME, { replace: true }),
		goToEvents: () => navigate(AppRoutes.EVENTS),
		goToNewEvent: () => navigate(AppRoutes.NEW_EVENT),
		goToLogin: () => navigate(AppRoutes.LOGIN),
		goBack: () => navigate(-1)
	};
};