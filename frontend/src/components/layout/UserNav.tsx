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

  // Se o utilizador ainda não carregou, não mostre nada para evitar um "flash" de conteúdo.
  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* O texto do nome e perfil agora é escondido em ecrãs pequenos (hidden) e aparece em ecrãs maiores (sm:block) */}
      <div className="text-right hidden sm:block">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-gray-500">{getProfileName()}</p>
      </div>
      <div className="flex items-center border-l pl-2">
        <Link href="/dashboard/perfil/alterar-senha" className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Alterar Senha">
          <KeyRound className="w-5 h-5 text-gray-600" />
        </Link>
       <button
        onClick={handleLogout}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Sair"
        title="Sair"
       >
        <LogOut className="w-5 h-5 text-gray-600" />
       </button>
       </div>
    </div>
  );
}
