import React, { useState, useEffect } from 'react';
import { Plus, User, Search, Filter, Edit2, Trash2, Monitor, UserPlus } from 'lucide-react';
import { User as UserType, Department, Device } from '../../types';
import { apiService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import UserDialog from '../Dialogs/UserDialog';
import AssignDeviceDialog from '../Dialogs/AssignDeviceDialog';
import ConfirmDialog from '../Dialogs/ConfirmDialog';

// Helper function to safely format date distance
const safeFormatDistanceToNow = (dateString: string | undefined, addSuffix: boolean = true) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? 'N/A' : formatDistanceToNow(date, { addSuffix });
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, departmentFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, departmentsData, devicesData] = await Promise.all([
        apiService.getUsers(),
        apiService.getDepartments(),
        apiService.getDevices()
      ]);
      setUsers(usersData);
      setDepartments(departmentsData);
      setDevices(devicesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load user management data'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter(user => user.department === departmentFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserDialog(true);
  };

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleDeleteUser = (user: UserType) => {
    setUserToDelete(user);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await apiService.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      addNotification({
        type: 'success',
        title: 'User Deleted',
        message: `${userToDelete.fullName} has been deleted`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete the user'
      });
    } finally {
      setShowConfirmDialog(false);
      setUserToDelete(null);
    }
  };

  const handleUserSaved = (user: UserType) => {
    if (selectedUser) {
      // Update existing user
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    } else {
      // Add new user
      setUsers(prev => [...prev, user]);
    }
    setShowUserDialog(false);
    setSelectedUser(null);
  };

  const handleAssignDevice = (user: UserType) => {
    setSelectedUser(user);
    setShowAssignDialog(true);
  };

  const getUserDevices = (userId: string) => {
    return devices.filter(device => device.assignedUser?.id === userId);
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users and device assignments</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.code}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devices</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => {
                const userDevices = getUserDevices(user.id);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Monitor className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{userDevices.length}</span>
                        <button
                          onClick={() => handleAssignDevice(user)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Manage
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {safeFormatDistanceToNow(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 font-medium"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || departmentFilter ? 'Try adjusting your search or filter criteria' : 'Create your first user'}
          </p>
          {!searchQuery && !departmentFilter && (
            <button
              onClick={handleCreateUser}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add User
            </button>
          )}
        </div>
      )}

      {/* Dialogs */}
      {showUserDialog && (
        <UserDialog
          user={selectedUser}
          departments={departments}
          onSave={handleUserSaved}
          onClose={() => {
            setShowUserDialog(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showAssignDialog && selectedUser && (
        <AssignDeviceDialog
          user={selectedUser}
          devices={devices}
          onClose={() => {
            setShowAssignDialog(false);
            setSelectedUser(null);
          }}
          onSave={() => {
            loadData(); // Reload data to get updated device assignments
            setShowAssignDialog(false);
          }}
        />
      )}

      {showConfirmDialog && userToDelete && (
        <ConfirmDialog
          title="Delete User"
          message={`Are you sure you want to delete "${userToDelete.fullName}"? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmDialog(false);
            setUserToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;