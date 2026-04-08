"use client";

import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Group,
	Modal,
	NumberInput,
	SegmentedControl,
	Skeleton,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";

interface PromoCode {
	_id: string;
	code: string;
	tier: "pro" | "admin";
	durationDays: number | null;
	maxUses: number | null;
	currentUses: number;
	active: boolean;
	createdAt: string;
}

export function AdminPromos() {
	const [promos, setPromos] = useState<PromoCode[]>([]);
	const [loading, setLoading] = useState(true);
	const [createOpen, setCreateOpen] = useState(false);

	const loadPromos = useCallback(async () => {
		const res = await fetch("/api/admin/promos");
		if (res.ok) {
			setPromos(await res.json());
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		loadPromos();
	}, [loadPromos]);

	const handleDelete = async (id: string, code: string) => {
		const res = await fetch(`/api/admin/promos/${id}`, {
			method: "DELETE",
		});
		if (res.ok) {
			setPromos((prev) => prev.filter((p) => p._id !== id));
			notifications.show({
				title: "Deleted",
				message: `Code ${code} removed.`,
				color: "teal",
			});
		}
	};

	const handleToggle = async (id: string, active: boolean) => {
		const res = await fetch(`/api/admin/promos/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ active: !active }),
		});
		if (res.ok) {
			setPromos((prev) =>
				prev.map((p) => (p._id === id ? { ...p, active: !active } : p)),
			);
		}
	};

	if (loading) {
		return (
			<Stack gap="md">
				<Skeleton height={60} radius="md" />
				<Skeleton height={60} radius="md" />
			</Stack>
		);
	}

	return (
		<Stack gap="md">
			<Button color="sage" onClick={() => setCreateOpen(true)} fullWidth>
				Create Promo Code
			</Button>

			<CreatePromoModal
				opened={createOpen}
				onClose={() => setCreateOpen(false)}
				onCreated={() => {
					setCreateOpen(false);
					loadPromos();
				}}
			/>

			{promos.length === 0 && (
				<Text c="dimmed" ta="center">
					No promo codes yet.
				</Text>
			)}

			{promos.map((promo) => (
				<Card key={promo._id} padding="md" radius="md" withBorder>
					<Group justify="space-between" mb="xs">
						<Title order={4}>{promo.code}</Title>
						<Badge color={promo.active ? "teal" : "gray"} variant="filled">
							{promo.active ? "Active" : "Inactive"}
						</Badge>
					</Group>

					<Stack gap={4}>
						<Text size="sm">Tier: {promo.tier}</Text>
						<Text size="sm">
							Duration:{" "}
							{promo.durationDays ? `${promo.durationDays} days` : "Indefinite"}
						</Text>
						<Text size="sm">
							Uses: {promo.currentUses}
							{promo.maxUses !== null ? ` / ${promo.maxUses}` : ""}
						</Text>
					</Stack>

					<Group mt="md" gap="xs">
						<Button
							size="xs"
							variant="light"
							color={promo.active ? "coral" : "teal"}
							onClick={() => handleToggle(promo._id, promo.active)}
						>
							{promo.active ? "Deactivate" : "Activate"}
						</Button>
						<ActionIcon
							color="coral"
							variant="subtle"
							onClick={() => handleDelete(promo._id, promo.code)}
							aria-label={`Delete ${promo.code}`}
						>
							X
						</ActionIcon>
					</Group>
				</Card>
			))}
		</Stack>
	);
}

function CreatePromoModal({
	opened,
	onClose,
	onCreated,
}: {
	opened: boolean;
	onClose: () => void;
	onCreated: () => void;
}) {
	const [code, setCode] = useState("");
	const [tier, setTier] = useState<string>("pro");
	const [durationDays, setDurationDays] = useState<number | string>("");
	const [maxUses, setMaxUses] = useState<number | string>("");
	const [saving, setSaving] = useState(false);

	const handleCreate = async () => {
		const trimmed = code.trim().toUpperCase();
		if (!trimmed) return;

		setSaving(true);
		const res = await fetch("/api/admin/promos", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				code: trimmed,
				tier,
				durationDays: durationDays === "" ? null : Number(durationDays),
				maxUses: maxUses === "" ? null : Number(maxUses),
			}),
		});

		const data = await res.json();
		setSaving(false);

		if (!res.ok) {
			notifications.show({
				title: "Oops",
				message: data.error ?? "Something went wrong.",
				color: "coral",
			});
			return;
		}

		notifications.show({
			title: "Created",
			message: `Code ${trimmed} is live.`,
			color: "teal",
		});

		setCode("");
		setTier("pro");
		setDurationDays("");
		setMaxUses("");
		onCreated();
	};

	return (
		<Modal opened={opened} onClose={onClose} title="Create Promo Code" centered>
			<Stack gap="md">
				<TextInput
					label="Code"
					placeholder="LAUNCH2026"
					value={code}
					onChange={(e) => setCode(e.currentTarget.value.toUpperCase())}
					maxLength={20}
					aria-label="Promo code"
				/>

				<div>
					<Text size="sm" mb={4}>
						Tier
					</Text>
					<SegmentedControl
						fullWidth
						data={[
							{ label: "Pro", value: "pro" },
							{ label: "Admin", value: "admin" },
						]}
						value={tier}
						onChange={setTier}
					/>
				</div>

				<NumberInput
					label="Duration (days)"
					placeholder="Leave empty for indefinite"
					value={durationDays}
					onChange={setDurationDays}
					min={1}
					aria-label="Duration in days"
				/>

				<NumberInput
					label="Max uses"
					placeholder="Leave empty for unlimited"
					value={maxUses}
					onChange={setMaxUses}
					min={1}
					aria-label="Maximum uses"
				/>

				<Button
					color="sage"
					onClick={handleCreate}
					loading={saving}
					disabled={!code.trim()}
					fullWidth
				>
					Create
				</Button>
			</Stack>
		</Modal>
	);
}
