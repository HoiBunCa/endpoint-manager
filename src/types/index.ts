export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  department: string;
  role: 'admin' | 'user' | 'manager';
  createdAt: string;
  lastLogin?: string;
  assignedDevices?: Device[];
  token?: string; // Added for API authentication
}

export interface Device {
  id: string;
  hostname: string;
  platform: string;
  systemUuid: string;
  macAddress: string;
  ipAddress: string;
  isOnline: boolean;
  lastSeen: string;
  registeredAt: string;
  assignedUser?: User;
  department?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  operatingSystem?: {
    name: string;
    version: string;
    buildNumber: string;
    lastBootTime: string;
    installDate: string;
  };
  network?: NetworkAdapter[];
  hardware?: HardwareInfo;
  software?: SoftwareInfo[];
  blockedWebsites?: string[];
  locationHistory?: LocationHistory[];
}

export interface NetworkAdapter {
  name: string;
  macAddress: string;
  ipAddress: string;
  dnsServers: string[];
  status: 'connected' | 'disconnected';
}

export interface HardwareInfo {
  manufacturer: string;
  model: string;
  cpu: string;
  ram: string;
  storage: string;
  serialNumber: string;
}

export interface SoftwareInfo {
  name: string;
  version: string;
  publisher: string;
  installDate: string;
  size: string;
  isBlocked?: boolean;
}

export interface LocationHistory {
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  userCount: number;
  deviceCount: number;
}

export interface BlockingPolicy {
  id: string;
  name: string;
  type: 'website' | 'application';
  description: string;
  isActive: boolean;
  websites?: string[];
  applications?: string[];
  assignedDevices?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  deviceId: string;
  message: string;
  timestamp: string;
  sender: 'user' | 'device';
  isRead: boolean;
}

export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  activePolicies: number;
  pendingUpdates: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface RemoteControlSession {
  deviceId: string;
  isActive: boolean;
  startTime: string;
  screenData?: string;
}