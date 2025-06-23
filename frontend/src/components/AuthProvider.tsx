'use client';

import { useAuth } from '@/hooks/useAuth';
import React from 'react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isReady } = useAuth();

  // Enquanto o hook 'useAuth' não estiver "pronto" (isReady=false),
  // exibe um ecrã de carregamento. Isto previne o redirecionamento indesejado no refresh.
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>A verificar autenticação...</p>
      </div>
    );
  }

  // Quando estiver pronto, exibe o conteúdo da página protegida.
  return <>{children}</>;
}