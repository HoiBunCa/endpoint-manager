import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { clsx } from 'clsx';

interface LockComputerDialogProps {
  onLock: (timeout: number) => void;
  onClose: () => void;
}

const LockComputerDialog: React.FC<LockComputerDialogProps> = ({ onLock, onClose }) => {
  const [selectedTimeout, setSelectedTimeout] = useState<number | 'custom'>(3600000); // Default to 1 hour (in ms)
  const [customTimeout, setCustomTimeout] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeoutOptions = [
    { label: '1 Hour', value: 3600000 },
    { label: '4 Hours', value: 14400000 },
    { label: '8 Hours', value: 28800000 },
    { label: '24 Hours', value: 86400000 },
  ];

  const handleLock = async () => {
    setIsSubmitting(true);
    let timeoutValue = 0;

    if (selectedTimeout === 'custom') {
      const customMs = parseInt(customTimeout) * 60 * 1000; // Convert minutes to milliseconds
      if (isNaN(customMs) || customMs <= 0) {
        alert('Please enter a valid custom timeout in minutes.');
        setIsSubmitting(false);
        return;
      }
      timeoutValue = customMs;
    } else {
      timeoutValue = selectedTimeout;
    }

    await onLock(timeoutValue);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lock Computer</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Lock Duration
            </label>
            <div className="grid grid-cols-2 gap-3">
              {timeoutOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedTimeout(option.value)}
                  className={clsx(
                    'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                    selectedTimeout === option.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedTimeout('custom')}
                className={clsx(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                  selectedTimeout === 'custom'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                )}
              >
                Custom
              </button>
            </div>
          </div>

          {selectedTimeout === 'custom' && (
            <div>
              <label htmlFor="custom-timeout" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Duration (minutes)
              </label>
              <input
                id="custom-timeout"
                type="number"
                value={customTimeout}
                onChange={(e) => setCustomTimeout(e.target.value)}
                placeholder="e.g., 60"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLock}
            disabled={isSubmitting || (selectedTimeout === 'custom' && (!customTimeout || parseInt(customTimeout) <= 0))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Locking...' : 'Lock Computer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockComputerDialog;