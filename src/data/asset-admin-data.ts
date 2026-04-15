export type AssetStatus = "Working" | "In Repair" | "Deferred" | "Retired";

export interface AssetRecord {
  id: number | null;
  assetCode: string;
  locationId: number | null;
  deviceId: string;
  serialNumber: string;
  assetName: string;
  assetModel: string;
  invoiceNo: string;
  invoiceDate: string;
  vendor: string;
  quantity: string;
  assignedItems: number;
  receiveBy: string;
  amount: string;
  receivedDate: string;
  type: string;
  status: AssetStatus;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationRecord {
  code: string;
  name: string;
}

export interface MappingRecord {
  id: number | null;
  assetName: string;
  assetCode: string;
  deviceId: string;
  serialNumber: string;
  employeeId: string;
  assignedTo: string;
  role: string;
  department: string;
  location: string;
  assignedQuantity: number;
  isActive: boolean;
  assignedOn: string;
}

export interface UserRecord {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  team: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const assets: AssetRecord[] = [];

export const locations: LocationRecord[] = [];

export const mappings: MappingRecord[] = [];

export const users: UserRecord[] = [];

export const teamOptions = Array.from(new Set(users.map((item) => item.team)));
export const locationOptions = locations.map((item) => item.name);

export const dashboardMetrics = [];

export const statusBreakdown = [];

export const typeBreakdown = [];
