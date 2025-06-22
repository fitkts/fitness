import React from 'react';
import { Search, Filter, X, Calendar, DollarSign, Plus, Download, Upload, Info, CreditCard } from 'lucide-react';
import { PaymentFilter } from '../../utils/paymentUtils';
import { Staff } from '../../models/types';
import {
  PREDEFINED_DATE_RANGES,
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

  const handleMinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      ...filter, 
      minAmount: value ? parseInt(value) : null 
    });
  };

  const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      ...filter, 
      maxAmount: value ? parseInt(value) : null 
    });
  };

  const handleDateRangePreset = (range: { startDate: string; endDate: string }) => {
    onFilterChange({ 
      ...filter, 
      startDate: range.startDate, 
      endDate: range.endDate 
    });
  };

  const handleAmountRangePreset = (range: { min: number; max: number }) => {
    onFilterChange({ 
      ...filter, 
      minAmount: range.min, 
      maxAmount: range.max === Infinity ? null : range.max 
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
    if (filter.minAmount !== null && filter.minAmount !== undefined) count++;
    if (filter.maxAmount !== null && filter.maxAmount !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

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
              <div className={ACTION_BUTTON_CONFIG.ACTION_GROUP.container}>
                <div className={ACTION_BUTTON_CONFIG.ACTION_GROUP.buttonGroup}>
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
        <div className="space-y-3">
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
                  className={`w-full pl-7 pr-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  value={filter.search || ''}
                  onChange={handleSearchChange}
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

          {/* 두 번째 행: 날짜 및 금액 범위 */}
          <div className={COMPACT_LAYOUT_CONFIG.GRID.rangeSection}>
            {/* 날짜 범위 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={COMPACT_LAYOUT_CONFIG.RANGE_SECTION.iconSize} className="text-gray-500" />
                <label className={`block ${COMPACT_LAYOUT_CONFIG.RANGE_SECTION.title}`}>
                  날짜 범위
                </label>
              </div>
              
              <div className={`grid grid-cols-2 ${COMPACT_LAYOUT_CONFIG.RANGE_SECTION.gridGap}`}>
                <div>
                  <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} text-gray-600 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>시작일</label>
                  <input
                    type="date"
                    className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={filter.startDate || ''}
                    onChange={handleStartDateChange}
                  />
                </div>
                <div>
                  <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} text-gray-600 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>종료일</label>
                  <input
                    type="date"
                    className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={filter.endDate || ''}
                    onChange={handleEndDateChange}
                  />
                </div>
              </div>

              {/* 날짜 프리셋 */}
              <div className={COMPACT_LAYOUT_CONFIG.RANGE_SECTION.presetContainer}>
                {PREDEFINED_DATE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handleDateRangePreset(range)}
                    className={COMPACT_LAYOUT_CONFIG.RANGE_SECTION.presetButton}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 금액 범위 */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign size={COMPACT_LAYOUT_CONFIG.RANGE_SECTION.iconSize} className="text-gray-500" />
                <label className={`block ${COMPACT_LAYOUT_CONFIG.RANGE_SECTION.title}`}>
                  금액 범위
                </label>
              </div>
              
              <div className={`grid grid-cols-2 ${COMPACT_LAYOUT_CONFIG.RANGE_SECTION.gridGap}`}>
                <div>
                  <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} text-gray-600 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>최소 금액</label>
                  <input
                    type="number"
                    placeholder="0"
                    className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={filter.minAmount || ''}
                    onChange={handleMinAmountChange}
                  />
                </div>
                <div>
                  <label className={`block ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelSize} text-gray-600 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.labelMargin}`}>최대 금액</label>
                  <input
                    type="number"
                    placeholder="무제한"
                    className={`w-full px-2 ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.padding} border border-gray-300 rounded-md ${COMPACT_LAYOUT_CONFIG.INPUT_FIELD.textSize} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    value={filter.maxAmount || ''}
                    onChange={handleMaxAmountChange}
                  />
                </div>
              </div>

              {/* 금액 프리셋 */}
              <div className={COMPACT_LAYOUT_CONFIG.RANGE_SECTION.presetContainer}>
                {PREDEFINED_AMOUNT_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => handleAmountRangePreset(range)}
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

export default PaymentSearchFilter; 