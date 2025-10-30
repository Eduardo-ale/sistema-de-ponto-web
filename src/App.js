import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SessionProvider } from './contexts/SessionContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './components/Login';
import ResetPasswordPage from './components/ResetPasswordPage';
import AdminDashboard from './components/dashboards/AdminDashboard';
import UserDashboard from './components/dashboards/UserDashboard';
import HRDashboard from './components/dashboards/HRDashboard';
import './index.css';

// Importar handler global de erros
import './utils/errorHandler';

// Componente para proteger rotas
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Componente para redirecionar usuários autenticados
const PublicRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated) {
        const redirectPath = {
            'admin': '/admin-dashboard',
            'colaborador': '/user-dashboard',
            'rh': '/hr-dashboard'
        }[user?.role];

        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

// Componente principal da aplicação
const AppContent = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Rota pública - Login */}
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    {/* Rota pública - Redefinição de senha */}
                    <Route
                        path="/reset-password/:token"
                        element={<ResetPasswordPage />}
                    />

                    {/* Rotas protegidas - Dashboards */}
                    <Route
                        path="/admin-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/user-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['colaborador']}>
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/hr-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['rh']}>
                                <HRDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rota padrão - redirecionar baseado no tipo de usuário */}
                    <Route
                        path="/"
                        element={
                            isAuthenticated ? (
                                <Navigate
                                    to={
                                        user?.role === 'admin' ? '/admin-dashboard' :
                                            user?.role === 'colaborador' ? '/user-dashboard' :
                                                user?.role === 'rh' ? '/hr-dashboard' : '/login'
                                    }
                                    replace
                                />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    {/* Rota para usuários não autorizados */}
                    <Route
                        path="/unauthorized"
                        element={
                            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        Acesso Negado
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Você não tem permissão para acessar esta página.
                                    </p>
                                    <button
                                        onClick={() => window.location.href = '/login'}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Voltar ao Login
                                    </button>
                                </div>
                            </div>
                        }
                    />

                    {/* Rota 404 */}
                    <Route
                        path="*"
                        element={
                            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        Página não encontrada
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        A página que você está procurando não existe.
                                    </p>
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Voltar ao Início
                                    </button>
                                </div>
                            </div>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
};

// Componente principal com Provider
const App = () => {
    return (
        <SessionProvider>
            <NotificationProvider>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </NotificationProvider>
        </SessionProvider>
    );
};

export default App;
