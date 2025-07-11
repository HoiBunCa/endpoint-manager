import React, { useState, useEffect } from 'react';
import { X, Monitor, Mouse, Keyboard, Maximize2, Minimize2 } from 'lucide-react';
import { Device } from '../../types';
import { apiService } from '../../services/apiService';
import { useNotification } from '../../contexts/NotificationContext';

interface RemoteControlProps {
  device: Device;
  onClose: () => void;
}

const RemoteControl: React.FC<RemoteControlProps> = ({ device, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected]);

  const connect = async () => {
    try {
      setConnecting(true);
      const success = await apiService.startRemoteControl(device.id);
      if (success) {
        setIsConnected(true);
        addNotification({
          type: 'success',
          title: 'Remote Control Connected',
          message: `Connected to ${device.hostname}`
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Failed to connect to remote device'
      });
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      await apiService.stopRemoteControl(device.id);
      setIsConnected(false);
      addNotification({
        type: 'info',
        title: 'Remote Control Disconnected',
        message: `Disconnected from ${device.hostname}`
      });
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 ${
      isFullscreen ? 'p-0' : 'p-4'
    }`}>
      <div className={`bg-white rounded-lg shadow-xl flex flex-col ${
        isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-5/6'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Monitor className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Remote Control</h2>
              <p className="text-sm text-gray-600">{device.hostname}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-gray-100"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Remote Screen */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center overflow-hidden">
          {!isConnected ? (
            <div className="text-center text-white">
              <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">Remote Control</h3>
              <p className="text-gray-400 mb-6">Connect to view and control {device.hostname}</p>
              <button
                onClick={connect}
                disabled={connecting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              {/* Simulated remote screen */}
              <div className="text-center text-white">
                <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                  <div className="text-center">
                    <Monitor className="w-20 h-20 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Remote Desktop</h3>
                    <p className="text-lg">Connected to {device.hostname}</p>
                    <p className="text-sm text-gray-300 mt-2">Simulated remote screen</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control Bar */}
        {isConnected && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connected</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mouse className="w-4 h-4" />
                <span>Mouse enabled</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Keyboard className="w-4 h-4" />
                <span>Keyboard enabled</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={disconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoteControl;