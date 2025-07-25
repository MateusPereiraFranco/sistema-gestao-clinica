'use client';

import AuthProvider from '@/components/AuthProvider';
import Sidebar from '@/components/layout/Sidebar';
import React from 'react';
import { useLayoutStore } from '@/stores/useLayoutStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 2. Obtenha o estado e a função de fechar do controlador
  const { isSidebarOpen, closeSidebar } = useLayoutStore();

  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-100">
        {/* 3. Passe o estado para o Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}
