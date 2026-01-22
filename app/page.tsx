'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🌹 로즈헤어 미용실
            </h1>
            <p className="text-lg text-gray-600">
              환영합니다, {user?.name}님!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Link
              href="/members/add"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">👤</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  회원 등록
                </h2>
                <p className="text-gray-600">
                  새로운 회원을 등록합니다
                </p>
              </div>
            </Link>

            <Link
              href="/members/search"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  회원 검색
                </h2>
                <p className="text-gray-600">
                  회원 정보를 검색합니다
                </p>
              </div>
            </Link>

            <Link
              href="/sales"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <div className="text-5xl mb-4">💰</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  매출 조회
                </h2>
                <p className="text-gray-600">
                  날짜별 매출을 조회합니다
                </p>
              </div>
            </Link>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
