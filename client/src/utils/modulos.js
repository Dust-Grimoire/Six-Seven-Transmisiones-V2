import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  InboxOutlined,
  BankOutlined,
  NotificationOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';

export const MODULOS = [
  { ruta: '/tablero', etiqueta: 'Tablero', Icono: DashboardOutlined, roles: ['DUENO', 'CONTADOR', 'JEFE_TECNICO'] },
  { ruta: '/agenda', etiqueta: 'Agenda', Icono: CalendarOutlined, roles: ['DUENO', 'CONTADOR'] },
  { ruta: '/personal', etiqueta: 'Personal', Icono: TeamOutlined, roles: ['DUENO'] },
  { ruta: '/inventario', etiqueta: 'Inventario', Icono: InboxOutlined, roles: ['JEFE_TECNICO'] },
  { ruta: '/financiero', etiqueta: 'Financiero', Icono: BankOutlined, roles: ['CONTADOR'] },
  { ruta: '/auspicios', etiqueta: 'Auspicios', Icono: NotificationOutlined, roles: ['DUENO'] },
  { ruta: '/usuarios', etiqueta: 'Usuarios', Icono: UserSwitchOutlined, roles: ['DUENO'] },
];

export const modulosDelRol = (rol) => MODULOS.filter((modulo) => modulo.roles.includes(rol));