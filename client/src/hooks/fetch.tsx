import { useCallback, useState } from "react";
import { ResponsePayload } from "../constants/interfaces";

export function useFetch<T>() {
	const [payload, setPayload] = useState<ResponsePayload<T> | null>(null);
	
	const fetchData = useCallback(async (url: string, options?: RequestInit) => {
		try {
			const response = await fetch(`http://localhost:3000${url}`, options);
			
			if (!response.ok) throw new Error(`Error: ${response.statusText}`);
			
			const result = await response.json();
			
			setPayload(result as ResponsePayload<T> ?? null);
			return result as ResponsePayload<T> ?? null;
		} catch {
			setPayload(null);
			return null;
		}
	}, []);

	return { payload, fetchData };
}