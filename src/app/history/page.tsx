"use client";

import {
	Card,
	Container,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
	UnstyledButton,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import type { FoodLogEntry, UserProfile } from "@/types";
import { formatNumber } from "@/types";

interface DaySummary {
	date: string;
	totalCalories: number;
	itemCount: number;
	logs: FoodLogEntry[];
}

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"];

export default function HistoryPage() {
	const { status } = useSession();
	const router = useRouter();
	const [days, setDays] = useState<DaySummary[]>([]);
	const [expandedDate, setExpandedDate] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchHistory = useCallback(async () => {
		const userRes = await fetch("/api/user");
		if (!userRes.ok) return;

		const user: UserProfile = await userRes.json();
		const timezone = user.timezone || "UTC";

		const pastDays: string[] = [];
		for (let i = 1; i <= 30; i++) {
			const d = new Date();
			d.setDate(d.getDate() - i);
			const dateStr = new Intl.DateTimeFormat("en-CA", {
				timeZone: timezone,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			}).format(d);
			pastDays.push(dateStr);
		}

		const results: DaySummary[] = [];
		for (const date of pastDays) {
			const res = await fetch(`/api/food/log?date=${encodeURIComponent(date)}`);
			if (res.ok) {
				const logs: FoodLogEntry[] = await res.json();
				if (logs.length > 0) {
					const totalCalories = logs.reduce(
						(sum, l) => sum + l.totalCalories,
						0,
					);
					const itemCount = logs.reduce((sum, l) => sum + l.items.length, 0);
					results.push({ date, totalCalories, itemCount, logs });
				}
			}
		}

		setDays(results);
		setLoading(false);
	}, []);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
			return;
		}
		if (status === "authenticated") {
			fetchHistory();
		}
	}, [status, router, fetchHistory]);

	if (status === "loading" || loading) {
		return (
			<Container size={480} py="xl" pb={80}>
				<Skeleton height={40} mb="xl" />
				<Stack gap="sm">
					{SKELETON_KEYS.map((key) => (
						<Skeleton key={key} height={60} />
					))}
				</Stack>
			</Container>
		);
	}

	return (
		<Container size={480} py="md" pb={100}>
			<Title order={3} mb="xl">
				Past Days
			</Title>

			{days.length === 0 ? (
				<Text c="dimmed" ta="center" py="xl">
					No history yet. Start logging food.
				</Text>
			) : (
				<Stack gap="sm">
					{days.map((day) => (
						<div key={day.date}>
							<UnstyledButton
								onClick={() =>
									setExpandedDate(expandedDate === day.date ? null : day.date)
								}
								w="100%"
							>
								<Card padding="md" radius="md" withBorder>
									<Group justify="space-between">
										<div>
											<Text fw={600}>{day.date}</Text>
											<Text c="dimmed" size="sm">
												{day.itemCount} item
												{day.itemCount !== 1 ? "s" : ""}
											</Text>
										</div>
										<Text fw={600}>{formatNumber(day.totalCalories)} cal</Text>
									</Group>
								</Card>
							</UnstyledButton>
							{expandedDate === day.date && (
								<Card ml="md" mt={4} padding="sm" radius="md" bg="gray.0">
									<Stack gap={4}>
										{day.logs.flatMap((log) =>
											log.items.map((item) => (
												<Group
													key={`${log._id}-${item.name}`}
													justify="space-between"
												>
													<Text size="sm">{item.name}</Text>
													<Text size="sm" fw={500}>
														{formatNumber(item.calories)}
													</Text>
												</Group>
											)),
										)}
									</Stack>
								</Card>
							)}
						</div>
					))}
				</Stack>
			)}

			<BottomNav />
		</Container>
	);
}
