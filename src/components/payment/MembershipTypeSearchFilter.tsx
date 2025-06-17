import React from 'react';
import { Search, Filter, X, DollarSign, Calendar } from 'lucide-react';
import { MembershipTypeFilter } from '../../types/payment';

interface MembershipTypeSearchFilterProps {
  filter: MembershipTypeFilter;
  onFilterChange: (filter: MembershipTypeFilter) => void;
  onReset: () => void;
}

const MembershipTypeSearchFilter: React.FC<MembershipTypeSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
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
  const handlePricePreset = (min: number, max?: number) => {
    onFilterChange({
      ...filter,
      minPrice: min,
      maxPrice: max,
    });
  };

  // 기간 프리셋 핸들러
  const handleDurationPreset = (min: number, max?: number) => {
    onFilterChange({
      ...filter,
      minDuration: min,
      maxDuration: max,
    });
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">이용권 검색 및 필터</h3>
            {activeFilterCount > 0 && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
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
        {/* 첫 번째 행: 검색 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              이용권 검색
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="이용권 이름 또는 설명으로 검색..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={filter.search || ''}
                onChange={handleSearchChange}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>
        </div>

        {/* 두 번째 행: 가격 및 기간 필터 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 가격 범위 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-gray-500" />
              <label className="block text-sm font-medium text-gray-700">
                가격 범위
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="minPrice" className="block text-xs text-gray-600 mb-1">최소 가격</label>
                <input
                  id="minPrice"
                  type="number"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filter.minPrice || ''}
                  onChange={handleMinPriceChange}
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="block text-xs text-gray-600 mb-1">최대 가격</label>
                <input
                  id="maxPrice"
                  type="number"
                  placeholder="무제한"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filter.maxPrice || ''}
                  onChange={handleMaxPriceChange}
                />
              </div>
            </div>

            {/* 가격 프리셋 */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => handlePricePreset(0, 100000)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                10만원 이하
              </button>
              <button
                onClick={() => handlePricePreset(100000, 300000)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                10-30만원
              </button>
              <button
                onClick={() => handlePricePreset(300000, 500000)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                30-50만원
              </button>
              <button
                onClick={() => handlePricePreset(500000)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                50만원 이상
              </button>
            </div>
          </div>

          {/* 기간 범위 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-gray-500" />
              <label className="block text-sm font-medium text-gray-700">
                이용 기간 (개월)
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="minDuration" className="block text-xs text-gray-600 mb-1">최소 기간</label>
                <input
                  id="minDuration"
                  type="number"
                  placeholder="1"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filter.minDuration || ''}
                  onChange={handleMinDurationChange}
                />
              </div>
              <div>
                <label htmlFor="maxDuration" className="block text-xs text-gray-600 mb-1">최대 기간</label>
                <input
                  id="maxDuration"
                  type="number"
                  placeholder="무제한"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={filter.maxDuration || ''}
                  onChange={handleMaxDurationChange}
                />
              </div>
            </div>

            {/* 기간 프리셋 */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => handleDurationPreset(1, 1)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                1개월
              </button>
              <button
                onClick={() => handleDurationPreset(3, 3)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                3개월
              </button>
              <button
                onClick={() => handleDurationPreset(6, 6)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                6개월
              </button>
              <button
                onClick={() => handleDurationPreset(12, 12)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                12개월
              </button>
              <button
                onClick={() => handleDurationPreset(12)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                장기권
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipTypeSearchFilter; 