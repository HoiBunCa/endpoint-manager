import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('endpoint-manager-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('https://endpoint-manager-api.tcgroup.vn/api/auth/login/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
          'Content-Type': 'application/json',
          'Origin': 'https://endpoint-manager.tcgroup.vn',
          'Referer': 'https://endpoint-manager.tcgroup.vn/',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json(); // data will be { refresh, access, name }
        
        // Construct User object from available data and defaults
        const userData: User = {
          id: Date.now().toString(), // Generate a client-side ID as API doesn't provide one in this format
          username: data.name || username, // Use name from API response, fallback to input username
          email: `${data.name || username}@example.com`, // Mock email as API doesn't provide it
          fullName: data.name || username, // Use name from API response, fallback to input username
          department: 'General', // Default department
          role: 'user', // Default role
          createdAt: new Date().toISOString(), // Generate creation date
          lastLogin: new Date().toISOString(),
          token: data.access // Store the access token
        };
        
        setUser(userData);
        localStorage.setItem('endpoint-manager-user', JSON.stringify(userData));
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call (still mocked as no API was provided for register)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock registration
      const userData: User = {
        id: Date.now().toString(),
        username,
        email,
        fullName: username,
        department: 'General',
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      setUser(userData);
      localStorage.setItem('endpoint-manager-user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('endpoint-manager-user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};