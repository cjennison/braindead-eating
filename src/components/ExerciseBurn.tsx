"use client";

import { ActionIcon, Group, Text } from "@mantine/core";
import { formatNumber } from "@/types";

interface ExerciseBurnProps {
	caloriesBurned: number;
	onAdjust: (delta: number) => void;
}

export function ExerciseBurn({ caloriesBurned, onAdjust }: ExerciseBurnProps) {
	return (
		<div style={{ textAlign: "center" }}>
			<Text
				size="sm"
				c="teal.5"
				fw={700}
				mb={8}
				style={{
					fontFamily: "var(--mantine-font-family-headings)",
					letterSpacing: "-0.01em",
					minHeight: 20,
					visibility: caloriesBurned > 0 ? "visible" : "hidden",
				}}
			>
				+{formatNumber(caloriesBurned)} burned
			</Text>
			<Group justify="center" gap="xs" wrap="nowrap">
				<ActionIcon
					variant="light"
					color="teal"
					size={48}
					radius="xl"
					onClick={() => onAdjust(100)}
					aria-label="Add 100 exercise calories"
				>
					<Text size="sm" fw={700} lh={1}>
						+100
					</Text>
				</ActionIcon>
				<ActionIcon
					variant="light"
					color="teal"
					size={48}
					radius="xl"
					onClick={() => onAdjust(10)}
					aria-label="Add 10 exercise calories"
				>
					<Text size="sm" fw={700} lh={1}>
						+10
					</Text>
				</ActionIcon>
				<div
					style={{
						width: 1,
						height: 28,
						backgroundColor: "var(--mantine-color-default-border)",
						flexShrink: 0,
					}}
				/>
				<ActionIcon
					variant="light"
					color="coral"
					size={48}
					radius="xl"
					onClick={() => onAdjust(-10)}
					disabled={caloriesBurned === 0}
					aria-label="Subtract 10 exercise calories"
				>
					<Text size="sm" fw={700} lh={1}>
						-10
					</Text>
				</ActionIcon>
				<ActionIcon
					variant="light"
					color="coral"
					size={48}
					radius="xl"
					onClick={() => onAdjust(-100)}
					disabled={caloriesBurned === 0}
					aria-label="Subtract 100 exercise calories"
				>
					<Text size="sm" fw={700} lh={1}>
						-100
					</Text>
				</ActionIcon>
			</Group>
			<Text size="xs" c="dimmed" mt={6}>
				burned calories from exercise
			</Text>
		</div>
	);
}
