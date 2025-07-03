import React, { useState, useEffect } from 'react';
import { X, Monitor, Search } from 'lucide-react';
import { BlockingPolicy, Device } from '../../types';
import { apiService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';

interface AssignDevicesDialogProps {
  policy: BlockingPolicy;
  onSave: (policy: BlockingPolicy) => void;
  onClose: () => void;
}

const AssignDevicesDialog: React.FC<AssignDevicesDialogProps> = ({ policy, onSave, onClose }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    if (policy.assignedDevices) {
      setSelectedDevices(policy.assignedDevices);
    }
  }, [policy]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDevices();
      setDevices(data);
    } catch (error) {
      console.error('Failed to load devices:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load devices'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices(prev =>
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedPolicy = {
        ...policy,
        assignedDevices: selectedDevices
      };
      
      await apiService.updateBlockingPolicy(updatedPolicy);
      onSave(updatedPolicy);
      
      addNotification({
        type: 'success',
        title: 'Devices Assigned',
        message: `${selectedDevices.length} devices assigned to ${policy.name}`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Assignment Failed',
        message: 'Failed to assign devices to policy'
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredDevices = devices.filter(device =>
    device.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.assignedUser?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign Devices</h2>
            <p className="text-sm text-gray-600">Select devices to apply "{policy.name}" policy</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
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

          {/* Device List */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading devices...</div>
            ) : filteredDevices.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No devices found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredDevices.map(device => (
                  <div key={device.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedDevices.includes(device.id)}
                        onChange={() => handleDeviceToggle(device.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{device.hostname}</div>
                        <div className="text-sm text-gray-600">
                          {device.assignedUser?.fullName || 'Unassigned'} • {device.platform}
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${device.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {selectedDevices.length} of {devices.length} devices selected
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Assign Devices'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDevicesDialog;