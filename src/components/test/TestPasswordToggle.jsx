import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Componente de teste simples para o ícone de olho
const TestPasswordToggle = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');

    const togglePassword = () => {
        console.log('🔍 Toggle clicked, current state:', showPassword);
        setShowPassword(!showPassword);
        console.log('🔍 New state:', !showPassword);
    };

    return (
        <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white mb-4">Teste do Ícone de Olho</h3>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite uma senha"
                    className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
                <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            <div className="mt-2 text-sm text-gray-300">
                Estado: {showPassword ? 'Visível' : 'Oculto'} | Tipo: {showPassword ? 'text' : 'password'}
            </div>
        </div>
    );
};

export default TestPasswordToggle;

import { Eye, EyeOff } from 'lucide-react';

// Componente de teste simples para o ícone de olho
const TestPasswordToggle = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');

    const togglePassword = () => {
        console.log('🔍 Toggle clicked, current state:', showPassword);
        setShowPassword(!showPassword);
        console.log('🔍 New state:', !showPassword);
    };

    return (
        <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white mb-4">Teste do Ícone de Olho</h3>
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite uma senha"
                    className="w-full px-3 py-2 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
                <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            <div className="mt-2 text-sm text-gray-300">
                Estado: {showPassword ? 'Visível' : 'Oculto'} | Tipo: {showPassword ? 'text' : 'password'}
            </div>
        </div>
    );
};

export default TestPasswordToggle;


