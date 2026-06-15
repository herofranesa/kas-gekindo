"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    LayoutDashboard,
    ArrowLeftRight,
    LogOut,
    Menu,
    X,
    Wallet,
} from "lucide-react";

const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    async function handleLogout() {
        await fetch("/api/login");
        router.push("/login");
    }

    return (
        <>
            <button
                className="lg:hidden fixed top-4 left-4 z-50 bg-white text-gray-700 p-2.5 rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition"
                onClick={() => setOpen(!open)}
            >
                {open ? (
                    <X className="w-5 h-5" />
                ) : (
                    <Menu className="w-5 h-5" />
                )}
            </button>

            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden ${open ? "block" : "hidden"}`}
                onClick={() => setOpen(false)}
            />

            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transform transition-transform duration-300 lg:transform-none ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight">
                                KAS GEKINDO
                            </h2>
                            <p className="text-xs text-blue-200/70">
                                Manajemen Kas
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="p-3 space-y-1">
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                        Menu
                    </p>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? "bg-white/15 text-white shadow-sm"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium text-sm">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Keluar</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
