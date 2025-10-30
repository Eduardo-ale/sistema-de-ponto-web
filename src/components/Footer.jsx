import React from 'react';
import { Mail, Phone, Clock, Shield, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full bg-gray-900 border-t border-gray-700 mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Conteúdo Principal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    {/* Coluna 1 - Identificação do Sistema */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-200">
                                    Sistema de Registro de Ponto
                                </h3>
                                <p className="text-sm text-blue-400 font-medium">
                                    CORE RH
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                                Versão 1.0.0
                            </span>
                            <span className="text-xs text-green-400 flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span>Online</span>
                            </span>
                        </div>
                    </div>

                    {/* Coluna 2 - Direitos Autorais */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-200 flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span>Governo do Estado</span>
                        </h4>
                        <div className="text-sm text-gray-400 space-y-1">
                            <p>© 2025 Governo do Estado de</p>
                            <p className="font-medium text-gray-300">Mato Grosso do Sul</p>
                            <p className="text-xs text-gray-500">Todos os direitos reservados</p>
                        </div>
                    </div>

                    {/* Coluna 3 - Suporte Técnico */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-200 flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-green-400" />
                            <span>Suporte Técnico</span>
                        </h4>
                        <div className="text-sm text-gray-400 space-y-2">
                            <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3 text-gray-500" />
                                <span>Equipe de TI CORE</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="w-3 h-3 text-gray-500" />
                                <span className="font-mono text-gray-300">(67) 3378-3519 / 3378-3556</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="w-3 h-3 text-gray-500" />
                                <a
                                    href="mailto:core.ms.suporteti@gmail.com"
                                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:underline"
                                >
                                    core.ms.suporteti@gmail.com
                                </a>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-xs">
                                    Segunda a sexta, das 08h às 17h
                                    <span className="text-gray-500 ml-1">(horário de MS)</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linha Divisória */}
                <div className="border-t border-gray-700 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                        {/* Informações Adicionais */}
                        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-xs text-gray-500">
                            <span>Sistema desenvolvido com React + TailwindCSS</span>
                            <span className="hidden md:inline">•</span>
                            <span>Interface responsiva e moderna</span>
                            <span className="hidden md:inline">•</span>
                            <span>Segurança e performance otimizadas</span>
                        </div>

                        {/* Status do Sistema */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs text-gray-400">Sistema operacional</span>
                            </div>
                            <div className="text-xs text-gray-500">
                                Última atualização: {new Date().toLocaleDateString('pt-BR')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
