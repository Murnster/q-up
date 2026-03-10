import { useCallback, useState } from "react";
import { ResponsePayload } from "../constants/interfaces";
import { useCredentials } from "./use-crendentials";

export function useFetch<T>() {
	const [payload, setPayload] = useState<ResponsePayload<T> | null>(null);
	const [loading, setLoading] = useState(false);
	const { setUser } = useCredentials();

	const fetchData = useCallback(async (url: string, options?: RequestInit) => {
		setLoading(true);
		try {
			const response = await fetch(`${url}`, options);

			if (response.status === 401) {
				setUser(null);
				setPayload(null);
				return null;
			}

			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`);
			}

			const result = await response.json();

			setPayload(result as ResponsePayload<T> ?? null);
			return result as ResponsePayload<T> ?? null;
		} catch {
			setPayload(null);
			return null;
		} finally {
			setLoading(false);
		}
	}, [setUser]);

	return { payload, fetchData, loading };
}