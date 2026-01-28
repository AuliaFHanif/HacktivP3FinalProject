"use client";

import { Package, Edit3, Trash2, Star, CheckCircle2, Coins, DollarSign } from "lucide-react";

interface PackageCardProps {
  id: string;
  name: string;
  type: string;
  tokens: number;
  price: number;
  description: string;
  features: string[];
  popular: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PackageCard({
  id,
  name,
  type,
  tokens,
  price,
  description,
  features,
  popular,
  onEdit,
  onDelete,
}: PackageCardProps) {
  return (
    <div
      className={`relative bg-white rounded-[2rem] p-8 border transition-all ${
        popular
          ? "border-blue-400 shadow-xl shadow-blue-200/50"
          : "border-slate-200 shadow-sm hover:shadow-lg"
      }`}
    >
      {popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold">
            <Star size={14} /> Popular
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="bg-slate-100 p-3 rounded-2xl text-slate-600">
          <Package size={24} />
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-blue-600 transition"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-600 transition"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-1">{name}</h3>
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4">
        {type}
      </p>
      <p className="text-sm text-slate-500 mb-6">{description}</p>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3">
          <Coins className="text-slate-400" size={18} />
          <span className="text-sm text-slate-600">
            <span className="font-bold text-slate-900">{tokens.toLocaleString()}</span> Tokens
          </span>
        </div>
        <div className="flex items-center gap-3">
          <DollarSign className="text-slate-400" size={18} />
          <span className="text-sm text-slate-600">
            <span className="font-bold text-slate-900">${price}</span> USD
          </span>
        </div>
      </div>

      <div className="mb-8 pb-8 border-t border-slate-200">
        <p className="text-xs font-bold text-slate-400 uppercase mb-3 mt-4">
          Features
        </p>
        <div className="space-y-2">
          {features.slice(0, 3).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
              <span>{feature.trim()}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-3 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-slate-900 transition">
        Select Package
      </button>
    </div>
  );
}
