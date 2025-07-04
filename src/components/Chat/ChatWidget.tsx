import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { ChatMessage } from '../../types';
import { apiService } from '../../services/apiService';
import { formatDistanceToNow } from 'date-fns';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  useEffect(() => {
    loadRecentMessages();
  }, []);

  const loadRecentMessages = async () => {
    try {
      const data = await apiService.getChatMessages();
      setMessages(data);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedDeviceId) return;

    try {
      const message = await apiService.sendChatMessage(selectedDeviceId, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Group messages by device
  const messagesByDevice = messages.reduce((acc, msg) => {
    if (!acc[msg.deviceId]) {
      acc[msg.deviceId] = [];
    }
    acc[msg.deviceId].push(msg);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Device Chat</h3>
            <p className="text-sm text-gray-600">Chat with connected devices</p>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col">
            {!selectedDeviceId ? (
              /* Device List */
              <div className="flex-1 p-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Select a device to chat</h4>
                {Object.keys(messagesByDevice).map(deviceId => {
                  const deviceMessages = messagesByDevice[deviceId];
                  const lastMessage = deviceMessages[deviceMessages.length - 1];
                  const unreadCount = deviceMessages.filter(m => !m.isRead && m.sender === 'device').length;
                  
                  return (
                    <button
                      key={deviceId}
                      onClick={() => setSelectedDeviceId(deviceId)}
                      className="w-full p-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Device {deviceId}</div>
                          <div className="text-sm text-gray-600 truncate">
                            {lastMessage.message}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })}
                          </div>
                        </div>
                        {unreadCount > 0 && (
                          <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
                {Object.keys(messagesByDevice).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No conversations yet</p>
                )}
              </div>
            ) : (
              /* Chat Messages */
              <>
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                  <button
                    onClick={() => setSelectedDeviceId(null)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ← Back
                  </button>
                  <span className="text-sm font-medium">Device {selectedDeviceId}</span>
                </div>
                
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {messagesByDevice[selectedDeviceId]?.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;