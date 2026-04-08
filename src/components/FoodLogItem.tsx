"use client";

import {
	ActionIcon,
	Badge,
	Button,
	Card,
	Drawer,
	Group,
	Stack,
	Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import type { FoodLogEntry, SubscriptionTier } from "@/types";
import { formatNumber, roundGrams } from "@/types";

interface FoodLogItemProps {
	entry: FoodLogEntry;
	onDelete: (id: string) => void;
	tier: SubscriptionTier;
}

export function FoodLogItem({ entry, onDelete, tier }: FoodLogItemProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const canSeeMacros = tier === "pro" || tier === "admin";

	return (
		<>
			<Card
				padding="lg"
				radius="xl"
				withBorder
				style={{
					transition: "transform 0.2s ease, box-shadow 0.2s ease",
					cursor: "pointer",
				}}
				onClick={open}
				role="button"
				tabIndex={0}
				aria-label={`View details for ${entry.items.map((i) => i.name).join(", ")}`}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						open();
					}
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
						onClick={(e) => {
							e.stopPropagation();
							onDelete(entry._id);
						}}
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

			<Drawer
				opened={opened}
				onClose={close}
				position="bottom"
				size="auto"
				title="Nutrition Breakdown"
				radius="lg"
				styles={{
					title: {
						fontFamily: "var(--mantine-font-family-headings)",
						fontWeight: 800,
						letterSpacing: "-0.01em",
					},
				}}
			>
				{canSeeMacros ? (
					<Stack gap="md" pb="md">
						{entry.items.map((item) => (
							<Card
								key={`detail-${entry._id}-${item.name}`}
								padding="md"
								radius="md"
								withBorder
							>
								<Group justify="space-between" mb="xs">
									<Text
										fw={700}
										size="md"
										style={{
											fontFamily: "var(--mantine-font-family-headings)",
										}}
									>
										{item.name}
									</Text>
									<Badge color="teal" variant="light" size="lg">
										{formatNumber(item.calories)} cal
									</Badge>
								</Group>
								<Group gap="lg">
									<MacroStat
										label="Protein"
										grams={item.protein_g}
										color="teal"
									/>
									<MacroStat label="Carbs" grams={item.carbs_g} color="sage" />
									<MacroStat label="Fat" grams={item.fat_g} color="coral" />
								</Group>
							</Card>
						))}

						{entry.items.length > 1 && (
							<Card
								padding="md"
								radius="md"
								withBorder
								style={{
									borderColor: "var(--mantine-color-teal-5)",
									borderWidth: 2,
								}}
							>
								<Group justify="space-between" mb="xs">
									<Text
										fw={800}
										size="md"
										style={{
											fontFamily: "var(--mantine-font-family-headings)",
											textTransform: "uppercase",
											letterSpacing: "0.05em",
										}}
									>
										Total
									</Text>
									<Badge color="teal" variant="filled" size="lg">
										{formatNumber(entry.totalCalories)} cal
									</Badge>
								</Group>
								<Group gap="lg">
									<MacroStat
										label="Protein"
										grams={entry.totalProtein_g}
										color="teal"
									/>
									<MacroStat
										label="Carbs"
										grams={entry.totalCarbs_g}
										color="sage"
									/>
									<MacroStat
										label="Fat"
										grams={entry.totalFat_g}
										color="coral"
									/>
								</Group>
							</Card>
						)}
					</Stack>
				) : (
					<Stack gap="md" pb="md" align="center">
						<div
							style={{
								filter: "blur(6px)",
								opacity: 0.4,
								pointerEvents: "none",
								userSelect: "none",
								width: "100%",
							}}
							aria-hidden="true"
						>
							<Card padding="md" radius="md" withBorder>
								<Group justify="space-between" mb="xs">
									<Text fw={700}>{entry.items[0]?.name ?? "Food item"}</Text>
									<Badge color="teal" variant="light" size="lg">
										--- cal
									</Badge>
								</Group>
								<Group gap="lg">
									<MacroStat label="Protein" grams={0} color="teal" />
									<MacroStat label="Carbs" grams={0} color="sage" />
									<MacroStat label="Fat" grams={0} color="coral" />
								</Group>
							</Card>
						</div>

						<Text
							fw={700}
							size="lg"
							ta="center"
							style={{
								fontFamily: "var(--mantine-font-family-headings)",
							}}
						>
							Per-item macros are a Pro feature
						</Text>
						<Text size="sm" c="dimmed" ta="center" maw={300}>
							Upgrade to see protein, carbs, and fat for every food you log.
						</Text>
						<Button
							component={Link}
							href="/profile"
							color="teal"
							fullWidth
							maw={300}
						>
							Upgrade to Pro
						</Button>
					</Stack>
				)}
			</Drawer>
		</>
	);
}

function MacroStat({
	label,
	grams,
	color,
}: {
	label: string;
	grams: number;
	color: string;
}) {
	return (
		<div style={{ textAlign: "center" }}>
			<Text
				fw={800}
				size="lg"
				c={`${color}.5`}
				style={{ fontFamily: "var(--mantine-font-family-headings)" }}
			>
				{roundGrams(grams)}
				<Text span size="xs" c="dimmed" fw={500} ml={2}>
					g
				</Text>
			</Text>
			<Text
				size="xs"
				c="dimmed"
				fw={600}
				style={{
					textTransform: "uppercase",
					letterSpacing: "0.05em",
					fontFamily: "var(--mantine-font-family-headings)",
				}}
			>
				{label}
			</Text>
		</div>
	);
}
