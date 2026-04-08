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
import type { FoodLogEntry, UserProfile, WeightLogEntry } from "@/types";

const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

interface AppDataContextValue {
	user: UserProfile | null;
	userLoading: boolean;
	refreshUser: () => Promise<void>;
	updateUser: (updated: UserProfile) => void;

	foodLogs: FoodLogEntry[];
	foodLogsLoading: boolean;
	refreshFoodLogs: () => Promise<void>;
	setFoodLogs: (updater: FoodLogEntry[] | ((prev: FoodLogEntry[]) => FoodLogEntry[])) => void;

	weightEntries: WeightLogEntry[];
	weightEntriesLoading: boolean;
	refreshWeightEntries: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue>({
	user: null,
	userLoading: true,
	refreshUser: async () => {},
	updateUser: () => {},

	foodLogs: [],
	foodLogsLoading: true,
	refreshFoodLogs: async () => {},
	setFoodLogs: () => {},

	weightEntries: [],
	weightEntriesLoading: true,
	refreshWeightEntries: async () => {},
});

export function useUser() {
	const ctx = useContext(AppDataContext);
	return {
		user: ctx.user,
		loading: ctx.userLoading,
		refreshUser: ctx.refreshUser,
		updateUser: ctx.updateUser,
	};
}

export function useFoodLogs() {
	const ctx = useContext(AppDataContext);
	return {
		logs: ctx.foodLogs,
		loading: ctx.foodLogsLoading,
		refreshLogs: ctx.refreshFoodLogs,
		setLogs: ctx.setFoodLogs,
	};
}

export function useWeightEntries() {
	const ctx = useContext(AppDataContext);
	return {
		entries: ctx.weightEntries,
		loading: ctx.weightEntriesLoading,
		refreshEntries: ctx.refreshWeightEntries,
	};
}

function isStale(timestamp: number | null): boolean {
	if (timestamp === null) return true;
	return Date.now() - timestamp > STALE_THRESHOLD_MS;
}

export function UserProvider({ children }: { children: ReactNode }) {
	const { status } = useSession();
	const router = useRouter();

	// User state
	const [user, setUser] = useState<UserProfile | null>(null);
	const [userLoading, setUserLoading] = useState(true);
	const userFetchedAt = useRef<number | null>(null);

	// Food logs state
	const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>([]);
	const [foodLogsLoading, setFoodLogsLoading] = useState(true);
	const foodLogsFetchedAt = useRef<number | null>(null);

	// Weight entries state
	const [weightEntries, setWeightEntries] = useState<WeightLogEntry[]>([]);
	const [weightEntriesLoading, setWeightEntriesLoading] = useState(true);
	const weightFetchedAt = useRef<number | null>(null);

	const fetchUser = useCallback(async () => {
		const res = await fetch("/api/user");
		if (res.ok) {
			const data: UserProfile = await res.json();
			setUser(data);
			userFetchedAt.current = Date.now();
			if (!data.onboardingComplete) {
				router.push("/onboarding");
			}
		}
		setUserLoading(false);
	}, [router]);

	const fetchFoodLogs = useCallback(async () => {
		const res = await fetch("/api/food/log");
		if (res.ok) {
			setFoodLogs(await res.json());
			foodLogsFetchedAt.current = Date.now();
		}
		setFoodLogsLoading(false);
	}, []);

	const fetchWeightEntries = useCallback(async () => {
		const res = await fetch("/api/weight");
		if (res.ok) {
			setWeightEntries(await res.json());
			weightFetchedAt.current = Date.now();
		}
		setWeightEntriesLoading(false);
	}, []);

	// Initial fetch on auth
	useEffect(() => {
		if (status === "unauthenticated") {
			setUserLoading(false);
			setFoodLogsLoading(false);
			setWeightEntriesLoading(false);
			return;
		}
		if (status === "authenticated" && userFetchedAt.current === null) {
			fetchUser();
			fetchFoodLogs();
			fetchWeightEntries();
		}
	}, [status, fetchUser, fetchFoodLogs, fetchWeightEntries]);

	// Refresh functions: only show loading if data is stale
	const refreshUser = useCallback(async () => {
		if (isStale(userFetchedAt.current)) {
			setUserLoading(true);
		}
		await fetchUser();
	}, [fetchUser]);

	const refreshFoodLogs = useCallback(async () => {
		if (isStale(foodLogsFetchedAt.current)) {
			setFoodLogsLoading(true);
		}
		await fetchFoodLogs();
	}, [fetchFoodLogs]);

	const refreshWeightEntries = useCallback(async () => {
		if (isStale(weightFetchedAt.current)) {
			setWeightEntriesLoading(true);
		}
		await fetchWeightEntries();
	}, [fetchWeightEntries]);

	const updateUser = useCallback((updated: UserProfile) => {
		setUser(updated);
	}, []);

	const setFoodLogsWrapper = useCallback(
		(updater: FoodLogEntry[] | ((prev: FoodLogEntry[]) => FoodLogEntry[])) => {
			setFoodLogs(updater);
		},
		[],
	);

	return (
		<AppDataContext.Provider
			value={{
				user,
				userLoading,
				refreshUser,
				updateUser,
				foodLogs,
				foodLogsLoading,
				refreshFoodLogs,
				setFoodLogs: setFoodLogsWrapper,
				weightEntries,
				weightEntriesLoading,
				refreshWeightEntries,
			}}
		>
			{children}
		</AppDataContext.Provider>
	);
}
