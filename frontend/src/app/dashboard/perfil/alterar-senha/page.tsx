'use client';

import Header from "@/components/layout/Header";
import ChangePasswordForm from "@/components/perfil/ChangePasswordForm";

export default function AlterarSenhaPage() {
    return (
        <>
            <Header title="Alterar a Minha Palavra-passe" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="bg-white p-8 rounded-lg shadow-sm">
                    <ChangePasswordForm />
                </div>
            </main>
        </>
    );
}