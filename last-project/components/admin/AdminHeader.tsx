"use client";

import { Plus, X } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description: string;
  isAdding: boolean;
  onToggleAdd: () => void;
}

export default function AdminHeader({
  title,
  description,
  isAdding,
  onToggleAdd,
}: AdminHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      <button
        onClick={onToggleAdd}
        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100"
      >
        {isAdding ? <X size={18} /> : <Plus size={18} />}
        {isAdding ? "Cancel" : "Add Item"}
      </button>
    </div>
  );
}
