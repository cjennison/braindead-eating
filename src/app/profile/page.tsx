"use client";

import {
	Anchor,
	Button,
	Card,
	Container,
	Group,
	NumberInput,
	SegmentedControl,
	Skeleton,
	Stack,
	Text,
	Title,
	useComputedColorScheme,
	useMantineColorScheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { PageTransition } from "@/components/PageTransition";
import { SubscriptionCard } from "@/components/SubscriptionCard";
import { useUser } from "@/components/UserProvider";
import {
	calculateCalorieTarget,
	DEFICIT_MODES,
	type DeficitMode,
	formatNumber,
	type UserProfile,
	type WeightUnit,
} from "@/types";

export default function ProfilePage() {
	const { status } = useSession();
	const router = useRouter();
	const { user, loading, updateUser: setUser } = useUser();
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const { setColorScheme } = useMantineColorScheme();
	const colorScheme = useComputedColorScheme();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/auth/signin");
		}
	}, [status, router]);

	const patchUser = async (updates: Partial<UserProfile>) => {
		const res = await fetch("/api/user", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updates),
		});
		if (res.ok) {
			setUser(await res.json());
		} else {
			const data = await res.json();
			notifications.show({
				title: "Oops",
				message: data.error || "Something went wrong.",
				color: "coral",
			});
		}
	};

	const handleDeleteAccount = async () => {
		const res = await fetch("/api/user", {
			method: "DELETE",
		});
		if (res.ok) {
			await signOut({ callbackUrl: "/auth/signin" });
		}
	};

	const handleDeficitChange = (modeId: DeficitMode) => {
		if (!user?.currentWeight) return;
		const mode = DEFICIT_MODES.find((m) => m.id === modeId);
		if (!mode) return;
		const target = calculateCalorieTarget(
			user.currentWeight,
			mode.deficitPerDay,
			user.unit,
		);
		patchUser({
			deficitMode: modeId,
			dailyCalorieTarget: target,
		} as Partial<UserProfile>);
	};

	return (
		<PageTransition>
			<Container
				size={480}
				pt="md"
				style={{ paddingBottom: "var(--page-bottom-padding)" }}
			>
				<Title order={3} mb="xl">
					Profile
				</Title>

				{status === "loading" || loading || !user ? (
					<Stack>
						<Skeleton height={40} mb="xl" />
						<Skeleton height={200} />
					</Stack>
				) : (
					<Stack gap="lg">
						<div>
							<Text fw={600} size="lg">
								{user.name}
							</Text>
							<Text c="dimmed" size="sm">
								{user.email}
							</Text>
						</div>

						<Card padding="md" radius="md" withBorder>
							<Text c="dimmed" size="sm" mb={4}>
								Mode
							</Text>
							<Text fw={600}>
								{DEFICIT_MODES.find((m) => m.id === user.deficitMode)?.label ??
									"Not set"}
							</Text>
						</Card>

						<SubscriptionCard user={user} onUpdate={setUser} />

						<div>
							<Text c="dimmed" size="sm" mb={4}>
								Daily Calorie Target
							</Text>
							<Text fw={700} size="xl">
								{user.dailyCalorieTarget
									? formatNumber(user.dailyCalorieTarget)
									: "Not set"}
							</Text>
						</div>

						<div>
							<Text c="dimmed" size="sm" mb={4}>
								Intensity
							</Text>
							<Stack gap="xs">
								{DEFICIT_MODES.map((mode) => (
									<Card
										key={mode.id}
										padding="sm"
										radius="md"
										withBorder
										onClick={() => handleDeficitChange(mode.id as DeficitMode)}
										style={{
											cursor: "pointer",
											borderColor:
												user.deficitMode === mode.id
													? "var(--mantine-color-sage-5)"
													: undefined,
											borderWidth: user.deficitMode === mode.id ? 2 : 1,
										}}
									>
										<Group justify="space-between">
											<div>
												<Text fw={600}>{mode.label}</Text>
												<Text c="dimmed" size="sm">
													{mode.subtitle}
												</Text>
											</div>
											{user.currentWeight && (
												<Text fw={500} size="sm">
													{formatNumber(
														calculateCalorieTarget(
															user.currentWeight,
															mode.deficitPerDay,
															user.unit,
														),
													)}{" "}
													cal
												</Text>
											)}
										</Group>
									</Card>
								))}
							</Stack>
						</div>

						<div>
							<Text c="dimmed" size="sm" mb={4}>
								Custom Calorie Target
							</Text>
							<NumberInput
								value={user.dailyCalorieTarget ?? ""}
								onChange={(val) => {
									if (typeof val === "number" && val > 0) {
										patchUser({
											dailyCalorieTarget: val,
											deficitMode: "custom",
										} as Partial<UserProfile>);
									}
								}}
								min={1200}
								max={5000}
								step={50}
								hideControls
							/>
						</div>

						<div>
							<Text c="dimmed" size="sm" mb={4}>
								Goal Weight
							</Text>
							<NumberInput
								value={user.goalWeight ?? ""}
								onChange={(val) => {
									if (typeof val === "number" && val > 0) {
										patchUser({
											goalWeight: val,
										} as Partial<UserProfile>);
									}
								}}
								min={50}
								max={999}
								decimalScale={1}
								suffix={` ${user.unit}`}
								hideControls
							/>
						</div>

						<div>
							<Text c="dimmed" size="sm" mb={4}>
								Unit Preference
							</Text>
							<SegmentedControl
								value={user.unit}
								onChange={(val) =>
									patchUser({
										unit: val as WeightUnit,
									} as Partial<UserProfile>)
								}
								data={[
									{ label: "lbs", value: "lbs" },
									{ label: "kg", value: "kg" },
								]}
								fullWidth
							/>
						</div>

						<div>
							<Group justify="space-between" align="flex-end" mb={4}>
								<Text c="dimmed" size="sm">
									Theme
								</Text>
							</Group>
							<SegmentedControl
								value={colorScheme}
								onChange={(val) => setColorScheme(val as "light" | "dark")}
								data={[
									{ label: "Light", value: "light" },
									{ label: "Dark", value: "dark" },
								]}
								fullWidth
							/>
						</div>

						<Anchor href="/history" c="dimmed">
							Food history
						</Anchor>

						<Button
							variant="subtle"
							color="gray"
							onClick={() => signOut({ callbackUrl: "/auth/signin" })}
						>
							Sign Out
						</Button>

						{!deleteConfirm ? (
							<Text
								c="coral"
								ta="center"
								size="sm"
								style={{ cursor: "pointer" }}
								onClick={() => setDeleteConfirm(true)}
							>
								Delete my account
							</Text>
						) : (
							<Card padding="md" radius="md" withBorder>
								<Text ta="center" mb="md" size="sm">
									This will permanently delete your account and all your data.
									This cannot be undone.
								</Text>
								<Group justify="center" gap="md">
									<Button color="coral" onClick={handleDeleteAccount}>
										Delete everything
									</Button>
									<Button
										variant="default"
										onClick={() => setDeleteConfirm(false)}
									>
										Never mind
									</Button>
								</Group>
							</Card>
						)}
					</Stack>
				)}
			</Container>
		</PageTransition>
	);
}
