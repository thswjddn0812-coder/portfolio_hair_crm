'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { membersAPI, visitRecordsAPI } from '@/lib/api';
import Link from 'next/link';

interface Member {
  id: number;
  name: string;
  phone: string | null;
  totalVisits: number | null;
  createAt: string | null;
}

interface VisitRecord {
  id: number;
  memberId: number | null;
  treatment: string | null;
  price: number | null;
  visitedAt: string | null;
  memo: string | null;
}

export default function SearchMemberPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedMemberId, setExpandedMemberId] = useState<number | null>(null);
  const [viewingRecordsMemberId, setViewingRecordsMemberId] = useState<number | null>(null);
  const [visitRecords, setVisitRecords] = useState<VisitRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [visitRecord, setVisitRecord] = useState<{
    memberId: number;
    treatment: string;
    price: string;
    memo: string;
    visited_at: string;
  } | null>(null);
  const [savingVisit, setSavingVisit] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await membersAPI.search(
        name.trim() || undefined,
        phone.trim() || undefined
      );
      setMembers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || '회원 검색에 실패했습니다.');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setName('');
    setPhone('');
    setMembers([]);
    setError('');
    setExpandedMemberId(null);
    setVisitRecord(null);
    setViewingRecordsMemberId(null);
    setVisitRecords([]);
  };

  const handleViewRecords = async (memberId: number) => {
    if (viewingRecordsMemberId === memberId) {
      setViewingRecordsMemberId(null);
      setVisitRecords([]);
      return;
    }

    setLoadingRecords(true);
    setError('');

    try {
      const records = await visitRecordsAPI.getByMemberId(memberId);
      setVisitRecords(records);
      setViewingRecordsMemberId(memberId);
    } catch (err: any) {
      setError(err.response?.data?.message || '방문 기록 조회에 실패했습니다.');
      setVisitRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleExpandMember = (memberId: number) => {
    setExpandedMemberId(expandedMemberId === memberId ? null : memberId);
    if (expandedMemberId !== memberId) {
      setVisitRecord({
        memberId,
        treatment: '',
        price: '',
        memo: '',
        visited_at: '',
      });
    } else {
      setVisitRecord(null);
    }
  };

  const handleSaveVisitRecord = async (e: React.FormEvent) => {
    if (!visitRecord) return;

    e.preventDefault();
    setSavingVisit(true);
    setError('');

    try {
      await visitRecordsAPI.create(visitRecord.memberId, {
        treatment: visitRecord.treatment,
        price: visitRecord.price ? parseInt(visitRecord.price) : undefined,
        memo: visitRecord.memo || undefined,
        visited_at: visitRecord.visited_at || undefined,
      });

      // 회원 목록 새로고침
      const data = await membersAPI.search(
        name.trim() || undefined,
        phone.trim() || undefined
      );
      setMembers(data);

      // 방문 기록 목록도 새로고침
      if (viewingRecordsMemberId === visitRecord.memberId) {
        const records = await visitRecordsAPI.getByMemberId(visitRecord.memberId);
        setVisitRecords(records);
      }

      // 폼 초기화
      setVisitRecord({
        memberId: visitRecord.memberId,
        treatment: '',
        price: '',
        memo: '',
        visited_at: '',
      });

      alert('방문 기록이 등록되었습니다!');
    } catch (err: any) {
      setError(err.response?.data?.message || '방문 기록 등록에 실패했습니다.');
    } finally {
      setSavingVisit(false);
    }
  };

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
        <div className="max-w-4xl mx-auto">
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
              회원 검색
            </h1>

            {error && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="searchName" className="block text-sm font-medium text-gray-700 mb-2">
                    이름으로 검색
                  </label>
                  <input
                    id="searchName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                    placeholder="이름을 입력하세요"
                  />
                </div>

                <div>
                  <label htmlFor="searchPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호로 검색
                  </label>
                  <input
                    id="searchPhone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                    placeholder="전화번호를 입력하세요"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || (!name.trim() && !phone.trim())}
                  className="flex-1 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? '검색 중...' : '검색'}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  초기화
                </button>
              </div>
            </form>
          </div>

          {members.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                검색 결과 ({members.length}명)
              </h2>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="border border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-pink-50 p-4 flex justify-between items-center">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-900">
                        <div>
                          <span className="font-semibold">이름: </span>
                          <span>{member.name}</span>
                        </div>
                        <div>
                          <span className="font-semibold">전화번호: </span>
                          <span>{member.phone || '-'}</span>
                        </div>
                        <div>
                          <span className="font-semibold">총 방문 횟수: </span>
                          <span>{member.totalVisits || 0}회</span>
                        </div>
                        <div>
                          <span className="font-semibold">가입일: </span>
                          <span>
                            {member.createAt
                              ? new Date(member.createAt).toLocaleDateString('ko-KR')
                              : '-'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleViewRecords(member.id)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                          disabled={loadingRecords}
                        >
                          {loadingRecords && viewingRecordsMemberId === member.id
                            ? '로딩 중...'
                            : viewingRecordsMemberId === member.id
                            ? '기록 숨기기'
                            : '기록 보기'}
                        </button>
                        <button
                          onClick={() => handleExpandMember(member.id)}
                          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm font-semibold"
                        >
                          {expandedMemberId === member.id ? '접기' : '기록 입력'}
                        </button>
                      </div>
                    </div>

                    {viewingRecordsMemberId === member.id && (
                      <div className="p-6 bg-blue-50 border-t border-gray-300">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          방문 기록 목록
                        </h3>
                        {visitRecords.length === 0 ? (
                          <p className="text-gray-600 text-center py-4">
                            방문 기록이 없습니다.
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-blue-100">
                                  <th className="border border-gray-300 px-4 py-3 text-left text-gray-900">날짜</th>
                                  <th className="border border-gray-300 px-4 py-3 text-left text-gray-900">시술 내용</th>
                                  <th className="border border-gray-300 px-4 py-3 text-left text-gray-900">가격</th>
                                  <th className="border border-gray-300 px-4 py-3 text-left text-gray-900">메모</th>
                                </tr>
                              </thead>
                              <tbody>
                                {visitRecords.map((record) => (
                                  <tr key={record.id} className="hover:bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-3 text-gray-900">
                                      {record.visitedAt
                                        ? new Date(record.visitedAt).toLocaleString('ko-KR', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        : '-'}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-gray-900">
                                      {record.treatment || '-'}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-gray-900">
                                      {record.price ? `${record.price.toLocaleString()}원` : '-'}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-gray-900">
                                      {record.memo || '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {expandedMemberId === member.id && visitRecord?.memberId === member.id && (
                      <div className="p-6 bg-gray-50 border-t border-gray-300">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          방문 기록 입력
                        </h3>
                        <form onSubmit={handleSaveVisitRecord} className="space-y-4">
                          <div>
                            <label htmlFor={`treatment-${member.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                              시술 내용 <span className="text-red-500">*</span>
                            </label>
                            <input
                              id={`treatment-${member.id}`}
                              type="text"
                              value={visitRecord.treatment}
                              onChange={(e) =>
                                setVisitRecord({ ...visitRecord, treatment: e.target.value })
                              }
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                              placeholder="예: 커트, 펌, 전체염색 등"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor={`price-${member.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                                가격 (원) <span className="text-gray-500">(선택사항)</span>
                              </label>
                              <input
                                id={`price-${member.id}`}
                                type="number"
                                min="0"
                                value={visitRecord.price}
                                onChange={(e) =>
                                  setVisitRecord({ ...visitRecord, price: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                                placeholder="가격을 입력하세요"
                              />
                            </div>

                            <div>
                              <label htmlFor={`visited_at-${member.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                                방문 날짜 <span className="text-gray-500">(선택사항)</span>
                              </label>
                              <input
                                id={`visited_at-${member.id}`}
                                type="datetime-local"
                                value={visitRecord.visited_at}
                                onChange={(e) =>
                                  setVisitRecord({ ...visitRecord, visited_at: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor={`memo-${member.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                              메모 <span className="text-gray-500">(선택사항)</span>
                            </label>
                            <textarea
                              id={`memo-${member.id}`}
                              value={visitRecord.memo}
                              onChange={(e) =>
                                setVisitRecord({ ...visitRecord, memo: e.target.value })
                              }
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                              placeholder="예: 약간 짧게 원하심, 영양 추가함 등"
                            />
                          </div>

                          <div className="flex gap-4">
                            <button
                              type="submit"
                              disabled={savingVisit || !visitRecord.treatment.trim()}
                              className="flex-1 py-2 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {savingVisit ? '저장 중...' : '저장'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setVisitRecord({
                                  memberId: member.id,
                                  treatment: '',
                                  price: '',
                                  memo: '',
                                  visited_at: '',
                                });
                              }}
                              className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                              초기화
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {members.length === 0 && !loading && (name || phone) && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-600">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
