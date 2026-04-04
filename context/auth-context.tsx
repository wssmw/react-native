import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { UserInfo, userApi } from '@/request/api';
import { tokenManager } from '@/request/core';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  login: (user: UserInfo) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (nextUser: UserInfo) => {
    setIsLoggedIn(true);
    setUser(nextUser);
    setIsLoading(false);
  };

  const checkAuth = async () => {
    try {
      const tokens = await tokenManager.getTokens();
      console.log('检查 token 状态:', tokens);

      if (tokens && tokens.accessToken) {
        console.log('=== token 存在，已登录 ===');
        setIsLoggedIn(true);

        try {
          const meResponse = await userApi.getMe();
          if (meResponse.success) {
            setUser(meResponse.data);
          }
        } catch (error) {
          console.log('获取当前用户信息失败');
        }
      } else {
        console.log('=== token 不存在，未登录 ===');
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await tokenManager.clearTokens();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isLoading, user, setUser, login, checkAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
