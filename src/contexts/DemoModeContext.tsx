"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DemoModeContextType {
    demoMode: boolean;
    toggleDemoMode: () => void;
    setDemoMode: (value: boolean) => void;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

const DEMO_MODE_KEY = "proveniq-crm-demo-mode";

export function DemoModeProvider({ children }: { children: ReactNode }) {
    const [demoMode, setDemoModeState] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem(DEMO_MODE_KEY);
        if (stored !== null) {
            setDemoModeState(stored === "true");
        }
    }, []);

    // Persist to localStorage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem(DEMO_MODE_KEY, String(demoMode));
        }
    }, [demoMode, mounted]);

    const toggleDemoMode = () => {
        setDemoModeState((prev) => !prev);
    };

    const setDemoMode = (value: boolean) => {
        setDemoModeState(value);
    };

    return (
        <DemoModeContext.Provider value={{ demoMode, toggleDemoMode, setDemoMode }}>
            {children}
        </DemoModeContext.Provider>
    );
}

export function useDemoMode() {
    const context = useContext(DemoModeContext);
    if (context === undefined) {
        throw new Error("useDemoMode must be used within a DemoModeProvider");
    }
    return context;
}
