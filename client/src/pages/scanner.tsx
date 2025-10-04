
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useCallback, useEffect, useState } from "react";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";

export const QRScanner = () => {
	const { goToHome } = useAppNavigation();
	const { fetchData } = useFetch<{ done: 1 }>();
	const [scanQRWarning, setScanQRWarning] = useState('');
	
	const handleScan = (result: IDetectedBarcode[]) => {
		console.log('Scanned!');
		
		result?.forEach((barcode) => {
			console.log(barcode.rawValue);
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
				console.log(result.data);
				// Successfully signed up
				goToHome();
			}
		}
	}, [fetchData, goToHome]);
	
	const handleQRScanError = () => {
		setScanQRWarning('Failed to scan event. Please try again later.');
	};
	
	useEffect(() => {
		// For testing purposes, automatically scan a few QR codes
		// In a real application, the user would scan QR codes manually
		// Uncomment the lines below to simulate scanning QR codes
		
		const simulateScans = async () => {
			await new Promise(res => setTimeout(res, 2000));
			await fetchSignupWithEventID('e9e992c5-cc04-485c-8206-187ac9736840');
		};
		
		simulateScans();
	}, [fetchSignupWithEventID]);
	
	return (
		<>
			<div className="fc g5 w100 vertCenter p10">
				<div className={ `textWarning ${!scanQRWarning ? 'hidden' : ''}` }>{ scanQRWarning }</div>
				Scan QR here
				<div className="qr-wrapper w100 fr vertCenter">
					<Scanner styles={{ container: { "border": "20px solid black" } }} onScan={ (result) => handleScan(result) } />
				</div>
			</div>
		</>
	);
};