"use client";

import { Anchor, Container, Skeleton, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CalorieDisplay } from "@/components/CalorieDisplay";
import { FoodInput } from "@/components/FoodInput";
import { FoodLogItem } from "@/components/FoodLogItem";
import { MacroBar } from "@/components/MacroBar";
import { PageTransition } from "@/components/PageTransition";
import type { FoodLogEntry, UserProfile } from "@/types";

export default function HomePage() {
	const { status } = useSession();
	const router = useRouter();
	const [logs, setLogs] = useState<FoodLogEntry[]>([]);
	const [user, setUser] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [pendingLog, setPendingLog] = useState(false);

	const fetchData = useCallback(async () => {
		const [logsRes, userRes] = await Promise.all([
			fetch("/api/food/log"),
			fetch("/api/user"),
		]);
		if (logsRes.ok) {
			setLogs(await logsRes.json());
		}
		if (userRes.ok) {
			const userData: UserProfile = await userRes.json();
			if (!userData.onboardingComplete) {
				router.push("/onboarding");
				return;
			}
			setUser(userData);
		}
		setLoading(false);
	}, [router]);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
			return;
		}
		if (status === "authenticated") {
			fetchData();
		}
	}, [status, router, fetchData]);

	const handleLogFood = async (input: string) => {
		setPendingLog(true);
		const res = await fetch("/api/food/log", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ input }),
		});

		if (!res.ok) {
			const data = await res.json();
			notifications.show({
				title: "Oops",
				message: data.error || "Something went wrong. Try again.",
				color: "coral",
			});
			setPendingLog(false);
			return;
		}

		setPendingLog(false);
		await fetchData();
	};

	const handleDelete = async (id: string) => {
		const res = await fetch(`/api/food/log/${id}`, {
			method: "DELETE",
		});

		if (res.ok) {
			setLogs((prev) => prev.filter((l) => l._id !== id));
		}
	};

	if (status === "loading" || loading) {
		return (
			<Container size={480} py="xl" pb={80}>
				<Skeleton height={40} mb="xl" />
				<Skeleton height={80} mb="md" />
				<Skeleton height={120} mb="md" />
				<Skeleton height={60} />
			</Container>
		);
	}

	const target = user?.dailyCalorieTarget ?? 2000;
	const consumed = logs.reduce((sum, log) => sum + log.totalCalories, 0);
	const remaining = target - consumed;

	const totalProtein = logs.reduce((sum, log) => sum + log.totalProtein_g, 0);
	const totalCarbs = logs.reduce((sum, log) => sum + log.totalCarbs_g, 0);
	const totalFat = logs.reduce((sum, log) => sum + log.totalFat_g, 0);

	return (
		<PageTransition>
			<Container
				size={480}
				py="md"
				style={{ paddingBottom: "var(--page-bottom-padding)" }}
			>
				<Title
					order={3}
					mb="xs"
					c="darkCharcoal.3"
					style={{ letterSpacing: "-0.02em" }}
				>
					Brain Dead Eating
				</Title>

				<CalorieDisplay remaining={remaining} target={target} />

				<div style={{ marginTop: "2rem" }}>
					<FoodInput onSubmit={handleLogFood} />
				</div>

				{logs.length === 0 && (
					<Stack align="center" mt="4rem" gap="xs">
						{pendingLog ? (
							<>
								<Text
									c="teal.5"
									size="xl"
									fw={700}
									style={{
										fontFamily: "var(--mantine-font-family-headings)",
										letterSpacing: "-0.01em",
									}}
								>
									Thinking...
								</Text>
								<Text c="dimmed" size="md" ta="center">
									Figuring out what you just ate
								</Text>
							</>
						) : (
							<>
								<Text
									c="dimmed"
									size="xl"
									fw={700}
									style={{
										fontFamily: "var(--mantine-font-family-headings)",
										letterSpacing: "-0.01em",
									}}
								>
									Empty stomach?
								</Text>
								<Text
									c="dimmed"
									size="md"
									ta="center"
									style={{ maxWidth: 300 }}
								>
									Type what you ate above. We'll do the math.
								</Text>
							</>
						)}
					</Stack>
				)}

				{logs.length > 0 && (
					<Stack mt="2.5rem" gap="md">
						<Text
							fw={700}
							size="xl"
							style={{
								fontFamily: "var(--mantine-font-family-headings)",
								letterSpacing: "0.02em",
							}}
						>
							Today's Log
						</Text>
						{logs.map((log) => (
							<FoodLogItem key={log._id} entry={log} onDelete={handleDelete} />
						))}
					</Stack>
				)}

				{logs.length > 0 && (
					<div style={{ marginTop: 32 }}>
						<MacroBar
							protein={totalProtein}
							carbs={totalCarbs}
							fat={totalFat}
						/>
					</div>
				)}

				{logs.length > 0 && (
					<Anchor
						href="/history"
						ta="center"
						display="block"
						mt="xl"
						c="dimmed"
					>
						View past days
					</Anchor>
				)}

				<BottomNav />
			</Container>
		</PageTransition>
	);
}
