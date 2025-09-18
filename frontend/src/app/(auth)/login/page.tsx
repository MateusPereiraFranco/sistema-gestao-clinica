"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/services/api";
import toast from "react-hot-toast";
import { LogIn, Mail, Lock, BriefcaseMedical } from "lucide-react";
import { useFilterStore } from "@/stores/useFilterStore";
import Link from "next/link";
import PasswordInput from "@/components/ui/PasswordInput";

interface LoginResponse {
  token: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    profile: "master" | "normal";
  };
}

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const { resetDatesToToday } = useFilterStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && user) {
      router.replace("/dashboard");
    }
  }, [isClient, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("A autenticar...");
    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      setUser(response.data.user, response.data.token);
      resetDatesToToday();
      toast.success(`Bem-vindo de volta, ${response.data.user.name}!`, {
        id: toastId,
      });
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Ocorreu um erro.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient || user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>A carregar...</p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-tr from-indigo-800 to-purple-700 text-white p-12">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white bg-opacity-20 rounded-full">
            <BriefcaseMedical size={40} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Sistema de Gestão Clínica
          </h1>
          <p className="mt-4 text-lg text-indigo-200">
            Centralize a gestão da saúde com eficiência e segurança. A nossa
            plataforma une todas as suas unidades.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center w-full lg:w-1/2 bg-gray-50 p-8">
        <div className="w-full max-w-sm">
          <div className="text-left mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Aceda à sua Conta
            </h2>
            <p className="mt-2 text-gray-500">
              Bem-vindo! Por favor, insira os seus dados.
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Endereço de email
              </label>
              <div className="absolute inset-y-0 left-0 top-7 flex items-center pl-3 pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full py-3 pl-10 pr-4 text-gray-900 border border-gray-300 rounded-lg shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="exemplo@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Palavra-passe
              </label>
              <div className="absolute inset-y-0 left-0 top-7 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-sm group hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                <LogIn className="w-5 h-5 mr-2 -ml-1" />
                {isLoading ? "A aguardar..." : "Entrar"}
              </button>
            </div>
            {/*<div className="flex items-center justify-center">
                        <div className="text-sm">
                            <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Esqueceu a sua palavra-passe?
                            </Link>
                        </div>
                    </div>
                */}
          </form>
        </div>
      </div>
    </div>
  );
}
