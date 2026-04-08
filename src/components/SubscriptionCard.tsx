"use client";

import {
	Badge,
	Button,
	Card,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import {
	AI_DAILY_LIMIT_FREE,
	AI_DAILY_LIMIT_PRO,
	getEffectiveTier,
	type UserProfile,
} from "@/types";

interface SubscriptionCardProps {
	user: UserProfile;
	onUpdate: (user: UserProfile) => void;
}

const TIER_LABELS: Record<string, string> = {
	free: "Free",
	pro: "Pro",
	admin: "Admin",
};

const TIER_COLORS: Record<string, string> = {
	free: "gray",
	pro: "teal",
	admin: "grape",
};

function formatDate(dateStr: string | null): string {
	if (!dateStr) return "";
	return new Date(dateStr).toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export function SubscriptionCard({ user, onUpdate }: SubscriptionCardProps) {
	const [promoCode, setPromoCode] = useState("");
	const [promoLoading, setPromoLoading] = useState(false);
	const [trialLoading, setTrialLoading] = useState(false);

	const effectiveTier = getEffectiveTier({
		subscriptionTier: user.subscriptionTier,
		subscriptionExpiresAt: user.subscriptionExpiresAt,
	});

	const isExpired =
		user.subscriptionTier !== "free" && effectiveTier === "free";

	const handleStartTrial = async () => {
		setTrialLoading(true);
		const res = await fetch("/api/subscription", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ action: "start-trial" }),
		});

		const data = await res.json();
		setTrialLoading(false);

		if (!res.ok) {
			notifications.show({
				title: "Oops",
				message: data.error || "Something went wrong.",
				color: "coral",
			});
			return;
		}

		const userRes = await fetch("/api/user");
		if (userRes.ok) {
			onUpdate(await userRes.json());
		}

		notifications.show({
			title: "Welcome to Pro",
			message: "Your 7-day free trial has started.",
			color: "teal",
		});
	};

	const handleRedeemPromo = async () => {
		const code = promoCode.trim();
		if (!code) return;

		setPromoLoading(true);
		const res = await fetch("/api/subscription/promo", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code }),
		});

		const data = await res.json();
		setPromoLoading(false);

		if (!res.ok) {
			notifications.show({
				title: "Oops",
				message: data.error || "Something went wrong.",
				color: "coral",
			});
			return;
		}

		setPromoCode("");
		const userRes = await fetch("/api/user");
		if (userRes.ok) {
			onUpdate(await userRes.json());
		}

		notifications.show({
			title: "Code applied",
			message: `You now have ${TIER_LABELS[data.tier]} access.`,
			color: "teal",
		});
	};

	return (
		<Card padding="md" radius="md" withBorder>
			<Stack gap="md">
				<div>
					<Text c="dimmed" size="sm" mb={4}>
						Subscription
					</Text>
					<Badge color={TIER_COLORS[effectiveTier]} size="lg" variant="filled">
						{TIER_LABELS[effectiveTier]}
					</Badge>
				</div>

				<Text size="sm">
					{effectiveTier === "free" &&
						`${AI_DAILY_LIMIT_FREE} food logs per day`}
					{effectiveTier === "pro" && `${AI_DAILY_LIMIT_PRO} food logs per day`}
					{effectiveTier === "admin" && "Unlimited food logs"}
				</Text>

				{user.subscriptionExpiresAt && effectiveTier !== "free" && (
					<Text size="sm" c="dimmed">
						{user.subscriptionSource === "trial" ? "Trial expires" : "Expires"}{" "}
						{formatDate(user.subscriptionExpiresAt)}
					</Text>
				)}

				{isExpired && (
					<Text size="sm" c="coral">
						Your{" "}
						{user.subscriptionSource === "trial" ? "trial" : "subscription"} has
						expired.
					</Text>
				)}

				{effectiveTier === "free" && (
					<Card
						padding="md"
						radius="md"
						withBorder
						style={{
							borderColor: "var(--mantine-color-teal-5)",
							borderWidth: 2,
						}}
					>
						<Stack gap="sm">
							<Title order={5}>Upgrade to Pro</Title>
							<Text size="sm">
								$1/month for {AI_DAILY_LIMIT_PRO} food logs per day. That's it.
								No catch.
							</Text>

							<Text size="xs" c="dimmed">
								In-app purchases coming soon via App Store and Google Play.
							</Text>

							{!user.trialUsed && (
								<Button
									color="teal"
									onClick={handleStartTrial}
									loading={trialLoading}
									fullWidth
								>
									Try Pro free for 7 days
								</Button>
							)}

							<div>
								<Text size="sm" mb={4}>
									Have a promo code?
								</Text>
								<TextInput
									placeholder="Enter code"
									value={promoCode}
									onChange={(e) => setPromoCode(e.currentTarget.value)}
									maxLength={20}
									style={{
										textTransform: "uppercase",
									}}
									aria-label="Promo code"
								/>
								<Button
									variant="light"
									color="teal"
									mt="xs"
									onClick={handleRedeemPromo}
									loading={promoLoading}
									disabled={!promoCode.trim()}
									fullWidth
								>
									Redeem
								</Button>
							</div>
						</Stack>
					</Card>
				)}

				{effectiveTier !== "free" && effectiveTier !== "admin" && (
					<div>
						<Text size="sm" mb={4}>
							Have a promo code?
						</Text>
						<TextInput
							placeholder="Enter code"
							value={promoCode}
							onChange={(e) => setPromoCode(e.currentTarget.value)}
							maxLength={20}
							style={{
								textTransform: "uppercase",
							}}
							aria-label="Promo code"
						/>
						<Button
							variant="light"
							color="teal"
							mt="xs"
							onClick={handleRedeemPromo}
							loading={promoLoading}
							disabled={!promoCode.trim()}
							fullWidth
						>
							Redeem
						</Button>
					</div>
				)}
			</Stack>
		</Card>
	);
}
