import React, { useState, useEffect } from 'react';
import { Filter, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const FilterByDepartment = ({ onFilterChange, selectedDepartment, setSelectedDepartment }) => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Carrega os departamentos do localStorage (simulando backend)
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                // Simular carregamento de departamentos
                await new Promise(resolve => setTimeout(resolve, 500));

                // Departamentos disponíveis no sistema
                const availableDepartments = [
                    'Todos',
                    'Recursos Humanos',
                    'Tecnologia da Informação',
                    'Administração',
                    'Financeiro',
                    'Comercial',
                    'Operações',
                    'Atendimento',
                    'Marketing',
                    'Jurídico'
                ];

                setDepartments(availableDepartments);
            } catch (error) {
                console.error('Erro ao carregar departamentos:', error);
                // Fallback com departamentos básicos
                setDepartments(['Todos', 'Recursos Humanos', 'Tecnologia da Informação', 'Administração']);
            }
        };

        fetchDepartments();
    }, []);

    // Atualiza filtro e notifica componente pai
    const handleChange = async (event) => {
        const value = event.target.value;
        setSelectedDepartment(value);
        setLoading(true);

        try {
            // Simular delay de processamento
            await new Promise(resolve => setTimeout(resolve, 800));
            await onFilterChange(value);
        } catch (error) {
            console.error('Erro ao aplicar filtro:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="flex flex-col md:flex-row items-center justify-between bg-gray-800/60 backdrop-blur-lg shadow-lg rounded-2xl p-6 mb-6 border border-gray-700/30 w-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex items-center gap-3 mb-4 md:mb-0">
                <div className="p-2 bg-blue-800/30 rounded-lg">
                    <Filter className="text-blue-400 w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-gray-200 font-semibold text-lg">
                        Filtrar por Departamento/Setor
                    </h2>
                    <p className="text-sm text-gray-400">
                        Selecione um departamento para filtrar os dados de ausências
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <select
                    value={selectedDepartment}
                    onChange={handleChange}
                    disabled={loading}
                    className="border border-gray-600 rounded-xl p-3 w-full md:w-64 text-gray-200 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {departments.map((dep, index) => (
                        <option key={index} value={dep} className="bg-gray-700 text-gray-200">
                            {dep}
                        </option>
                    ))}
                </select>

                {loading && (
                    <motion.div
                        className="flex items-center text-blue-400 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Atualizando dados...
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default FilterByDepartment;
