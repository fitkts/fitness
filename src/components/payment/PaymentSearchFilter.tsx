import React from 'react';
import { Search, Filter, X, Plus, Download, Upload, Info, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { PaymentFilter } from '../../utils/paymentUtils';
import { Staff } from '../../models/types';
import {
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

  // 날짜 범위 적용 함수 (Statistics와 동일한 방식)
  const handleQuickDateRange = (rangeGetter: () => { startDate: string; endDate: string }) => {
    const { startDate, endDate } = rangeGetter();
    onFilterChange({
      ...filter,
      startDate,
      endDate,
    });
  };

  // 현재 날짜 기준 날짜 범위 계산 함수들
  const getCurrentDateRange = (type: string): { startDate: string; endDate: string } => {
    const today = new Date();
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    switch (type) {
      case 'today':
        return { startDate: formatDate(today), endDate: formatDate(today) };
      case 'week':
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset);
        const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6);
        return { startDate: formatDate(startOfWeek), endDate: formatDate(endOfWeek) };
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { startDate: formatDate(startOfMonth), endDate: formatDate(endOfMonth) };
      case 'year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        return { startDate: formatDate(startOfYear), endDate: formatDate(endOfYear) };
      default:
        return { startDate: formatDate(today), endDate: formatDate(today) };
    }
  };

  // 현재 선택된 날짜를 기준으로 이전/다음 범위 계산
  const getRelativeDateRange = (type: string, direction: 'prev' | 'next'): { startDate: string; endDate: string } => {
    const currentStart = filter.startDate || getCurrentDateRange(type).startDate;
    const baseDate = new Date(currentStart);
    const offset = direction === 'prev' ? -1 : 1;
    
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    switch (type) {
      case 'today':
        const newDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset);
        return { startDate: formatDate(newDay), endDate: formatDate(newDay) };
      case 'week':
        const newWeekStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + (offset * 7));
        const newWeekEnd = new Date(newWeekStart.getFullYear(), newWeekStart.getMonth(), newWeekStart.getDate() + 6);
        return { startDate: formatDate(newWeekStart), endDate: formatDate(newWeekEnd) };
      case 'month':
        const newMonthStart = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
        const newMonthEnd = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset + 1, 0);
        return { startDate: formatDate(newMonthStart), endDate: formatDate(newMonthEnd) };
      case 'year':
        const newYearStart = new Date(baseDate.getFullYear() + offset, 0, 1);
        const newYearEnd = new Date(baseDate.getFullYear() + offset, 11, 31);
        return { startDate: formatDate(newYearStart), endDate: formatDate(newYearEnd) };
      default:
        return getCurrentDateRange(type);
    }
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
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 overflow-hidden sticky top-4 z-20`}
      data-testid="payment-search-filter-container"
    >
      {/* 헤더 */}
      <div className="p-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-800">결제 검색 및 필터</h3>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
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
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1 px-2 rounded-md flex items-center transition-colors"
                    >
                      <Plus size={12} className="mr-1" />
                      결제
                    </button>
                  )}

                  {/* 이용권 추가 버튼 */}
                  {onAddMembershipType && (
                    <button
                      onClick={onAddMembershipType}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1 px-2 rounded-md flex items-center transition-colors"
                    >
                      <CreditCard size={12} className="mr-1" />
                      이용권
                    </button>
                  )}
                </div>

                {/* 엑셀 버튼 그룹 */}
                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <button
                    title="엑셀 불러오기"
                    className="p-1 hover:bg-gray-100 transition-colors"
                    onClick={() => document.getElementById('payment-excel-import-input')?.click()}
                  >
                    <Upload size={10} />
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
                    className="p-1 hover:bg-gray-100 transition-colors border-l border-gray-300"
                    onClick={handleExportExcel}
                  >
                    <Download size={10} />
                  </button>
                  <button
                    title="엑셀 형식 안내"
                    className="p-1 hover:bg-gray-100 transition-colors border-l border-gray-300"
                    onClick={() => {/* TODO: 엑셀 형식 안내 모달 */}}
                  >
                    <Info size={10} color="#888" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 필터 컨텐츠 */}
      <div className="p-2">
        <div className="space-y-2">
          {/* 첫 번째 행: 기본 필터들 */}
          <div className="grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-1">
            {/* 검색 박스 - 기존보다 축소 */}
            <div className="col-span-2 lg:col-span-2 xl:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                검색
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="회원명, 이용권..."
                  className="w-full pl-4 pr-1 py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={filter.search || ''}
                  onChange={handleSearchChange}
                />
                <Search
                  className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={10}
                />
              </div>
            </div>

            {/* 상태, 방법, 담당자 등 - 1컬럼씩만 차지 */}
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                상태
              </label>
              <select
                className="w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
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

            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                방법
              </label>
              <select
                className="w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filter.paymentMethod || 'all'}
                onChange={handlePaymentMethodChange}
              >
                <option value="all">전체</option>
                <option value="현금">현금</option>
                <option value="카드">카드</option>
                <option value="계좌이체">이체</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div className="col-span-2 lg:col-span-1 xl:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                이용권
              </label>
              <select
                className="w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filter.membershipType || 'all'}
                onChange={handleMembershipTypeChange}
              >
                <option value="all">전체</option>
                {membershipTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.length > 8 ? `${type.substring(0, 8)}...` : type}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                담당자
              </label>
              <select
                className="w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
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

            {/* 시작일, 종료일 - 1컬럼씩 */}
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                시작일
              </label>
              <input
                type="date"
                className="w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filter.startDate || ''}
                onChange={handleStartDateChange}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                종료일
              </label>
              <input
                type="date"
                className="w-full py-1 h-7 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filter.endDate || ''}
                onChange={handleEndDateChange}
              />
            </div>

            {/* 빠른 날짜 - 나머지 공간 */}
            <div className="col-span-4 lg:col-span-4 xl:col-span-4">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                빠른 날짜
              </label>
              <div className="flex flex-wrap gap-0.5">
                {[
                  { label: '오늘', type: 'today' },
                  { label: '이번주', type: 'week' },
                  { label: '이번달', type: 'month' },
                  { label: '올해', type: 'year' }
                ].map((preset) => (
                  <div key={preset.label} className="flex items-center bg-gray-50 rounded-md p-0.5 border border-gray-200">
                    <button
                      onClick={() => handleQuickDateRange(() => getRelativeDateRange(preset.type, 'prev'))}
                      className="p-0.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title={`이전 ${preset.label}`}
                    >
                      <ChevronLeft size={12} />
                    </button>
                    <button
                      onClick={() => handleQuickDateRange(() => getCurrentDateRange(preset.type))}
                      className="flex-1 px-1.5 py-0.5 text-xs font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors text-center"
                    >
                      {preset.label}
                    </button>
                    <button
                      onClick={() => handleQuickDateRange(() => getRelativeDateRange(preset.type, 'next'))}
                      className="p-0.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title={`다음 ${preset.label}`}
                    >
                      <ChevronRight size={12} />
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
