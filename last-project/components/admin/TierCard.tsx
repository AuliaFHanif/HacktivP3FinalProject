"use client";

import { Layers, CheckCircle2, Edit3, Trash2, Users, Zap } from "lucide-react";

interface TierCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  quota: number;
  benefits: string[];
  onEdit: () => void;
  onDelete: () => void;
}

export default function TierCard({
  title,
  description,
  price,
  quota,
  benefits,
  onEdit,
  onDelete,
}: TierCardProps) {
  return (
    <div className="group relative bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      
      {/* Top Section: Icon & Actions */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg shadow-slate-200">
            <Layers size={20} />
          </div>
          <div className="bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            Tier Level
          </div>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Edit Tier"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Delete Tier"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Value Metrics Container */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Zap size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Tokens</span>
          </div>
          <p className="text-lg font-black text-slate-900">
            {price.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Users size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-tight">Questions Quota</span>
          </div>
          <p className="text-lg font-black text-slate-900">
            {quota} <span className="text-[10px] text-slate-400 font-medium"></span>
          </p>
        </div>
      </div>

      {/* Benefits List */}
      <div className="space-y-3.5 mb-10 flex-grow">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Included Benefits</p>
        {benefits.map((benefit, idx) => (
          <div key={idx} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
            <div className="mt-0.5 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle2 size={12} className="text-green-600" />
            </div>
            <span>{benefit.trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}