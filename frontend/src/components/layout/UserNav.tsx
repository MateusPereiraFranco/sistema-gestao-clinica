'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { KeyRound, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const getProfileName = () => {
    if (user?.profile === 'admin') return 'Administrador do Sistema';
    if (user?.profile === 'master') return 'Gestor da Unidade';
    return 'Profissional';
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex items-center gap-5">
      <div className="text-right">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-gray-500">{getProfileName()}</p>
      </div>
      <div className="flex items-center border-l pl-2 ml-2">
        <Link href="/dashboard/perfil/alterar-senha" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <KeyRound className="w-5 h-5 text-gray-600" />
        </Link>
       <button
        onClick={handleLogout}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Sair"
       >
        <LogOut className="w-5 h-5 text-gray-600" />
       </button>
       </div>
    </div>
  );
}