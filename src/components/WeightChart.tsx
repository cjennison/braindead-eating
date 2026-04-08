"use client";

import { Text } from "@mantine/core";
import type { WeightLogEntry } from "@/types";

interface WeightChartProps {
	entries: WeightLogEntry[];
	unit: string;
}

export function WeightChart({ entries, unit }: WeightChartProps) {
	if (entries.length < 2) {
		return (
			<Text c="dimmed" ta="center" py="xl">
				Log at least 2 weights to see your trend.
			</Text>
		);
	}

	const sorted = [...entries].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);

	const weights = sorted.map((e) => e.weight);
	const minWeight = Math.min(...weights);
	const maxWeight = Math.max(...weights);
	const range = maxWeight - minWeight || 1;

	const chartWidth = 400;
	const chartHeight = 180;
	const paddingX = 16;
	const paddingY = 24;
	const innerWidth = chartWidth - paddingX * 2;
	const innerHeight = chartHeight - paddingY * 2;

	const points = sorted.map((entry, i) => {
		const x =
			paddingX +
			(sorted.length > 1
				? (i / (sorted.length - 1)) * innerWidth
				: innerWidth / 2);
		const y =
			paddingY +
			innerHeight -
			((entry.weight - minWeight) / range) * innerHeight;
		return { x, y, weight: entry.weight, date: entry.date };
	});

	const linePath = points
		.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
		.join(" ");

	return (
		<div>
			<Text fw={600} size="lg" mb="sm">
				Weight Trend
			</Text>
			<svg
				viewBox={`0 0 ${chartWidth} ${chartHeight}`}
				width="100%"
				height={chartHeight}
				role="img"
				aria-label={`Weight trend chart showing ${entries.length} entries`}
			>
				<line
					x1={paddingX}
					y1={paddingY + innerHeight}
					x2={paddingX + innerWidth}
					y2={paddingY + innerHeight}
					stroke="#E0E0E0"
					strokeWidth="1"
				/>
				<path
					d={linePath}
					fill="none"
					stroke="#5BAFA8"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				{points.map((p) => (
					<circle key={p.date} cx={p.x} cy={p.y} r="4" fill="#5BAFA8" />
				))}
				<text x={paddingX} y={paddingY - 8} fontSize="12" fill="#8E8E8E">
					{maxWeight.toFixed(1)} {unit}
				</text>
				<text
					x={paddingX}
					y={paddingY + innerHeight + 16}
					fontSize="12"
					fill="#8E8E8E"
				>
					{minWeight.toFixed(1)} {unit}
				</text>
			</svg>
		</div>
	);
}
