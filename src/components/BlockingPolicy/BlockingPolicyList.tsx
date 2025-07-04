import React, { useState, useEffect } from 'react';
import { Plus, Shield, Search, Edit2, Trash2, Users, Globe, Settings } from 'lucide-react';
import { BlockingPolicy } from '../../types';
import { apiService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import PolicyDialog from '../Dialogs/PolicyDialog';
import AssignDevicesDialog from '../Dialogs/AssignDevicesDialog';
import ConfirmDialog from '../Dialogs/ConfirmDialog';
import { useTranslation } from '../../hooks/useTranslation'; // Import useTranslation

const BlockingPolicyList: React.FC = () => {
  const [policies, setPolicies] = useState<BlockingPolicy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<BlockingPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<BlockingPolicy | null>(null);
  const [policyToDelete, setPolicyToDelete] = useState<BlockingPolicy | null>(null);
  const { addNotification } = useNotification();
  const { t } = useTranslation(); // Use translation hook

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    filterPolicies();
  }, [policies, searchQuery]);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBlockingPolicies();
      setPolicies(data);
    } catch (error) {
      console.error('Failed to load policies:', error);
      addNotification({
        type: 'error',
        title: t('error'),
        message: t('failed_to_load_blocking_policies')
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPolicies = () => {
    let filtered = policies;

    if (searchQuery) {
      filtered = filtered.filter(policy =>
        policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPolicies(filtered);
  };

  const handleCreatePolicy = () => {
    setSelectedPolicy(null);
    setShowPolicyDialog(true);
  };

  const handleEditPolicy = (policy: BlockingPolicy) => {
    setSelectedPolicy(policy);
    setShowPolicyDialog(true);
  };

  const handleDeletePolicy = (policy: BlockingPolicy) => {
    setPolicyToDelete(policy);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!policyToDelete) return;

    try {
      await apiService.deleteBlockingPolicy(policyToDelete.id);
      setPolicies(prev => prev.filter(p => p.id !== policyToDelete.id));
      addNotification({
        type: 'success',
        title: t('policy_deleted'),
        message: t('policy_deleted_message', { policyName: policyToDelete.name })
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: t('delete_failed'),
        message: t('failed_to_delete_policy')
      });
    } finally {
      setShowConfirmDialog(false);
      setPolicyToDelete(null);
    }
  };

  const handleAssignDevices = (policy: BlockingPolicy) => {
    setSelectedPolicy(policy);
    setShowAssignDialog(true);
  };

  const handlePolicySaved = (policy: BlockingPolicy) => {
    if (selectedPolicy) {
      // Update existing policy
      setPolicies(prev => prev.map(p => p.id === policy.id ? policy : p));
    } else {
      // Add new policy
      setPolicies(prev => [...prev, policy]);
    }
    setShowPolicyDialog(false);
    setSelectedPolicy(null);
  };

  const togglePolicyStatus = async (policy: BlockingPolicy) => {
    try {
      const updatedPolicy = { ...policy, isActive: !policy.isActive };
      await apiService.updateBlockingPolicy(updatedPolicy);
      setPolicies(prev => prev.map(p => p.id === policy.id ? updatedPolicy : p));
      addNotification({
        type: 'success',
        title: t('policy_updated'),
        message: t('policy_status_updated', { policyName: policy.name, status: updatedPolicy.isActive ? t('activated') : t('deactivated') })
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: t('update_failed'),
        message: t('failed_to_update_policy_status')
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('blocking_policy')}</h1>
          <p className="text-gray-600">{t('manage_website_app_blocking_policies')}</p>
        </div>
        <button
          onClick={handleCreatePolicy}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('add_policy')}</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t('search_policies')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Policies List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredPolicies.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('no_policies_found')}</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? t('try_adjusting_search') : t('create_first_policy')}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreatePolicy}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('add_policy')}
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPolicies.map((policy) => (
              <div key={policy.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      policy.type === 'website' ? 'bg-blue-100' : 'bg-purple-100'
                    )}>
                      {policy.type === 'website' ? (
                        <Globe className={clsx('w-5 h-5', policy.type === 'website' ? 'text-blue-600' : 'text-purple-600')} />
                      ) : (
                        <Settings className={clsx('w-5 h-5', policy.type === 'website' ? 'text-blue-600' : 'text-purple-600')} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{policy.name}</h3>
                        <span className={clsx(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          policy.type === 'website' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        )}>
                          {policy.type}
                        </span>
                        <span className={clsx(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          policy.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        )}>
                          {policy.isActive ? t('active') : t('inactive')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>
                          {policy.type === 'website' 
                            ? t('x_websites', { count: policy.websites?.length || 0 })
                            : t('x_applications', { count: policy.applications?.length || 0 })}
                        </span>
                        <span>{t('x_devices_assigned', { count: policy.assignedDevices?.length || 0 })}</span>
                        <span>{t('updated')} {formatDistanceToNow(new Date(policy.updatedAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => togglePolicyStatus(policy)}
                      className={clsx(
                        'px-3 py-1 text-sm font-medium rounded-lg transition-colors',
                        policy.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      )}
                    >
                      {policy.isActive ? t('deactivate') : t('activate')}
                    </button>
                    
                    <button
                      onClick={() => handleAssignDevices(policy)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('assign_devices')}
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleEditPolicy(policy)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('edit_policy')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeletePolicy(policy)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('delete_policy')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {showPolicyDialog && (
        <PolicyDialog
          policy={selectedPolicy}
          onSave={handlePolicySaved}
          onClose={() => {
            setShowPolicyDialog(false);
            setSelectedPolicy(null);
          }}
        />
      )}

      {showAssignDialog && selectedPolicy && (
        <AssignDevicesDialog
          policy={selectedPolicy}
          onClose={() => {
            setShowAssignDialog(false);
            setSelectedPolicy(null);
          }}
          onSave={(updatedPolicy) => {
            setPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
            setShowAssignDialog(false);
          }}
        />
      )}

      {showConfirmDialog && policyToDelete && (
        <ConfirmDialog
          title={t('delete_policy_title')}
          message={t('delete_policy_confirm_message', { policyName: policyToDelete.name })}
          confirmText={t('delete')}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmDialog(false);
            setPolicyToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default BlockingPolicyList;