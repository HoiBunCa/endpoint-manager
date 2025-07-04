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
import { useTranslation } from '../../hooks/useTranslation'; // Import useTranslation

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
  const { t } = useTranslation(); // Use translation hook

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
        title: t('action_failed'),
        message: t('failed_to_load_device_details')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLockComputer = async (timeout: number) => {
    if (!device?.systemUuid) {
      addNotification({
        type: 'error',
        title: t('action_failed'),
        message: t('device_system_uuid_not_available', { action: t('lock_computer') })
      });
      return;
    }
    try {
      await apiService.lockComputer(device.systemUuid, timeout);
      setIsComputerLocked(true);
      addNotification({
        type: 'success',
        title: t('action_executed'),
        message: t('computer_locked_for_x_hours', { hostname: device.hostname, hours: timeout / 3600000 })
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: t('action_failed'),
        message: t('failed_to_execute_action', { action: t('lock_computer'), hostname: device.hostname })
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
      } else if (action === 'reboot') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('reboot') })
          });
          return;
        }
        await apiService.rebootDevice(device.systemUuid);
        addNotification({
          type: 'success',
          title: t('action_executed'),
          message: t('reboot_command_sent', { hostname: device.hostname })
        });
      } else if (action === 'sleep') { // Handle Sleep action
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('sleep') })
          });
          return;
        }
        await apiService.sleepComputer(device.systemUuid);
        addNotification({
          type: 'success',
          title: t('action_executed'),
          message: t('sleep_command_sent', { hostname: device.hostname })
        });
      } else if (action === 'power_off') { // Handle Power Off action
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('power_off') })
          });
          return;
        }
        await apiService.powerOffComputer(device.systemUuid);
        addNotification({
          type: 'success',
          title: t('action_executed'),
          message: t('power_off_command_sent', { hostname: device.hostname })
        });
      } else if (action === 'clear_running_apps') { // Handle Clear App Running action
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('clear_app_running') })
          });
          return;
        }
        await apiService.clearDesktopApps(device.systemUuid);
        addNotification({
          type: 'success',
          title: t('action_executed'),
          message: t('clear_app_running_command_sent', { hostname: device.hostname })
        });
      } else if (action === 'toggle_speaker') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('speaker_control') })
          });
          return;
        }

        if (isSpeakerLocked) {
          await apiService.unlockSpeaker(device.systemUuid);
          setIsSpeakerLocked(false);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('speaker_unlocked_on_device', { hostname: device.hostname })
          });
        } else {
          await apiService.lockSpeaker(device.systemUuid);
          setIsSpeakerLocked(true);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('speaker_locked_on_device', { hostname: device.hostname })
          });
        }
      } else if (action === 'toggle_task_manager') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('task_manager') })
          });
          return;
        }

        if (isTaskManagerLocked) {
          await apiService.enableTaskManager(device.systemUuid);
          setIsTaskManagerLocked(false);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('task_manager_enabled_on_device', { hostname: device.hostname })
          });
        } else {
          await apiService.disableTaskManager(device.systemUuid);
          setIsTaskManagerLocked(true);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('task_manager_disabled_on_device', { hostname: device.hostname })
          });
        }
      } else if (action === 'toggle_usb') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('usb_control') })
          });
          return;
        }

        if (isUsbLocked) {
          await apiService.unlockUsb(device.systemUuid);
          setIsUsbLocked(false);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('usb_unlocked_on_device', { hostname: device.hostname })
          });
        } else {
          await apiService.lockUsb(device.systemUuid);
          setIsUsbLocked(true);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('usb_locked_on_device', { hostname: device.hostname })
          });
        }
      } else if (action === 'toggle_printer') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('print_control') })
          });
          return;
        }

        if (isPrinterLocked) {
          await apiService.unlockPrinting(device.systemUuid);
          setIsPrinterLocked(false);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('printer_unlocked_on_device', { hostname: device.hostname })
          });
        } else {
          await apiService.lockPrinting(device.systemUuid);
          setIsPrinterLocked(true);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('printer_locked_on_device', { hostname: device.hostname })
          });
        }
      } else if (action === 'toggle_security') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('security_control') })
          });
          return;
        }

        if (isSecurityLocked) {
          await apiService.unlockSecurity(device.systemUuid);
          setIsSecurityLocked(false);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('security_unlocked_on_device', { hostname: device.hostname })
          });
        } else {
          await apiService.lockSecurity(device.systemUuid);
          setIsSecurityLocked(true);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('security_locked_on_device', { hostname: device.hostname })
          });
        }
      } else if (action === 'toggle_dvd') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('dvd_control') })
          });
          return;
        }

        if (isDvdLocked) {
          await apiService.unlockDvd(device.systemUuid);
          setIsDvdLocked(false);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('dvd_unlocked_on_device', { hostname: device.hostname })
          });
        } else {
          await apiService.lockDvd(device.systemUuid);
          setIsDvdLocked(true);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('dvd_locked_on_device', { hostname: device.hostname })
          });
        }
      } else if (action === 'toggle_ctrl_alt_del') {
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('ctrl_alt_del_control') })
          });
          return;
        }

        if (isCtrlAltDelLocked) {
          await apiService.unlockCtrlAltDel(device.systemUuid);
          setIsCtrlAltDelLocked(false);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('ctrl_alt_del_unlocked_on_device', { hostname: device.hostname })
          });
        } else {
          await apiService.lockCtrlAltDel(device.systemUuid);
          setIsCtrlAltDelLocked(true);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('ctrl_alt_del_locked_on_device', { hostname: device.hostname })
          });
        }
      } else if (action === 'toggle_uac') { // Handle UAC toggle
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('uac_control') })
          });
          return;
        }

        if (isUacLocked) {
          await apiService.unlockUac(device.systemUuid);
          setIsUacLocked(false);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('uac_unlocked_on_device', { hostname: device.hostname })
          });
        } else {
          await apiService.lockUac(device.systemUuid);
          setIsUacLocked(true);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('uac_locked_on_device', { hostname: device.hostname })
          });
        }
      } else if (action === 'toggle_computer_lock') { // Handle Computer Lock/Unlock
        if (!device.systemUuid) {
          addNotification({
            type: 'error',
            title: t('action_failed'),
            message: t('device_system_uuid_not_available', { action: t('lock_computer') })
          });
          return;
        }

        if (isComputerLocked) {
          await apiService.unlockComputer(device.systemUuid);
          setIsComputerLocked(false);
          addNotification({
            type: 'success',
            title: t('action_executed'),
            message: t('computer_unlocked_on_device', { hostname: device.hostname })
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
          title: t('action_executed'),
          message: t('command_sent_to_device', { action: action.replace(/_/g, ' '), hostname: device.hostname })
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: t('action_failed'),
        message: t('failed_to_execute_action', { action: action.replace(/_/g, ' '), hostname: device.hostname })
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
        title: t('software_updated'),
        message: t('software_status_updated', { softwareName: softwareName, status: !isBlocked ? t('blocked') : t('unblocked') })
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: t('update_failed'),
        message: t('failed_to_update_software_status', { softwareName: softwareName })
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
        title: t('website_blocked'),
        message: t('website_blocked_message', { website: newWebsite })
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: t('block_failed'),
        message: t('failed_to_block_website', { website: newWebsite })
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
        title: t('website_unblocked'),
        message: t('website_unblocked_message', { website: website })
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: t('unblock_failed'),
        message: t('failed_to_unblock_website', { website: website })
      });
    }
  };

  const exportSoftwareList = () => {
    if (!device?.software) return;

    const csvContent = [
      [t('name'), t('version'), t('publisher'), t('install_date'), t('size'), t('blocked')].join(','),
      ...device.software.map(sw => [
        sw.name,
        sw.version,
        sw.publisher,
        safeToLocaleDateString(sw.installDate), // Use safe function
        sw.size,
        sw.isBlocked ? t('yes') : t('no')
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('device_not_found')}</h3>
        <p className="text-gray-500 mb-4">{t('device_not_found_message')}</p>
        <button
          onClick={() => navigate('/devices')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {t('back_to_devices')}
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
    { name: t('reboot'), action: 'reboot', imageSrc: '/assets/images/icon-images/reboot.png', color: 'bg-gray-100' },
    { name: t('sleep'), action: 'sleep', imageSrc: '/assets/images/icon-images/sleep.png', color: 'bg-gray-100' },
    { name: t('task_manager'), action: 'toggle_task_manager', imageSrc: '/assets/images/icon-images/task_manager.png', color: 'bg-gray-100', isLocked: isTaskManagerLocked },
    { name: t('speaker_control'), action: 'toggle_speaker', imageSrc: '/assets/images/icon-images/speaker.png', color: 'bg-gray-100', isLocked: isSpeakerLocked },
    { name: t('power_off'), action: 'power_off', imageSrc: '/assets/images/icon-images/power_off.png', color: 'bg-gray-100' },
    { name: t('clear_app_running'), action: 'clear_running_apps', imageSrc: '/assets/images/icon-images/clear_running_apps.png', color: 'bg-gray-100' },
    { name: isComputerLocked ? t('unlock_computer') : t('lock_computer'), action: 'toggle_computer_lock', imageSrc: '/assets/images/icon-images/computer.png', color: 'bg-gray-100', isLocked: isComputerLocked }, // Combined Lock/Unlock Computer
    { name: t('usb_control'), action: 'toggle_usb', imageSrc: '/assets/images/icon-images/usb.png', color: 'bg-gray-100', isLocked: isUsbLocked },
    { name: t('print_control'), action: 'toggle_printer', imageSrc: '/assets/images/icon-images/print.png', color: 'bg-gray-100', isLocked: isPrinterLocked },
    { name: t('security_control'), action: 'toggle_security', imageSrc: '/assets/images/icon-images/security.png', color: 'bg-gray-100', isLocked: isSecurityLocked },
    { name: t('dvd_control'), action: 'toggle_dvd', imageSrc: '/assets/images/icon-images/dvd.png', color: 'bg-gray-100', isLocked: isDvdLocked },
    { name: t('ctrl_alt_del_control'), action: 'toggle_ctrl_alt_del', imageSrc: '/assets/images/icon-images/ctrl_alt_del.png', color: 'bg-gray-100', isLocked: isCtrlAltDelLocked },
    { name: t('uac_control'), action: 'toggle_uac', imageSrc: '/assets/images/icon-images/uac.png', color: 'bg-gray-100', isLocked: isUacLocked }, // Combined UAC control
    { name: t('remote_control'), action: 'remote_control', imageSrc: '/assets/images/icon-images/remote_control.png', color: 'bg-gray-100' },
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
            <p className="text-gray-600">{t('device_details_management')}</p>
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
            {device.isOnline ? t('online') : t('offline')}
          </span>
        </div>
      </div>

      {/* Device Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('device_information')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t('hostname')}</p>
            <p className="font-medium">{device.hostname}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('platform')}</p>
            <p className="font-medium">{device.platform}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('system_uuid')}</p>
            <p className="font-medium font-mono text-sm">{device.systemUuid}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('mac_address')}</p>
            <p className="font-medium font-mono text-sm">{device.macAddress}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('ip_address')}</p>
            <p className="font-medium font-mono text-sm">{device.ipAddress}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('department')}</p>
            <p className="font-medium">{device.department || t('unassigned')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('assigned_user')}</p>
            <p className="font-medium">{device.assignedUser?.fullName || t('unassigned')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('last_seen')}</p>
            <p className="font-medium">{safeFormatDistanceToNow(device.lastSeen)}</p>
          </div>
        </div>
      </div>

      {/* Control Panel (now below Device Information) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('remote_control')}</h2>
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
              { id: 'overview', label: t('overview'), icon: Activity },
              { id: 'hardware', label: t('hardware'), icon: Cpu },
              { id: 'software', label: t('software'), icon: Settings },
              { id: 'websites', label: t('blocked_websites'), icon: Shield },
              { id: 'location', label: t('location'), icon: MapPin },
              { id: 'chat', label: t('remote_chat'), icon: MessageCircle },
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('operating_system')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('os_name')}</p>
                    <p className="font-medium">{device.operatingSystem?.name || t('n_a')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('version')}</p>
                    <p className="font-medium">{device.operatingSystem?.version || t('n_a')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('build_number')}</p>
                    <p className="font-medium">{device.operatingSystem?.buildNumber || t('n_a')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('last_boot')}</p>
                    <p className="font-medium">
                      {safeFormatDistanceToNow(device.operatingSystem?.lastBootTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('install_date')}</p>
                    <p className="font-medium">
                      {safeToLocaleDateString(device.operatingSystem?.installDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Network */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('network_adapters')}</h3>
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
                          {adapter.status === 'connected' ? t('connected') : t('disconnected')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">{t('ip')}: </span>
                          <span className="font-mono">{adapter.ipAddress}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('mac')}: </span>
                          <span className="font-mono">{adapter.macAddress}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('dns')}: </span>
                          <span className="font-mono">{adapter.dnsServers.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">{t('no_network_adapters_found')}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Hardware Tab */}
          {activeTab === 'hardware' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{t('hardware_information')}</h3>
                <button
                  onClick={() => {
                    // Export hardware info
                    const hardwareData = device.hardware;
                    if (hardwareData) {
                      const csvContent = [
                        [t('component'), t('details')].join(','),
                        [t('manufacturer'), hardwareData.manufacturer],
                        [t('model'), hardwareData.model],
                        [t('cpu'), hardwareData.cpu],
                        [t('ram'), hardwareData.ram],
                        [t('storage'), hardwareData.storage],
                        [t('serial_number'), hardwareData.serialNumber]
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
                  <span>{t('export')}</span>
                </button>
              </div>
              
              {device.hardware ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('manufacturer')}</p>
                      <p className="font-medium">{device.hardware.manufacturer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('model')}</p>
                      <p className="font-medium">{device.hardware.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('serial_number')}</p>
                      <p className="font-medium font-mono">{device.hardware.serialNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('cpu')}</p>
                      <p className="font-medium">{device.hardware.cpu}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('ram')}</p>
                      <p className="font-medium">{device.hardware.ram}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('storage')}</p>
                      <p className="font-medium">{device.hardware.storage}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">{t('no_hardware_info_available')}</p>
              )}
            </div>
          )}

          {/* Software Tab */}
          {activeTab === 'software' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{t('installed_software')}</h3>
                <button
                  onClick={exportSoftwareList}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('export')}</span>
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={t('search_software')}
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
                        {t('installed')}: {safeToLocaleDateString(software.installDate)} • {software.size}
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
                            <span>{t('blocked')}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>{t('allowed')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredSoftware.length === 0 && (
                <p className="text-gray-500 text-center py-8">{t('no_software_found')}</p>
              )}
            </div>
          )}

          {/* Blocked Websites Tab */}
          {activeTab === 'websites' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{t('blocked_websites')}</h3>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={t('search_blocked_websites')}
                    value={websiteSearch}
                    onChange={(e) => setWebsiteSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder={t('enter_website_to_block')}
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
                  {t('block_website')}
                </button>
              </div>

              <div className="space-y-3">
                {filteredWebsites.map((website, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Ban className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-gray-900">{website}</p>
                        <p className="text-sm text-gray-600">{t('blocked_website')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeBlockedWebsite(website)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
                    >
                      {t('unblock')}
                    </button>
                  </div>
                ))}
              </div>

              {filteredWebsites.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('no_blocked_websites')}</p>
                </div>
              )}
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">{t('device_location')}</h3>
              <div className="h-96 rounded-lg overflow-hidden">
                <DeviceMap device={device} />
              </div>
              {device.location && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{t('current_location')}</h4>
                  <p className="text-sm text-gray-600">
                    {device.location.address || `${device.location.latitude}, ${device.location.longitude}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('last_updated')}: {safeFormatDistanceToNow(device.lastSeen)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('remote_chat')}</h3>
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