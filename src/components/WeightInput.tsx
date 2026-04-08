"use client";

import { Button, NumberInput } from "@mantine/core";
import { useState } from "react";
import type { WeightUnit } from "@/types";

interface WeightInputProps {
  unit: WeightUnit;
  onSubmit: (weight: number) => Promise<void>;
}

export function WeightInput({ unit, onSubmit }: WeightInputProps) {
  const [value, setValue] = useState<number | string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (typeof value !== "number" || value <= 0 || loading) return;

    setLoading(true);
    await onSubmit(value);
    setValue("");
    setLoading(false);
  };

  return (
    <div>
      <NumberInput
        placeholder="Enter weight"
        value={value}
        onChange={setValue}
        min={50}
        max={999}
        decimalScale={1}
        suffix={` ${unit}`}
        hideControls
        aria-label={`Weight in ${unit}`}
        styles={{
          input: {
            fontSize: "2rem",
            textAlign: "center",
            fontWeight: 700,
            height: "auto",
            padding: "16px",
          },
        }}
      />
      <Button
        fullWidth
        mt="md"
        onClick={handleSubmit}
        loading={loading}
        disabled={typeof value !== "number" || value <= 0}
      >
        Log today's weight
      </Button>
    </div>
  );
}
