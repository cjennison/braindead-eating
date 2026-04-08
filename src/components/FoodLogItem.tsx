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
    <Card padding="md" radius="md" withBorder>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          {entry.items.map((item) => (
            <Group key={`${entry._id}-${item.name}`} justify="space-between">
              <Text
                size="md"
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
              >
                {item.name}
              </Text>
              <Text size="md" fw={500} style={{ flexShrink: 0 }}>
                {formatNumber(item.calories)}
              </Text>
            </Group>
          ))}
          {entry.items.length > 1 && (
            <Group justify="space-between" mt={4}>
              <Text size="sm" fw={600}>
                Total
              </Text>
              <Text size="sm" fw={600}>
                {formatNumber(entry.totalCalories)}
              </Text>
            </Group>
          )}
        </Stack>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label="Delete entry"
          onClick={() => onDelete(entry._id)}
          style={{ flexShrink: 0 }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            role="img"
            aria-label="Delete"
          >
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </ActionIcon>
      </Group>
    </Card>
  );
}
