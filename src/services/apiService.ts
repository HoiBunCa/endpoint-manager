import { Device, User, Department, BlockingPolicy, DashboardStats, ChatMessage } from '../types';
import { mockDevices, mockUsers, mockDepartments, mockBlockingPolicies, mockDashboardStats, mockChatMessages } from './mockData';

// Base URL for the API (if you start making real calls beyond login)
const API_BASE_URL = 'https://endpoint-manager-api.tcgroup.vn/api'; 

// Simulated API service with localStorage persistence
class ApiService {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper to get authentication headers
  private _getAuthHeaders(): HeadersInit {
    const userString = localStorage.getItem('endpoint-manager-user');
    if (userString) {
      try {
        const user: User = JSON.parse(userString);
        if (user.token) {
          return {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json', // Default for JSON bodies
          };
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    return {
      'Content-Type': 'application/json', // Default if no token
    };
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    await this.delay(300);
    // Example of how a real fetch call would look with auth headers:
    // const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    //   headers: this._getAuthHeaders(),
    // });
    // if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    // return response.json();
    return mockDashboardStats;
  }

  // Devices
  async getDevices(): Promise<Device[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/`, {
        headers: this._getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch devices:', errorData);
        throw new Error('Failed to fetch devices');
      }

      const responseData = await response.json(); // Get the full response object
      const devicesData = responseData.results; // Access the 'results' array

      return devicesData.map((item: any) => ({
        id: item.device_id,
        hostname: item.hostname,
        platform: item.os_info_caption || 'Unknown',
        systemUuid: item.system_uuid || 'N/A',
        macAddress: item.mac_address || 'N/A', // This API response doesn't provide it, keep N/A
        ipAddress: item.ip_address || 'N/A', // This API response doesn't provide it, keep N/A
        isOnline: item.is_online,
        lastSeen: item.last_seen,
        registeredAt: item.registered_at || new Date().toISOString(),
        assignedUser: item.assign_user ? {
          id: item.assign_user_id || `user-${item.assign_user}`, // Assuming assign_user_id might be present in full device detail
          username: item.assign_user,
          email: `${item.assign_user}@example.com`, // Mock email
          fullName: item.assign_user,
          department: item.department_code || 'N/A', // Assuming department_code might be present
          role: 'user', // Default role
          createdAt: new Date().toISOString()
        } : undefined,
        department: item.department_code || 'N/A', // Assuming department_code might be present
        location: (item.location_latitude && item.location_longitude) ? { // Assuming these might be present
          latitude: item.location_latitude,
          longitude: item.location_longitude,
          address: item.location_address || undefined
        } : undefined,
        // These detailed fields are typically fetched in the single device detail API
        operatingSystem: undefined,
        network: undefined,
        hardware: undefined,
        software: undefined,
        blockedWebsites: undefined,
        locationHistory: undefined
      }));
    } catch (error) {
      console.error('Error in getDevices:', error);
      throw error;
    }
  }

  async getDevice(id: string): Promise<Device | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/devices/${id}/`, {
        headers: this._getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Device not found
        }
        const errorData = await response.json();
        console.error(`Failed to fetch device ${id}:`, errorData);
        throw new Error(`Failed to fetch device ${id}`);
      }

      const item = await response.json();
      return {
        id: item.device_id,
        hostname: item.hostname,
        platform: item.os_info?.caption || 'Unknown',
        systemUuid: item.system_uuid || 'N/A',
        macAddress: item.mac_address || 'N/A',
        ipAddress: item.ip_address || 'N/A',
        isOnline: item.is_online,
        lastSeen: item.last_seen,
        registeredAt: item.registered_at || new Date().toISOString(),
        assignedUser: item.assign_user ? {
          id: item.assign_user_id || `user-${item.assign_user}`,
          username: item.assign_user,
          email: `${item.assign_user}@example.com`, // Mock email
          fullName: item.assign_user,
          department: item.department_code || 'N/A',
          role: 'user', // Default role
          createdAt: new Date().toISOString()
        } : undefined,
        department: item.department_code || 'N/A',
        location: (item.location_info?.latitude && item.location_info?.longitude) ? {
          latitude: item.location_info.latitude,
          longitude: item.location_info.longitude,
          address: item.location_info.address || undefined
        } : undefined,
        operatingSystem: item.os_info ? {
          name: item.os_info.caption || 'N/A',
          version: item.os_info.version || 'N/A',
          buildNumber: item.os_info.build_number || 'N/A',
          lastBootTime: item.os_info.last_boot_time || 'N/A',
          installDate: item.os_info.install_date || 'N/A'
        } : undefined,
        network: item.network_adapters?.map((adapter: any) => ({
          name: adapter.name,
          macAddress: adapter.mac_address,
          ipAddress: adapter.ip_address,
          dnsServers: adapter.dns_servers || [],
          status: adapter.status || 'unknown'
        })) || [],
        hardware: item.hardware_info ? {
          manufacturer: item.hardware_info.manufacturer || 'N/A',
          model: item.hardware_info.model || 'N/A',
          cpu: item.hardware_info.cpu || 'N/A',
          ram: item.hardware_info.ram || 'N/A',
          storage: item.hardware_info.storage || 'N/A',
          serialNumber: item.hardware_info.serial_number || 'N/A'
        } : undefined,
        software: item.installed_software?.map((sw: any) => ({
          name: sw.name,
          version: sw.version,
          publisher: sw.publisher,
          installDate: sw.install_date,
          size: sw.size,
          isBlocked: sw.is_blocked || false
        })) || [],
        blockedWebsites: item.blocked_websites || [],
        locationHistory: item.location_history?.map((loc: any) => ({
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: loc.timestamp,
          address: loc.address || undefined
        })) || []
      };
    } catch (error) {
      console.error(`Error in getDevice ${id}:`, error);
      throw error;
    }
  }

  async updateDevice(device: Device): Promise<Device> {
    await this.delay(300); // Keep mock delay for update for now
    // Example:
    // const response = await fetch(`${API_BASE_URL}/devices/${device.id}`, {
    //   method: 'PUT',
    //   headers: this._getAuthHeaders(),
    //   body: JSON.stringify(device)
    // });
    // if (!response.ok) throw new Error('Failed to update device');
    // return response.json();
    const devices = await this.getDevices(); // This will now fetch from API
    const index = devices.findIndex(d => d.id === device.id);
    if (index !== -1) {
      devices[index] = device;
      // Note: We are not persisting to localStorage here anymore for devices
      // as getDevices now fetches from API.
      // If you need local state for updates before a full refresh,
      // you'd manage it within the component or a global state.
    }
    return device;
  }

  async getRecentOnlineDevices(): Promise<Device[]> {
    await this.delay(500); // Simulate network delay
    try {
      const response = await fetch(`${API_BASE_URL}/devices/recent-online/`, {
        headers: this._getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch recent online devices:', errorData);
        throw new Error('Failed to fetch recent online devices');
      }

      const data = await response.json();
      // Map API response to existing Device type
      return data.map((item: any) => ({
        id: item.device_id,
        hostname: item.hostname,
        platform: item.os_info_caption || 'Unknown', // Using os_info_caption for platform
        systemUuid: item.system_uuid,
        macAddress: 'N/A', // Not provided by this API
        ipAddress: 'N/A', // Not provided by this API
        isOnline: item.is_online,
        lastSeen: item.last_seen,
        registeredAt: new Date().toISOString(), // Default or fetch separately if needed
        assignedUser: item.assign_user ? {
          id: 'temp-user-id', // API doesn't provide user ID, generate a temp one
          username: item.assign_user,
          email: `${item.assign_user}@example.com`,
          fullName: item.assign_user,
          department: 'N/A',
          role: 'user',
          createdAt: new Date().toISOString()
        } : undefined,
        department: 'N/A', // Not provided by this API
        location: undefined, // Not provided by this API
        operatingSystem: {
          name: item.os_info_caption || 'N/A',
          version: 'N/A',
          buildNumber: 'N/A',
          lastBootTime: 'N/A',
          installDate: 'N/A'
        },
        network: [], // Not provided by this API
        hardware: undefined, // Not provided by this API
        software: [], // Not provided by this API
        blockedWebsites: [], // Not provided by this API
        locationHistory: [] // Not provided by this API
      }));
    } catch (error) {
      console.error('Error in getRecentOnlineDevices:', error);
      throw error;
    }
  }

  // Users
  async getUsers(): Promise<User[]> {
    await this.delay(500);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/users`, { headers: this._getAuthHeaders() });
    // if (!response.ok) throw new Error('Failed to fetch users');
    // return response.json();
    const stored = localStorage.getItem('endpoint-manager-users');
    return stored ? JSON.parse(stored) : mockUsers;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    await this.delay(300);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/users`, {
    //   method: 'POST',
    //   headers: this._getAuthHeaders(),
    //   body: JSON.stringify(user)
    // });
    // if (!response.ok) throw new Error('Failed to create user');
    // return response.json();
    const users = await this.getUsers();
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('endpoint-manager-users', JSON.stringify(users));
    return newUser;
  }

  async updateUser(user: User): Promise<User> {
    await this.delay(300);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
    //   method: 'PUT',
    //   headers: this._getAuthHeaders(),
    //   body: JSON.stringify(user)
    // });
    // if (!response.ok) throw new Error('Failed to update user');
    // return response.json();
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem('endpoint-manager-users', JSON.stringify(users));
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.delay(300);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    //   method: 'DELETE',
    //   headers: this._getAuthHeaders()
    // });
    // if (!response.ok) throw new Error('Failed to delete user');
    const users = await this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem('endpoint-manager-users', JSON.stringify(filtered));
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    await this.delay(500);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/departments`, { headers: this._getAuthHeaders() });
    // if (!response.ok) throw new Error('Failed to fetch departments');
    // return response.json();
    const stored = localStorage.getItem('endpoint-manager-departments');
    return stored ? JSON.parse(stored) : mockDepartments;
  }

  async createDepartment(department: Omit<Department, 'id' | 'userCount' | 'deviceCount'>): Promise<Department> {
    await this.delay(300);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/departments`, {
    //   method: 'POST',
    //   headers: this._getAuthHeaders(),
    //   body: JSON.stringify(department)
    // });
    // if (!response.ok) throw new Error('Failed to create department');
    // return response.json();
    const departments = await this.getDepartments();
    const newDepartment: Department = {
      ...department,
      id: Date.now().toString(),
      userCount: 0,
      deviceCount: 0
    };
    departments.push(newDepartment);
    localStorage.setItem('endpoint-manager-departments', JSON.stringify(departments));
    return newDepartment;
  }

  async updateDepartment(department: Department): Promise<Department> {
    await this.delay(300);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/departments/${department.id}`, {
    //   method: 'PUT',
    //   headers: this._getAuthHeaders(),
    //   body: JSON.stringify(department)
    // });
    // if (!response.ok) throw new Error('Failed to update department');
    // return response.json();
    const departments = await this.getDepartments();
    const index = departments.findIndex(d => d.id === department.id);
    if (index !== -1) {
      departments[index] = department;
      localStorage.setItem('endpoint-manager-departments', JSON.stringify(departments));
    }
    return department;
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.delay(300);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
    //   method: 'DELETE',
    //   headers: this._getAuthHeaders()
    // });
    // if (!response.ok) throw new Error('Failed to delete department');
    const departments = await this.getDepartments();
    const filtered = departments.filter(d => d.id !== id);
    localStorage.setItem('endpoint-manager-departments', JSON.stringify(filtered));
  }

  // Blocking Policies
  async getBlockingPolicies(): Promise<BlockingPolicy[]> {
    await this.delay(500);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/blocking-policies`, { headers: this._getAuthHeaders() });
    // if (!response.ok) throw new Error('Failed to fetch blocking policies');
    // return response.json();
    const stored = localStorage.getItem('endpoint-manager-policies');
    return stored ? JSON.parse(stored) : mockBlockingPolicies;
  }

  async createBlockingPolicy(policy: Omit<BlockingPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlockingPolicy> {
    await this.delay(300);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/blocking-policies`, {
    //   method: 'POST',
    //   headers: this._getAuthHeaders(),
    //   body: JSON.stringify(policy)
    // });
    // if (!response.ok) throw new Error('Failed to create blocking policy');
    // return response.json();
    const policies = await this.getBlockingPolicies();
    const newPolicy: BlockingPolicy = {
      ...policy,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    policies.push(newPolicy);
    localStorage.setItem('endpoint-manager-policies', JSON.stringify(policies));
    return newPolicy;
  }

  async updateBlockingPolicy(policy: BlockingPolicy): Promise<BlockingPolicy> {
    await this.delay(300);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/blocking-policies/${policy.id}`, {
    //   method: 'PUT',
    //   headers: this._getAuthHeaders(),
    //   body: JSON.stringify(policy)
    // });
    // if (!response.ok) throw new Error('Failed to update blocking policy');
    // return response.json();
    const policies = await this.getBlockingPolicies();
    const index = policies.findIndex(p => p.id === policy.id);
    if (index !== -1) {
      policies[index] = { ...policy, updatedAt: new Date().toISOString() };
      localStorage.setItem('endpoint-manager-policies', JSON.stringify(policies));
    }
    return policy;
  }

  async deleteBlockingPolicy(id: string): Promise<void> {
    await this.delay(300);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/blocking-policies/${id}`, {
    //   method: 'DELETE',
    //   headers: this._getAuthHeaders()
    // });
    // if (!response.ok) throw new Error('Failed to delete blocking policy');
    const policies = await this.getBlockingPolicies();
    const filtered = policies.filter(p => p.id !== id);
    localStorage.setItem('endpoint-manager-policies', JSON.stringify(filtered));
  }

  // Chat Messages
  async getChatMessages(deviceId?: string): Promise<ChatMessage[]> {
    await this.delay(300);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/chat`, { headers: this._getAuthHeaders() });
    // if (!response.ok) throw new Error('Failed to fetch chat messages');
    // return response.json();
    const stored = localStorage.getItem('endpoint-manager-chat');
    const messages = stored ? JSON.parse(stored) : mockChatMessages;
    return deviceId ? messages.filter((m: ChatMessage) => m.deviceId === deviceId) : messages;
  }

  async sendChatMessage(deviceId: string, message: string): Promise<ChatMessage> {
    await this.delay(300);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/chat`, {
    //   method: 'POST',
    //   headers: this._getAuthHeaders(),
    //   body: JSON.stringify({ message })
    // });
    // if (!response.ok) throw new Error('Failed to send message');
    // return response.json();
    const messages = await this.getChatMessages();
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      deviceId,
      message,
      timestamp: new Date().toISOString(),
      sender: 'user',
      isRead: true
    };
    messages.push(newMessage);
    localStorage.setItem('endpoint-manager-chat', JSON.stringify(messages));
    return newMessage;
  }

  // Device Actions
  async executeDeviceAction(deviceId: string, action: string, params?: any): Promise<boolean> {
    await this.delay(1000);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/action/${action}`, {
    //   method: 'POST',
    //   headers: this._getAuthHeaders(),
    //   body: JSON.stringify(params)
    // });
    // if (!response.ok) throw new Error(`Failed to execute ${action}`);
    // return true;
    console.log(`Executing ${action} on device ${deviceId}`, params);
    return true;
  }

  // API calls for speaker control
  async lockSpeaker(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/lock-speaker/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to lock speaker for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to lock speaker for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in lockSpeaker:', error);
      throw error;
    }
  }

  async unlockSpeaker(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/unlock-speaker/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to unlock speaker for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to unlock speaker for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in unlockSpeaker:', error);
      throw error;
    }
  }

  // API calls for Task Manager control
  async disableTaskManager(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/disable-task-manager/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to disable Task Manager for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to disable Task Manager for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in disableTaskManager:', error);
      throw error;
    }
  }

  async enableTaskManager(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/enable-task-manager/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to enable Task Manager for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to enable Task Manager for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in enableTaskManager:', error);
      throw error;
    }
  }

  // API calls for USB control
  async lockUsb(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/lock-usb/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to lock USB for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to lock USB for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in lockUsb:', error);
      throw error;
    }
  }

  async unlockUsb(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/unlock-usb/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to unlock USB for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to unlock USB for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in unlockUsb:', error);
      throw error;
    }
  }

  // API calls for Printer control
  async lockPrinting(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/lock-printing/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to lock printing for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to lock printing for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in lockPrinting:', error);
      throw error;
    }
  }

  async unlockPrinting(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/unlock-printing/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to unlock printing for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to unlock printing for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in unlockPrinting:', error);
      throw error;
    }
  }

  // API calls for Security control
  async lockSecurity(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/lock-security/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to lock security for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to lock security for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in lockSecurity:', error);
      throw error;
    }
  }

  async unlockSecurity(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/unlock-security/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to unlock security for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to unlock security for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in unlockSecurity:', error);
      throw error;
    }
  }

  // API calls for DVD control
  async lockDvd(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/lock-dvd/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to lock DVD for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to lock DVD for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in lockDvd:', error);
      throw error;
    }
  }

  async unlockDvd(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/unlock-dvd/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to unlock DVD for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to unlock DVD for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in unlockDvd:', error);
      throw error;
    }
  }

  // API calls for Ctrl+Alt+Del control
  async lockCtrlAltDel(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/lock-ctrl-alt-del/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to lock Ctrl+Alt+Del for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to lock Ctrl+Alt+Del for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in lockCtrlAltDel:', error);
      throw error;
    }
  }

  async unlockCtrlAltDel(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/unlock-ctrl-alt-del/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to unlock Ctrl+Alt+Del for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to unlock Ctrl+Alt+Del for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in unlockCtrlAltDel:', error);
      throw error;
    }
  }

  // New API calls for UAC control
  async lockUac(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/lock-uac/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to lock UAC for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to lock UAC for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in lockUac:', error);
      throw error;
    }
  }

  async unlockUac(systemUuid: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/unlock-uac/${systemUuid}/`, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: JSON.stringify({})
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to unlock UAC for device ${systemUuid}:`, errorData);
        throw new Error(`Failed to unlock UAC for device ${systemUuid}`);
      }
      return true;
    } catch (error) {
      console.error('Error in unlockUac:', error);
      throw error;
    }
  }

  // Remote Control
  async startRemoteControl(deviceId: string): Promise<boolean> {
    await this.delay(1000);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/remote-control/start`, {
    //   method: 'POST',
    //   headers: this._getAuthHeaders()
    // });
    // if (!response.ok) throw new Error('Failed to start remote control');
    // return true;
    console.log(`Starting remote control for device ${deviceId}`);
    return true;
  }

  async stopRemoteControl(deviceId: string): Promise<boolean> {
    await this.delay(500);
    // Example:
    // const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/remote-control/stop`, {
    //   method: 'POST',
    //   headers: this._getAuthHeaders()
    // });
    // if (!response.ok) throw new Error('Failed to stop remote control');
    // return true;
    console.log(`Stopping remote control for device ${deviceId}`);
    return true;
  }
}

export const apiService = new ApiService();