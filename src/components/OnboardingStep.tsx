"use client";

import { Button, Container, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  children: ReactNode;
  onNext: () => void;
  onSkip: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function OnboardingStep({
  step,
  totalSteps,
  title,
  children,
  onNext,
  onSkip,
  nextLabel = "Next",
  nextDisabled = false,
}: OnboardingStepProps) {
  return (
    <Container size={480} py="xl">
      <Stack mih="80vh" justify="center" gap="xl">
        <Text c="dimmed" ta="center">
          Step {step} of {totalSteps}
        </Text>
        <Title order={2} ta="center" size="1.75rem">
          {title}
        </Title>
        {children}
        <Button fullWidth onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </Button>
        <Button variant="subtle" color="gray" fullWidth onClick={onSkip}>
          Skip
        </Button>
      </Stack>
    </Container>
  );
}
