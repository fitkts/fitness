import React from 'react';
import { Search, Filter, X, Plus } from 'lucide-react';
import { FILTER_OPTIONS, SEARCH_CONFIG, SORT_OPTIONS, COMPACT_LAYOUT_CONFIG, ACTION_BUTTON_CONFIG } from '../../config/lockerConfig';

interface LockerSearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  layoutDirection: 'row' | 'column';
  onLayoutChange: (layout: 'row' | 'column') => void;
  onReset: () => void;
  onAddLocker?: () => void;
  showActionButtons?: boolean;
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
  onReset,
  onAddLocker,
  showActionButtons = false
}) => {
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
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.padding} overflow-hidden sticky top-4 z-20`}
      data-testid="locker-search-filter-container"
    >
      {/* 헤더 */}
      <div className={`${COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.headerPadding} bg-gray-50 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter size={COMPACT_LAYOUT_CONFIG.HEADER.icon} className="text-gray-600" />
            <h3 className={COMPACT_LAYOUT_CONFIG.HEADER.title}>락커 검색 및 필터</h3>
            {activeFilterCount > 0 && (
              <span className={`bg-blue-100 text-blue-800 ${COMPACT_LAYOUT_CONFIG.HEADER.badge} font-medium px-1.5 py-0.5 rounded-full`}>
                {activeFilterCount}개
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* 필터 초기화 버튼 */}
            {activeFilterCount > 0 && (
              <button
                onClick={onReset}
                className="flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={10} />
                초기화
              </button>
            )}
            
            {/* 액션 버튼들 */}
            {showActionButtons && (
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-300">
                {/* 락커 추가 버튼 */}
                {onAddLocker && (
                  <button
                    onClick={onAddLocker}
                    className={`${ACTION_BUTTON_CONFIG.base} ${ACTION_BUTTON_CONFIG.primary}`}
                  >
                    <Plus size={12} className="mr-1" />
                    락커 추가
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 필터 컨텐츠 */}
      <div className={COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.contentPadding}>
        <div className={`${COMPACT_LAYOUT_CONFIG.GRID.responsive} ${COMPACT_LAYOUT_CONFIG.GRID.gap}`}>
          {/* 검색 박스 */}
          <div>
            <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
              검색
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="락커번호, 회원명..."
                className={`w-full pl-7 pr-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <Search
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={12}
              />
            </div>
          </div>

          {/* 상태 필터 */}
          <div>
            <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
              상태
            </label>
            <select
              className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
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
            <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
              정렬
            </label>
            <select
              className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label.split(' (')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* 표시 방식 */}
          <div>
            <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
              배치
            </label>
            <select
              className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={layoutDirection}
              onChange={(e) => onLayoutChange(e.target.value as 'row' | 'column')}
            >
              <option value="row">가로</option>
              <option value="column">세로</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockerSearchAndFilter; 