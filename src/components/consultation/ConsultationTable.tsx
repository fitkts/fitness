import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronUp, 
  ChevronDown,
  UserPlus,
  Phone,
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import { 
  ConsultationMember,
  ConsultationTableFilters,
  ConsultationTableSort,
  ConsultationTableProps
} from '../../types/consultation';
import { 
  CONSULTATION_STATUS_OPTIONS,
  STATUS_BADGE_STYLES,
  CONSULTATION_TABLE_COLUMNS 
} from '../../config/consultationConfig';
import { 
  formatDate, 
  formatPhoneNumber, 
  formatConsultationStatus,
  formatRelativeTime,
  formatLastVisit
} from '../../utils/consultationFormatters';

const ConsultationTable: React.FC<ConsultationTableProps> = ({
  members,
  filters,
  sort,
  onFilterChange,
  onSortChange,
  onMemberSelect,
  onAddNewMember,
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 정렬 핸들러
  const handleSort = (field: ConsultationTableSort['field']) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, direction: newDirection });
  };

  // 검색 핸들러
  const handleSearch = (searchQuery: string) => {
    onFilterChange({ ...filters, search_query: searchQuery });
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(members.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentMembers = members.slice(startIndex, endIndex);

  // 상담 상태 배지 렌더링
  const renderStatusBadge = (status?: string) => {
    if (!status) return <span className="text-gray-400">-</span>;
    
    const config = CONSULTATION_STATUS_OPTIONS.find(opt => opt.value === status);
    const badgeStyle = STATUS_BADGE_STYLES[status as keyof typeof STATUS_BADGE_STYLES];
    
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={badgeStyle}
      >
        {config?.label || status}
      </span>
    );
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (field: string) => {
    if (sort.field !== field) return null;
    return sort.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // 마지막 방문일 표시
  const renderLastVisit = (timestamp?: number) => {
    const visitInfo = formatLastVisit(timestamp);
    const colorClasses = {
      recent: 'text-green-600',
      warning: 'text-yellow-600',
      danger: 'text-red-600'
    };
    
    return (
      <span className={`text-sm ${colorClasses[visitInfo.status]}`}>
        {visitInfo.text}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 헤더 영역 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">상담 회원 관리</h2>
              <p className="text-sm text-gray-500">총 {members.length}명의 회원</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 검색 입력 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="회원명, 연락처 검색..."
                value={filters.search_query || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* 필터 버튼 */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={16} />
              필터
            </button>
            
            {/* 신규 회원 추가 버튼 */}
            <button
              onClick={onAddNewMember}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus size={16} />
              신규 회원 등록
            </button>
          </div>
        </div>

        {/* 필터 패널 */}
        {isFilterOpen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 상담 상태 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상담 상태
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    status: e.target.value as any || undefined
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">전체</option>
                  {CONSULTATION_STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 날짜 범위 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가입일 (시작)
                </label>
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    date_from: e.target.value || undefined
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가입일 (종료)
                </label>
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => onFilterChange({
                    ...filters,
                    date_to: e.target.value || undefined
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 필터 초기화 버튼 */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  onFilterChange({});
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 테이블 영역 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {CONSULTATION_TABLE_COLUMNS.map(column => (
                <th 
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key as any)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // 로딩 스켈레톤
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {CONSULTATION_TABLE_COLUMNS.map(column => (
                    <td key={column.key} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : currentMembers.length === 0 ? (
              // 데이터 없음
              <tr>
                <td 
                  colSpan={CONSULTATION_TABLE_COLUMNS.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-12 h-12 text-gray-300" />
                    <p>회원 데이터가 없습니다.</p>
                    <button
                      onClick={onAddNewMember}
                      className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      첫 번째 회원을 등록해보세요
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              // 실제 데이터
              currentMembers.map(member => (
                <tr 
                  key={member.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onMemberSelect(member)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatPhoneNumber(member.phone)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.gender || '-'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.birth_date ? formatDate(member.birth_date) : '-'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(member.consultation_status)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.staff_name || '-'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.first_visit ? formatDate(member.first_visit) : '-'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderLastVisit(member.last_visit)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMemberSelect(member);
                      }}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {!loading && members.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700">
              {startIndex + 1}-{Math.min(endIndex, members.length)} / 총 {members.length}명
            </div>
            
            <div className="flex items-center gap-2">
              {/* 페이지 크기 선택 */}
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={10}>10개씩</option>
                <option value={20}>20개씩</option>
                <option value={50}>50개씩</option>
                <option value={100}>100개씩</option>
              </select>
              
              {/* 페이지 번호 */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                
                <span className="px-3 py-1 text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationTable; 