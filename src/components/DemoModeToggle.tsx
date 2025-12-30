"use client";

import { useDemoMode } from "@/contexts/DemoModeContext";
import { Sparkles, Database } from "lucide-react";

interface DemoModeToggleProps {
    variant?: "compact" | "full";
}

export default function DemoModeToggle({ variant = "full" }: DemoModeToggleProps) {
    const { demoMode, toggleDemoMode } = useDemoMode();

    if (variant === "compact") {
        return (
            <button
                onClick={toggleDemoMode}
                className={`p-2 rounded-lg transition-colors ${
                    demoMode
                        ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                        : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                }`}
                title={demoMode ? "Demo Mode ON - Click for Live Data" : "Live Data - Click for Demo Mode"}
            >
                {demoMode ? <Sparkles className="w-4 h-4" /> : <Database className="w-4 h-4" />}
            </button>
        );
    }

    return (
        <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg">
            <div className="flex items-center gap-2">
                {demoMode ? (
                    <Sparkles className="w-4 h-4 text-purple-400" />
                ) : (
                    <Database className="w-4 h-4 text-green-400" />
                )}
                <span className="text-sm text-slate-300">
                    {demoMode ? "Demo Mode" : "Live Data"}
                </span>
            </div>
            <button
                onClick={toggleDemoMode}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                    demoMode ? "bg-purple-600" : "bg-green-600"
                }`}
            >
                <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        demoMode ? "left-1" : "translate-x-5 left-1"
                    }`}
                />
            </button>
        </div>
    );
}
