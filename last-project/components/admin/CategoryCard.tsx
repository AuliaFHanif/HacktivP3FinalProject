"use client";

import { LayoutGrid, Edit3, Trash2 } from "lucide-react";

interface CategoryLevel {
  junior: boolean;
  middle: boolean;
  senior: boolean;
}

interface CategoryCardProps {
  id: string;
  title: string;
  description: string;
  imgUrl?: string;
  level?: CategoryLevel;
  published?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}

export default function CategoryCard({
  id,
  title,
  description,
  imgUrl,
  level,
  published,
  onEdit,
  onDelete,
  onTogglePublish,
}: CategoryCardProps) {
  return (
    <div className="group bg-white rounded-3xl border border-slate-200 p-5 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <LayoutGrid className="text-blue-500" />
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
        {description}
      </p>

      {/* Levels Section */}
      {level && (
        <div className="mb-4 pb-4 border-b border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">
            Levels
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  level.junior
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Junior
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {level.junior ? "Ready" : "Not Ready"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  level.middle
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Middle
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {level.middle ? "Ready" : "Not Ready"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  level.senior
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Senior
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {level.senior ? "Ready" : "Not Ready"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Publish Status */}
      <button
        onClick={onTogglePublish}
        className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition ${
          published
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
      >
        {published ? "Published" : "Publish"}
      </button>
    </div>
  );
}
