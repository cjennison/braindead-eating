"use client";

import { Button, Textarea } from "@mantine/core";
import { useState } from "react";
import { getRandomPlaceholder } from "@/types";

interface FoodInputProps {
  onSubmit: (input: string) => Promise<void>;
  disabled?: boolean;
}

export function FoodInput({ onSubmit, disabled }: FoodInputProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [placeholder] = useState(() => getRandomPlaceholder());

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    await onSubmit(trimmed);
    setValue("");
    setLoading(false);
  };

  return (
    <div>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        minRows={3}
        maxRows={5}
        autosize
        disabled={loading || disabled}
        aria-label="What did you eat?"
        styles={{
          input: {
            fontSize: "1.25rem",
          },
        }}
      />
      <Button
        fullWidth
        mt="md"
        onClick={handleSubmit}
        loading={loading}
        disabled={!value.trim() || disabled}
        loaderProps={{ type: "dots" }}
      >
        {loading ? "Logging..." : "Log it"}
      </Button>
    </div>
  );
}
