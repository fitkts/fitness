import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Users
} from 'lucide-react';
import { ConsultationMember, ConsultationSortConfig, ConsultationPaginationConfig } from '../../types/consultation';
import { CONSULTATION_PAGINATION_CONFIG, CONSULTATION_TABLE_COMPACT_CONFIG } from '../../config/consultationFilterConfig';
import { calculatePagination } from '../../utils/memberUtils';
import ConsultationTableRefactored from './ConsultationTableRefactored';

interface ConsultationTableWithPaginationProps {
  members: ConsultationMember[];
  sortConfig: ConsultationSortConfig;
  pagination: ConsultationPaginationConfig;
  isLoading?: boolean;
  onSort: (key: string) => void;
  onView: (member: ConsultationMember) => void;
  onPromote: (member: ConsultationMember) => void;
  onDelete?: (member: ConsultationMember) => void;
  onPaginationChange: (pagination: Partial<ConsultationPaginationConfig>) => void;
}

const ConsultationTableWithPagination: React.FC<ConsultationTableWithPaginationProps> = ({
  members,
  sortConfig,
  pagination,
  isLoading = false,
  onSort,
  onView,
  onPromote,
  onDelete,
  onPaginationChange,
}) => {
  const { currentPage, pageSize, showAll } = pagination;
  const totalItems = members.length;

  // 페이지네이션 계산 (회원관리와 동일한 유틸 사용)
  const paginationInfo = calculatePagination(
    totalItems,
    currentPage,
    pageSize,
    CONSULTATION_PAGINATION_CONFIG.MAX_VISIBLE_PAGES
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className={`px-4 ${CONSULTATION_TABLE_COMPACT_CONFIG.HEADER.containerPadding} bg-gray-50 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={CONSULTATION_TABLE_COMPACT_CONFIG.HEADER.iconSize} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">상담 회원 목록</h3>
            <span className={`bg-blue-100 text-blue-800 ${CONSULTATION_TABLE_COMPACT_CONFIG.HEADER.badgeTextSize} font-medium px-2 py-0.5 rounded-full`}>
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
              {CONSULTATION_PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.map((size) => (
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
        <div className={`${CONSULTATION_TABLE_COMPACT_CONFIG.LOADING.containerPadding} text-center`}>
          <div className={`animate-spin rounded-full ${CONSULTATION_TABLE_COMPACT_CONFIG.LOADING.spinnerSize} border-b-2 border-blue-600 mx-auto mb-4`}></div>
          <p className="text-gray-500">상담 회원 목록을 불러오는 중...</p>
        </div>
      ) : totalItems === 0 ? (
        /* 빈 상태 */
        <div className={`${CONSULTATION_TABLE_COMPACT_CONFIG.EMPTY_STATE.containerPadding} text-center`}>
          <Users size={CONSULTATION_TABLE_COMPACT_CONFIG.EMPTY_STATE.iconSize} className="text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">상담 회원 정보가 없습니다</h4>
          <p className="text-gray-500 mb-4">
            상담 회원을 추가하려면 상단의 '신규 상담 등록' 버튼을 클릭하세요.
          </p>
        </div>
      ) : (
        <>
          {/* 테이블 */}
          <ConsultationTableRefactored
            members={currentPageData}
            sortConfig={sortConfig}
            onSort={onSort}
            onView={onView}
            onPromote={onPromote}
            onDelete={onDelete}
          />

          {/* 페이지네이션 (전체보기가 아닐 때만 표시) */}
          {!showAll && totalPages > 1 && (
            <div className={`px-4 ${CONSULTATION_TABLE_COMPACT_CONFIG.PAGINATION.containerPadding} bg-gray-50 border-t border-gray-200`}>
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
                    className={`${CONSULTATION_TABLE_COMPACT_CONFIG.PAGINATION.buttonPadding} text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100`}
                  >
                    <ChevronLeft size={CONSULTATION_TABLE_COMPACT_CONFIG.PAGINATION.iconSize} />
                  </button>
                  
                  {startPage > 1 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        className={`${CONSULTATION_TABLE_COMPACT_CONFIG.PAGINATION.numberButtonPadding} text-sm border border-gray-300 rounded hover:bg-gray-50`}
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
                      className={`${CONSULTATION_TABLE_COMPACT_CONFIG.PAGINATION.numberButtonPadding} text-sm border rounded transition-colors ${
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
                        className={`${CONSULTATION_TABLE_COMPACT_CONFIG.PAGINATION.numberButtonPadding} text-sm border border-gray-300 rounded hover:bg-gray-50`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className={`${CONSULTATION_TABLE_COMPACT_CONFIG.PAGINATION.buttonPadding} text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-gray-100`}
                  >
                    <ChevronRight size={CONSULTATION_TABLE_COMPACT_CONFIG.PAGINATION.iconSize} />
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

export default ConsultationTableWithPagination; 