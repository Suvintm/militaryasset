export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  BASES: '/bases',
  EQUIPMENT_TYPES: '/equipment-types',
  USERS: '/users',
  PURCHASES: '/purchases',
  TRANSFERS: {
    BASE: '/transfers',
    APPROVE: (id: string) => `/transfers/${id}/approve`,
    COMPLETE: (id: string) => `/transfers/${id}/complete`,
    CANCEL: (id: string) => `/transfers/${id}/cancel`,
  },
  ASSIGNMENTS: {
    BASE: '/assignments',
    RETURN: (id: string) => `/assignments/${id}/return`,
  },
  EXPENDITURES: '/expenditures',
  DASHBOARD: {
    SUMMARY: '/dashboard/summary',
    NET_MOVEMENT_DETAIL: '/dashboard/net-movement/detail',
  },
  AUDIT_LOGS: '/audit-logs',
};
