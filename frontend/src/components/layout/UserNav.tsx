'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserNav() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-gray-500">{user?.profile === 'master' ? 'Administrador' : 'Profissional'}</p>
      </div>
       <button
        onClick={handleLogout}
        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="Sair"
       >
        <LogOut className="w-5 h-5 text-gray-600" />
       </button>
    </div>
  );
}