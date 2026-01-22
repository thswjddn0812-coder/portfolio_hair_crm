'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { visitRecordsAPI } from '@/lib/api';
import Link from 'next/link';

interface VisitRecord {
  id: number;
  memberId: number | null;
  treatment: string | null;
  price: number | null;
  visitedAt: string | null;
  memo: string | null;
}

export default function SalesPage() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [records, setRecords] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // 오늘 날짜를 기본값으로 설정
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    handleDateChange(today);
  }, []);

  const handleDateChange = async (date: string) => {
    if (!date) return;

    setLoading(true);
    setError('');
    setRecords([]);

    try {
      const data = await visitRecordsAPI.getByDate(date);
      setRecords(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '매출 조회에 실패했습니다.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const totalSales = records.reduce((sum, record) => sum + (record.price || 0), 0);
  const recordCount = records.length;

  if (authLoading) {
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="text-pink-500 hover:text-pink-600 font-semibold"
            >
              ← 홈으로
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              💰 매출 조회
            </h1>

            <div className="mb-6">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                날짜 선택
              </label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  handleDateChange(e.target.value);
                }}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <div className="text-xl text-gray-600">로딩 중...</div>
              </div>
            )}

            {!loading && selectedDate && (
              <div className="mt-6">
                <div className="bg-pink-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">선택한 날짜</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {new Date(selectedDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">총 매출</p>
                      <p className="text-2xl font-bold text-pink-600">
                        {totalSales.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      총 방문 건수: <span className="font-semibold text-gray-900">{recordCount}건</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!loading && records.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                방문 기록 ({records.length}건)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-pink-100">
                      <th className="border border-gray-300 px-4 py-3 text-left text-gray-900">시간</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-gray-900">시술 내용</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-gray-900">가격</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-gray-900">메모</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-gray-900">
                          {record.visitedAt
                            ? new Date(record.visitedAt).toLocaleTimeString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900">
                          {record.treatment || '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900 font-semibold">
                          {record.price ? `${record.price.toLocaleString()}원` : '-'}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-900">
                          {record.memo || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-pink-50 font-bold">
                      <td colSpan={2} className="border border-gray-300 px-4 py-3 text-right text-gray-900">
                        합계
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-900">
                        {totalSales.toLocaleString()}원
                      </td>
                      <td className="border border-gray-300 px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {!loading && selectedDate && records.length === 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-600 text-lg">
                선택한 날짜에 방문 기록이 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
