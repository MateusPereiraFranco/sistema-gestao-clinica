import UserNav from "./UserNav";
import React from "react";

interface HeaderProps {
    title: string;
    action?: React.ReactNode;
}

export default function Header({ title, action }: HeaderProps) {
    return (
        <header className="bg-white h-16 flex items-center justify-between px-6 border-b shrink-0">
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
            <div className="flex items-center gap-4">
                {action} {/* Renderiza o botão se ele for passado */}
                <UserNav />
            </div>
        </header>
    );
}