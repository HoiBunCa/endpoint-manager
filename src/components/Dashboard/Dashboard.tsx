import React, { useState, useEffect } from 'react';
import { Monitor, Users, Shield, AlertCircle, Activity, Eye } from 'lucide-react';
import { Device, DashboardStats } from '../../types';
import { apiService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import DevicesMap from '../Maps/DevicesMap';
import { clsx } from 'clsx';
import { useTranslation } from '../../hooks/useTranslation'; // Import useTranslation

// Helper function to safely format date distance
const safeFormatDistanceToNow = (dateString: string | undefined, addSuffix: boolean = true) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : formatDistanceToNow(date, { addSuffix });
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDevices, setRecentDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation(); // Use translation hook

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, recentOnlineDevices] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRecentOnlineDevices() // Call the new API for recent online devices
      ]);
      
      setStats(dashboardStats);
      setRecentDevices(recentOnlineDevices); // Set directly from API response
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceClick = (deviceId: string) => {
    navigate(`/device/${deviceId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: t('total_devices'),
      value: stats?.totalDevices || 0,
      icon: Monitor,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: t('online_devices'),
      value: stats?.onlineDevices || 0,
      icon: Activity,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: t('active_policies'),
      value: stats?.activePolicies || 0,
      icon: Shield,
      color: 'bg-purple-500',
      change: '+5%'
    },
    {
      title: t('pending_updates'),
      value: stats?.pendingUpdates || 0,
      icon: AlertCircle,
      color: 'bg-orange-500',
      change: '-3%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
        <p className="text-gray-600">{t('welcome_back_to_app')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className={clsx(
                    'text-sm mt-1',
                    card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  )}>
                    {t('with_change_from_last_month', { change: card.change })}
                  </p>
                </div>
                <div className={clsx('p-3 rounded-lg', card.color)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Online Devices */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('recent_online_devices')}</h2>
              <p className="text-sm text-gray-600">{t('latest_devices_online')}</p>
            </div>
            <div className="p-6">
              {recentDevices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{t('no_devices_found_dashboard')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDevices.map((device) => (
                    <div
                      key={device.id}
                      onClick={() => handleDeviceClick(device.id)}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{device.hostname}</h3>
                          <p className="text-sm text-gray-600">{device.platform}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{t('online')}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {safeFormatDistanceToNow(device.lastSeen)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate('/devices')}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{t('view_all_devices')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Devices Map */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{t('device_locations')}</h2>
              <p className="text-sm text-gray-600">{t('geographic_distribution')}</p>
            </div>
            <div className="p-6">
              <div className="h-64 rounded-lg overflow-hidden">
                <DevicesMap />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;