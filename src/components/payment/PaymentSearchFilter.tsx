import React, { useState } from 'react';
import { Search, Filter, X, Calendar, DollarSign, Plus, Download, Upload, Info, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { PaymentFilter } from '../../utils/paymentUtils';
import { Staff } from '../../models/types';
import {
  getPredefinedDateRanges,
  dateUtils,
  PREDEFINED_AMOUNT_RANGES,
  FILTER_CONFIG,
  COMPACT_LAYOUT_CONFIG,
  ACTION_BUTTON_CONFIG
} from '../../config/paymentConfig';
import * as XLSX from 'xlsx';

interface PaymentSearchFilterProps {
  filter: PaymentFilter;
  onFilterChange: (filter: PaymentFilter) => void;
  onReset: () => void;
  membershipTypes?: string[];
  staffList?: Staff[];
  showActionButtons?: boolean;
  onAddPayment?: () => void;
  onAddMembershipType?: () => void;
  onImportSuccess?: () => void;
  showToast?: (type: 'success' | 'error', message: string) => void;
  payments?: any[];
}

const PaymentSearchFilter: React.FC<PaymentSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  membershipTypes = [],
  staffList = [],
  showActionButtons = false,
  onAddPayment,
  onAddMembershipType,
  onImportSuccess,
  showToast,
  payments = [],
}) => {
  const [dateOffsets, setDateOffsets] = useState<Record<string, number>>({
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    days7: 0,
    days30: 0,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      status: e.target.value as PaymentFilter['status'] 
    });
  };

  const handleMembershipTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      membershipType: e.target.value 
    });
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      paymentMethod: e.target.value as PaymentFilter['paymentMethod'] 
    });
  };

  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      staffName: e.target.value 
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ 
      ...filter, 
      startDate: e.target.value 
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ 
      ...filter, 
      endDate: e.target.value 
    });
  };

  const handleDateRangePreset = (range: any) => {
    onFilterChange({ 
      ...filter, 
      startDate: range.startDate, 
      endDate: range.endDate 
    });
  };

  // 날짜 이동 기능
  const handleDateNavigation = (type: string, direction: 'prev' | 'next', days?: number) => {
    const offsetKey = days ? `days${days}` : type;
    const currentOffset = dateOffsets[offsetKey] || 0;
    const newOffset = direction === 'next' ? currentOffset + 1 : currentOffset - 1;
    
    setDateOffsets(prev => ({
      ...prev,
      [offsetKey]: newOffset
    }));

    let newRange;
    switch (type) {
      case 'today':
        newRange = dateUtils.getToday(newOffset);
        break;
      case 'week':
        newRange = dateUtils.getThisWeek(newOffset);
        break;
      case 'month':
        newRange = dateUtils.getThisMonth(newOffset);
        break;
      case 'year':
        newRange = dateUtils.getThisYear(newOffset);
        break;
      case 'days':
        newRange = dateUtils.getRecentDays(days!, newOffset);
        break;
      default:
        return;
    }

    onFilterChange({
      ...filter,
      startDate: newRange.startDate,
      endDate: newRange.endDate,
    });
  };

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.search && filter.search.trim() !== '') count++;
    if (filter.status && filter.status !== 'all') count++;
    if (filter.membershipType && filter.membershipType !== 'all') count++;
    if (filter.paymentMethod && filter.paymentMethod !== 'all') count++;
    if (filter.staffName && filter.staffName !== 'all') count++;
    if (filter.startDate) count++;
    if (filter.endDate) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // 날짜 라벨 생성 (현재 오프셋 반영)
  const getDateRangeLabel = (type: string, baseLabel: string, days?: number) => {
    const offsetKey = days ? `days${days}` : type;
    const offset = dateOffsets[offsetKey] || 0;
    
    if (offset === 0) return baseLabel;
    
    switch (type) {
      case 'today':
        if (offset === -1) return '어제';
        if (offset === 1) return '내일';
        return offset > 0 ? `${offset}일 후` : `${Math.abs(offset)}일 전`;
      case 'week':
        if (offset === -1) return '지난 주';
        if (offset === 1) return '다음 주';
        return offset > 0 ? `${offset}주 후` : `${Math.abs(offset)}주 전`;
      case 'month':
        if (offset === -1) return '지난 달';
        if (offset === 1) return '다음 달';
        return offset > 0 ? `${offset}개월 후` : `${Math.abs(offset)}개월 전`;
      case 'year':
        if (offset === -1) return '작년';
        if (offset === 1) return '내년';
        return offset > 0 ? `${offset}년 후` : `${Math.abs(offset)}년 전`;
      case 'days':
        if (offset === 0) return baseLabel;
        return offset > 0 ? `${days}일 후부터` : `${days}일 전 기준`;
      default:
        return baseLabel;
    }
  };

  // 엑셀 내보내기 핸들러
  const handleExportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(payments);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '결제내역');
      XLSX.writeFile(wb, '결제내역.xlsx');
      showToast?.('success', '엑셀 파일이 성공적으로 내보내졌습니다.');
    } catch (error) {
      console.error('엑셀 내보내기 오류:', error);
      showToast?.('error', '엑셀 내보내기 중 오류가 발생했습니다.');
    }
  };

  // 엑셀 불러오기 핸들러
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        // TODO: 실제 import 로직 구현 필요
        console.log('Import data:', jsonData);
        showToast?.('success', '엑셀 데이터를 성공적으로 가져왔습니다.');
        onImportSuccess?.();
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('엑셀 불러오기 오류:', error);
      showToast?.('error', '엑셀 파일 처리 중 오류가 발생했습니다.');
    }

    // 파일 input 초기화
    e.target.value = '';
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.padding} overflow-hidden sticky top-4 z-20`}
      data-testid="payment-search-filter-container"
    >
      {/* 헤더 */}
      <div className={`${COMPACT_LAYOUT_CONFIG.FILTER_CONTAINER.headerPadding} bg-gray-50 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter size={COMPACT_LAYOUT_CONFIG.HEADER.icon} className="text-gray-600" />
            <h3 className={COMPACT_LAYOUT_CONFIG.HEADER.title}>결제 검색 및 필터</h3>
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
                <div className="flex items-center gap-1.5">
                  {/* 결제 추가 버튼 */}
                  {onAddPayment && (
                    <button
                      onClick={onAddPayment}
                      className={ACTION_BUTTON_CONFIG.ADD_PAYMENT.className}
                    >
                      <Plus size={ACTION_BUTTON_CONFIG.ADD_PAYMENT.iconSize} className="mr-1" />
                      {ACTION_BUTTON_CONFIG.ADD_PAYMENT.text}
                    </button>
                  )}

                  {/* 이용권 추가 버튼 */}
                  {onAddMembershipType && (
                    <button
                      onClick={onAddMembershipType}
                      className={ACTION_BUTTON_CONFIG.ADD_MEMBERSHIP_TYPE.className}
                    >
                      <CreditCard size={ACTION_BUTTON_CONFIG.ADD_MEMBERSHIP_TYPE.iconSize} className="mr-1" />
                      {ACTION_BUTTON_CONFIG.ADD_MEMBERSHIP_TYPE.text}
                    </button>
                  )}
                </div>

                {/* 엑셀 버튼 그룹 */}
                <div className={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.container}>
                  <button
                    title="엑셀 불러오기"
                    className={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.button}
                    onClick={() => document.getElementById('payment-excel-import-input')?.click()}
                  >
                    <Upload size={ACTION_BUTTON_CONFIG.EXCEL_BUTTONS.iconSize} />
                  </button>
                  <input
                    id="payment-excel-import-input"
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
        <div className="space-y-2">
          {/* 첫 번째 행: 기본 필터들 */}
          <div className={`${COMPACT_LAYOUT_CONFIG.GRID.responsive} ${COMPACT_LAYOUT_CONFIG.GRID.gap}`}>
            {/* 검색 박스 */}
            <div>
              <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
                검색
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={FILTER_CONFIG.SEARCH_PLACEHOLDER}
                  className={`w-full pl-6 pr-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={filter.search || ''}
                  onChange={handleSearchChange}
                />
                <Search
                  className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400"
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
                value={filter.status || 'all'}
                onChange={handleStatusChange}
              >
                <option value="all">전체</option>
                <option value="완료">완료</option>
                <option value="취소">취소</option>
                <option value="환불">환불</option>
                <option value="대기">대기</option>
              </select>
            </div>

            {/* 결제 방법 */}
            <div>
              <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
                결제방법
              </label>
              <select
                className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={filter.paymentMethod || 'all'}
                onChange={handlePaymentMethodChange}
              >
                <option value="all">전체</option>
                <option value="현금">현금</option>
                <option value="카드">카드</option>
                <option value="계좌이체">계좌이체</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* 이용권 종류 */}
            <div>
              <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
                이용권
              </label>
              <select
                className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={filter.membershipType || 'all'}
                onChange={handleMembershipTypeChange}
              >
                <option value="all">전체</option>
                {membershipTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 담당자 */}
            <div>
              <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>
                담당자
              </label>
              <select
                className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={filter.staffName || 'all'}
                onChange={handleStaffChange}
              >
                <option value="all">전체</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 두 번째 행: 날짜 범위 (컴팩트하게) */}
          <div className="space-y-2">
            {/* 날짜 범위 */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={COMPACT_LAYOUT_CONFIG.HEADER.icon} className="text-gray-500" />
                <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} font-medium text-gray-700`}>
                  날짜 범위
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <input
                    type="date"
                    placeholder="시작일"
                    className="w-full px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={filter.startDate || ''}
                    onChange={handleStartDateChange}
                    style={{ fontSize: '11px' }}
                  />
                </div>
                <div>
                  <input
                    type="date"
                    placeholder="종료일"
                    className="w-full px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={filter.endDate || ''}
                    onChange={handleEndDateChange}
                    style={{ fontSize: '11px' }}
                  />
                </div>
              </div>

              {/* 컴팩트한 날짜 프리셋 */}
              <div className="grid grid-cols-4 gap-0.5 pt-1">
                {getPredefinedDateRanges().slice(0, 8).map((range) => (
                  <div key={range.label} className="flex items-center border border-gray-200 rounded overflow-hidden">
                    <button
                      onClick={() => handleDateNavigation(range.type || 'today', 'prev', range.days)}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title="이전"
                    >
                      <ChevronLeft size={10} />
                    </button>
                    <button
                      onClick={() => handleDateRangePreset(range)}
                      className="flex-1 w-full text-center text-xs font-medium text-gray-800 px-1 py-1 hover:bg-gray-50 transition-colors"
                    >
                      {getDateRangeLabel(range.type || 'today', range.label, range.days)}
                    </button>
                    <button
                      onClick={() => handleDateNavigation(range.type || 'today', 'next', range.days)}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title="다음"
                    >
                      <ChevronRight size={10} />
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

export default PaymentSearchFilter; 