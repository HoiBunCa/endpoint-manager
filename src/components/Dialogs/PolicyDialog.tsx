import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { BlockingPolicy } from '../../types';
import { apiService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';

interface PolicyDialogProps {
  policy: BlockingPolicy | null;
  onSave: (policy: BlockingPolicy) => void;
  onClose: () => void;
}

const PolicyDialog: React.FC<PolicyDialogProps> = ({ policy, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'website' as 'website' | 'application',
    description: '',
    isActive: true,
    websites: [''],
    applications: ['']
  });
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (policy) {
      setFormData({
        name: policy.name,
        type: policy.type,
        description: policy.description,
        isActive: policy.isActive,
        websites: policy.websites || [''],
        applications: policy.applications || ['']
      });
    }
  }, [policy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const policyData = {
        ...formData,
        websites: formData.type === 'website' ? formData.websites.filter(w => w.trim()) : undefined,
        applications: formData.type === 'application' ? formData.applications.filter(a => a.trim()) : undefined,
        assignedDevices: policy?.assignedDevices || []
      };

      let savedPolicy: BlockingPolicy;
      if (policy) {
        savedPolicy = await apiService.updateBlockingPolicy({ ...policy, ...policyData });
      } else {
        savedPolicy = await apiService.createBlockingPolicy(policyData);
      }

      onSave(savedPolicy);
      addNotification({
        type: 'success',
        title: policy ? 'Policy Updated' : 'Policy Created',
        message: `${formData.name} has been ${policy ? 'updated' : 'created'} successfully`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save the policy'
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = (type: 'websites' | 'applications') => {
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], '']
    }));
  };

  const removeItem = (type: 'websites' | 'applications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const updateItem = (type: 'websites' | 'applications', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {policy ? 'Edit Policy' : 'Create New Policy'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter policy name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'website' | 'application' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="website">Website Blocking</option>
                  <option value="application">Application Blocking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter policy description"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active policy
                </label>
              </div>
            </div>

            {/* Website/Application List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  {formData.type === 'website' ? 'Blocked Websites' : 'Blocked Applications'}
                </label>
                <button
                  type="button"
                  onClick={() => addItem(formData.type === 'website' ? 'websites' : 'applications')}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-2">
                {(formData.type === 'website' ? formData.websites : formData.applications).map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateItem(
                        formData.type === 'website' ? 'websites' : 'applications',
                        index,
                        e.target.value
                      )}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={
                        formData.type === 'website' 
                          ? 'e.g., facebook.com' 
                          : 'e.g., steam.exe'
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(
                        formData.type === 'website' ? 'websites' : 'applications',
                        index
                      )}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {(formData.type === 'website' ? formData.websites : formData.applications).length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  No {formData.type === 'website' ? 'websites' : 'applications'} added yet. Click "Add" to start.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : policy ? 'Update Policy' : 'Create Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyDialog;