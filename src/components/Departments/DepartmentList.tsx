import React, { useState, useEffect } from 'react';
import { Plus, Building, Search, Edit2, Trash2, Users, Monitor } from 'lucide-react';
import { Department } from '../../types';
import { apiService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import DepartmentDialog from '../Dialogs/DepartmentDialog';
import ConfirmDialog from '../Dialogs/ConfirmDialog';

const DepartmentList: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    filterDepartments();
  }, [departments, searchQuery]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load departments'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDepartments = () => {
    let filtered = departments;

    if (searchQuery) {
      filtered = filtered.filter(department =>
        department.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDepartments(filtered);
  };

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setShowDepartmentDialog(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setShowDepartmentDialog(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setDepartmentToDelete(department);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      await apiService.deleteDepartment(departmentToDelete.id);
      setDepartments(prev => prev.filter(d => d.id !== departmentToDelete.id));
      addNotification({
        type: 'success',
        title: 'Department Deleted',
        message: `${departmentToDelete.name} has been deleted`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete the department'
      });
    } finally {
      setShowConfirmDialog(false);
      setDepartmentToDelete(null);
    }
  };

  const handleDepartmentSaved = (department: Department) => {
    if (selectedDepartment) {
      // Update existing department
      setDepartments(prev => prev.map(d => d.id === department.id ? department : d));
    } else {
      // Add new department
      setDepartments(prev => [...prev, department]);
    }
    setShowDepartmentDialog(false);
    setSelectedDepartment(null);
  };

  const handleDepartmentClick = (department: Department) => {
    navigate(`/user-management?department=${department.code}`);
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
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage organizational departments</p>
        </div>
        <button
          onClick={handleCreateDepartment}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <div
            key={department.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleDepartmentClick(department)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditDepartment(department);
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit department"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDepartment(department);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{department.name}</h3>
                <p className="text-sm text-gray-600 font-mono">{department.code}</p>
                <p className="text-sm text-gray-600 mt-2">{department.description}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{department.userCount} users</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Monitor className="w-4 h-4" />
                  <span>{department.deviceCount} devices</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDepartments.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Create your first department'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleCreateDepartment}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Add Department
            </button>
          )}
        </div>
      )}

      {/* Dialogs */}
      {showDepartmentDialog && (
        <DepartmentDialog
          department={selectedDepartment}
          onSave={handleDepartmentSaved}
          onClose={() => {
            setShowDepartmentDialog(false);
            setSelectedDepartment(null);
          }}
        />
      )}

      {showConfirmDialog && departmentToDelete && (
        <ConfirmDialog
          title="Delete Department"
          message={`Are you sure you want to delete "${departmentToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmDialog(false);
            setDepartmentToDelete(null);
          }}
        />
      )}
    </div>
  );
};

export default DepartmentList;