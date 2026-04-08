"use client";

import { ActionIcon, Card, Group, Stack, Text } from "@mantine/core";
import type { FoodLogEntry } from "@/types";
import { formatNumber } from "@/types";

interface FoodLogItemProps {
	entry: FoodLogEntry;
	onDelete: (id: string) => void;
}

export function FoodLogItem({ entry, onDelete }: FoodLogItemProps) {
	return (
		<Card
			padding="lg"
			radius="xl"
			withBorder
			style={{
				transition: "transform 0.2s ease, box-shadow 0.2s ease",
			}}
		>
			<Group justify="space-between" align="flex-start" wrap="nowrap">
				<Stack gap={12} style={{ flex: 1, minWidth: 0 }}>
					{entry.items.map((item) => (
						<Group
							key={`${entry._id}-${item.name}`}
							justify="space-between"
							wrap="nowrap"
							align="flex-start"
						>
							<Text
								size="lg"
								fw={600}
								style={{
									flex: 1,
									fontFamily: "var(--mantine-font-family-headings)",
									letterSpacing: "-0.01em",
									lineHeight: 1.3,
									wordBreak: "break-word",
								}}
							>
								{item.name}
							</Text>
							<Text
								size="lg"
								fw={700}
								style={{
									flexShrink: 0,
									fontFamily: "var(--mantine-font-family-headings)",
									color: "var(--mantine-color-teal-5)",
								}}
							>
								{formatNumber(item.calories)}
								<Text span size="xs" c="dimmed" fw={500} ml={2}>
									cal
								</Text>
							</Text>
						</Group>
					))}
					{entry.items.length > 1 && (
						<Group
							justify="space-between"
							mt={4}
							pt={8}
							style={{
								borderTop: "1px dashed var(--mantine-color-default-border)",
							}}
						>
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
								Total
							</Text>
							<Text
								size="sm"
								fw={800}
								style={{
									fontFamily: "var(--mantine-font-family-headings)",
									color: "var(--mantine-color-teal-5)",
								}}
							>
								{formatNumber(entry.totalCalories)}
								<Text span size="xs" c="dimmed" fw={500} ml={2}>
									cal
								</Text>
							</Text>
						</Group>
					)}
				</Stack>
				<ActionIcon
					variant="subtle"
					color="coral.5"
					radius="xl"
					size="xl"
					aria-label="Delete entry"
					onClick={() => onDelete(entry._id)}
					style={{
						flexShrink: 0,
						transition: "all 0.2s ease",
						minWidth: "48px",
						minHeight: "48px",
					}}
				>
					<svg
						width="22"
						height="22"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						role="img"
						aria-label="Delete"
					>
						<path d="M3 6h18" />
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
						<line x1="10" y1="11" x2="10" y2="17" />
						<line x1="14" y1="11" x2="14" y2="17" />
					</svg>
				</ActionIcon>
			</Group>
		</Card>
	);
}
