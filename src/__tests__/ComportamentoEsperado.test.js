import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { SessionProvider } from '../contexts/SessionContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import NewUserModal from '../components/modals/NewUserModal';

// Mock dos serviços
jest.mock('../services/api', () => ({
    employeeService: {
        createEmployee: jest.fn(() => Promise.resolve({
            success: true,
            data: { id: 1, name: 'Teste Usuário', email: 'teste@teste.com' }
        }))
    },
    departmentService: {
        getDepartments: jest.fn(() => Promise.resolve({
            success: true,
            data: [{ name: 'TI' }, { name: 'RH' }]
        }))
    }
}));

// Wrapper para testes
const TestWrapper = ({ children }) => (
    <BrowserRouter>
        <AuthProvider>
            <SessionProvider>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </SessionProvider>
        </AuthProvider>
    </BrowserRouter>
);

describe('Comportamento Esperado do Sistema', () => {
    beforeEach(() => {
        // Mock do localStorage
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(() => null),
                setItem: jest.fn(),
                removeItem: jest.fn(),
            },
            writable: true
        });
    });

    test('1. Administrador clica em "Novo Usuário" - Modal abre', async () => {
        render(
            <TestWrapper>
                <AdminDashboard />
            </TestWrapper>
        );

        // Aguardar carregamento
        await waitFor(() => {
            expect(screen.getByText('Novo Usuário')).toBeInTheDocument();
        });

        // Clicar no botão
        const novoUsuarioBtn = screen.getByText('Novo Usuário');
        fireEvent.click(novoUsuarioBtn);

        // Verificar se modal abre
        await waitFor(() => {
            expect(screen.getByText('Novo Colaborador')).toBeInTheDocument();
        });
    });

    test('2. Modal abre com transição suave e layout centralizado', async () => {
        render(
            <TestWrapper>
                <NewUserModal isOpen={true} onClose={jest.fn()} />
            </TestWrapper>
        );

        // Verificar elementos do modal
        expect(screen.getByText('Novo Colaborador')).toBeInTheDocument();
        expect(screen.getByText('Preencha os dados para criar um novo colaborador')).toBeInTheDocument();

        // Verificar se está centralizado (classe CSS)
        const modal = screen.getByRole('dialog', { hidden: true });
        expect(modal).toHaveClass('fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center');
    });

    test('3. Formulário é interativo, validado e responsivo', async () => {
        render(
            <TestWrapper>
                <NewUserModal isOpen={true} onClose={jest.fn()} />
            </TestWrapper>
        );

        // Verificar campos do formulário
        expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
        expect(screen.getByLabelText('CPF')).toBeInTheDocument();
        expect(screen.getByLabelText('Email Corporativo')).toBeInTheDocument();
        expect(screen.getByLabelText('Senha')).toBeInTheDocument();

        // Testar interatividade
        const nomeInput = screen.getByLabelText('Nome Completo');
        fireEvent.change(nomeInput, { target: { value: 'João Silva' } });
        expect(nomeInput.value).toBe('João Silva');

        // Testar validação
        const emailInput = screen.getByLabelText('Email Corporativo');
        fireEvent.change(emailInput, { target: { value: 'email-invalido' } });

        // Aguardar validação
        await waitFor(() => {
            expect(screen.getByText('Email inválido')).toBeInTheDocument();
        });
    });

    test('4. Ao enviar: loading → sucesso/erro → feedback visual', async () => {
        render(
            <TestWrapper>
                <NewUserModal isOpen={true} onClose={jest.fn()} />
            </TestWrapper>
        );

        // Preencher formulário
        fireEvent.change(screen.getByLabelText('Nome Completo'), { target: { value: 'João Silva' } });
        fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '12345678901' } });
        fireEvent.change(screen.getByLabelText('Email Corporativo'), { target: { value: 'joao@teste.com' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
        fireEvent.change(screen.getByLabelText('Confirmar Senha'), { target: { value: '123456' } });

        // Submeter formulário
        const submitBtn = screen.getByText('Criar Colaborador');
        fireEvent.click(submitBtn);

        // Verificar loading
        await waitFor(() => {
            expect(screen.getByText('Criando Colaborador...')).toBeInTheDocument();
        });

        // Verificar sucesso
        await waitFor(() => {
            expect(screen.getByText('✅ Colaborador criado com sucesso!')).toBeInTheDocument();
        }, { timeout: 3000 });

        // Verificar botão de sucesso
        await waitFor(() => {
            expect(screen.getByText('Colaborador Criado!')).toBeInTheDocument();
        });
    });

    test('5. Modal fecha automaticamente e atualiza o painel', async () => {
        const mockOnClose = jest.fn();
        const mockOnUserCreated = jest.fn();

        render(
            <TestWrapper>
                <NewUserModal
                    isOpen={true}
                    onClose={mockOnClose}
                    onUserCreated={mockOnUserCreated}
                />
            </TestWrapper>
        );

        // Preencher e submeter formulário
        fireEvent.change(screen.getByLabelText('Nome Completo'), { target: { value: 'João Silva' } });
        fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '12345678901' } });
        fireEvent.change(screen.getByLabelText('Email Corporativo'), { target: { value: 'joao@teste.com' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
        fireEvent.change(screen.getByLabelText('Confirmar Senha'), { target: { value: '123456' } });

        fireEvent.click(screen.getByText('Criar Colaborador'));

        // Aguardar fechamento automático
        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled();
        }, { timeout: 5000 });

        // Verificar se callback foi chamado
        expect(mockOnUserCreated).toHaveBeenCalled();
    });
});

// Teste de integração completo
describe('Teste de Integração Completo', () => {
    test('Fluxo completo do sistema', async () => {
        render(
            <TestWrapper>
                <AdminDashboard />
            </TestWrapper>
        );

        // 1. Clicar em "Novo Usuário"
        await waitFor(() => {
            expect(screen.getByText('Novo Usuário')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Novo Usuário'));

        // 2. Verificar modal aberto
        await waitFor(() => {
            expect(screen.getByText('Novo Colaborador')).toBeInTheDocument();
        });

        // 3. Preencher formulário
        fireEvent.change(screen.getByLabelText('Nome Completo'), { target: { value: 'Maria Santos' } });
        fireEvent.change(screen.getByLabelText('CPF'), { target: { value: '98765432100' } });
        fireEvent.change(screen.getByLabelText('Email Corporativo'), { target: { value: 'maria@teste.com' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });
        fireEvent.change(screen.getByLabelText('Confirmar Senha'), { target: { value: '123456' } });

        // 4. Submeter
        fireEvent.click(screen.getByText('Criar Colaborador'));

        // 5. Verificar fluxo completo
        await waitFor(() => {
            expect(screen.getByText('Criando Colaborador...')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText('✅ Colaborador criado com sucesso!')).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText('Colaborador Criado!')).toBeInTheDocument();
        });

        // 6. Verificar fechamento automático
        await waitFor(() => {
            expect(screen.queryByText('Novo Colaborador')).not.toBeInTheDocument();
        }, { timeout: 5000 });
    });
});






