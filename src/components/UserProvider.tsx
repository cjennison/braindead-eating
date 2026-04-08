"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type { UserProfile } from "@/types";

interface UserContextValue {
	user: UserProfile | null;
	loading: boolean;
	refreshUser: () => Promise<void>;
	updateUser: (updated: UserProfile) => void;
}

const UserContext = createContext<UserContextValue>({
	user: null,
	loading: true,
	refreshUser: async () => {},
	updateUser: () => {},
});

export function useUser() {
	return useContext(UserContext);
}

export function UserProvider({ children }: { children: ReactNode }) {
	const { status } = useSession();
	const router = useRouter();
	const [user, setUser] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const fetchedRef = useRef(false);

	const fetchUser = useCallback(async () => {
		const res = await fetch("/api/user");
		if (res.ok) {
			const data: UserProfile = await res.json();
			setUser(data);
			if (!data.onboardingComplete) {
				router.push("/onboarding");
			}
		}
		setLoading(false);
	}, [router]);

	useEffect(() => {
		if (status === "unauthenticated") {
			setLoading(false);
			return;
		}
		if (status === "authenticated" && !fetchedRef.current) {
			fetchedRef.current = true;
			fetchUser();
		}
	}, [status, fetchUser]);

	const refreshUser = useCallback(async () => {
		await fetchUser();
	}, [fetchUser]);

	const updateUser = useCallback((updated: UserProfile) => {
		setUser(updated);
	}, []);

	return (
		<UserContext.Provider value={{ user, loading, refreshUser, updateUser }}>
			{children}
		</UserContext.Provider>
	);
}
