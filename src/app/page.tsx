"use client";

import { Anchor, Container, Skeleton, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { CalorieDisplay } from "@/components/CalorieDisplay";
import { FoodInput } from "@/components/FoodInput";
import { FoodLogItem } from "@/components/FoodLogItem";
import { MacroBar } from "@/components/MacroBar";
import { PageTransition } from "@/components/PageTransition";
import { useFoodLogs, useUser } from "@/components/UserProvider";
import { type FoodLogEntry, getAiDailyLimit, getEffectiveTier } from "@/types";

export default function HomePage() {
	const { status } = useSession();
	const router = useRouter();
	const { user, loading: userLoading } = useUser();
	const {
		logs,
		loading: logsLoading,
		aiUsageCount,
		refreshLogs,
		setLogs,
	} = useFoodLogs();
	const [pendingLog, setPendingLog] = useState(false);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
	}, [status, router]);

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
		await refreshLogs();
	};

	const handleDelete = async (id: string) => {
		const res = await fetch(`/api/food/log/${id}`, {
			method: "DELETE",
		});

		if (res.ok) {
			setLogs((prev: FoodLogEntry[]) => prev.filter((l) => l._id !== id));
		}
	};

	const loading = status === "loading" || userLoading || logsLoading;

	const target = user?.dailyCalorieTarget ?? 2000;
	const consumed = logs.reduce((sum, log) => sum + log.totalCalories, 0);
	const remaining = target - consumed;

	const totalProtein = logs.reduce((sum, log) => sum + log.totalProtein_g, 0);
	const totalCarbs = logs.reduce((sum, log) => sum + log.totalCarbs_g, 0);
	const totalFat = logs.reduce((sum, log) => sum + log.totalFat_g, 0);

	const effectiveTier = user
		? getEffectiveTier({
				subscriptionTier: user.subscriptionTier,
				subscriptionExpiresAt: user.subscriptionExpiresAt,
			})
		: "free";
	const dailyLimit = getAiDailyLimit(effectiveTier);

	return (
		<PageTransition>
			<Container
				size={480}
				pt="md"
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

				{loading ? (
					<Stack mt="md">
						<Skeleton height={80} mb="md" />
						<Skeleton height={120} mb="md" />
						<Skeleton height={60} />
					</Stack>
				) : (
					<>
						<CalorieDisplay remaining={remaining} target={target} />

						<div style={{ marginTop: "2rem" }}>
							<FoodInput onSubmit={handleLogFood} />
							{dailyLimit !== null && (
								<Text size="xs" c="dimmed" ta="center" mt="xs">
									{dailyLimit - aiUsageCount > 0
										? `${dailyLimit - aiUsageCount} logs remaining today`
										: "No logs remaining today"}
									{effectiveTier === "free" && " (free plan)"}
								</Text>
							)}
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
								{(effectiveTier === "pro" || effectiveTier === "admin") && (
									<Text size="xs" c="dimmed">
										tap an item to check the macros
									</Text>
								)}
								{logs.map((log) => (
									<FoodLogItem
										key={log._id}
										entry={log}
										onDelete={handleDelete}
										tier={effectiveTier}
									/>
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

						<Text
							size="xs"
							c="dimmed"
							ta="center"
							mt="xl"
							style={{ opacity: 0.6 }}
						>
							Estimates powered by AI. Nutritional values are approximate.
						</Text>
					</>
				)}
			</Container>
		</PageTransition>
	);
}
