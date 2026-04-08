"use client";

import { Text } from "@mantine/core";
import { formatNumber, getCalorieStatus } from "@/types";

interface CalorieDisplayProps {
	remaining: number;
	target: number;
}

const STATUS_COLORS = {
	"on-track": "var(--mantine-color-sage-5)",
	close: "#D4A843",
	over: "var(--mantine-color-coral-5)",
} as const;

const STATUS_MESSAGES = {
	"on-track": "calories remaining",
	close: "calories remaining -- almost there",
	over: "over -- no worries, tomorrow's a new day",
} as const;

export function CalorieDisplay({ remaining, target }: CalorieDisplayProps) {
	const status = getCalorieStatus(remaining, target);
	const displayNumber = status === "over" ? Math.abs(remaining) : remaining;

	return (
		<div
			style={{
				textAlign: "center",
				padding: "32px 0",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Text
				style={{
					fontSize: "6rem",
					lineHeight: 0.9,
					fontWeight: 900,
					color: STATUS_COLORS[status],
					letterSpacing: "-4px",
					textShadow:
						status === "on-track"
							? "0px 8px 24px rgba(38, 156, 26, 0.2)"
							: status === "over"
								? "0px 8px 24px rgba(234, 64, 43, 0.2)"
								: "none",
				}}
			>
				{formatNumber(displayNumber)}
			</Text>
			<Text
				c="dimmed"
				size="xl"
				fw={600}
				mt={12}
				style={{ letterSpacing: "-0.5px" }}
			>
				{STATUS_MESSAGES[status]}
			</Text>
		</div>
	);
}
