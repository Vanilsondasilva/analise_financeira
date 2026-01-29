"use client";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}

export default function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg flex gap-1 shadow-sm">
      <button
        onClick={() => setViewMode("grid")}
        className={`p-2 rounded-md transition-all ${
          viewMode === "grid" 
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm" 
            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        }`}
        title="Visualização em Grade"
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => setViewMode("list")}
        className={`p-2 rounded-md transition-all ${
          viewMode === "list" 
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm" 
            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        }`}
        title="Visualização em Lista"
      >
        <List size={18} />
      </button>
    </div>
  );
}