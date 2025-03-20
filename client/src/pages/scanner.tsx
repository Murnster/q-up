
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useAppNavigation } from "../hooks/navigation";

export const QRScanner = () => {
	const { goToHome } = useAppNavigation();
	
	const handleScan = (result: IDetectedBarcode[]) => {
		console.log('Scanned!');
		
		result?.forEach((barcode) => {
			console.log(barcode.rawValue);
		});
		
		goToHome();
	};
	
	return (
		<>
			<div className="fc g5 w100 vertCenter">
				Scan QR here
				<div className="qr-wrapper w100 fr vertCenter">
					<Scanner styles={{ container: { "border": "20px solid black" } }} onScan={ (result) => handleScan(result) } />
				</div>
			</div>
		</>
	);
};