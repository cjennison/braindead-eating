"use client";

import { Group, Stack, Text } from "@mantine/core";
import { formatNumber } from "@/types";

interface MacroBarProps {
	protein: number;
	carbs: number;
	fat: number;
}

export function MacroBar({ protein, carbs, fat }: MacroBarProps) {
	const total = protein + carbs + fat;
	const proteinPct = total > 0 ? (protein / total) * 100 : 0;
	const carbsPct = total > 0 ? (carbs / total) * 100 : 0;
	const fatPct = total > 0 ? (fat / total) * 100 : 0;

	return (
		<Stack gap="md" mt="xl">
			<Text
				fw={700}
				size="xl"
				style={{
					fontFamily: "var(--mantine-font-family-headings)",
					letterSpacing: "0.02em",
				}}
			>
				Today's Macros
			</Text>
			<Stack gap="lg">
				<MacroRow
					label="Protein"
					grams={protein}
					percent={proteinPct}
					color="teal.5"
				/>
				<MacroRow
					label="Carbs"
					grams={carbs}
					percent={carbsPct}
					color="sage.5"
				/>
				<MacroRow label="Fat" grams={fat} percent={fatPct} color="coral.5" />
			</Stack>
		</Stack>
	);
}

interface MacroRowProps {
	label: string;
	grams: number;
	percent: number;
	color: string;
}

function MacroRow({ label, grams, percent, color }: MacroRowProps) {
	return (
		<div>
			<Group justify="space-between" mb={8} align="flex-end">
				<Text
					size="sm"
					c="dimmed"
					fw={600}
					style={{
						fontFamily: "var(--mantine-font-family-headings)",
						textTransform: "uppercase",
						letterSpacing: "0.05em",
					}}
				>
					{label}
				</Text>
				<Text
					size="md"
					fw={700}
					style={{ fontFamily: "var(--mantine-font-family-headings)" }}
				>
					{formatNumber(grams)}
					<Text span size="xs" c="dimmed" fw={500} ml={2}>
						g
					</Text>
				</Text>
			</Group>
			<div
				style={{
					position: "relative",
					height: "12px",
					borderRadius: "12px",
					backgroundColor: "var(--mantine-color-darkCharcoal-8)",
					overflow: "hidden",
					boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
				}}
			>
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						height: "100%",
						width: `${percent}%`,
						backgroundColor: `var(--mantine-color-${color.replace(".", "-")})`,
						borderRadius: "12px",
						transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
						boxShadow: "0 0 8px rgba(0,0,0,0.5) inset",
					}}
				/>
			</div>
		</div>
	);
}
