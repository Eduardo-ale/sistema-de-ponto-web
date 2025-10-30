import { useState, useEffect, useCallback } from 'react';
import { employeeService } from '../services/api';
import toast from 'react-hot-toast';

export const useEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Buscar todos os colaboradores
    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await employeeService.getAllEmployees();

            if (result.success) {
                setEmployees(result.data);
            } else {
                setError(result.error);
                toast.error(result.error);
            }
        } catch (err) {
            const errorMessage = 'Erro ao buscar colaboradores';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Criar novo colaborador
    const createEmployee = useCallback(async (employeeData) => {
        setLoading(true);
        setError(null);

        try {
            const result = await employeeService.createEmployee(employeeData);

            if (result.success) {
                // Atualizar lista local
                setEmployees(prev => [result.data, ...prev]);
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = 'Erro interno do servidor';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Atualizar colaborador
    const updateEmployee = useCallback(async (employeeId, employeeData) => {
        setLoading(true);
        setError(null);

        try {
            const result = await employeeService.updateEmployee(employeeId, employeeData);

            if (result.success) {
                // Atualizar lista local
                setEmployees(prev => prev.map(emp =>
                    emp.id === employeeId ? { ...emp, ...result.data } : emp
                ));
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = 'Erro interno do servidor';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Deletar colaborador
    const deleteEmployee = useCallback(async (employeeId) => {
        setLoading(true);
        setError(null);

        try {
            const result = await employeeService.deleteEmployee(employeeId);

            if (result.success) {
                // Remover da lista local
                setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
                return { success: true };
            } else {
                setError(result.error);
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = 'Erro interno do servidor';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Alternar status do colaborador
    const toggleEmployeeStatus = useCallback(async (employeeId, newStatus) => {
        setLoading(true);
        setError(null);

        try {
            const result = await employeeService.toggleEmployeeStatus(employeeId, newStatus);

            if (result.success) {
                // Atualizar lista local
                setEmployees(prev => prev.map(emp =>
                    emp.id === employeeId ? { ...emp, status: newStatus } : emp
                ));
                return { success: true };
            } else {
                setError(result.error);
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = 'Erro interno do servidor';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Importar colaboradores
    const importEmployees = useCallback(async (file) => {
        setLoading(true);
        setError(null);

        try {
            const result = await employeeService.importEmployees(file);

            if (result.success) {
                // Atualizar lista local
                setEmployees(prev => [...result.data, ...prev]);
                return { success: true, data: result.data };
            } else {
                setError(result.error);
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = 'Erro interno do servidor';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Exportar colaboradores
    const exportEmployees = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await employeeService.exportEmployees();

            if (result.success) {
                return { success: true };
            } else {
                setError(result.error);
                toast.error(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMessage = 'Erro interno do servidor';
            setError(errorMessage);
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar dados iniciais
    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    return {
        employees,
        loading,
        error,
        fetchEmployees,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        toggleEmployeeStatus,
        importEmployees,
        exportEmployees
    };
};

export default useEmployees;






