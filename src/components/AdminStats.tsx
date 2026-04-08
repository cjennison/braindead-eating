"use client";

import { Card, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";

interface Stats {
	totalUsers: number;
	tiers: Record<string, number>;
	aiUsageToday: number;
	foodLogsToday: number;
	totalFoodLogs: number;
	usersAtLimit: number;
}

export function AdminStats() {
	const [stats, setStats] = useState<Stats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			const res = await fetch("/api/admin/stats");
			if (res.ok) {
				setStats(await res.json());
			}
			setLoading(false);
		};
		load();
	}, []);

	if (loading) {
		return (
			<Stack gap="md">
				<Skeleton height={80} radius="md" />
				<Skeleton height={80} radius="md" />
				<Skeleton height={80} radius="md" />
			</Stack>
		);
	}

	if (!stats) {
		return <Text c="coral">Failed to load stats.</Text>;
	}

	return (
		<Stack gap="md">
			<Card padding="md" radius="md" withBorder>
				<Text c="dimmed" size="sm">
					Total Users
				</Text>
				<Title order={2}>{stats.totalUsers.toLocaleString()}</Title>
				<Group gap="lg" mt="xs">
					<Text size="sm">Free: {stats.tiers.free ?? 0}</Text>
					<Text size="sm">Pro: {stats.tiers.pro ?? 0}</Text>
					<Text size="sm">Admin: {stats.tiers.admin ?? 0}</Text>
				</Group>
			</Card>

			<Card padding="md" radius="md" withBorder>
				<Text c="dimmed" size="sm">
					Today
				</Text>
				<Group gap="lg" mt="xs">
					<div>
						<Title order={3}>{stats.foodLogsToday.toLocaleString()}</Title>
						<Text size="sm" c="dimmed">
							Food logs
						</Text>
					</div>
					<div>
						<Title order={3}>{stats.aiUsageToday.toLocaleString()}</Title>
						<Text size="sm" c="dimmed">
							AI calls
						</Text>
					</div>
				</Group>
			</Card>

			<Card padding="md" radius="md" withBorder>
				<Group gap="lg">
					<div>
						<Title order={3}>{stats.totalFoodLogs.toLocaleString()}</Title>
						<Text size="sm" c="dimmed">
							Total food logs
						</Text>
					</div>
					<div>
						<Title order={3}>{stats.usersAtLimit.toLocaleString()}</Title>
						<Text size="sm" c="dimmed">
							At daily limit
						</Text>
					</div>
				</Group>
			</Card>
		</Stack>
	);
}
