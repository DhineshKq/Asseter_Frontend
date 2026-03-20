export type AssetStatus = "Working" | "In Repair" | "Deferred" | "Retired";

export interface AssetRecord {
  deviceId: string;
  serialNumber: string;
  assetName: string;
  type: string;
  status: AssetStatus;
  location: string;
  owner: string;
}

export interface LocationRecord {
  code: string;
  name: string;
  team: string;
  floor: string;
  assetsCount: number;
}

export interface MappingRecord {
  assetName: string;
  deviceId: string;
  assignedTo: string;
  department: string;
  location: string;
  assignedOn: string;
}

export interface UserRecord {
  employeeId: string;
  name: string;
  email: string;
  role: string;
  team: string;
  status: string;
}

export const assets: AssetRecord[] = [
  {
    deviceId: "LAP-1001",
    serialNumber: "SN-DL-39A1",
    assetName: "Dell Latitude 5440",
    type: "Laptop",
    status: "Working",
    location: "Infra Team",
    owner: "Arun Kumar",
  },
  {
    deviceId: "MON-2015",
    serialNumber: "SN-LG-77B5",
    assetName: "LG 27 inch Monitor",
    type: "Monitor",
    status: "Working",
    location: "Service Desk",
    owner: "Priya N",
  },
  {
    deviceId: "RTR-3010",
    serialNumber: "SN-CS-51D2",
    assetName: "Cisco Branch Router",
    type: "Network Device",
    status: "Deferred",
    location: "Network Team",
    owner: "Sandeep",
  },
  {
    deviceId: "PRN-4022",
    serialNumber: "SN-HP-10K8",
    assetName: "HP LaserJet Pro",
    type: "Printer",
    status: "In Repair",
    location: "Admin Support",
    owner: "Facilities Pool",
  },
  {
    deviceId: "LAP-1019",
    serialNumber: "SN-LN-88P4",
    assetName: "Lenovo ThinkPad E14",
    type: "Laptop",
    status: "Working",
    location: "QA Team",
    owner: "Meena R",
  },
  {
    deviceId: "SRV-5003",
    serialNumber: "SN-DC-93J0",
    assetName: "Dell PowerEdge R450",
    type: "Server",
    status: "Working",
    location: "Datacenter",
    owner: "Platform Team",
  },
];

export const locations: LocationRecord[] = [
  { code: "LOC-01", name: "Infra Team", team: "Infrastructure", floor: "3rd Floor", assetsCount: 18 },
  { code: "LOC-02", name: "Service Desk", team: "Support", floor: "Ground Floor", assetsCount: 11 },
  { code: "LOC-03", name: "QA Team", team: "Quality", floor: "2nd Floor", assetsCount: 9 },
  { code: "LOC-04", name: "Network Team", team: "Network", floor: "Server Room", assetsCount: 7 },
  { code: "LOC-05", name: "Datacenter", team: "Platform", floor: "Basement", assetsCount: 14 },
];

export const mappings: MappingRecord[] = [
  {
    assetName: "Dell Latitude 5440",
    deviceId: "LAP-1001",
    assignedTo: "Arun Kumar",
    department: "Infrastructure",
    location: "Infra Team",
    assignedOn: "2026-02-12",
  },
  {
    assetName: "LG 27 inch Monitor",
    deviceId: "MON-2015",
    assignedTo: "Priya N",
    department: "Support",
    location: "Service Desk",
    assignedOn: "2026-01-06",
  },
  {
    assetName: "Lenovo ThinkPad E14",
    deviceId: "LAP-1019",
    assignedTo: "Meena R",
    department: "Quality",
    location: "QA Team",
    assignedOn: "2026-03-01",
  },
  {
    assetName: "Dell PowerEdge R450",
    deviceId: "SRV-5003",
    assignedTo: "Platform Team",
    department: "Engineering",
    location: "Datacenter",
    assignedOn: "2025-12-18",
  },
];

export const users: UserRecord[] = [
  {
    employeeId: "EMP-001",
    name: "Arun Kumar",
    email: "arun.kumar@asseter.local",
    role: "IT Admin",
    team: "Infrastructure",
    status: "Active",
  },
  {
    employeeId: "EMP-014",
    name: "Priya N",
    email: "priya.n@asseter.local",
    role: "Support Engineer",
    team: "Support",
    status: "Active",
  },
  {
    employeeId: "EMP-027",
    name: "Sandeep",
    email: "sandeep@asseter.local",
    role: "Network Engineer",
    team: "Network",
    status: "Active",
  },
  {
    employeeId: "EMP-031",
    name: "Meena R",
    email: "meena.r@asseter.local",
    role: "QA Lead",
    team: "Quality",
    status: "On Leave",
  },
  {
    employeeId: "EMP-045",
    name: "Rohit Jain",
    email: "rohit.jain@asseter.local",
    role: "IT Admin",
    team: "Platform",
    status: "Active",
  },
];

export const dashboardMetrics = [
  { label: "Total Assets", value: 59, helper: "Across all IT teams" },
  { label: "Working Assets", value: 46, helper: "Ready for use" },
  { label: "Deferred Assets", value: 7, helper: "Pending review" },
  { label: "Active Users", value: 24, helper: "Mapped and unmanaged users" },
];

export const statusBreakdown = [
  { label: "Working", value: 46 },
  { label: "In Repair", value: 4 },
  { label: "Deferred", value: 7 },
  { label: "Retired", value: 2 },
];

export const typeBreakdown = [
  { label: "Laptop", value: 21 },
  { label: "Monitor", value: 12 },
  { label: "Network Device", value: 8 },
  { label: "Printer", value: 6 },
  { label: "Server", value: 12 },
];
