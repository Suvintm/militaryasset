export type Role = 'ADMIN' | 'BASE_COMMANDER' | 'LOGISTICS_OFFICER';

export type TransferStatus = 'PENDING' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export type AssignmentStatus = 'ACTIVE' | 'RETURNED';

export type EquipmentCategory = 'WEAPON' | 'VEHICLE' | 'AMMUNITION' | 'SUPPLY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  baseId?: string | null;
  base?: Base | null;
  isActive: boolean;
  createdAt: string;
}

export interface Base {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

export interface EquipmentType {
  id: string;
  name: string;
  category: EquipmentCategory | string;
  unit: string;
}

export interface StockBalance {
  id: string;
  baseId: string;
  base?: Base;
  equipmentTypeId: string;
  equipmentType?: EquipmentType;
  quantity: number;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  baseId: string;
  base?: Base;
  equipmentTypeId: string;
  equipmentType?: EquipmentType;
  quantity: number;
  unitPrice: number | string;
  supplier: string;
  purchaseDate: string;
  notes?: string | null;
  recordedById: string;
  recordedBy?: User;
  createdAt: string;
}

export interface TransferEvent {
  id: string;
  transferId: string;
  status: TransferStatus;
  note?: string | null;
  actorId?: string | null;
  createdAt: string;
}

export interface Transfer {
  id: string;
  fromBaseId: string;
  fromBase?: Base;
  toBaseId: string;
  toBase?: Base;
  equipmentTypeId: string;
  equipmentType?: EquipmentType;
  quantity: number;
  status: TransferStatus;
  notes?: string | null;
  initiatedById: string;
  initiatedBy?: User;
  approvedById?: string | null;
  approvedBy?: User | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  events?: TransferEvent[];
}

export interface Assignment {
  id: string;
  baseId: string;
  base?: Base;
  equipmentTypeId: string;
  equipmentType?: EquipmentType;
  personnelName: string;
  personnelId: string;
  quantity: number;
  status: AssignmentStatus;
  assignedById: string;
  assignedBy?: User;
  assignedAt: string;
  returnedAt?: string | null;
  notes?: string | null;
}

export interface Expenditure {
  id: string;
  baseId: string;
  base?: Base;
  equipmentTypeId: string;
  equipmentType?: EquipmentType;
  quantity: number;
  reason: string;
  expendedById: string;
  expendedBy?: User;
  expendedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: User | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entityType: string;
  entityId?: string | null;
  method?: string | null;
  path?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  payloadBefore?: any;
  payloadAfter?: any;
  createdAt: string;
}

export interface DashboardSummary {
  openingBalance: number;
  closingBalance: number;
  netMovement: number;
  purchases: number;
  transfersIn: number;
  transfersOut: number;
  assigned: number;
  expended: number;
}
