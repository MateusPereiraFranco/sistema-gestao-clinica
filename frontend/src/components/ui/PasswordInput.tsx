'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Aceita todas as propriedades de um input HTML padrão para máxima reutilização.
interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function PasswordInput(props: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="relative">
            <input
                {...props}
                type={showPassword ? 'text' : 'password'}
                className="w-full p-3 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Esconder palavra-passe" : "Mostrar palavra-passe"}
            >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
    );
}