import UserNav from "./UserNav";
import React from "react";
import { Menu } from 'lucide-react';
import { useLayoutStore } from "@/stores/useLayoutStore";

interface HeaderProps {
    title: string;
    action?: React.ReactNode;
}

export default function Header({ title, action }: HeaderProps) {
    const { openSidebar } = useLayoutStore();
    return (
        <header className="bg-white h-16 flex items-center justify-between px-6 border-b shrink-0">
            <div className="flex items-center">
                <button onClick={openSidebar} className="lg:hidden text-gray-600 mr-4">
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            </div>
            <div className="flex items-center gap-4">
                {action}
                <UserNav />
            </div>
        </header>
    );
}