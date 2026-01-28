"use client";

import { Edit3, Trash2, Zap, Play } from "lucide-react";

interface QuestionCardProps {
  id: string;
  content: string;
  categoryTitle: string;
  level: string;
  type: string;
  followUp: boolean;
  audioUrl?: string;
  onEdit: () => void;
  onDelete: () => void;
  onAudio?: () => void;
}

export default function QuestionCard({
  id,
  content,
  categoryTitle,
  level,
  type,
  followUp,
  audioUrl,
  onEdit,
  onDelete,
  onAudio,
}: QuestionCardProps) {
  const levelColors: Record<string, string> = {
    junior: "bg-green-100 text-green-700 border-green-200",
    mid: "bg-yellow-100 text-yellow-700 border-yellow-200",
    middle: "bg-yellow-100 text-yellow-700 border-yellow-200",
    senior: "bg-red-100 text-red-700 border-red-200",
  };

  const typeColors: Record<string, string> = {
    intro: "bg-blue-100 text-blue-700 border-blue-200",
    core: "bg-purple-100 text-purple-700 border-purple-200",
    closing: "bg-orange-100 text-orange-700 border-orange-200",
  };

  const handlePlayAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {categoryTitle}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition ml-3">
          {audioUrl && (
            <button
              onClick={handlePlayAudio}
              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
              title="Play Audio"
            >
              <Play size={16} />
            </button>
          )}
          {onAudio && (
            <button
              onClick={onAudio}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="Generate Audio"
            >
              <Zap size={16} />
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
            title="Edit Question"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Delete Question"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level</span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              levelColors[level.toLowerCase()] || "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              typeColors[type.toLowerCase()] || "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
        </div>
        {followUp && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
            Follow-up
          </span>
        )}
      </div>
    </div>
  );
}