'use client';

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
        <header className="bg-white h-16 flex items-center justify-between px-4 sm:px-6 border-b shrink-0">
            <div className="flex items-center">
                <button onClick={openSidebar} className="lg:hidden text-gray-600 mr-2 sm:mr-4">
                    <Menu size={24} />
                </button>
                {/* O título agora é truncado em ecrãs muito pequenos */}
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                {action}
                <UserNav />
            </div>
        </header>
    );
}
