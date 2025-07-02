'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { BriefcaseMedical, LayoutDashboard, Users, Calendar, ListChecks } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/pacientes', label: 'Pacientes', icon: Users },
  { href: '/dashboard/agenda', label: 'Agenda Completa', icon: Calendar },
  { href: '/dashboard/lista-de-espera', label: 'Lista de Espera', icon: ListChecks },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r">
      <div className="h-16 flex items-center justify-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <BriefcaseMedical className="h-6 w-6 text-indigo-600" />
          <span>Clínica IOA</span>
        </Link>
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
  );
}