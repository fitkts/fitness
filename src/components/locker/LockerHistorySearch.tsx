import React, { useState, useEffect, useCallback } from 'react';
// 임시로 간단한 아이콘 컴포넌트 사용
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const FilterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
  </svg>
);
import { LockerHistory } from '../../types/lockerHistory';
import { LOCKER_ACTION_LABELS } from '../../config/lockerHistoryConfig';
import { formatDate } from '../../utils/lockerHistoryUtils';

interface SearchFilters {
  lockerId?: number;
  memberName?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

interface SearchResults {
  data: LockerHistory[];
  totalCount: number;
  totalPages: number;
}

const LockerHistorySearch: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    page: 1,
    pageSize: 20
  });
  
  const [results, setResults] = useState<SearchResults>({
    data: [],
    totalCount: 0,
    totalPages: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 실행 함수
  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const apiFilters: any = {
        page: searchFilters.page,
        pageSize: searchFilters.pageSize
      };

      if (searchFilters.lockerId) {
        apiFilters.lockerId = searchFilters.lockerId;
      }
      if (searchFilters.memberName?.trim()) {
        apiFilters.memberName = searchFilters.memberName.trim();
      }
      if (searchFilters.action && searchFilters.action !== 'all') {
        apiFilters.action = searchFilters.action;
      }
      if (searchFilters.startDate) {
        apiFilters.startDate = searchFilters.startDate;
      }
      if (searchFilters.endDate) {
        apiFilters.endDate = searchFilters.endDate;
      }

      const response = await window.api.getLockerHistory(apiFilters);
      
      if (response.success) {
        setResults(response.data);
      } else {
        setError(response.error || '데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
      console.error('검색 오류:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (key !== 'page') {
      newFilters.page = 1; // 다른 필터 변경 시 첫 페이지로
    }
    setFilters(newFilters);
    performSearch(newFilters);
  };

  // 검색 버튼 클릭
  const handleSearchClick = () => {
    performSearch(filters);
  };

  // Excel 내보내기
  const handleExportExcel = () => {
    console.log('Excel 내보내기:', results.data);
  };

  // 컴포넌트 마운트 시 초기 검색
  useEffect(() => {
    performSearch(filters);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* 검색 필터 섹션 */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <FilterIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">락커 사용 내역 검색</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 락커 번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              락커 번호
            </label>
            <input
              type="number"
              placeholder="예: 101"
              value={filters.lockerId || ''}
              onChange={(e) => handleFilterChange('lockerId', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 회원명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              회원명
            </label>
            <input
              type="text"
              placeholder="회원명 입력"
              value={filters.memberName || ''}
              onChange={(e) => handleFilterChange('memberName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 액션 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              액션 타입
            </label>
            <select
              value={filters.action || 'all'}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">전체</option>
              {Object.entries(LOCKER_ACTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* 시작 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작 날짜
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 검색 및 내보내기 버튼 */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSearchClick}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <SearchIcon className="h-4 w-4 mr-2" />
            {isLoading ? '검색중...' : '검색'}
          </button>
          
          <button
            onClick={handleExportExcel}
            disabled={results.data.length === 0}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Excel 내보내기
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* 검색 결과 정보 */}
      <div className="mb-4">
        <span className="text-sm text-gray-600">
          총 {results.totalCount}건 (페이지 {filters.page} / {results.totalPages || 1})
        </span>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* 검색 결과 테이블 */}
      {!isLoading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜/시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  락커 번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  회원명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상세 내용
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  처리자
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.data.map((history) => (
                <tr key={history.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(history.createdAt || '')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {history.lockerNumber || history.lockerId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {history.memberName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      history.action === 'assign' ? 'bg-green-100 text-green-800' :
                      history.action === 'release' ? 'bg-red-100 text-red-800' :
                      history.action === 'payment' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {LOCKER_ACTION_LABELS[history.action] || history.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {history.notes || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {history.staffName || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 데이터가 없을 때 */}
          {results.data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              검색 조건에 맞는 내역이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      {results.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={filters.page <= 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
            >
              이전
            </button>
            
            {Array.from({ length: Math.min(5, results.totalPages) }, (_, i) => {
              const pageNum = i + Math.max(1, filters.page - 2);
              if (pageNum > results.totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handleFilterChange('page', pageNum)}
                  className={`px-3 py-1 text-sm border rounded ${
                    pageNum === filters.page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handleFilterChange('page', Math.min(results.totalPages, filters.page + 1))}
              disabled={filters.page >= results.totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
            >
              다음
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default LockerHistorySearch; 