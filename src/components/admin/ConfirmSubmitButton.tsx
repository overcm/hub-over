"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmSubmitButtonProps extends ComponentProps<typeof Button> {
  confirmMessage: string;
}

export function ConfirmSubmitButton({
  confirmMessage,
  onClick,
  type = "submit",
  ...props
}: ConfirmSubmitButtonProps) {
  return (
    <Button
      type={type}
      onClick={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...props}
    />
  );
}
