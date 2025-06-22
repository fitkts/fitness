import React from 'react';
import { Filter, X } from 'lucide-react';
import { COMMON_FILTER_LAYOUT, getActiveFilterCount } from '../../config/commonFilterConfig';

interface BaseFilterProps {
  title: string;
  filter: Record<string, any>;
  onReset: () => void;
  children: React.ReactNode;
  actionButtons?: React.ReactNode;
  gridColumns?: 4 | 6;
  excludeFromCount?: string[];
  className?: string;
}

/**
 * 모든 페이지 필터의 베이스 컴포넌트
 * 일관된 레이아웃과 스타일을 제공
 */
const BaseFilter: React.FC<BaseFilterProps> = ({
  title,
  filter,
  onReset,
  children,
  actionButtons,
  gridColumns = 4,
  excludeFromCount = ['search'],
  className = '',
}) => {
  const activeFilterCount = getActiveFilterCount(filter, excludeFromCount);
  const hasActiveFilters = activeFilterCount > 0;

  const gridClass = gridColumns === 6 
    ? COMMON_FILTER_LAYOUT.CONTENT.gridCols6 
    : COMMON_FILTER_LAYOUT.CONTENT.gridCols4;

  return (
    <div className={`${COMMON_FILTER_LAYOUT.CONTAINER.className} ${className}`}>
      {/* 헤더 */}
      <div className={COMMON_FILTER_LAYOUT.HEADER.wrapper}>
        <div className={COMMON_FILTER_LAYOUT.HEADER.leftSection}>
          <h3 className={COMMON_FILTER_LAYOUT.HEADER.title}>
            <Filter className={COMMON_FILTER_LAYOUT.HEADER.titleIcon} />
            {title}
          </h3>
          {hasActiveFilters && (
            <span className={COMMON_FILTER_LAYOUT.HEADER.badge}>
              {activeFilterCount}개 필터 적용됨
            </span>
          )}
        </div>
        
        <div className={COMMON_FILTER_LAYOUT.HEADER.rightSection}>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors"
            >
              <X size={14} className="mr-1" />
              초기화
            </button>
          )}
          {actionButtons}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className={COMMON_FILTER_LAYOUT.CONTENT.wrapper}>
        <div className={`${COMMON_FILTER_LAYOUT.CONTENT.grid} ${gridClass}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseFilter; 