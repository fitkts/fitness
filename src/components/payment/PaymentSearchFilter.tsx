import React from 'react';
import { Search, Filter, X, Calendar, DollarSign } from 'lucide-react';
import { PaymentFilter } from '../../utils/paymentUtils';
import { Staff } from '../../models/types';
import { 
  PAYMENT_STATUS_OPTIONS, 
  PAYMENT_METHOD_OPTIONS, 
  PREDEFINED_DATE_RANGES,
  PREDEFINED_AMOUNT_RANGES,
  FILTER_CONFIG 
} from '../../config/paymentConfig';

interface PaymentSearchFilterProps {
  filter: PaymentFilter;
  onFilterChange: (filter: PaymentFilter) => void;
  onReset: () => void;
  membershipTypes?: string[];
  staffList?: Staff[];
}

const PaymentSearchFilter: React.FC<PaymentSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  membershipTypes = [],
  staffList = [],
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
      minAmount: value ? Number(value) : undefined 
    });
  };

  const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFilterChange({ 
      ...filter, 
      maxAmount: value ? Number(value) : undefined 
    });
  };

  const handleDateRangePreset = (range: { startDate: string; endDate: string }) => {
    onFilterChange({
      ...filter,
      startDate: range.startDate,
      endDate: range.endDate,
    });
  };

  const handleAmountRangePreset = (range: { min: number; max: number }) => {
    onFilterChange({
      ...filter,
      minAmount: range.min,
      maxAmount: range.max === Infinity ? undefined : range.max,
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
    if (filter.minAmount !== undefined) count++;
    if (filter.maxAmount !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden sticky top-4 z-20"
      data-testid="payment-search-filter-container"
    >
      {/* 헤더 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">결제 검색 및 필터</h3>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {activeFilterCount}개 필터 적용됨
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={14} />
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 필터 컨텐츠 */}
      <div className="p-4 space-y-4">
        {/* 첫 번째 행: 검색 및 기본 필터 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 검색 박스 */}
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              검색
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={FILTER_CONFIG.SEARCH_PLACEHOLDER}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filter.search || ''}
                onChange={handleSearchChange}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>

          {/* 결제 상태 */}
          <div>
            <label htmlFor="status" className="block text-xs font-medium text-gray-700 mb-1">
              결제 상태
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filter.status || 'all'}
              onChange={handleStatusChange}
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 이용권 종류 */}
          <div>
            <label htmlFor="membershipType" className="block text-xs font-medium text-gray-700 mb-1">
              이용권 종류
            </label>
            <select
              id="membershipType"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filter.membershipType || 'all'}
              onChange={handleMembershipTypeChange}
            >
              <option value="all">전체 이용권</option>
              {membershipTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* 결제 방법 */}
          <div>
            <label htmlFor="paymentMethod" className="block text-xs font-medium text-gray-700 mb-1">
              결제 방법
            </label>
            <select
              id="paymentMethod"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filter.paymentMethod || 'all'}
              onChange={handlePaymentMethodChange}
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 두 번째 행: 날짜 및 금액 필터 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 날짜 범위 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-gray-500" />
              <label className="block text-sm font-medium text-gray-700">
                결제 날짜 범위
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="startDate" className="block text-xs text-gray-600 mb-1">시작일</label>
                <input
                  id="startDate"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter.startDate || ''}
                  onChange={handleStartDateChange}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-xs text-gray-600 mb-1">종료일</label>
                <input
                  id="endDate"
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter.endDate || ''}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>

            {/* 날짜 프리셋 */}
            <div className="flex flex-wrap gap-1">
              {PREDEFINED_DATE_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handleDateRangePreset(range)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* 금액 범위 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-gray-500" />
              <label className="block text-sm font-medium text-gray-700">
                결제 금액 범위
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="minAmount" className="block text-xs text-gray-600 mb-1">최소 금액</label>
                <input
                  id="minAmount"
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter.minAmount || ''}
                  onChange={handleMinAmountChange}
                />
              </div>
              <div>
                <label htmlFor="maxAmount" className="block text-xs text-gray-600 mb-1">최대 금액</label>
                <input
                  id="maxAmount"
                  type="number"
                  placeholder="무제한"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter.maxAmount || ''}
                  onChange={handleMaxAmountChange}
                />
              </div>
            </div>

            {/* 금액 프리셋 */}
            <div className="flex flex-wrap gap-1">
              {PREDEFINED_AMOUNT_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handleAmountRangePreset(range)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 세 번째 행: 담당자 필터 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="staffName" className="block text-xs font-medium text-gray-700 mb-1">
              담당자
            </label>
            <select
              id="staffName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filter.staffName || 'all'}
              onChange={handleStaffChange}
            >
              <option value="all">전체 담당자</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.name}>
                  {staff.name} ({staff.position})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSearchFilter; 