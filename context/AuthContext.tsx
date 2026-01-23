'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

interface User {
  id: number;
  username: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 페이지 로드 시 쿠키에 있는 토큰으로 프로필 가져오기
    const checkAuth = async () => {
      try {
        const profile = await authAPI.getProfile();
        setUser(profile);
      } catch (error: any) {
        // 401 에러는 정상적인 경우 (로그인하지 않은 상태)
        // 네트워크 에러나 타임아웃도 정상적으로 처리
        console.log('Auth check failed:', error?.message || 'Unknown error');
        setUser(null);
      } finally {
        // 항상 loading을 false로 설정하여 무한 로딩 방지
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    await authAPI.login(username, password);
    // 로그인 성공 후 쿠키가 설정될 때까지 약간의 딜레이
    // 프로필 가져오기
    try {
      const profile = await authAPI.getProfile();
      setUser(profile);
    } catch (error) {
      // 프로필 가져오기 실패 시 에러 던지기
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // 로그아웃 실패해도 클라이언트 상태는 초기화
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
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
