// =============================================
//  GymPro — Datos de demostración
// =============================================

const GymData = {
  members: [
    { id: 1,  name: 'Ana García',        email: 'ana.garcia@email.com',      phone: '+34 611 234 567', plan: 'Premium',  status: 'Activo',    joined: '2024-01-15', expiry: '2025-01-15', color: '#3b82f6' },
    { id: 2,  name: 'Carlos Martínez',   email: 'carlos.m@email.com',        phone: '+34 622 345 678', plan: 'Estándar', status: 'Activo',    joined: '2024-02-10', expiry: '2025-02-10', color: '#a855f7' },
    { id: 3,  name: 'Lucía Fernández',   email: 'lucia.f@email.com',         phone: '+34 633 456 789', plan: 'Básico',   status: 'Activo',    joined: '2024-03-05', expiry: '2025-03-05', color: '#22c55e' },
    { id: 4,  name: 'Miguel Torres',     email: 'miguel.t@email.com',        phone: '+34 644 567 890', plan: 'Premium',  status: 'Activo',    joined: '2024-01-20', expiry: '2025-01-20', color: '#f97316' },
    { id: 5,  name: 'Sara López',        email: 'sara.l@email.com',          phone: '+34 655 678 901', plan: 'Estándar', status: 'Pendiente', joined: '2024-04-12', expiry: '2024-12-12', color: '#ef4444' },
    { id: 6,  name: 'Pablo Sánchez',     email: 'pablo.s@email.com',         phone: '+34 666 789 012', plan: 'Básico',   status: 'Inactivo',  joined: '2023-11-01', expiry: '2024-11-01', color: '#64748b' },
    { id: 7,  name: 'Elena Díaz',        email: 'elena.d@email.com',         phone: '+34 677 890 123', plan: 'Premium',  status: 'Activo',    joined: '2024-05-08', expiry: '2025-05-08', color: '#3b82f6' },
    { id: 8,  name: 'Roberto Jiménez',   email: 'roberto.j@email.com',       phone: '+34 688 901 234', plan: 'Estándar', status: 'Activo',    joined: '2024-06-01', expiry: '2025-06-01', color: '#a855f7' },
    { id: 9,  name: 'Isabel Moreno',     email: 'isabel.m@email.com',        phone: '+34 699 012 345', plan: 'Básico',   status: 'Activo',    joined: '2024-07-14', expiry: '2025-07-14', color: '#22c55e' },
    { id: 10, name: 'David Ruiz',        email: 'david.r@email.com',         phone: '+34 611 123 456', plan: 'Premium',  status: 'Activo',    joined: '2024-08-20', expiry: '2025-08-20', color: '#f97316' },
    { id: 11, name: 'María Navarro',     email: 'maria.n@email.com',         phone: '+34 622 234 567', plan: 'Estándar', status: 'Inactivo',  joined: '2023-09-10', expiry: '2024-09-10', color: '#64748b' },
    { id: 12, name: 'Javier Castro',     email: 'javier.c@email.com',        phone: '+34 633 345 678', plan: 'Básico',   status: 'Activo',    joined: '2024-09-03', expiry: '2025-09-03', color: '#3b82f6' },
    { id: 13, name: 'Carmen Ortega',     email: 'carmen.o@email.com',        phone: '+34 644 456 789', plan: 'Premium',  status: 'Activo',    joined: '2024-10-18', expiry: '2025-10-18', color: '#a855f7' },
    { id: 14, name: 'Fernando Gómez',    email: 'fernando.g@email.com',      phone: '+34 655 567 890', plan: 'Estándar', status: 'Pendiente', joined: '2024-11-22', expiry: '2025-11-22', color: '#22c55e' },
    { id: 15, name: 'Patricia Vega',     email: 'patricia.v@email.com',      phone: '+34 666 678 901', plan: 'Básico',   status: 'Activo',    joined: '2024-12-05', expiry: '2025-12-05', color: '#f97316' },
  ],

  classes: [
    { id: 1,  name: 'Yoga Matutino',       trainer: 'Sofía Reyes',    day: 'Lunes',     time: '08:00',  duration: 60,  capacity: 20, enrolled: 18, level: 'Todos',      color: '#a855f7' },
    { id: 2,  name: 'CrossFit Intensivo',  trainer: 'Marco Delgado',  day: 'Lunes',     time: '18:00',  duration: 60,  capacity: 15, enrolled: 15, level: 'Avanzado',   color: '#ef4444' },
    { id: 3,  name: 'Spinning',            trainer: 'Laura Molina',   day: 'Martes',    time: '07:00',  duration: 45,  capacity: 25, enrolled: 20, level: 'Intermedio', color: '#f97316' },
    { id: 4,  name: 'Pilates',             trainer: 'Sofía Reyes',    day: 'Martes',    time: '10:00',  duration: 55,  capacity: 18, enrolled: 12, level: 'Todos',      color: '#22c55e' },
    { id: 5,  name: 'Boxeo Fitness',       trainer: 'Marco Delgado',  day: 'Miércoles', time: '19:00',  duration: 60,  capacity: 16, enrolled: 14, level: 'Intermedio', color: '#3b82f6' },
    { id: 6,  name: 'Zumba',              trainer: 'Laura Molina',   day: 'Miércoles', time: '17:00',  duration: 60,  capacity: 30, enrolled: 28, level: 'Todos',      color: '#ec4899' },
    { id: 7,  name: 'Yoga Relajante',      trainer: 'Sofía Reyes',    day: 'Jueves',    time: '20:00',  duration: 60,  capacity: 20, enrolled: 10, level: 'Todos',      color: '#a855f7' },
    { id: 8,  name: 'HIIT',               trainer: 'Marco Delgado',  day: 'Jueves',    time: '07:30',  duration: 45,  capacity: 20, enrolled: 19, level: 'Avanzado',   color: '#ef4444' },
    { id: 9,  name: 'Body Pump',          trainer: 'Ana Vidal',      day: 'Viernes',   time: '09:00',  duration: 55,  capacity: 22, enrolled: 16, level: 'Todos',      color: '#f97316' },
    { id: 10, name: 'Stretching',         trainer: 'Sofía Reyes',    day: 'Viernes',   time: '18:30',  duration: 40,  capacity: 25, enrolled: 8,  level: 'Todos',      color: '#22c55e' },
    { id: 11, name: 'Functional Training',trainer: 'Marco Delgado',  day: 'Sábado',    time: '10:00',  duration: 60,  capacity: 18, enrolled: 17, level: 'Intermedio', color: '#3b82f6' },
    { id: 12, name: 'Aqua Aeróbics',      trainer: 'Ana Vidal',      day: 'Sábado',    time: '11:00',  duration: 45,  capacity: 20, enrolled: 11, level: 'Todos',      color: '#06b6d4' },
  ],

  payments: [
    { id: 1,  memberId: 1,  member: 'Ana García',      plan: 'Premium',  amount: 59.99, date: '2025-04-01', dueDate: '2025-05-01', status: 'Pagado'   },
    { id: 2,  memberId: 2,  member: 'Carlos Martínez', plan: 'Estándar', amount: 39.99, date: '2025-04-01', dueDate: '2025-05-01', status: 'Pagado'   },
    { id: 3,  memberId: 3,  member: 'Lucía Fernández', plan: 'Básico',   amount: 24.99, date: '2025-04-02', dueDate: '2025-05-02', status: 'Pagado'   },
    { id: 4,  memberId: 4,  member: 'Miguel Torres',   plan: 'Premium',  amount: 59.99, date: '2025-04-01', dueDate: '2025-05-01', status: 'Pagado'   },
    { id: 5,  memberId: 5,  member: 'Sara López',      plan: 'Estándar', amount: 39.99, date: '',           dueDate: '2025-04-15', status: 'Pendiente'},
    { id: 6,  memberId: 6,  member: 'Pablo Sánchez',   plan: 'Básico',   amount: 24.99, date: '',           dueDate: '2025-03-01', status: 'Vencido'  },
    { id: 7,  memberId: 7,  member: 'Elena Díaz',      plan: 'Premium',  amount: 59.99, date: '2025-04-05', dueDate: '2025-05-05', status: 'Pagado'   },
    { id: 8,  memberId: 8,  member: 'Roberto Jiménez', plan: 'Estándar', amount: 39.99, date: '2025-04-06', dueDate: '2025-05-06', status: 'Pagado'   },
    { id: 9,  memberId: 9,  member: 'Isabel Moreno',   plan: 'Básico',   amount: 24.99, date: '',           dueDate: '2025-04-20', status: 'Pendiente'},
    { id: 10, memberId: 10, member: 'David Ruiz',      plan: 'Premium',  amount: 59.99, date: '2025-04-08', dueDate: '2025-05-08', status: 'Pagado'   },
    { id: 11, memberId: 11, member: 'María Navarro',   plan: 'Estándar', amount: 39.99, date: '',           dueDate: '2025-03-10', status: 'Vencido'  },
    { id: 12, memberId: 12, member: 'Javier Castro',   plan: 'Básico',   amount: 24.99, date: '2025-04-03', dueDate: '2025-05-03', status: 'Pagado'   },
    { id: 13, memberId: 13, member: 'Carmen Ortega',   plan: 'Premium',  amount: 59.99, date: '2025-04-09', dueDate: '2025-05-09', status: 'Pagado'   },
    { id: 14, memberId: 14, member: 'Fernando Gómez',  plan: 'Estándar', amount: 39.99, date: '',           dueDate: '2025-04-18', status: 'Pendiente'},
    { id: 15, memberId: 15, member: 'Patricia Vega',   plan: 'Básico',   amount: 24.99, date: '2025-04-10', dueDate: '2025-05-10', status: 'Pagado'   },
  ],

  staff: [
    { id: 1, name: 'Sofía Reyes',    role: 'Entrenador',  email: 'sofia.r@gympro.com',   phone: '+34 611 001 001', speciality: 'Yoga & Pilates',      since: '2022-03-01', color: '#a855f7' },
    { id: 2, name: 'Marco Delgado',  role: 'Entrenador',  email: 'marco.d@gympro.com',   phone: '+34 622 002 002', speciality: 'CrossFit & HIIT',      since: '2021-06-15', color: '#ef4444' },
    { id: 3, name: 'Laura Molina',   role: 'Entrenador',  email: 'laura.m@gympro.com',   phone: '+34 633 003 003', speciality: 'Spinning & Zumba',     since: '2023-01-10', color: '#f97316' },
    { id: 4, name: 'Ana Vidal',      role: 'Entrenador',  email: 'ana.v@gympro.com',     phone: '+34 644 004 004', speciality: 'Body Pump & Aqua',     since: '2022-09-01', color: '#22c55e' },
    { id: 5, name: 'Diego Herrera',  role: 'Recepción',   email: 'diego.h@gympro.com',   phone: '+34 655 005 005', speciality: 'Atención al cliente',  since: '2023-04-01', color: '#3b82f6' },
    { id: 6, name: 'Paula Ramos',    role: 'Recepción',   email: 'paula.r@gympro.com',   phone: '+34 666 006 006', speciality: 'Administración',       since: '2024-01-15', color: '#06b6d4' },
    { id: 7, name: 'Luis Morales',   role: 'Limpieza',    email: 'luis.m@gympro.com',    phone: '+34 677 007 007', speciality: 'Mantenimiento',        since: '2022-02-01', color: '#64748b' },
    { id: 8, name: 'Carmen Ibáñez',  role: 'Gerente',     email: 'carmen.i@gympro.com',  phone: '+34 688 008 008', speciality: 'Gestión General',      since: '2020-01-01', color: '#f59e0b' },
  ],

  monthlyRevenue: [
    { month: 'Ene', amount: 4200 },
    { month: 'Feb', amount: 4800 },
    { month: 'Mar', amount: 5100 },
    { month: 'Abr', amount: 5600 },
    { month: 'May', amount: 5200 },
    { month: 'Jun', amount: 4900 },
    { month: 'Jul', amount: 5400 },
    { month: 'Ago', amount: 5800 },
    { month: 'Sep', amount: 6100 },
    { month: 'Oct', amount: 6300 },
    { month: 'Nov', amount: 5900 },
    { month: 'Dic', amount: 6500 },
  ]
};
