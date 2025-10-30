// Dados mockados para colaboradores
export const mockEmployees = [
    {
        id: 1,
        name: 'MARIO LUIS',
        cpf: '111.222.333-44',
        registration: 'EMP001',
        position: 'Desenvolvedor Senior',
        department: 'Tecnologia',
        email: 'chapeudepalhal250@gmail.com',
        phone: '(11) 99999-0000',
        login: 'mario.luis',
        role: 'employee',
        status: true,
        workStartTime: '08:00',
        workEndTime: '17:00',
        workSchedule: '08h-17h',
        createdAt: '2024-01-15T08:00:00Z'
    },
    {
        id: 2,
        name: 'Maria Silva',
        cpf: '123.456.789-00',
        registration: 'EMP002',
        position: 'Desenvolvedora Frontend',
        department: 'Tecnologia',
        email: 'maria.silva@empresa.com',
        phone: '(11) 99999-1111',
        login: 'maria.silva',
        role: 'employee',
        status: true,
        workStartTime: '08:00',
        workEndTime: '17:00',
        workSchedule: '08h-17h',
        createdAt: '2024-01-15T08:00:00Z'
    },
    {
        id: 2,
        name: 'João Santos',
        cpf: '987.654.321-00',
        registration: 'EMP003',
        position: 'Gerente de Projetos',
        department: 'Tecnologia',
        email: 'joao.santos@empresa.com',
        phone: '(11) 99999-2222',
        login: 'joao.santos',
        role: 'manager',
        status: true,
        workStartTime: '09:00',
        workEndTime: '18:00',
        workSchedule: '09h-18h',
        createdAt: '2024-01-20T08:00:00Z'
    },
    {
        id: 3,
        name: 'Ana Costa',
        cpf: '456.789.123-00',
        registration: 'EMP005',
        position: 'Analista de RH',
        department: 'Recursos Humanos',
        email: 'ana.costa@empresa.com',
        phone: '(11) 99999-3333',
        login: 'ana.costa',
        role: 'rh',
        status: true,
        workStartTime: '08:30',
        workEndTime: '17:30',
        workSchedule: '08h30-17h30',
        createdAt: '2024-02-01T08:00:00Z'
    },
    {
        id: 4,
        name: 'Pedro Oliveira',
        cpf: '789.123.456-00',
        registration: 'EMP005',
        position: 'Designer UX/UI',
        department: 'Design',
        email: 'pedro.oliveira@empresa.com',
        phone: '(11) 99999-4444',
        role: 'employee',
        status: false,
        workStartTime: '10:00',
        workEndTime: '19:00',
        workSchedule: '10h-19h',
        createdAt: '2024-02-10T08:00:00Z'
    },
    {
        id: 5,
        name: 'Carla Mendes',
        cpf: '321.654.987-00',
        registration: 'EMP005',
        position: 'Administradora',
        department: 'Administração',
        email: 'carla.mendes@empresa.com',
        phone: '(11) 99999-5555',
        role: 'admin',
        status: true,
        workStartTime: '08:00',
        workEndTime: '17:00',
        workSchedule: '08h-17h',
        createdAt: '2024-02-15T08:00:00Z'
    },
    {
        id: 6,
        name: 'Roberto Lima',
        cpf: '654.321.987-00',
        registration: 'EMP006',
        position: 'Analista Financeiro',
        department: 'Financeiro',
        email: 'roberto.lima@empresa.com',
        phone: '(11) 99999-6666',
        role: 'employee',
        status: true,
        workStartTime: '08:00',
        workEndTime: '17:00',
        workSchedule: '08h-17h',
        createdAt: '2024-02-20T08:00:00Z'
    },
    {
        id: 7,
        name: 'Fernanda Rocha',
        cpf: '147.258.369-00',
        registration: 'EMP007',
        position: 'Marketing Digital',
        department: 'Marketing',
        email: 'fernanda.rocha@empresa.com',
        phone: '(11) 99999-7777',
        role: 'employee',
        status: true,
        workStartTime: '09:00',
        workEndTime: '18:00',
        workSchedule: '09h-18h',
        createdAt: '2024-03-01T08:00:00Z'
    },
    {
        id: 8,
        name: 'Lucas Ferreira',
        cpf: '369.258.147-00',
        registration: 'EMP008',
        position: 'Desenvolvedor Backend',
        department: 'Tecnologia',
        email: 'lucas.ferreira@empresa.com',
        phone: '(11) 99999-8888',
        role: 'employee',
        status: true,
        workStartTime: '08:00',
        workEndTime: '17:00',
        workSchedule: '08h-17h',
        createdAt: '2024-03-05T08:00:00Z'
    }
];

// Dados mockados para departamentos
export const mockDepartments = [
    { id: 1, name: 'Tecnologia', description: 'Desenvolvimento e TI' },
    { id: 2, name: 'Recursos Humanos', description: 'Gestão de pessoas' },
    { id: 3, name: 'Design', description: 'Design e UX/UI' },
    { id: 4, name: 'Administração', description: 'Gestão administrativa' },
    { id: 5, name: 'Financeiro', description: 'Contabilidade e finanças' },
    { id: 6, name: 'Marketing', description: 'Marketing e vendas' },
    { id: 7, name: 'Operações', description: 'Operações e produção' }
];

// Dados mockados para horários
export const mockSchedules = [
    {
        id: 1,
        employeeId: 1,
        dayOfWeek: 'monday',
        startTime: '08:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        isActive: true
    },
    {
        id: 2,
        employeeId: 1,
        dayOfWeek: 'tuesday',
        startTime: '08:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        isActive: true
    },
    {
        id: 3,
        employeeId: 1,
        dayOfWeek: 'wednesday',
        startTime: '08:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        isActive: true
    },
    {
        id: 4,
        employeeId: 1,
        dayOfWeek: 'thursday',
        startTime: '08:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        isActive: true
    },
    {
        id: 5,
        employeeId: 1,
        dayOfWeek: 'friday',
        startTime: '08:00',
        endTime: '17:00',
        breakStartTime: '12:00',
        breakEndTime: '13:00',
        isActive: true
    }
];

// Dados mockados para eventos
export const mockEvents = [
    {
        id: 1,
        employeeId: 1,
        type: 'vacation',
        startDate: '2024-12-20',
        endDate: '2024-12-31',
        reason: 'Férias de fim de ano',
        description: 'Período de férias coletivas',
        isPaid: true,
        createdAt: '2024-11-01T08:00:00Z'
    },
    {
        id: 2,
        employeeId: 1,
        type: 'holiday',
        startDate: '2024-12-25',
        endDate: '2024-12-25',
        reason: 'Natal',
        description: 'Feriado nacional',
        isPaid: true,
        createdAt: '2024-01-01T08:00:00Z'
    },
    {
        id: 3,
        employeeId: 2,
        type: 'sick_leave',
        startDate: '2024-11-15',
        endDate: '2024-11-17',
        reason: 'Atestado médico',
        description: 'Gripe',
        isPaid: true,
        createdAt: '2024-11-15T08:00:00Z'
    }
];

export default {
    mockEmployees,
    mockDepartments,
    mockSchedules,
    mockEvents
};

