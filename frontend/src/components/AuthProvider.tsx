'use client';

import { useAuth } from '@/hooks/useAuth';
import React from 'react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>A verificar autenticação...</p>
      </div>
    );
  }

  return <>{children}</>;
}