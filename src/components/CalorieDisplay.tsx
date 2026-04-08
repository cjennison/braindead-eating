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
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <Text
        fw={700}
        style={{
          fontSize: "3.5rem",
          lineHeight: 1.1,
          color: STATUS_COLORS[status],
        }}
      >
        {formatNumber(displayNumber)}
      </Text>
      <Text c="dimmed" size="lg" mt={4}>
        {STATUS_MESSAGES[status]}
      </Text>
    </div>
  );
}
