"use client";

import { Group, Progress, Stack, Text } from "@mantine/core";
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
    <Stack gap="sm">
      <Text fw={600} size="lg">
        Today's Macros
      </Text>
      <MacroRow
        label="Protein"
        grams={protein}
        percent={proteinPct}
        color="teal"
      />
      <MacroRow label="Carbs" grams={carbs} percent={carbsPct} color="sage" />
      <MacroRow label="Fat" grams={fat} percent={fatPct} color="coral" />
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
      <Group justify="space-between" mb={4}>
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        <Text size="sm" fw={500}>
          {formatNumber(grams)}g
        </Text>
      </Group>
      <Progress value={percent} color={color} size="lg" radius="md" />
    </div>
  );
}
