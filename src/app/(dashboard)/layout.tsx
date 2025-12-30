import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import "../globals.css";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auth disabled for local dev - no Supabase key configured
    // Re-enable auth check when NEXT_PUBLIC_SUPABASE_ANON_KEY is set

    return (
        <DemoModeProvider>
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">{children}</main>
                <CommandPalette />
            </div>
        </DemoModeProvider>
    );
}
