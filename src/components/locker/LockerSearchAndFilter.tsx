import React from 'react';
import { Search, Filter, X, Plus } from 'lucide-react';
import { FILTER_OPTIONS, SEARCH_CONFIG, SORT_OPTIONS } from '../../config/lockerConfig';

interface LockerSearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  layoutDirection: 'row' | 'column';
  onLayoutChange: (layout: 'row' | 'column') => void;
  onAddClick: () => void;
  totalCount?: number;
  filteredCount?: number;
}

const LockerSearchAndFilter: React.FC<LockerSearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  layoutDirection,
  onLayoutChange,
  onAddClick,
  totalCount = 0,
  filteredCount = 0
}) => {
  // 필터 초기화 함수
  const handleReset = () => {
    onSearchChange('');
    onFilterChange('all');
    onSortChange('number_asc');
    onLayoutChange('row');
  };

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm && searchTerm.trim() !== '') count++;
    if (filter && filter !== 'all') count++;
    if (sortBy && sortBy !== 'number_asc') count++;
    if (layoutDirection && layoutDirection !== 'row') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">락커 관리</h1>
          {totalCount > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600">
                총 {totalCount}개
              </span>
              {filteredCount !== totalCount && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {filteredCount}개 표시 중
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onAddClick}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus size={18} className="mr-2" />
          락커 추가
        </button>
      </div>

      {/* 검색 및 필터 섹션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
        {/* 헤더 */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">락커 검색 및 필터</h3>
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {activeFilterCount}개 필터 적용됨
                </span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={14} />
                초기화
              </button>
            )}
          </div>
        </div>

        {/* 필터 컨텐츠 */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 검색 박스 */}
            <div className="lg:col-span-2">
              <label htmlFor="search-input" className="block text-xs font-medium text-gray-700 mb-1">
                락커 번호 검색
              </label>
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  placeholder={SEARCH_CONFIG.PLACEHOLDER}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>

            {/* 상태 필터 */}
            <div>
              <label htmlFor="status-filter" className="block text-xs font-medium text-gray-700 mb-1">
                락커 상태
              </label>
              <select
                id="status-filter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filter}
                onChange={(e) => onFilterChange(e.target.value)}
              >
                {FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 정렬 방식 */}
            <div>
              <label htmlFor="sort-select" className="block text-xs font-medium text-gray-700 mb-1">
                정렬 방식
              </label>
              <select
                id="sort-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 레이아웃 설정 - 별도 행으로 분리 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  표시 방식
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onLayoutChange('row')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      layoutDirection === 'row'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    가로 배치
                  </button>
                  <button
                    onClick={() => onLayoutChange('column')}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      layoutDirection === 'column'
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    세로 배치
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockerSearchAndFilter; 