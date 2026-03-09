import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useCallback, useState } from "react";
import { useFetch } from "../hooks/fetch";
import { useAppNavigation } from "../hooks/navigation";
import { useToast } from "../hooks/use-toast";

export const QRScanner = () => {
	const { goToHome } = useAppNavigation();
	const { fetchData, loading } = useFetch<{ done: 1 }>();
	const { addToast } = useToast();
	const [scanSuccess, setScanSuccess] = useState(false);
	const [permissionDenied, setPermissionDenied] = useState(false);

	const handleError = (error: unknown) => {
		if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError')) {
			setPermissionDenied(true);
		}
	};

	const handleScan = (result: IDetectedBarcode[]) => {
		if (loading || scanSuccess) {
			return;
		}
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
				addToast('Failed to sign up for event. Please try again.', 'error');
			} else if (result?.data?.done) {
				setScanSuccess(true);
				addToast('Successfully signed up!', 'success');
				setTimeout(() => {
					goToHome();
				}, 1500);
			}
		}
	}, [fetchData, goToHome, addToast]);

	return (
		<div className="scanner-page">
			<h2>Scan QR Code</h2>
			{ scanSuccess ? (
				<div className="scanner-success">
					<svg width="64" height="64" viewBox="0 0 64 64" fill="none">
						<circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="3"/>
						<path d="M20 32L28 40L44 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
					</svg>
					<span>Signed Up!</span>
				</div>
			) : (
				<>
					{ permissionDenied ? (
						<div className="scanner-permission-denied">
							<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
								<circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5"/>
								<path d="M24 14v12M24 34v.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
							</svg>
							<p>Camera access was denied.</p>
							<p>Please allow camera permission in your browser settings and reload the page.</p>
						</div>
					) : (
						<>
							<span className="scanner-status">{ loading ? 'Signing up...' : 'Point your camera at an event QR code' }</span>
							<div className="scanner-wrapper">
								{ !loading && <Scanner onScan={ (result) => handleScan(result) } onError={ handleError } /> }
							</div>
						</>
					) }
				</>
			) }
		</div>
	);
};
