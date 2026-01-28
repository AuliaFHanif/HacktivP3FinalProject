"use client";

import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  Plus,
  HelpCircle,
  Layers,
  Settings,
  LogOut,
  PlusCircle,
  Package,
  LucideIcon,
} from "lucide-react";
import { logout } from "@/lib/auth";

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface AdminSidebarProps {
  activeTab: string;
  onNavigate: (path: string, name: string) => void;
}

export const MENU_ITEMS: MenuItem[] = [
  { name: "Categories", icon: LayoutGrid, path: "/categories" },
  { name: "Questions", icon: HelpCircle, path: "/questions" },
  { name: "Tiers", icon: Layers, path: "/tiers" },
  { name: "Create Questions", icon: PlusCircle, path: "/createQuestions" },
  { name: "Packages", icon: Package, path: "/packages" },
];

export default function AdminSidebar({
  activeTab,
  onNavigate,
}: AdminSidebarProps) {
  const router = useRouter();

  const handleNavigation = (path: string, name: string) => {
    onNavigate(path, name);
    router.push(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
          S
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">
          Seekers.
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">
          Menu
        </div>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.path, item.name)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === item.name
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <item.icon
              className={`w-5 h-5 ${
                activeTab === item.name
                  ? "text-blue-600"
                  : "text-slate-400"
              }`}
            />
            {item.name}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  );
}
