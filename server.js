import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRoutes from './routes/emailRoutes.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging de requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rotas
app.use('/api', emailRoutes);

// Rota de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Sistema de Ponto - Email Service',
        version: '2.0.0'
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({
        message: 'Sistema de Ponto Web - Email Service API',
        version: '2.0.0',
        endpoints: {
            'POST /api/users/send-reset-email': 'Enviar e-mail após reset de senha',
            'GET /api/email/test-connection': 'Testar conexão com servidor de e-mail',
            'POST /api/email/send-test': 'Enviar e-mail de teste',
            'GET /health': 'Health check do serviço'
        }
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('❌ Erro não tratado:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado',
        path: req.originalUrl
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('🚀 Servidor iniciado com sucesso!');
    console.log(`📡 Servidor rodando em: http://localhost:${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`📧 SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
    console.log(`📧 SMTP User: ${process.env.SMTP_USER || 'Não configurado'}`);
    console.log('---');
    console.log('📋 Endpoints disponíveis:');
    console.log('  POST /api/users/send-reset-email - Enviar e-mail de reset');
    console.log('  GET  /api/email/test-connection - Testar conexão SMTP');
    console.log('  POST /api/email/send-test - Enviar e-mail de teste');
    console.log('  GET  /health - Health check');
    console.log('---');
});

// Tratamento de sinais para shutdown graceful
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recebido, encerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT recebido, encerrando servidor...');
    process.exit(0);
});

export default app;





