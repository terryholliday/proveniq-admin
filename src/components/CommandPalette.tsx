"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
    id: string;
    type: "deal" | "account" | "contact" | "action";
    title: string;
    subtitle?: string;
    icon: string;
    href?: string;
    action?: () => void;
}

const QUICK_ACTIONS: SearchResult[] = [
    { id: "new-deal", type: "action", title: "Create New Deal", subtitle: "Add a new opportunity", icon: "➕", href: "/deals/new" },
    { id: "pipeline", type: "action", title: "View Pipeline", subtitle: "Kanban board view", icon: "📊", href: "/pipeline" },
    { id: "reports", type: "action", title: "Reports & Forecasting", subtitle: "Analytics dashboard", icon: "📈", href: "/reports" },
    { id: "dashboard", type: "action", title: "Go to Dashboard", subtitle: "Overview", icon: "🏠", href: "/dashboard" },
    { id: "deals", type: "action", title: "All Deals", subtitle: "List view", icon: "💼", href: "/deals" },
    { id: "accounts", type: "action", title: "Accounts", subtitle: "Company list", icon: "🏢", href: "/accounts" },
    { id: "guide", type: "action", title: "User Guide", subtitle: "Documentation", icon: "📚", href: "/guide" },
    { id: "settings", type: "action", title: "Settings", subtitle: "Configure CRM", icon: "⚙️", href: "/settings" },
];

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Handle keyboard shortcut to open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Search logic
    const search = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults(QUICK_ACTIONS);
            return;
        }

        setLoading(true);
        const lowerQuery = q.toLowerCase();

        // Filter quick actions
        const actionResults = QUICK_ACTIONS.filter(
            a => a.title.toLowerCase().includes(lowerQuery) || a.subtitle?.toLowerCase().includes(lowerQuery)
        );

        // Search deals via API
        try {
            const dealsRes = await fetch(`/api/deals?search=${encodeURIComponent(q)}&limit=5`);
            const dealsData = await dealsRes.json();
            
            const dealResults: SearchResult[] = (dealsData.data || []).map((deal: any) => ({
                id: deal.id,
                type: "deal" as const,
                title: deal.name,
                subtitle: `${deal.account?.name || "No account"} · ${deal.stage}`,
                icon: "💼",
                href: `/deals/${deal.id}`,
            }));

            // Search accounts
            const accountsRes = await fetch(`/api/accounts?search=${encodeURIComponent(q)}&limit=5`);
            const accountsData = await accountsRes.json();
            
            const accountResults: SearchResult[] = (accountsData.data || []).map((account: any) => ({
                id: account.id,
                type: "account" as const,
                title: account.name,
                subtitle: account.segment || "No segment",
                icon: "🏢",
                href: `/accounts/${account.id}`,
            }));

            setResults([...actionResults, ...dealResults, ...accountResults]);
        } catch (e) {
            // If API fails, just show filtered actions
            setResults(actionResults);
        }

        setLoading(false);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            search(query);
        }, 150);
        return () => clearTimeout(timer);
    }, [query, search]);

    // Initialize with quick actions
    useEffect(() => {
        if (isOpen && !query) {
            setResults(QUICK_ACTIONS);
        }
    }, [isOpen, query]);

    // Handle selection
    const handleSelect = (result: SearchResult) => {
        if (result.href) {
            router.push(result.href);
        } else if (result.action) {
            result.action();
        }
        setIsOpen(false);
        setQuery("");
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && results[selectedIndex]) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <style jsx global>{`
                .command-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 9999;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 15vh;
                }

                .command-dialog {
                    width: 90%;
                    max-width: 640px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .command-input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border);
                }

                .command-search-icon {
                    color: var(--text-muted);
                }

                .command-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-size: 1.125rem;
                    color: var(--text-primary);
                }

                .command-input::placeholder {
                    color: var(--text-muted);
                }

                .command-shortcut {
                    display: flex;
                    gap: 4px;
                }

                .command-shortcut kbd {
                    padding: 4px 8px;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-family: inherit;
                }

                .command-results {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 8px;
                }

                .command-section {
                    padding: 8px 12px 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .command-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.1s ease;
                }

                .command-item:hover,
                .command-item.selected {
                    background: var(--bg-tertiary);
                }

                .command-item.selected {
                    background: rgba(99, 102, 241, 0.15);
                }

                .command-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: var(--bg-tertiary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.125rem;
                }

                .command-item.selected .command-icon {
                    background: var(--primary);
                }

                .command-text {
                    flex: 1;
                    min-width: 0;
                }

                .command-title {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .command-subtitle {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-top: 2px;
                }

                .command-type {
                    font-size: 0.7rem;
                    padding: 2px 8px;
                    border-radius: 4px;
                    background: var(--bg-tertiary);
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                .command-type.deal { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
                .command-type.account { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
                .command-type.contact { background: rgba(16, 185, 129, 0.15); color: #34d399; }
                .command-type.action { background: rgba(99, 102, 241, 0.15); color: #a5b4fc; }

                .command-empty {
                    padding: 32px;
                    text-align: center;
                    color: var(--text-muted);
                }

                .command-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .command-footer {
                    padding: 12px 20px;
                    border-top: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .command-hints {
                    display: flex;
                    gap: 16px;
                }

                .command-hint {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .command-hint kbd {
                    padding: 2px 6px;
                    background: var(--bg-tertiary);
                    border-radius: 3px;
                    font-size: 0.7rem;
                }
            `}</style>

            <div className="command-overlay" onClick={() => setIsOpen(false)}>
                <div className="command-dialog" onClick={(e) => e.stopPropagation()}>
                    <div className="command-input-wrapper">
                        <svg className="command-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            ref={inputRef}
                            type="text"
                            className="command-input"
                            placeholder="Search deals, accounts, or type a command..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setSelectedIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                        />
                        <div className="command-shortcut">
                            <kbd>ESC</kbd>
                        </div>
                    </div>

                    <div className="command-results">
                        {loading ? (
                            <div className="command-loading">
                                <div className="loading-spinner" />
                            </div>
                        ) : results.length === 0 ? (
                            <div className="command-empty">
                                No results found for "{query}"
                            </div>
                        ) : (
                            <>
                                {!query && <div className="command-section">Quick Actions</div>}
                                {query && results.some(r => r.type === "action") && <div className="command-section">Actions</div>}
                                {results.filter(r => r.type === "action").map((result, idx) => (
                                    <div
                                        key={result.id}
                                        className={`command-item ${selectedIndex === idx ? "selected" : ""}`}
                                        onClick={() => handleSelect(result)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                    >
                                        <div className="command-icon">{result.icon}</div>
                                        <div className="command-text">
                                            <div className="command-title">{result.title}</div>
                                            {result.subtitle && <div className="command-subtitle">{result.subtitle}</div>}
                                        </div>
                                        <span className={`command-type ${result.type}`}>{result.type}</span>
                                    </div>
                                ))}

                                {results.some(r => r.type === "deal") && (
                                    <>
                                        <div className="command-section">Deals</div>
                                        {results.filter(r => r.type === "deal").map((result, idx) => {
                                            const actualIdx = results.filter(r => r.type === "action").length + idx;
                                            return (
                                                <div
                                                    key={result.id}
                                                    className={`command-item ${selectedIndex === actualIdx ? "selected" : ""}`}
                                                    onClick={() => handleSelect(result)}
                                                    onMouseEnter={() => setSelectedIndex(actualIdx)}
                                                >
                                                    <div className="command-icon">{result.icon}</div>
                                                    <div className="command-text">
                                                        <div className="command-title">{result.title}</div>
                                                        {result.subtitle && <div className="command-subtitle">{result.subtitle}</div>}
                                                    </div>
                                                    <span className={`command-type ${result.type}`}>{result.type}</span>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}

                                {results.some(r => r.type === "account") && (
                                    <>
                                        <div className="command-section">Accounts</div>
                                        {results.filter(r => r.type === "account").map((result, idx) => {
                                            const actualIdx = results.filter(r => r.type === "action").length + results.filter(r => r.type === "deal").length + idx;
                                            return (
                                                <div
                                                    key={result.id}
                                                    className={`command-item ${selectedIndex === actualIdx ? "selected" : ""}`}
                                                    onClick={() => handleSelect(result)}
                                                    onMouseEnter={() => setSelectedIndex(actualIdx)}
                                                >
                                                    <div className="command-icon">{result.icon}</div>
                                                    <div className="command-text">
                                                        <div className="command-title">{result.title}</div>
                                                        {result.subtitle && <div className="command-subtitle">{result.subtitle}</div>}
                                                    </div>
                                                    <span className={`command-type ${result.type}`}>{result.type}</span>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <div className="command-footer">
                        <div className="command-hints">
                            <span className="command-hint"><kbd>↑↓</kbd> Navigate</span>
                            <span className="command-hint"><kbd>↵</kbd> Select</span>
                            <span className="command-hint"><kbd>ESC</kbd> Close</span>
                        </div>
                        <span>PROVENIQ Sales</span>
                    </div>
                </div>
            </div>
        </>
    );
}
