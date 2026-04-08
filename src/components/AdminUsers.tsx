"use client";

import {
	Badge,
	Button,
	Card,
	Group,
	Skeleton,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";

interface AdminUser {
	_id: string;
	email: string;
	name: string;
	subscriptionTier: string;
	subscriptionSource: string | null;
	trialUsed: boolean;
	aiUsageToday: number;
	totalFoodLogs: number;
	createdAt: string;
}

interface UsersResponse {
	users: AdminUser[];
	total: number;
	page: number;
	totalPages: number;
}

const TIER_COLORS: Record<string, string> = {
	free: "gray",
	pro: "teal",
	admin: "grape",
};

export function AdminUsers() {
	const [data, setData] = useState<UsersResponse | null>(null);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [changingTier, setChangingTier] = useState<string | null>(null);

	const loadUsers = useCallback(async () => {
		setLoading(true);
		const params = new URLSearchParams({
			page: String(page),
			limit: "20",
		});
		if (search.trim()) {
			params.set("search", search.trim());
		}

		const res = await fetch(`/api/admin/users?${params.toString()}`);
		if (res.ok) {
			setData(await res.json());
		}
		setLoading(false);
	}, [page, search]);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const handleSearch = () => {
		setPage(1);
		loadUsers();
	};

	const handleChangeTier = async (userId: string, newTier: string) => {
		setChangingTier(userId);
		const res = await fetch(`/api/admin/users/${userId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ subscriptionTier: newTier }),
		});

		const result = await res.json();
		setChangingTier(null);

		if (!res.ok) {
			notifications.show({
				title: "Oops",
				message: result.error ?? "Something went wrong.",
				color: "coral",
			});
			return;
		}

		notifications.show({
			title: "Updated",
			message: `Tier changed to ${newTier}.`,
			color: "teal",
		});

		loadUsers();
	};

	const cycleTier = (current: string): string => {
		if (current === "free") return "pro";
		if (current === "pro") return "admin";
		return "free";
	};

	return (
		<Stack gap="md">
			<Group gap="xs">
				<TextInput
					placeholder="Search name or email"
					value={search}
					onChange={(e) => setSearch(e.currentTarget.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") handleSearch();
					}}
					style={{ flex: 1 }}
					aria-label="Search users"
				/>
				<Button color="sage" onClick={handleSearch} variant="light">
					Search
				</Button>
			</Group>

			{loading && (
				<Stack gap="md">
					<Skeleton height={80} radius="md" />
					<Skeleton height={80} radius="md" />
					<Skeleton height={80} radius="md" />
				</Stack>
			)}

			{!loading && data && (
				<>
					<Text size="sm" c="dimmed">
						{data.total} user{data.total !== 1 ? "s" : ""}{" "}
						{search.trim() ? "found" : "total"}
					</Text>

					{data.users.map((user) => (
						<Card key={user._id} padding="md" radius="md" withBorder>
							<Group justify="space-between" mb="xs">
								<div>
									<Text fw={600} size="sm">
										{user.name}
									</Text>
									<Text size="xs" c="dimmed">
										{user.email}
									</Text>
								</div>
								<Badge
									color={TIER_COLORS[user.subscriptionTier] ?? "gray"}
									variant="filled"
									size="sm"
								>
									{user.subscriptionTier}
								</Badge>
							</Group>

							<Group gap="lg" mt="xs">
								<Text size="xs">AI today: {user.aiUsageToday}</Text>
								<Text size="xs">Logs: {user.totalFoodLogs}</Text>
								{user.subscriptionSource && (
									<Text size="xs" c="dimmed">
										via {user.subscriptionSource}
									</Text>
								)}
							</Group>

							<Button
								size="xs"
								variant="light"
								color="sage"
								mt="sm"
								loading={changingTier === user._id}
								onClick={() =>
									handleChangeTier(user._id, cycleTier(user.subscriptionTier))
								}
							>
								Change to {cycleTier(user.subscriptionTier)}
							</Button>
						</Card>
					))}

					{data.totalPages > 1 && (
						<Group justify="center" gap="md">
							<Button
								size="xs"
								variant="light"
								disabled={page <= 1}
								onClick={() => setPage((p) => p - 1)}
							>
								Previous
							</Button>
							<Text size="sm">
								{page} / {data.totalPages}
							</Text>
							<Button
								size="xs"
								variant="light"
								disabled={page >= data.totalPages}
								onClick={() => setPage((p) => p + 1)}
							>
								Next
							</Button>
						</Group>
					)}
				</>
			)}
		</Stack>
	);
}
