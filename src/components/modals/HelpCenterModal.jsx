import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HelpCircle,
    Search,
    BookOpen,
    MessageCircle,
    Phone,
    Mail,
    ExternalLink,
    ChevronRight,
    X,
    FileText,
    Video,
    Download,
    Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const HelpCenterModal = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'Todos', icon: BookOpen },
        { id: 'getting-started', label: 'Primeiros Passos', icon: Star },
        { id: 'user-management', label: 'Gerenciamento de Usuários', icon: FileText },
        { id: 'reports', label: 'Relatórios', icon: FileText },
        { id: 'settings', label: 'Configurações', icon: FileText },
        { id: 'troubleshooting', label: 'Solução de Problemas', icon: HelpCircle }
    ];

    const helpArticles = [
        {
            id: 1,
            title: 'Como criar um novo usuário',
            category: 'user-management',
            content: 'Para criar um novo usuário, acesse o menu "Gerenciar Usuários" e clique em "Novo Colaborador". Preencha todos os campos obrigatórios e clique em "Salvar".',
            tags: ['usuário', 'criar', 'colaborador'],
            rating: 4.8
        },
        {
            id: 2,
            title: 'Configurando notificações por e-mail',
            category: 'settings',
            content: 'Acesse as Configurações Gerais e vá para a seção "Notificações". Ative as opções desejadas e configure seus preferências de recebimento.',
            tags: ['notificação', 'e-mail', 'configuração'],
            rating: 4.5
        },
        {
            id: 3,
            title: 'Gerando relatórios de ponto',
            category: 'reports',
            content: 'No dashboard administrativo, clique em "Relatórios" e selecione o tipo de relatório desejado. Configure os filtros e clique em "Gerar".',
            tags: ['relatório', 'ponto', 'dashboard'],
            rating: 4.7
        },
        {
            id: 4,
            title: 'Primeiro acesso ao sistema',
            category: 'getting-started',
            content: 'Após receber suas credenciais, acesse o sistema e altere sua senha no primeiro login. Configure suas preferências nas Configurações.',
            tags: ['primeiro acesso', 'login', 'senha'],
            rating: 4.9
        },
        {
            id: 5,
            title: 'Problemas de login',
            category: 'troubleshooting',
            content: 'Se você está tendo problemas para fazer login, verifique se suas credenciais estão corretas. Se o problema persistir, entre em contato com o suporte.',
            tags: ['login', 'problema', 'credenciais'],
            rating: 4.3
        }
    ];

    const filteredArticles = helpArticles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleContactSupport = (type) => {
        const messages = {
            email: 'Redirecionando para o e-mail de suporte...',
            phone: 'Redirecionando para o telefone de suporte...',
            chat: 'Iniciando chat de suporte...'
        };

        toast.success(messages[type], {
            duration: 2000,
            icon: '📞'
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence key="help-center-presence">
            <motion.div
                key="help-center-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    key="help-center-modal"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, type: 'spring', damping: 25 }}
                    className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Central de Ajuda</h2>
                                    <p className="text-sm text-gray-400">Encontre respostas para suas dúvidas</p>
                                </div>
                            </div>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                title="Fechar"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Barra de Pesquisa */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Pesquisar na central de ajuda..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        {/* Categorias */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <motion.button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${selectedCategory === category.id
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    <category.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{category.label}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Artigos de Ajuda */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white">
                                Artigos ({filteredArticles.length})
                            </h3>

                            {filteredArticles.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredArticles.map((article) => (
                                        <motion.div
                                            key={article.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="text-white font-medium mb-2">{article.title}</h4>
                                                    <p className="text-gray-400 text-sm mb-3">{article.content}</p>
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center space-x-1">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                            <span className="text-sm text-gray-400">{article.rating}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {article.tags.map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <HelpCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum artigo encontrado</h3>
                                    <p className="text-gray-500">Tente ajustar sua pesquisa ou categoria</p>
                                </div>
                            )}
                        </div>

                        {/* Contato com Suporte */}
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <MessageCircle className="w-5 h-5 mr-2 text-green-400" />
                                Precisa de Mais Ajuda?
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <motion.button
                                    onClick={() => handleContactSupport('email')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    <Mail className="w-5 h-5 text-blue-400" />
                                    <div className="text-left">
                                        <h4 className="text-white font-medium">E-mail</h4>
                                        <p className="text-sm text-gray-400">suporte@core-rh.com</p>
                                    </div>
                                </motion.button>

                                <motion.button
                                    onClick={() => handleContactSupport('phone')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    <Phone className="w-5 h-5 text-green-400" />
                                    <div className="text-left">
                                        <h4 className="text-white font-medium">Telefone</h4>
                                        <p className="text-sm text-gray-400">(11) 9999-9999</p>
                                    </div>
                                </motion.button>

                                <motion.button
                                    onClick={() => handleContactSupport('chat')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5 text-purple-400" />
                                    <div className="text-left">
                                        <h4 className="text-white font-medium">Chat Online</h4>
                                        <p className="text-sm text-gray-400">Disponível 24/7</p>
                                    </div>
                                </motion.button>
                            </div>
                        </div>

                        {/* Recursos Adicionais */}
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <BookOpen className="w-5 h-5 mr-2 text-blue-400" />
                                Recursos Adicionais
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    <FileText className="w-5 h-5 text-orange-400" />
                                    <div className="text-left">
                                        <h4 className="text-white font-medium">Manual do Usuário</h4>
                                        <p className="text-sm text-gray-400">Guia completo do sistema</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center space-x-3 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                    <Video className="w-5 h-5 text-red-400" />
                                    <div className="text-left">
                                        <h4 className="text-white font-medium">Tutoriais em Vídeo</h4>
                                        <p className="text-sm text-gray-400">Aprenda visualmente</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default HelpCenterModal;
