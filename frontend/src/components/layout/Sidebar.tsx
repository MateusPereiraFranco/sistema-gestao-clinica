'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { BriefcaseMedical, LayoutDashboard, Users, Calendar, ListChecks, BarChart3, UserPlus, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/services/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/dashboard/pacientes', label: 'Pacientes', icon: Users },
  { href: '/dashboard/agenda', label: 'Agenda Completa', icon: Calendar },
  { href: '/dashboard/lista-de-espera', label: 'Lista de Espera', icon: ListChecks },
  { href: '/dashboard/relatorios', label: 'Relatórios', icon: BarChart3 },
];

const masterNavItems = [
  { href: '/dashboard/usuarios', label: 'Gerir Utilizadores', icon: UserPlus },
];

const adminNavItems = [
  { href: '/dashboard/unidades', label: 'Gerir Unidades', icon: ShieldCheck },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user: loggedInUser } = useAuthStore();
    const [unitName, setUnitName] = useState('AMA');
    const pathname = usePathname();
    const { user } = useAuthStore();

    useEffect(() => {
        if (loggedInUser?.unit_id) {
            if (loggedInUser.unit_name) {
                setUnitName(loggedInUser.unit_name);
            } else {
                api.get(`/units/${loggedInUser.unit_id}`)
                    .then(res => {
                        setUnitName(res.data.name);
                    })
                    .catch(err => {
                        console.error("Falha ao buscar o nome da unidade:", err);
                    });
            }
        }
    }, [loggedInUser]);

  return (
    <>
        {/* Overlay para ecrãs pequenos (escurece o fundo quando o menu está aberto) */}
        <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        ></div>

        {/* O seu <aside> com as classes de responsividade adicionadas */}
        <aside 
            className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r z-40 transform transition-transform duration-300 ease-in-out 
                       lg:relative lg:translate-x-0
                       ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <div className="h-16 flex items-center justify-between border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <BriefcaseMedical className="h-6 w-6 text-indigo-600" />
                    <span>{unitName}</span>
                </Link>
                {/* Botão para fechar, visível apenas em ecrãs pequenos */}
                <button onClick={onClose} className="lg:hidden p-1 text-gray-500">
                    <X size={24} />
                </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            pathname === item.href
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.label}
                    </Link>
                ))}
                {(user?.profile === 'admin' || user?.profile === 'master') && (
                    <div className="pt-4 mt-4 border-t">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase">Gestão</p>
                        <div className="mt-2 space-y-1">
                            {masterNavItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        pathname.startsWith(item.href)
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                {(user?.profile === 'admin') && (
                    <div className="pt-4 mt-4 border-t">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase">Admin</p>
                        <div className="mt-2 space-y-1">
                            {adminNavItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        pathname.startsWith(item.href)
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
            <div className="p-4 mt-auto border-t">
                <div className="flex items-center gap-3">
                    <div className='flex flex-col'>
                        <p className="text-sm font-semibold text-gray-800">{user?.name || 'Utilizador'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'email@exemplo.com'}</p>
                    </div>
                </div>
            </div>
        </aside>
    </>
  );
}