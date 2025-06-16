import React from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  Trash2, 
  Info, 
  Database,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Member } from '../../models/types';
import { SortConfig, PaginationConfig } from '../../types/member';
import { formatDate, getMembershipStatus, calculatePagination } from '../../utils/memberUtils';
import { PAGINATION_CONFIG } from '../../config/memberConfig';

interface MemberTableWithPaginationProps {
  members: Member[];
  sortConfig: SortConfig;
  pagination: PaginationConfig;
  isLoading?: boolean;
  onSort: (key: string) => void;
  onView: (member: Member) => void;
  onEdit: (member: Member) => void;
  onDelete: (id: number) => void;
  onPaginationChange: (pagination: Partial<PaginationConfig>) => void;
}

const MemberTableWithPagination: React.FC<MemberTableWithPaginationProps> = ({
  members,
  sortConfig,
  pagination,
  isLoading = false,
  onSort,
  onView,
  onEdit,
  onDelete,
  onPaginationChange,
}) => {
  const { currentPage, pageSize, showAll } = pagination;
  const totalItems = members.length;

  // 페이지네이션 계산
  const paginationInfo = calculatePagination(
    totalItems,
    currentPage,
    pageSize,
    PAGINATION_CONFIG.MAX_VISIBLE_PAGES
  );

  const { totalPages, pageNumbers, hasNextPage, hasPrevPage, startPage, endPage } = paginationInfo;

  // 현재 페이지 데이터
  const getCurrentPageData = () => {
    if (showAll) return members;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return members.slice(startIndex, endIndex);
  };

  const currentPageData = getCurrentPageData();

  // 페이지네이션 핸들러
  const handlePageChange = (page: number) => {
    onPaginationChange({ currentPage: page });
  };

  const handlePageSizeChange = (size: number) => {
    onPaginationChange({ pageSize: size, currentPage: 1 });
  };

  const handleShowAllToggle = () => {
    onPaginationChange({ showAll: !showAll, currentPage: 1 });
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return null;
    
    return (
      <span className="ml-1">
        {sortConfig.direction === 'ascending' ? (
          <ChevronUp className="text-blue-500" size={14} />
        ) : sortConfig.direction === 'descending' ? (
          <ChevronDown className="text-blue-500" size={14} />
        ) : null}
      </span>
    );
  };

  const getStatusBadge = (endDate: string | undefined | null) => {
    const status = getMembershipStatus(endDate);
    return (
      <span
        className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
          status === 'active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {status === 'active' ? '활성' : '만료'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">회원 목록</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              총 {totalItems}명
            </span>
          </div>
          
          {/* 페이지 크기 컨트롤 */}
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className={`text-sm border border-gray-300 rounded px-2 py-1 ${
                showAll ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={showAll || totalItems === 0}
            >
              {PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}개씩
                </option>
              ))}
            </select>
            <button
              onClick={handleShowAllToggle}
              disabled={totalItems === 0}
              className={`text-sm px-3 py-1 rounded transition-colors ${
                showAll
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {showAll ? '페이지 보기' : '전체 보기'}
            </button>
          </div>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">회원 목록을 불러오는 중...</p>
        </div>
      ) : totalItems === 0 ? (
        /* 빈 상태 */
        <div className="p-12 text-center">
          <Database size={48} className="text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">회원 정보가 없습니다</h4>
          <p className="text-gray-500 mb-4">
            회원을 추가하려면 상단의 '회원 추가' 버튼을 클릭하세요.
          </p>
        </div>
      ) : (
        <>
          {/* 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: 'name', label: '이름' },
                    { key: 'gender', label: '성별' },
                    { key: 'phone', label: '연락처' },
                    { key: 'membershipType', label: '회원권 종류' },
                    { key: 'membershipEnd', label: '만료일' },
                    { key: 'staffName', label: '담당자' },
                    { key: 'status', label: '상태', sortable: false },
                    { key: 'actions', label: '작업', sortable: false },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.sortable !== false
                          ? 'cursor-pointer hover:bg-gray-100 transition-colors'
                          : ''
                      } ${column.key === 'actions' ? 'text-center' : ''}`}
                      onClick={() => 
                        column.sortable !== false ? onSort(column.key) : undefined
                      }
                    >
                      <div className="flex items-center">
                        {column.label}
                        {column.sortable !== false && renderSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPageData.map((member, index) => (
                  <tr
                    key={member.id}
                    className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                    onClick={() => onView(member)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-blue-600">
                            {member.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 group-hover:text-blue-600">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {member.gender || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {member.phone || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {member.membershipType || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatDate(member.membershipEnd)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {member.staffName || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(member.membershipEnd)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div
                        className="flex justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(member);
                          }}
                          className="p-1 text-blue-500 hover:text-blue-700 transition-colors rounded hover:bg-blue-50"
                          title="상세보기"
                        >
                          <Info size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(member);
                          }}
                          className="p-1 text-yellow-500 hover:text-yellow-700 transition-colors rounded hover:bg-yellow-50"
                          title="수정"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(member.id!);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors rounded hover:bg-red-50"
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 (전체보기가 아닐 때만 표시) */}
          {!showAll && totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">
                    {(currentPage - 1) * pageSize + 1}
                  </span>
                  {' - '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalItems)}
                  </span>
                  {' / '}
                  <span className="font-medium">{totalItems}</span>
                  명 표시
                </div>
                
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {startPage > 1 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        1
                      </button>
                      {startPage > 2 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                    </>
                  )}
                  
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => handlePageChange(number)}
                      className={`px-3 py-1 text-sm border rounded transition-colors ${
                        currentPage === number
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                  
                  {endPage < totalPages && (
                    <>
                      {endPage < totalPages - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100"
                  >
                    <ChevronRight size={16} />
                  </button>
                </nav>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemberTableWithPagination; 