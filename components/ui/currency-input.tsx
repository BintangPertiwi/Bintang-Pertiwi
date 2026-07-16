"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";

type CurrencyInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "type"
> & {
  value: string;
  onChange: (rawDigits: string) => void;
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => (
    <Input
      {...props}
      ref={ref}
      inputMode="numeric"
      value={value ? Number(value).toLocaleString("id-ID") : ""}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
    />
  )
);
CurrencyInput.displayName = "CurrencyInput";
