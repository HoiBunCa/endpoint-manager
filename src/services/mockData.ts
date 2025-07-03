import { Device, User, Department, BlockingPolicy, DashboardStats, ChatMessage } from '../types';

// Mock data for development
export const mockDevices: Device[] = [
  {
    id: '1',
    hostname: 'DESKTOP-ABC123',
    platform: 'Windows',
    systemUuid: 'abc123-def456-ghi789',
    macAddress: '00:11:22:33:44:55',
    ipAddress: '192.168.1.100',
    isOnline: true,
    lastSeen: new Date(Date.now() - 30000).toISOString(),
    registeredAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    assignedUser: {
      id: '2',
      username: 'jdoe',
      email: 'john.doe@company.com',
      fullName: 'John Doe',
      department: 'IT',
      role: 'user',
      createdAt: new Date().toISOString()
    },
    department: 'IT',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'New York, NY'
    },
    operatingSystem: {
      name: 'Windows 11 Pro',
      version: '22H2',
      buildNumber: '22621.2428',
      lastBootTime: new Date(Date.now() - 3600000).toISOString(),
      installDate: new Date(Date.now() - 86400000 * 30).toISOString()
    },
    network: [
      {
        name: 'Ethernet',
        macAddress: '00:11:22:33:44:55',
        ipAddress: '192.168.1.100',
        dnsServers: ['8.8.8.8', '8.8.4.4'],
        status: 'connected'
      }
    ],
    hardware: {
      manufacturer: 'Dell',
      model: 'OptiPlex 7090',
      cpu: 'Intel Core i7-11700',
      ram: '16 GB',
      storage: '512 GB SSD',
      serialNumber: 'DL123456'
    },
    software: [
      {
        name: 'Microsoft Office 365',
        version: '16.0.14931.20648',
        publisher: 'Microsoft Corporation',
        installDate: new Date(Date.now() - 86400000 * 15).toISOString(),
        size: '3.2 GB',
        isBlocked: false
      },
      {
        name: 'Chrome',
        version: '118.0.5993.70',
        publisher: 'Google LLC',
        installDate: new Date(Date.now() - 86400000 * 20).toISOString(),
        size: '152 MB',
        isBlocked: false
      }
    ],
    blockedWebsites: ['facebook.com', 'twitter.com'],
    locationHistory: [
      {
        latitude: 40.7128,
        longitude: -74.0060,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        address: 'New York, NY'
      }
    ]
  },
  {
    id: '2',
    hostname: 'LAPTOP-XYZ789',
    platform: 'Windows',
    systemUuid: 'xyz789-abc123-def456',
    macAddress: '00:22:33:44:55:66',
    ipAddress: '192.168.1.101',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    registeredAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    department: 'Sales',
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: 'Manhattan, NY'
    },
    operatingSystem: {
      name: 'Windows 10 Pro',
      version: '22H2',
      buildNumber: '19045.3570',
      lastBootTime: new Date(Date.now() - 7200000).toISOString(),
      installDate: new Date(Date.now() - 86400000 * 60).toISOString()
    },
    hardware: {
      manufacturer: 'HP',
      model: 'EliteBook 840 G8',
      cpu: 'Intel Core i5-1135G7',
      ram: '8 GB',
      storage: '256 GB SSD',
      serialNumber: 'HP987654'
    }
  },
  {
    id: '3',
    hostname: 'WORKSTATION-001',
    platform: 'Windows',
    systemUuid: 'work001-uuid-123',
    macAddress: '00:33:44:55:66:77',
    ipAddress: '192.168.1.102',
    isOnline: true,
    lastSeen: new Date(Date.now() - 60000).toISOString(),
    registeredAt: new Date(Date.now() - 86400000 * 21).toISOString(),
    department: 'Design',
    location: {
      latitude: 40.7614,
      longitude: -73.9776,
      address: 'Times Square, NY'
    },
    operatingSystem: {
      name: 'Windows 11 Pro',
      version: '23H2',
      buildNumber: '22631.2428',
      lastBootTime: new Date(Date.now() - 1800000).toISOString(),
      installDate: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    hardware: {
      manufacturer: 'ASUS',
      model: 'ProArt Station PA90',
      cpu: 'Intel Core i9-12900K',
      ram: '32 GB',
      storage: '1 TB NVMe SSD',
      serialNumber: 'AS456789'
    }
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    fullName: 'System Administrator',
    department: 'IT',
    role: 'admin',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    id: '2',
    username: 'jdoe',
    email: 'john.doe@company.com',
    fullName: 'John Doe',
    department: 'IT',
    role: 'user',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    lastLogin: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    username: 'jsmith',
    email: 'jane.smith@company.com',
    fullName: 'Jane Smith',
    department: 'Sales',
    role: 'manager',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    lastLogin: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '4',
    username: 'rjohnson',
    email: 'robert.johnson@company.com',
    fullName: 'Robert Johnson',
    department: 'Design',
    role: 'user',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Information Technology',
    code: 'IT',
    description: 'Responsible for managing company technology infrastructure',
    userCount: 15,
    deviceCount: 25
  },
  {
    id: '2',
    name: 'Sales',
    code: 'SALES',
    description: 'Sales and business development team',
    userCount: 8,
    deviceCount: 12
  },
  {
    id: '3',
    name: 'Design',
    code: 'DESIGN',
    description: 'Creative design and marketing team',
    userCount: 6,
    deviceCount: 8
  },
  {
    id: '4',
    name: 'Human Resources',
    code: 'HR',
    description: 'Human resources and administrative functions',
    userCount: 4,
    deviceCount: 6
  }
];

export const mockBlockingPolicies: BlockingPolicy[] = [
  {
    id: '1',
    name: 'Social Media Block',
    type: 'website',
    description: 'Blocks access to social media websites during work hours',
    isActive: true,
    websites: ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com'],
    assignedDevices: ['1', '2'],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: '2',
    name: 'Gaming Applications',
    type: 'application',
    description: 'Prevents installation and running of gaming applications',
    isActive: true,
    applications: ['steam.exe', 'epicgameslauncher.exe', 'battle.net.exe'],
    assignedDevices: ['1', '3'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    name: 'Streaming Services',
    type: 'website',
    description: 'Blocks access to video streaming services',
    isActive: false,
    websites: ['netflix.com', 'youtube.com', 'twitch.tv'],
    assignedDevices: [],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockDashboardStats: DashboardStats = {
  totalDevices: 3,
  onlineDevices: 2,
  activePolicies: 2,
  pendingUpdates: 1
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    deviceId: '1',
    message: 'Hello, this is a test message from the device.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    sender: 'device',
    isRead: true
  },
  {
    id: '2',
    deviceId: '1',
    message: 'Thank you for the response. Everything is working fine.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    sender: 'user',
    isRead: true
  },
  {
    id: '3',
    deviceId: '2',
    message: 'System update completed successfully.',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    sender: 'device',
    isRead: false
  }
];