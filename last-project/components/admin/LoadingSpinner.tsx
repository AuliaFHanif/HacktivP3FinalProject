"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
}

export default function LoadingSpinner({ text = "Loading..." }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Loader2 className="animate-spin w-5 h-5" />
      <span>{text}</span>
    </div>
  );
}
