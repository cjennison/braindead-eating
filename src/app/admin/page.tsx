"use client";

import {
	Button,
	Container,
	Group,
	SegmentedControl,
	Skeleton,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { AdminPromos } from "@/components/AdminPromos";
import { AdminStats } from "@/components/AdminStats";
import { AdminUsers } from "@/components/AdminUsers";
import { PageTransition } from "@/components/PageTransition";
import { useUser } from "@/components/UserProvider";

type AdminTab = "stats" | "promos" | "users";

export default function AdminPage() {
	const { status } = useSession();
	const router = useRouter();
	const { user, loading } = useUser();
	const [tab, setTab] = useState<AdminTab>("stats");

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
	}, [status, router]);

	useEffect(() => {
		if (!loading && user && user.subscriptionTier !== "admin") {
			router.push("/profile");
		}
	}, [loading, user, router]);

	if (loading || !user) {
		return (
			<PageTransition>
				<Container size="xs" py="xl">
					<Stack gap="md">
						<Skeleton height={40} radius="md" />
						<Skeleton height={40} radius="md" />
						<Skeleton height={200} radius="md" />
					</Stack>
				</Container>
			</PageTransition>
		);
	}

	if (user.subscriptionTier !== "admin") {
		return (
			<PageTransition>
				<Container size="xs" py="xl">
					<Text c="coral" ta="center">
						Access denied.
					</Text>
				</Container>
			</PageTransition>
		);
	}

	return (
		<PageTransition>
			<Container size="xs" py="xl" pb={100}>
				<Stack gap="lg">
					<Group justify="space-between">
						<Title order={2}>Admin</Title>
						<Button
							component={Link}
							href="/profile"
							variant="light"
							color="sage"
							size="sm"
						>
							Back to App
						</Button>
					</Group>

					<SegmentedControl
						fullWidth
						data={[
							{ label: "Stats", value: "stats" },
							{ label: "Promos", value: "promos" },
							{ label: "Users", value: "users" },
						]}
						value={tab}
						onChange={(v) => setTab(v as AdminTab)}
					/>

					{tab === "stats" && <AdminStats />}
					{tab === "promos" && <AdminPromos />}
					{tab === "users" && <AdminUsers />}
				</Stack>
			</Container>
		</PageTransition>
	);
}
