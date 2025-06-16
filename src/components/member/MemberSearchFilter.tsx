import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { MemberFilter, Staff } from '../../models/types';
import { FILTER_OPTIONS } from '../../config/memberConfig';

interface MemberSearchFilterProps {
  filter: MemberFilter;
  onFilterChange: (filter: MemberFilter) => void;
  onReset: () => void;
  onPaginationReset: () => void;
  staffList?: Staff[];
  membershipTypes?: string[];
}

const MemberSearchFilter: React.FC<MemberSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  onPaginationReset,
  staffList = [],
  membershipTypes = [],
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filter, search: e.target.value });
    onPaginationReset();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      status: e.target.value as MemberFilter['status'] 
    });
    onPaginationReset();
  };

  const handleStaffNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      staffName: e.target.value 
    });
    onPaginationReset();
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      gender: e.target.value 
    });
    onPaginationReset();
  };

  const handleMembershipTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ 
      ...filter, 
      membershipType: e.target.value 
    });
    onPaginationReset();
  };

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.search && filter.search.trim() !== '') count++;
    if (filter.status && filter.status !== 'all') count++;
    if (filter.staffName && filter.staffName !== 'all') count++;
    if (filter.gender && filter.gender !== 'all') count++;
    if (filter.membershipType && filter.membershipType !== 'all') count++;
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
            <h3 className="text-sm font-medium text-gray-900">회원 검색 및 필터</h3>
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
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* 검색 박스 */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              회원명 검색
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="회원 이름으로 검색..."
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

          {/* 상태별 필터 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              회원 상태
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filter.status || 'all'}
              onChange={handleStatusChange}
            >
              {FILTER_OPTIONS.STATUS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 담당자별 필터 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              담당자
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filter.staffName || 'all'}
              onChange={handleStaffNameChange}
            >
              <option value="all">전체 담당자</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.name}>
                  {staff.name} ({staff.position})
                </option>
              ))}
            </select>
          </div>

          {/* 성별 필터 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              성별
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filter.gender || 'all'}
              onChange={handleGenderChange}
            >
              <option value="all">전체 성별</option>
              <option value="남성">남성</option>
              <option value="여성">여성</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 이용권별 필터 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              이용권 종류
            </label>
            <select
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
        </div>
      </div>
    </div>
  );
};

export default MemberSearchFilter; 