"use client";

import { Container, Skeleton, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { PageTransition } from "@/components/PageTransition";
import { useUser, useWeightEntries } from "@/components/UserProvider";
import { WeightChart } from "@/components/WeightChart";
import { WeightInput } from "@/components/WeightInput";

export default function WeightPage() {
	const { status } = useSession();
	const router = useRouter();
	const { user, loading: userLoading } = useUser();
	const {
		entries,
		loading: entriesLoading,
		refreshEntries,
	} = useWeightEntries();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
	}, [status, router]);

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

		await refreshEntries();
	};

	const loading = status === "loading" || userLoading || entriesLoading;

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
				pt="md"
				style={{ paddingBottom: "var(--page-bottom-padding)" }}
			>
				<Title order={3} mb="xl">
					Your Weight
				</Title>

				{loading ? (
					<Stack>
						<Skeleton height={80} mb="xl" />
						<Skeleton height={200} />
					</Stack>
				) : (
					<>
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
					</>
				)}
			</Container>
		</PageTransition>
	);
}
