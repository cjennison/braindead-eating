"use client";

import {
	ActionIcon,
	Card,
	Container,
	Group,
	Skeleton,
	Stack,
	Text,
	Title,
	UnstyledButton,
} from "@mantine/core";
import {
	IconArrowLeft,
	IconChevronDown,
	IconChevronRight,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import { PageTransition } from "@/components/PageTransition";
import type { FoodLogEntry, SubscriptionTier, UserProfile } from "@/types";
import { formatNumber, getEffectiveTier, roundGrams } from "@/types";

function formatDateLabel(dateStr: string): string {
	const [year, month, day] = dateStr.split("-").map(Number);
	const date = new Date(year, month - 1, day);
	const today = new Date();
	const yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);

	if (
		date.getFullYear() === today.getFullYear() &&
		date.getMonth() === today.getMonth() &&
		date.getDate() === today.getDate()
	) {
		return "Today";
	}
	if (
		date.getFullYear() === yesterday.getFullYear() &&
		date.getMonth() === yesterday.getMonth() &&
		date.getDate() === yesterday.getDate()
	) {
		return "Yesterday";
	}

	return date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});
}

interface DaySummary {
	date: string;
	totalCalories: number;
	itemCount: number;
	logs: FoodLogEntry[];
	totalProtein: number;
	totalCarbs: number;
	totalFat: number;
	exerciseBurn: number;
}

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"];

export default function HistoryPage() {
	const { status } = useSession();
	const router = useRouter();
	const [days, setDays] = useState<DaySummary[]>([]);
	const [expandedDate, setExpandedDate] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [tier, setTier] = useState<SubscriptionTier>("free");

	const fetchHistory = useCallback(async () => {
		const userRes = await fetch("/api/user");
		if (!userRes.ok) return;

		const user: UserProfile = await userRes.json();
		const timezone = user.timezone || "UTC";
		setTier(
			getEffectiveTier({
				subscriptionTier: user.subscriptionTier,
				subscriptionExpiresAt: user.subscriptionExpiresAt
					? new Date(user.subscriptionExpiresAt)
					: null,
			}),
		);

		const endDate = new Intl.DateTimeFormat("en-CA", {
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(new Date());

		const startD = new Date();
		startD.setDate(startD.getDate() - 30);
		const startDate = new Intl.DateTimeFormat("en-CA", {
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).format(startD);

		const [res, exerciseRes] = await Promise.all([
			fetch(
				`/api/food/log?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
			),
			fetch(
				`/api/exercise?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
			),
		]);
		if (!res.ok) {
			setLoading(false);
			return;
		}

		const exerciseByDate: Record<string, number> = exerciseRes.ok
			? (
					(await exerciseRes.json()) as {
						exerciseByDate: Record<string, number>;
					}
				).exerciseByDate
			: {};

		const data = (await res.json()) as {
			days: Record<
				string,
				{
					logs: FoodLogEntry[];
					totalCalories: number;
					itemCount: number;
				}
			>;
		};

		const results: DaySummary[] = Object.entries(data.days)
			.map(([date, day]) => ({
				date,
				totalCalories: day.totalCalories,
				itemCount: day.itemCount,
				logs: day.logs,
				totalProtein: day.logs.reduce((s, l) => s + l.totalProtein_g, 0),
				totalCarbs: day.logs.reduce((s, l) => s + l.totalCarbs_g, 0),
				totalFat: day.logs.reduce((s, l) => s + l.totalFat_g, 0),
				exerciseBurn: exerciseByDate[date] ?? 0,
			}))
			.sort((a, b) => b.date.localeCompare(a.date));

		// Include days with only exercise burn (no food)
		const existingDates = new Set(results.map((r) => r.date));
		for (const [date, burn] of Object.entries(exerciseByDate)) {
			if (!existingDates.has(date) && burn > 0) {
				results.push({
					date,
					totalCalories: 0,
					itemCount: 0,
					logs: [],
					totalProtein: 0,
					totalCarbs: 0,
					totalFat: 0,
					exerciseBurn: burn,
				});
			}
		}
		results.sort((a, b) => b.date.localeCompare(a.date));

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
			<Container
				size={480}
				pt="md"
				style={{ paddingBottom: "var(--page-bottom-padding)" }}
			>
				<Group gap="sm" mb="xl">
					<Skeleton height={36} width={36} circle />
					<Skeleton height={28} width={120} />
				</Group>
				<Stack gap="md">
					{SKELETON_KEYS.map((key) => (
						<Skeleton key={key} height={72} radius="xl" />
					))}
				</Stack>
			</Container>
		);
	}

	return (
		<PageTransition>
			<Container
				size={480}
				pt="md"
				style={{ paddingBottom: "var(--page-bottom-padding)" }}
			>
				<Group gap="sm" mb="xl" align="center">
					<ActionIcon
						variant="subtle"
						size="lg"
						radius="xl"
						onClick={() => router.push("/app")}
						aria-label="Back to today"
					>
						<IconArrowLeft size={20} />
					</ActionIcon>
					<Title
						order={3}
						style={{
							letterSpacing: "-0.02em",
						}}
					>
						History
					</Title>
				</Group>

				{days.length === 0 ? (
					<Stack align="center" mt="4rem" gap="xs">
						<Text
							c="dimmed"
							size="xl"
							fw={700}
							style={{
								fontFamily: "var(--mantine-font-family-headings)",
								letterSpacing: "-0.01em",
							}}
						>
							Nothing here yet
						</Text>
						<Text c="dimmed" size="md" ta="center" style={{ maxWidth: 300 }}>
							Log some food and it will show up here.
						</Text>
					</Stack>
				) : (
					<Stack gap="md">
						{days.map((day) => {
							const isExpanded = expandedDate === day.date;
							return (
								<div key={day.date}>
									<UnstyledButton
										onClick={() =>
											setExpandedDate(isExpanded ? null : day.date)
										}
										w="100%"
									>
										<Card padding="lg" radius="xl" withBorder>
											<Group
												justify="space-between"
												align="center"
												wrap="nowrap"
											>
												<Stack gap={2}>
													<Text
														fw={700}
														size="lg"
														style={{
															fontFamily: "var(--mantine-font-family-headings)",
															letterSpacing: "-0.01em",
														}}
													>
														{formatDateLabel(day.date)}
													</Text>
													<Text c="dimmed" size="sm">
														{day.itemCount} item
														{day.itemCount !== 1 ? "s" : ""}
														{day.exerciseBurn > 0 &&
															` + ${formatNumber(day.exerciseBurn)} burned`}
													</Text>
												</Stack>
												<Group gap="sm" wrap="nowrap">
													<Text
														fw={700}
														size="lg"
														style={{
															fontFamily: "var(--mantine-font-family-headings)",
															color: "var(--mantine-color-teal-5)",
														}}
													>
														{formatNumber(day.totalCalories)}
														<Text span size="xs" c="dimmed" fw={500} ml={2}>
															cal
														</Text>
													</Text>
													{isExpanded ? (
														<IconChevronDown size={18} color="gray" />
													) : (
														<IconChevronRight size={18} color="gray" />
													)}
												</Group>
											</Group>
										</Card>
									</UnstyledButton>
									{isExpanded && (
										<Card mt="xs" ml="md" padding="lg" radius="xl" withBorder>
											<Stack gap={12}>
												{day.logs.flatMap((log) =>
													log.items.map((item) => (
														<Group
															key={`${log._id}-${item.name}`}
															justify="space-between"
															wrap="nowrap"
															align="flex-start"
														>
															<Text
																size="md"
																fw={600}
																style={{
																	flex: 1,
																	fontFamily:
																		"var(--mantine-font-family-headings)",
																	letterSpacing: "-0.01em",
																	lineHeight: 1.3,
																	wordBreak: "break-word",
																}}
															>
																{item.name}
															</Text>
															<Text
																size="md"
																fw={700}
																style={{
																	flexShrink: 0,
																	fontFamily:
																		"var(--mantine-font-family-headings)",
																	color: "var(--mantine-color-teal-5)",
																}}
															>
																{formatNumber(item.calories)}
																<Text span size="xs" c="dimmed" fw={500} ml={2}>
																	cal
																</Text>
															</Text>
														</Group>
													)),
												)}
												{(tier === "pro" || tier === "admin") && (
													<Group
														mt={8}
														pt={8}
														gap="lg"
														style={{
															borderTop:
																"1px dashed var(--mantine-color-default-border)",
														}}
													>
														<Text size="sm" c="blue.5" fw={600}>
															P: {roundGrams(day.totalProtein)}g
														</Text>
														<Text size="sm" c="green.6" fw={600}>
															C: {roundGrams(day.totalCarbs)}g
														</Text>
														<Text size="sm" c="orange.5" fw={600}>
															F: {roundGrams(day.totalFat)}g
														</Text>
													</Group>
												)}
												{day.exerciseBurn > 0 && (
													<Text
														size="sm"
														c="teal.5"
														fw={600}
														mt={4}
														pt={4}
														style={{
															borderTop:
																"1px dashed var(--mantine-color-default-border)",
														}}
													>
														Exercise: +{formatNumber(day.exerciseBurn)} cal
														burned
													</Text>
												)}
											</Stack>
										</Card>
									)}
								</div>
							);
						})}
					</Stack>
				)}
			</Container>
		</PageTransition>
	);
}
