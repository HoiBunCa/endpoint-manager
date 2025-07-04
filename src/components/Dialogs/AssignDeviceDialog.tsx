import React, { useState, useEffect } from 'react';
import { X, Monitor, Search, UserPlus } from 'lucide-react';
import { User, Device } from '../../types';
import { apiService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';

interface AssignDeviceDialogProps {
  user: User;
  devices: Device[];
  onSave: () => void;
  onClose: () => void;
}

const AssignDeviceDialog: React.FC<AssignDeviceDialogProps> = ({ user, devices, onSave, onClose }) => {
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [assignedDevices, setAssignedDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    const assigned = devices.filter(device => device.assignedUser?.id === user.id);
    const available = devices.filter(device => !device.assignedUser);
    
    setAssignedDevices(assigned);
    setAvailableDevices(available);
  }, [devices, user]);

  const assignDevice = async (device: Device) => {
    setLoading(true);
    try {
      const updatedDevice = {
        ...device,
        assignedUser: user,
        department: user.department
      };
      
      await apiService.updateDevice(updatedDevice);
      
      setAvailableDevices(prev => prev.filter(d => d.id !== device.id));
      setAssignedDevices(prev => [...prev, updatedDevice]);
      
      addNotification({
        type: 'success',
        title: 'Device Assigned',
        message: `${device.hostname} has been assigned to ${user.fullName}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Assignment Failed',
        message: 'Failed to assign device'
      });
    } finally {
      setLoading(false);
    }
  };

  const unassignDevice = async (device: Device) => {
    setLoading(true);
    try {
      const updatedDevice = {
        ...device,
        assignedUser: undefined,
        department: undefined
      };
      
      await apiService.updateDevice(updatedDevice);
      
      setAssignedDevices(prev => prev.filter(d => d.id !== device.id));
      setAvailableDevices(prev => [...prev, updatedDevice]);
      
      addNotification({
        type: 'success',
        title: 'Device Unassigned',
        message: `${device.hostname} has been unassigned from ${user.fullName}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Unassignment Failed',
        message: 'Failed to unassign device'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAvailableDevices = availableDevices.filter(device =>
    device.hostname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Manage Device Assignments</h2>
            <p className="text-sm text-gray-600">Assign devices to {user.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Devices */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Available Devices</h3>
                <span className="text-sm text-gray-500">{filteredAvailableDevices.length} devices</span>
              </div>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredAvailableDevices.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No available devices</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredAvailableDevices.map(device => (
                      <div key={device.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Monitor className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{device.hostname}</div>
                              <div className="text-sm text-gray-600">{device.platform}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => assignDevice(device)}
                            disabled={loading}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Assign</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Devices */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assigned Devices</h3>
                <span className="text-sm text-gray-500">{assignedDevices.length} devices</span>
              </div>

              <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
                {assignedDevices.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No assigned devices</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {assignedDevices.map(device => (
                      <div key={device.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Monitor className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{device.hostname}</div>
                              <div className="text-sm text-gray-600">{device.platform}</div>
                              <div className={`text-xs ${device.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                {device.isOnline ? 'Online' : 'Offline'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => unassignDevice(device)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm"
                          >
                            Unassign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={() => {
              onSave();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDeviceDialog;