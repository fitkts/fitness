import React from 'react';
import { Search, Plus, ArrowUpDown, LayoutGrid } from 'lucide-react';
import { FILTER_OPTIONS, SEARCH_CONFIG, SORT_OPTIONS, LAYOUT_OPTIONS } from '../../config/lockerConfig';

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
  return (
    <div className="space-y-4">
      {/* 타이틀과 통계 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">락커 관리</h1>
          {totalCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              전체 {totalCount}개 
              {filteredCount !== totalCount && (
                <span> / 필터링됨 {filteredCount}개</span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={onAddClick}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          락커 추가
        </button>
      </div>

      {/* 검색 및 필터링 */}
      <div className="flex flex-wrap gap-4">
        {/* 검색 입력 */}
        <div className="flex-1 min-w-[280px]">
          <div className="relative">
            <input
              type="text"
              placeholder={SEARCH_CONFIG.PLACEHOLDER}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input w-full pl-10"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* 상태 필터 */}
        <div className="min-w-[120px]">
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="select w-full"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 정렬 방식 */}
        <div className="min-w-[200px]">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="select w-full pl-8"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ArrowUpDown
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>

        {/* 레이아웃 방향 */}
        <div className="min-w-[160px]">
          <div className="relative">
            <select
              value={layoutDirection}
              onChange={(e) => onLayoutChange(e.target.value as 'row' | 'column')}
              className="select w-full pl-8"
            >
              {LAYOUT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <LayoutGrid
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockerSearchAndFilter; 