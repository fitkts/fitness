import React from 'react';
import { Search, Filter, X, DollarSign, Calendar, Plus, Download, Upload, Info, CreditCard } from 'lucide-react';
import { MembershipTypeFilter } from '../../types/payment';
import {
  PREDEFINED_PRICE_RANGES,
  PREDEFINED_DURATION_RANGES,
  FILTER_CONFIG
} from '../../config/membershipTypeConfig';
import * as XLSX from 'xlsx';

// 회원관리와 동일한 컴팩트 레이아웃 설정 사용
const COMPACT_LAYOUT_CONFIG = {
  FILTER_CONTAINER: {
    padding: '', // 실제 컨테이너 패딩은 컴포넌트에서 직접 관리
    headerPadding: 'px-3 py-2', // 회원관리와 동일
    contentPadding: 'p-3', // 회원관리와 동일
  },
  INPUT_FIELD: {
    padding: 'py-1.5', // 회원관리와 동일
    textSize: 'text-sm', // 회원관리와 동일
    labelSize: 'text-xs', // 회원관리와 동일
    labelMargin: 'mb-1', // 회원관리와 동일
  },
  GRID: {
    gap: 'gap-3', // 회원관리와 동일
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6', // 회원관리와 동일
  },
  HEADER: {
    title: 'text-sm font-medium text-gray-900', // 회원관리와 동일
    badge: 'text-xs', // 회원관리와 동일
    icon: 16, // 회원관리와 동일
  },
  RANGE_SECTION: {
    title: 'text-sm font-medium text-gray-700', // 회원관리와 동일
    iconSize: 16, // 회원관리와 동일
    gridGap: 'gap-2', // 회원관리와 동일
    presetContainer: 'flex flex-wrap gap-1', // 회원관리와 동일
    presetButton: 'px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors', // 회원관리와 동일
  },
};

// 결제내역 탭과 동일한 초록색 버튼 색상 사용
const ACTION_BUTTON_CONFIG = {
  ADD_MEMBERSHIP_TYPE: {
    text: '새 이용권 추가',
    className: 'bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-1.5 px-3 rounded-md flex items-center transition-colors', // 결제내역과 동일한 초록색
    iconSize: 14,
  },
  EXCEL_BUTTONS: {
    container: 'flex gap-1 items-center',
    button: 'bg-gray-100 border-none rounded p-2 cursor-pointer hover:bg-gray-200', // 회원관리와 동일
    infoButton: 'bg-transparent border-none p-1 cursor-pointer',
    iconSize: 16, // 회원관리와 동일
    infoIconSize: 15, // 회원관리와 동일
  },
  ACTION_GROUP: {
    container: 'flex items-center gap-2 ml-4 pl-4 border-l border-gray-300', // 회원관리와 동일
    buttonGroup: 'flex items-center gap-2',
  },
};

interface MembershipTypeSearchFilterProps {
  filter: MembershipTypeFilter;
  onFilterChange: (filter: MembershipTypeFilter) => void;
  onReset: () => void;
  showActionButtons?: boolean;
  onAddMembershipType?: () => void;
  onImportSuccess?: () => void;
  showToast?: (type: 'success' | 'error', message: string) => void;
  membershipTypes?: any[];
}

const MembershipTypeSearchFilter: React.FC<MembershipTypeSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  showActionButtons = false,
  onAddMembershipType,
  onImportSuccess,
  showToast,
  membershipTypes = [],
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      ...filter, 
      minPrice: value ? Number(value) : undefined 
    });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      ...filter, 
      maxPrice: value ? Number(value) : undefined 
    });
  };

  const handleMinDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      ...filter, 
      minDuration: value ? Number(value) : undefined 
    });
  };

  const handleMaxDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      ...filter, 
      maxDuration: value ? Number(value) : undefined 
    });
  };

  // 가격 프리셋 핸들러
  const handlePricePreset = (range: { min: number; max?: number }) => {
    onFilterChange({
      ...filter,
      minPrice: range.min,
      maxPrice: range.max,
    });
  };

  // 기간 프리셋 핸들러
  const handleDurationPreset = (range: { min: number; max?: number }) => {
    onFilterChange({
      ...filter,
      minDuration: range.min,
      maxDuration: range.max,
    });
  };

  // 엑셀 불러오기 핸들러
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        showToast?.('success', `${jsonData.length}개의 이용권 종류를 불러왔습니다.`);
        onImportSuccess?.();
      } catch (error) {
        showToast?.('error', '엑셀 파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // 같은 파일 재선택 가능하도록
  };

  // 엑셀 내보내기 핸들러
  const handleExportExcel = () => {
    if (membershipTypes.length === 0) {
      showToast?.('error', '내보낼 이용권 종류가 없습니다.');
      return;
    }

    try {
      const worksheet = XLSX.utils.json_to_sheet(membershipTypes);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '이용권종류');
      XLSX.writeFile(workbook, `이용권종류_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast?.('success', '이용권 종류 목록이 엑셀로 내보내졌습니다.');
    } catch (error) {
      showToast?.('error', '엑셀 내보내기 중 오류가 발생했습니다.');
    }
  };

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.search && filter.search.trim() !== '') count++;
    if (filter.minPrice !== undefined) count++;
    if (filter.maxPrice !== undefined) count++;
    if (filter.minDuration !== undefined) count++;
    if (filter.maxDuration !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.padding} overflow-hidden sticky top-4 z-20`}
      data-testid="membership-type-search-filter-container"
    >
      {/* 헤더 */}
      <div className={`${COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.headerPadding} bg-gray-50 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={COMPACT_LAYOUT_CONFIG.HEADER.icon} className="text-gray-600" />
            <h3 className={COMPACT_LAYOUT_CONFIG.HEADER.title}>이용권 검색 및 필터</h3>
            {activeFilterCount > 0 && (
              <span className={`bg-green-100 text-green-800 ${COMPACT_LAYOUT_CONFIG.HEADER.badge} font-medium px-2 py-0.5 rounded-full`}>
                {activeFilterCount}개 필터 적용됨
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* 필터 초기화 버튼 */}
            {activeFilterCount > 0 && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={12} />
                초기화
              </button>
            )}
            
            {/* 액션 버튼들 */}
            {showActionButtons && (
              <div className={ACTION_BUTTON_CONFIG.ACTION_GROUP.container}>
                {/* 메인 액션 버튼 그룹 */}
                <div className={ACTION_BUTTON_CONFIG.ACTION_GROUP.buttonGroup}>
                  {/* 새 이용권 추가 버튼 */}
                  {onAddMembershipType && (
                    <button
                      onClick={onAddMembershipType}
                      className={ACTION_BUTTON_CONFIG.ADD_MEMBERSHIP_TYPE.className}
                    >
                      <CreditCard size={ACTION_BUTTON_CONFIG.ADD_MEMBERSHIP_TYPE.iconSize} className="mr-2" />
                      {ACTION_BUTTON_CONFIG.ADD_MEMBERSHIP_TYPE.text}
                    </button>
                  )}
                </div>

                {/* 엑셀 버튼 그룹 */}
                <div className={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.container}>
                  <button
                    title="엑셀 불러오기"
                    className={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.button}
                    onClick={() => document.getElementById('membership-type-excel-import-input')?.click()}
                  >
                    <Upload size={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.iconSize} />
                  </button>
                  <input
                    id="membership-type-excel-import-input"
                    type="file"
                    accept=".xlsx, .xls"
                    style={{ display: 'none' }}
                    onChange={handleImportExcel}
                  />
                  <button
                    title="엑셀 내보내기"
                    className={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.button}
                    onClick={handleExportExcel}
                  >
                    <Download size={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.iconSize} />
                  </button>
                  <button
                    title="엑셀 형식 안내"
                    className={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.infoButton}
                    onClick={() => {/* TODO: 엑셀 형식 안내 모달 */}}
                  >
                    <Info size={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.infoIconSize} color="#888" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 필터 컨텐츠 */}
      <div className={COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.contentPadding}>
        <div className="space-y-4">
          {/* 첫 번째 행: 기본 필터들 */}
          <div className={`${COMPACT_LAYOUT_CONFIG.GRID.responsive} ${COMPACT_LAYOUT_CONFIG.GRID.gap}`} data-testid="grid-container-basic">
            {/* 검색 박스 */}
            <div className="lg:col-span-2">
              <label htmlFor="membership-type-search" className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
                검색
              </label>
              <div className="relative">
                <input
                  id="membership-type-search"
                  type="text"
                  placeholder={FILTER_CONFIG.SEARCH_PLACEHOLDER}
                  className={`w-full pl-8 pr-3 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  value={filter.search || ''}
                  onChange={handleSearchChange}
                />
                <Search
                  className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={14}
                />
              </div>
            </div>
          </div>

          {/* 두 번째 행: 가격 및 기간 범위 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="grid-container-ranges">
            {/* 가격 범위 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={COMPACT_LAYOUT_CONFIG.RANGE_SECTION.iconSize} className="text-gray-500" />
                <label className={`block ${COMPACT_LAYOUT_CONFIG.RANGE_SECTION.title}`}>
                  가격 범위
                </label>
              </div>
              
              <div className={`grid grid-cols-2 ${COMPACT_LAYOUT_CONFIG.RANGE_SECTION.gridGap}`}>
                <div>
                  <label htmlFor="minPrice" className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} text-gray-600 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>최소 가격</label>
                  <input
                    id="minPrice"
                    type="number"
                    placeholder={FILTER_CONFIG.PRICE_PLACEHOLDER.MIN}
                    className={`w-full px-3 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-green-500`}
                    value={filter.minPrice || ''}
                    onChange={handleMinPriceChange}
                  />
                </div>
                <div>
                  <label htmlFor="maxPrice" className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} text-gray-600 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>최대 가격</label>
                  <input
                    id="maxPrice"
                    type="number"
                    placeholder={FILTER_CONFIG.PRICE_PLACEHOLDER.MAX}
                    className={`w-full px-3 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-green-500`}
                    value={filter.maxPrice || ''}
                    onChange={handleMaxPriceChange}
                  />
                </div>
              </div>

              {/* 가격 프리셋 */}
              <div className={COMPACT_LAYOUT_CONFIG.RANGE_SECTION.presetContainer}>
                {PREDEFINED_PRICE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handlePricePreset(range)}
                    className={COMPACT_LAYOUT_CONFIG.RANGE_SECTION.presetButton}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 기간 범위 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={COMPACT_LAYOUT_CONFIG.RANGE_SECTION.iconSize} className="text-gray-500" />
                <label className={`block ${COMPACT_LAYOUT_CONFIG.RANGE_SECTION.title}`}>
                  이용 기간 (개월)
                </label>
              </div>
              
              <div className={`grid grid-cols-2 ${COMPACT_LAYOUT_CONFIG.RANGE_SECTION.gridGap}`}>
                <div>
                  <label htmlFor="minDuration" className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} text-gray-600 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>최소 기간</label>
                  <input
                    id="minDuration"
                    type="number"
                    placeholder={FILTER_CONFIG.DURATION_PLACEHOLDER.MIN}
                    min="1"
                    className={`w-full px-3 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-green-500`}
                    value={filter.minDuration || ''}
                    onChange={handleMinDurationChange}
                  />
                </div>
                <div>
                  <label htmlFor="maxDuration" className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} text-gray-600 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>최대 기간</label>
                  <input
                    id="maxDuration"
                    type="number"
                    placeholder={FILTER_CONFIG.DURATION_PLACEHOLDER.MAX}
                    min="1"
                    className={`w-full px-3 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-green-500`}
                    value={filter.maxDuration || ''}
                    onChange={handleMaxDurationChange}
                  />
                </div>
              </div>

              {/* 기간 프리셋 */}
              <div className={COMPACT_LAYOUT_CONFIG.RANGE_SECTION.presetContainer}>
                {PREDEFINED_DURATION_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handleDurationPreset(range)}
                    className={COMPACT_LAYOUT_CONFIG.RANGE_SECTION.presetButton}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipTypeSearchFilter; 