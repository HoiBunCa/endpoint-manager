import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Monitor, 
  ArrowLeft, 
  Activity, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Shield,
  MessageCircle,
  Settings,
  Power,
  Lock,
  Unlock,
  Speaker,
  Play,
  Download,
  Search,
  Ban,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  RefreshCcw, // For Reboot
  Moon, // For Sleep
  VolumeX, // For Lock Speaker
  Volume2, // For Unlock Speaker
  Eraser, // For Clear App Running
  Usb, // For USB actions
  Printer, // For Print actions
  ShieldOff, // For Lock Security
  ShieldCheck, // For Unlock Security
  Disc, // For DVD actions
  Keyboard, // For Ctrl+Alt+Del actions
  UserX, // For Lock UAC
  UserCheck // For Unlock UAC
} from 'lucide-react';
import { Device } from '../../types';
import { apiService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import DeviceMap from '../Maps/DeviceMap';
import RemoteControl from '../RemoteControl/RemoteControl';
import CustomRemoteControlButton from '../RemoteControl/CustomRemoteControlButton'; // Import the new component
import DeviceChat from '../Chat/DeviceChat';
import LockComputerDialog from '../Dialogs/LockComputerDialog'; // Import the new dialog

// Helper function to safely format date distance
const safeFormatDistanceToNow = (dateString: string | undefined, addSuffix: boolean = true) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : formatDistanceToNow(date, { addSuffix });
};

// Helper function to safely format date to locale string
const safeToLocaleDateString = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
};

const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hardware' | 'software' | 'websites' | 'chat' | 'location'>('overview');
  const [showRemoteControl, setShowRemoteControl] = useState(false);
  const [softwareSearch, setSoftwareSearch] = useState('');
  const [websiteSearch, setWebsiteSearch] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [isSpeakerLocked, setIsSpeakerLocked] = useState(false); // State for speaker lock
  const [isTaskManagerLocked, setIsTaskManagerLocked] = useState(false); // State for Task Manager lock
  const [isUsbLocked, setIsUsbLocked] = useState(false); // State for USB lock
  const [isPrinterLocked, setIsPrinterLocked] = useState(false); // State for Printer lock
  const [isSecurityLocked, setIsSecurityLocked] = useState(false); // State for Security lock
  const [isDvdLocked, setIsDvdLocked] = useState(false); // State for DVD lock
  const [isCtrlAltDelLocked, setIsCtrlAltDelLocked] = useState(false); // State for Ctrl+Alt+Del lock
  const [isUacLocked, setIsUacLocked] = useState(false); // New state for UAC lock
  const [isComputerLocked, setIsComputerLocked] = useState(false); // New state for Computer lock
  const [showLockComputerDialog, setShowLockComputerDialog] = useState(false); // New state for lock computer dialog

  useEffect(() => {
    if (id) {
      loadDevice();
    }
  }, [id]);

  const loadDevice = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await apiService.getDevice(id);
      setDevice(data);
      // Assuming initial states are unlocked if not provided by API
      setIsSpeakerLocked(false); 
      setIsTaskManagerLocked(false);
      setIsUsbLocked(false);
      setIsPrinterLocked(false);
      setIsSecurityLocked(false);
      setIsDvdLocked(false);
      setIsCtrlAltDelLocked(false);
      setIsUacLocked(false); // Initialize UAC lock state
      setIsComputerLocked(false); // Initialize computer lock state
    } catch (error) {
      console.error('Failed to load device:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load device details'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLockComputer = async (timeout: number) => {
    if (!device?.systemUuid) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: 'Device System UUID not available for computer lock.'
      });
      return;
    }
    try {
      await apiService.lockComputer(device.systemUuid, timeout);
      setIsComputerLocked(true);
      addNotification({
        type: 'success',
        title: 'Action Executed',
        message: `Computer locked on ${device.hostname} for ${timeout / 3600000} hours`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: `Failed to lock computer on ${device.hostname}`
      });
    } finally {
      setShowLockComputerDialog(false);
    }
  };

  const executeAction = async (action: string, params?: any) => {
    if (!device) return;

    try {
      if (action === 'remote_control') {
        setShowRemoteControl(true);
      } else if (action === 'toggle_speaker') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: 'Action Failed',
            message: 'Device System UUID not available for speaker control.'
          });
          return;
        }

        if (isSpeakerLocked) {
          await apiService.unlockSpeaker(device.systemUuid);
          setIsSpeakerLocked(false);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `Speaker unlocked on ${device.hostname}`
          });
        } else {
          await apiService.lockSpeaker(device.systemUuid);
          setIsSpeakerLocked(true);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `Speaker locked on ${device.hostname}`
          });
        }
      } else if (action === 'toggle_task_manager') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: 'Action Failed',
            message: 'Device System UUID not available for Task Manager control.'
          });
          return;
        }

        if (isTaskManagerLocked) {
          await apiService.enableTaskManager(device.systemUuid);
          setIsTaskManagerLocked(false);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `Task Manager enabled on ${device.hostname}`
          });
        } else {
          await apiService.disableTaskManager(device.systemUuid);
          setIsTaskManagerLocked(true);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `Task Manager disabled on ${device.hostname}`
          });
        }
      } else if (action === 'toggle_usb') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: 'Action Failed',
            message: 'Device System UUID not available for USB control.'
          });
          return;
        }

        if (isUsbLocked) {
          await apiService.unlockUsb(device.systemUuid);
          setIsUsbLocked(false);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `USB unlocked on ${device.hostname}`
          });
        } else {
          await apiService.lockUsb(device.systemUuid);
          setIsUsbLocked(true);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `USB locked on ${device.hostname}`
          });
        }
      } else if (action === 'toggle_printer') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: 'Action Failed',
            message: 'Device System UUID not available for printer control.'
          });
          return;
        }

        if (isPrinterLocked) {
          await apiService.unlockPrinting(device.systemUuid);
          setIsPrinterLocked(false);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `Printer unlocked on ${device.hostname}`
          });
        } else {
          await apiService.lockPrinting(device.systemUuid);
          setIsPrinterLocked(true);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `Printer locked on ${device.hostname}`
          });
        }
      } else if (action === 'toggle_security') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: 'Action Failed',
            message: 'Device System UUID not available for security control.'
          });
          return;
        }

        if (isSecurityLocked) {
          await apiService.unlockSecurity(device.systemUuid);
          setIsSecurityLocked(false);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `Security unlocked on ${device.hostname}`
          });
        } else {
          await apiService.lockSecurity(device.systemUuid);
          setIsSecurityLocked(true);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `Security locked on ${device.hostname}`
          });
        }
      } else if (action === 'toggle_dvd') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: 'Action Failed',
            message: 'Device System UUID not available for DVD control.'
          });
          return;
        }

        if (isDvdLocked) {
          await apiService.unlockDvd(device.systemUuid);
          setIsDvdLocked(false);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `DVD unlocked on ${device.hostname}`
          });
        } else {
          await apiService.lockDvd(device.systemUuid);
          setIsDvdLocked(true);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `DVD locked on ${device.hostname}`
          });
        }
      } else if (action === 'toggle_ctrl_alt_del') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: 'Action Failed',
            message: 'Device System UUID not available for Ctrl+Alt+Del control.'
          });
          return;
        }

        if (isCtrlAltDelLocked) {
          await apiService.unlockCtrlAltDel(device.systemUuid);
          setIsCtrlAltDelLocked(false);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `Ctrl+Alt+Del unlocked on ${device.hostname}`
          });
        } else {
          await apiService.lockCtrlAltDel(device.systemUuid);
          setIsCtrlAltDelLocked(true);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `Ctrl+Alt+Del locked on ${device.hostname}`
          });
        }
      } else if (action === 'toggle_uac') { // Handle UAC toggle
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: 'Action Failed',
            message: 'Device System UUID not available for UAC control.'
          });
          return;
        }

        if (isUacLocked) {
          await apiService.unlockUac(device.systemUuid);
          setIsUacLocked(false);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `UAC unlocked on ${device.hostname}`
          });
        } else {
          await apiService.lockUac(device.systemUuid);
          setIsUacLocked(true);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `UAC locked on ${device.hostname}`
          });
        }
      } else if (action === 'toggle_computer_lock') { // Handle Computer Lock/Unlock
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: 'Action Failed',
            message: 'Device System UUID not available for computer lock/unlock.'
          });
          return;
        }

        if (isComputerLocked) {
          await apiService.unlockComputer(device.systemUuid);
          setIsComputerLocked(false);
          addNotification({
            type: 'success',
            title: 'Action Executed',
            message: `Computer unlocked on ${device.hostname}`
          });
        } else {
          setShowLockComputerDialog(true); // Show dialog to select timeout
        }
      }
      else {
        // For other generic actions, continue using device.id or device.systemUuid as appropriate for the specific API
        // Assuming device.id is used for generic actions based on current implementation
        await apiService.executeDeviceAction(device.id, action, params);
        addNotification({
          type: 'success',
          title: 'Action Executed',
          message: `${action.replace(/_/g, ' ')} command sent to ${device.hostname}`
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: `Failed to execute ${action.replace(/_/g, ' ')} on ${device.hostname}`
      });
    }
  };

  const toggleSoftwareBlock = async (softwareName: string, isBlocked: boolean) => {
    if (!device) return;

    try {
      // Update local state
      const updatedDevice = {
        ...device,
        software: device.software?.map(sw => 
          sw.name === softwareName ? { ...sw, isBlocked: !isBlocked } : sw
        )
      };
      setDevice(updatedDevice);
      
      await apiService.updateDevice(updatedDevice);
      addNotification({
        type: 'success',
        title: 'Software Updated',
        message: `${softwareName} has been ${!isBlocked ? 'blocked' : 'unblocked'}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: `Failed to update ${softwareName} status`
      });
    }
  };

  const addBlockedWebsite = async () => {
    if (!device || !newWebsite.trim()) return;

    try {
      const updatedDevice = {
        ...device,
        blockedWebsites: [...(device.blockedWebsites || []), newWebsite.trim()]
      };
      setDevice(updatedDevice);
      setNewWebsite('');
      
      await apiService.updateDevice(updatedDevice);
      addNotification({
        type: 'success',
        title: 'Website Blocked',
        message: `${newWebsite} has been added to the blocked list`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Block Failed',
        message: `Failed to block ${newWebsite}`
      });
    }
  };

  const removeBlockedWebsite = async (website: string) => {
    if (!device) return;

    try {
      const updatedDevice = {
        ...device,
        blockedWebsites: device.blockedWebsites?.filter(w => w !== website)
      };
      setDevice(updatedDevice);
      
      await apiService.updateDevice(updatedDevice);
      addNotification({
        type: 'success',
        title: 'Website Unblocked',
        message: `${website} has been removed from the blocked list`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Unblock Failed',
        message: `Failed to unblock ${website}`
      });
    }
  };

  const exportSoftwareList = () => {
    if (!device?.software) return;

    const csvContent = [
      ['Name', 'Version', 'Publisher', 'Install Date', 'Size', 'Blocked'].join(','),
      ...device.software.map(sw => [
        sw.name,
        sw.version,
        sw.publisher,
        safeToLocaleDateString(sw.installDate), // Use safe function
        sw.size,
        sw.isBlocked ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${device.hostname}_software.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="text-center py-12">
        <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Device not found</h3>
        <p className="text-gray-500 mb-4">The device you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/devices')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Back to Devices
        </button>
      </div>
    );
  }

  const filteredSoftware = device.software?.filter(sw =>
    sw.name.toLowerCase().includes(softwareSearch.toLowerCase()) ||
    sw.publisher.toLowerCase().includes(softwareSearch.toLowerCase())
  ) || [];

  const filteredWebsites = device.blockedWebsites?.filter(website =>
    website.toLowerCase().includes(websiteSearch.toLowerCase())
  ) || [];

  const controlActions = [
    { name: 'Reboot', action: 'reboot', imageSrc: '/assets/images/icon-images/reboot.png', color: 'bg-gray-100' },
    { name: 'Sleep', action: 'sleep', imageSrc: '/assets/images/icon-images/sleep.png', color: 'bg-gray-100' },
    { name: 'Task Manager', action: 'toggle_task_manager', imageSrc: '/assets/images/icon-images/task_manager.png', color: 'bg-gray-100', isLocked: isTaskManagerLocked },
    { name: 'Speaker Control', action: 'toggle_speaker', imageSrc: '/assets/images/icon-images/speaker.png', color: 'bg-gray-100', isLocked: isSpeakerLocked },
    { name: 'Power Off', action: 'power_off', imageSrc: '/assets/images/icon-images/power_off.png', color: 'bg-gray-100' },
    { name: 'Clear App Running', action: 'clear_running_apps', imageSrc: '/assets/images/icon-images/clear_running_apps.png', color: 'bg-gray-100' },
    { name: isComputerLocked ? 'Unlock Computer' : 'Lock Computer', action: 'toggle_computer_lock', imageSrc: '/assets/images/icon-images/computer.png', color: 'bg-gray-100', isLocked: isComputerLocked }, // Combined Lock/Unlock Computer
    { name: 'USB Control', action: 'toggle_usb', imageSrc: '/assets/images/icon-images/usb.png', color: 'bg-gray-100', isLocked: isUsbLocked },
    { name: 'Print Control', action: 'toggle_printer', imageSrc: '/assets/images/icon-images/print.png', color: 'bg-gray-100', isLocked: isPrinterLocked },
    { name: 'Security Control', action: 'toggle_security', imageSrc: '/assets/images/icon-images/security.png', color: 'bg-gray-100', isLocked: isSecurityLocked },
    { name: 'DVD Control', action: 'toggle_dvd', imageSrc: '/assets/images/icon-images/dvd.png', color: 'bg-gray-100', isLocked: isDvdLocked },
    { name: 'Ctrl+Alt+Del Control', action: 'toggle_ctrl_alt_del', imageSrc: '/assets/images/icon-images/ctrl_alt_del.png', color: 'bg-gray-100', isLocked: isCtrlAltDelLocked },
    { name: 'UAC Control', action: 'toggle_uac', imageSrc: '/assets/images/icon-images/uac.png', color: 'bg-gray-100', isLocked: isUacLocked }, // Combined UAC control
    { name: 'Remote Control', action: 'remote_control', imageSrc: '/assets/images/icon-images/remote_control.png', color: 'bg-gray-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/devices')}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{device.hostname}</h1>
            <p className="text-gray-600">Device Details & Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={clsx(
            'w-3 h-3 rounded-full',
            device.isOnline ? 'bg-green-500' : 'bg-red-500'
          )}></div>
          <span className={clsx(
            'text-sm font-medium',
            device.isOnline ? 'text-green-700' : 'text-red-700'
          )}>
            {device.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Device Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Hostname</p>
            <p className="font-medium">{device.hostname}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Platform</p>
            <p className="font-medium">{device.platform}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">System UUID</p>
            <p className="font-medium font-mono text-sm">{device.systemUuid}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">MAC Address</p>
            <p className="font-medium font-mono text-sm">{device.macAddress}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">IP Address</p>
            <p className="font-medium font-mono text-sm">{device.ipAddress}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">{device.department || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Assigned User</p>
            <p className="font-medium">{device.assignedUser?.fullName || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Seen</p>
            <p className="font-medium">{safeFormatDistanceToNow(device.lastSeen)}</p>
          </div>
        </div>
      </div>

      {/* Control Panel (now below Device Information) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Remote Control</h2>
        <div className="flex flex-wrap gap-3 justify-center">
          {controlActions.map((action) => (
            <CustomRemoteControlButton
              key={action.action}
              imageSrc={action.imageSrc}
              label={action.name}
              action={action.action}
              onClick={executeAction}
              colorClass={action.color}
              isLocked={action.isLocked} // Use the isLocked prop from controlActions
            />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'hardware', label: 'Hardware', icon: Cpu },
              { id: 'software', label: 'Software', icon: Settings },
              { id: 'websites', label: 'Blocked Websites', icon: Shield },
              { id: 'location', label: 'Location', icon: MapPin },
              { id: 'chat', label: 'Remote Chat', icon: MessageCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Operating System */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Operating System</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">OS Name</p>
                    <p className="font-medium">{device.operatingSystem?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="font-medium">{device.operatingSystem?.version || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Build Number</p>
                    <p className="font-medium">{device.operatingSystem?.buildNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Boot</p>
                    <p className="font-medium">
                      {safeFormatDistanceToNow(device.operatingSystem?.lastBootTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Install Date</p>
                    <p className="font-medium">
                      {safeToLocaleDateString(device.operatingSystem?.installDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Network */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Network Adapters</h3>
                <div className="space-y-4">
                  {device.network?.map((adapter, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{adapter.name}</h4>
                        <span className={clsx(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          adapter.status === 'connected' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        )}>
                          {adapter.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">IP: </span>
                          <span className="font-mono">{adapter.ipAddress}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">MAC: </span>
                          <span className="font-mono">{adapter.macAddress}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">DNS: </span>
                          <span className="font-mono">{adapter.dnsServers.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No network adapters found</p>}
                </div>
              </div>
            </div>
          )}

          {/* Hardware Tab */}
          {activeTab === 'hardware' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Hardware Information</h3>
                <button
                  onClick={() => {
                    // Export hardware info
                    const hardwareData = device.hardware;
                    if (hardwareData) {
                      const csvContent = [
                        ['Component', 'Details'].join(','),
                        ['Manufacturer', hardwareData.manufacturer],
                        ['Model', hardwareData.model],
                        ['CPU', hardwareData.cpu],
                        ['RAM', hardwareData.ram],
                        ['Storage', hardwareData.storage],
                        ['Serial Number', hardwareData.serialNumber]
                      ].join('\n');

                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${device.hostname}_hardware.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
              
              {device.hardware ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Manufacturer</p>
                      <p className="font-medium">{device.hardware.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Model</p>
                      <p className="font-medium">{device.hardware.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Serial Number</p>
                      <p className="font-medium font-mono">{device.hardware.serialNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">CPU</p>
                      <p className="font-medium">{device.hardware.cpu}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">RAM</p>
                      <p className="font-medium">{device.hardware.ram}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Storage</p>
                      <p className="font-medium">{device.hardware.storage}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No hardware information available</p>
              )}
            </div>
          )}

          {/* Software Tab */}
          {activeTab === 'software' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Installed Software</h3>
                <button
                  onClick={exportSoftwareList}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search software..."
                  value={softwareSearch}
                  onChange={(e) => setSoftwareSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
                {filteredSoftware.map((software, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{software.name}</h4>
                      <p className="text-sm text-gray-600">{software.publisher} • {software.version}</p>
                      <p className="text-xs text-gray-500">
                        Installed: {safeToLocaleDateString(software.installDate)} • {software.size}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleSoftwareBlock(software.name, software.isBlocked || false)}
                        className={clsx(
                          'flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium',
                          software.isBlocked
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        )}
                      >
                        {software.isBlocked ? (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Blocked</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Allowed</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredSoftware.length === 0 && (
                <p className="text-gray-500 text-center py-8">No software found</p>
              )}
            </div>
          )}

          {/* Blocked Websites Tab */}
          {activeTab === 'websites' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Blocked Websites</h3>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search blocked websites..."
                    value={websiteSearch}
                    onChange={(e) => setWebsiteSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Enter website to block (e.g., facebook.com)"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addBlockedWebsite();
                    }
                  }}
                />
                <button
                  onClick={addBlockedWebsite}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Block Website
                </button>
              </div>

              <div className="space-y-3">
                {filteredWebsites.map((website, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Ban className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900">{website}</p>
                        <p className="text-sm text-gray-600">Blocked website</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeBlockedWebsite(website)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>

              {filteredWebsites.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No blocked websites</p>
                </div>
              )}
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Device Location</h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <DeviceMap device={device} />
              </div>
              {device.location && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Current Location</h4>
                  <p className="text-sm text-gray-600">
                    {device.location.address || `${device.location.latitude}, ${device.location.longitude}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {safeFormatDistanceToNow(device.lastSeen)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Remote Chat</h3>
              <DeviceChat deviceId={device.id} />
            </div>
          )}
        </div>
      </div>

      {/* Remote Control Modal */}
      {showRemoteControl && (
        <RemoteControl
          device={device}
          onClose={() => setShowRemoteControl(false)}
        />
      )}

      {/* Lock Computer Dialog */}
      {showLockComputerDialog && (
        <LockComputerDialog
          onLock={handleLockComputer}
          onClose={() => setShowLockComputerDialog(false)}
        />
      )}
    </div>
  );
};

export default DeviceDetail;