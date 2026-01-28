"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  message: string;
  subMessage?: string;
}

export default function EmptyState({
  icon: Icon,
  message,
  subMessage,
}: EmptyStateProps) {
  return (
    <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
      {Icon && (
        <Icon className="mx-auto text-slate-200 mb-4" size={48} />
      )}
      <p className="text-slate-400 font-medium">{message}</p>
      {subMessage && (
        <p className="text-slate-300 text-sm mt-2">{subMessage}</p>
      )}
    </div>
  );
}
