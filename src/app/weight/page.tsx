"use client";

import { Container, Skeleton, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { WeightChart } from "@/components/WeightChart";
import { WeightInput } from "@/components/WeightInput";
import type { UserProfile, WeightLogEntry } from "@/types";

export default function WeightPage() {
	const { status } = useSession();
	const router = useRouter();
	const [entries, setEntries] = useState<WeightLogEntry[]>([]);
	const [user, setUser] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchData = useCallback(async () => {
		const [weightRes, userRes] = await Promise.all([
			fetch("/api/weight"),
			fetch("/api/user"),
		]);
		if (weightRes.ok) {
			setEntries(await weightRes.json());
		}
		if (userRes.ok) {
			setUser(await userRes.json());
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
			return;
		}
		if (status === "authenticated") {
			fetchData();
		}
	}, [status, router, fetchData]);

	const handleLogWeight = async (weight: number) => {
		const res = await fetch("/api/weight", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ weight }),
		});

		if (!res.ok) {
			notifications.show({
				title: "Oops",
				message: "Something went wrong. Try again.",
				color: "coral",
			});
			return;
		}

		await fetchData();
	};

	if (status === "loading" || loading) {
		return (
			<Container size={480} py="xl" pb={80}>
				<Skeleton height={40} mb="xl" />
				<Skeleton height={80} mb="xl" />
				<Skeleton height={200} />
			</Container>
		);
	}

	const unit = user?.unit ?? "lbs";
	const latest = entries[0];
	const goalWeight = user?.goalWeight;
	const toGo =
		latest && goalWeight
			? Math.abs(latest.weight - goalWeight).toFixed(1)
			: null;

	return (
		<PageTransition>
			<Container
				size={480}
				py="md"
				style={{ paddingBottom: "var(--page-bottom-padding)" }}
			>
				<Title order={3} mb="xl">
					Your Weight
				</Title>

				{latest && (
					<Stack align="center" mb="xl">
						<Text fw={700} style={{ fontSize: "2.5rem", lineHeight: 1.1 }}>
							{latest.weight} {unit}
						</Text>
						<Text c="dimmed" size="sm">
							logged {latest.date}
						</Text>
					</Stack>
				)}

				<WeightInput unit={unit} onSubmit={handleLogWeight} />

				{goalWeight && (
					<Stack mt="xl" gap={4} align="center">
						<Text c="dimmed">
							Goal: {goalWeight} {unit}
						</Text>
						{toGo && (
							<Text fw={500}>
								To go: {toGo} {unit}
							</Text>
						)}
					</Stack>
				)}

				<div style={{ marginTop: 32 }}>
					<WeightChart entries={entries} unit={unit} />
				</div>

				<BottomNav />
			</Container>
		</PageTransition>
	);
}
