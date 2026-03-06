import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useCallback, useState } from "react";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";

export const QRScanner = () => {
	const { goToHome } = useAppNavigation();
	const { fetchData, loading } = useFetch<{ done: 1 }>();
	const [scanQRWarning, setScanQRWarning] = useState('');
	
	const handleScan = (result: IDetectedBarcode[]) => {
		if (loading) return;
		result?.forEach((barcode) => {
			if (barcode.rawValue) {
				fetchSignupWithEventID(barcode.rawValue);
			}
		});
	};
	
	const fetchSignupWithEventID = useCallback(async (eventID: string) => {
		const result = await fetchData('/register-event-signup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ eventID })
		});
		
		if (result != null) {
			if (result?.errorCode) {
				handleQRScanError();
			} else if (result?.data?.done) {
				goToHome();
			}
		}
	}, [fetchData, goToHome]);
	
	const handleQRScanError = () => {
		setScanQRWarning('Failed to scan event. Please try again later.');
	};
	
	return (
		<>
			<div className="fc g5 w100 vertCenter p10">
				<div className={ `textWarning ${!scanQRWarning ? 'hidden' : ''}` }>{ scanQRWarning }</div>
				{ loading ? 'Signing up...' : 'Scan QR here' }
				<div className="qr-wrapper w100 fr vertCenter">
					{ !loading && <Scanner styles={{ container: { "border": "20px solid black" } }} onScan={ (result) => handleScan(result) } /> }
				</div>
			</div>
		</>
	);
};