import React, { useMemo } from 'react';
import { Filter, ChevronLeft, ChevronRight, X, Settings, RefreshCw } from 'lucide-react';
import { ViewType, PaymentStatusFilter } from '../types/statistics';
import { createDynamicQuickDateRanges } from '../utils/dynamicDateUtils';
import {
  FILTER_GRID_CONFIG,
  FILTER_LAYOUT_CONFIG,
  INPUT_FIELD_CONFIG,
  QUICK_DATE_CONFIG,
  DATE_RANGE_CONFIG,
  VIEW_TYPE_OPTIONS,
  STATUS_FILTER_OPTIONS,
  FILTER_LABELS,
  ACTION_BUTTON_CONFIG,
} from '../config/statisticsFilterConfig';

interface FilterPanelProps {
  startDate: string;
  endDate: string;
  viewType: ViewType;
  statusFilter: PaymentStatusFilter;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onViewTypeChange: (viewType: ViewType) => void;
  onStatusFilterChange: (status: PaymentStatusFilter) => void;
  onQuickDateRange: (rangeGetter: () => { start: string; end: string }) => void;
  // 헤더 액션 버튼들
  onReset?: () => void;
  onCardEdit?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  startDate,
  endDate,
  viewType,
  statusFilter,
  onStartDateChange,
  onEndDateChange,
  onViewTypeChange,
  onStatusFilterChange,
  onQuickDateRange,
  onReset,
  onCardEdit,
  onRefresh,
  isLoading = false,
}) => {
  // 동적 날짜 범위 생성
  const quickDateRanges = useMemo(() => {
    return createDynamicQuickDateRanges(startDate);
  }, [startDate]);

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    
    // viewType이 기본값(monthly)이 아닌 경우
    if (viewType !== 'monthly') count++;
    
    // statusFilter가 기본값(전체)이 아닌 경우
    if (statusFilter !== '전체') count++;
    
    // 날짜 범위가 기본값(이번 달 첫째 날 ~ 오늘)이 아닌 경우
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // formatLocalDate 함수 (Statistics 페이지와 동일한 로직)
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const defaultStart = formatLocalDate(firstDayOfMonth);
    const defaultEnd = formatLocalDate(today);
    
    if (startDate !== defaultStart || endDate !== defaultEnd) count++;
    
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div 
      className={`${FILTER_LAYOUT_CONFIG.CONTAINER.className} ${FILTER_LAYOUT_CONFIG.CONTAINER.padding}`}
      data-testid="filter-panel-container"
    >
      {/* 헤더 */}
      <div 
        className={FILTER_LAYOUT_CONFIG.HEADER.className}
        data-testid="filter-panel-header"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter 
              size={FILTER_LAYOUT_CONFIG.HEADER.icon} 
              className="text-gray-600" 
              data-testid="filter-icon"
            />
            <h3 className={FILTER_LAYOUT_CONFIG.HEADER.title}>통계 필터</h3>
            {activeFilterCount > 0 && (
              <span className={`bg-blue-100 text-blue-800 ${FILTER_LAYOUT_CONFIG.HEADER.badge} font-medium px-1.5 py-0.5 rounded-full`}>
                {activeFilterCount}개
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* 필터 초기화 버튼 */}
            {activeFilterCount > 0 && onReset && (
              <button
                onClick={onReset}
                className={ACTION_BUTTON_CONFIG.RESET_BUTTON.className}
                data-testid="reset-filter-button"
              >
                <X size={ACTION_BUTTON_CONFIG.RESET_BUTTON.iconSize} />
                초기화
              </button>
            )}

            {/* 카드 편집 버튼 */}
            {onCardEdit && (
              <button
                onClick={onCardEdit}
                className={ACTION_BUTTON_CONFIG.CARD_EDIT_BUTTON.className}
                data-testid="card-edit-button"
              >
                <Settings size={ACTION_BUTTON_CONFIG.CARD_EDIT_BUTTON.iconSize} className="mr-1" />
                카드 편집
              </button>
            )}

            {/* 새로고침 버튼 */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className={ACTION_BUTTON_CONFIG.REFRESH_BUTTON.className}
                data-testid="refresh-button"
              >
                <RefreshCw 
                  size={ACTION_BUTTON_CONFIG.REFRESH_BUTTON.iconSize} 
                  className={isLoading ? 'animate-spin mr-1' : 'mr-1'} 
                />
                새로고침
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 필터 컨텐츠 - 12컬럼 그리드 시스템 적용 */}
      <div className={FILTER_LAYOUT_CONFIG.CONTENT.className}>
        <div className="space-y-2">
          {/* 첫 번째 행: 기본 필터들 */}
          <div className={FILTER_GRID_CONFIG.baseGrid}>
            {/* 기간 선택 - 4컬럼 차지 */}
            <div className={FILTER_GRID_CONFIG.columns.dateRange}>
              <label className={FILTER_GRID_CONFIG.styles.label}>
                {FILTER_LABELS.DATE_RANGE.label}
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className={FILTER_GRID_CONFIG.styles.input}
                  data-testid="start-date-input"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className={FILTER_GRID_CONFIG.styles.input}
                  data-testid="end-date-input"
                />
              </div>
            </div>

            {/* 차트 표시 단위 */}
            <div className={FILTER_GRID_CONFIG.columns.default}>
              <label className={FILTER_GRID_CONFIG.styles.label}>
                {FILTER_LABELS.VIEW_TYPE.label}
              </label>
              <select
                value={viewType}
                onChange={(e) => onViewTypeChange(e.target.value as ViewType)}
                className={FILTER_GRID_CONFIG.styles.select}
                data-testid="view-type-select"
              >
                {VIEW_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 결제 상태 필터 */}
            <div className={FILTER_GRID_CONFIG.columns.default}>
              <label className={FILTER_GRID_CONFIG.styles.label}>
                {FILTER_LABELS.STATUS_FILTER.label}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value as PaymentStatusFilter)}
                className={FILTER_GRID_CONFIG.styles.select}
                data-testid="status-filter-select"
              >
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 빠른 날짜 선택 - 나머지 공간 */}
            <div className="col-span-4 lg:col-span-4 xl:col-span-6">
              <label className={FILTER_GRID_CONFIG.styles.label}>
                빠른 날짜
              </label>
              <div className={QUICK_DATE_CONFIG.CONTAINER.className}>
                {quickDateRanges.map((range, index) => (
                  <div key={index} className={QUICK_DATE_CONFIG.BUTTON_GROUP.className}>
                    <button
                      onClick={() => onQuickDateRange(range.getPrevRange)}
                      className={QUICK_DATE_CONFIG.NAV_BUTTON.className}
                      title={`이전 ${range.label}`}
                    >
                      <ChevronLeft size={QUICK_DATE_CONFIG.NAV_BUTTON.iconSize} />
                    </button>
                    <button
                      onClick={() => onQuickDateRange(range.getRange)}
                      className={QUICK_DATE_CONFIG.MAIN_BUTTON.className}
                    >
                      {range.label}
                    </button>
                    <button
                      onClick={() => onQuickDateRange(range.getNextRange)}
                      className={QUICK_DATE_CONFIG.NAV_BUTTON.className}
                      title={`다음 ${range.label}`}
                    >
                      <ChevronRight size={QUICK_DATE_CONFIG.NAV_BUTTON.iconSize} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel; 