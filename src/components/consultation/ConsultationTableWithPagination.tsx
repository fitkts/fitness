import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ConsultationMember, ConsultationSortConfig, ConsultationPaginationConfig } from '../../types/consultation';
import { CONSULTATION_PAGINATION_CONFIG } from '../../config/consultationFilterConfig';
import ConsultationTableRefactored from './ConsultationTableRefactored';

interface ConsultationTableWithPaginationProps {
  members: ConsultationMember[];
  sortConfig: ConsultationSortConfig;
  pagination: ConsultationPaginationConfig;
  isLoading?: boolean;
  onSort: (key: string) => void;
  onView: (member: ConsultationMember) => void;
  onPromote: (member: ConsultationMember) => void;
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
  onPaginationChange,
}) => {
  const { currentPage, pageSize, showAll } = pagination;
  const totalItems = members.length;

  // 페이지네이션 계산
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  const getCurrentPageData = () => {
    if (showAll) {
      return members;
    }
    return members.slice(startIndex, endIndex);
  };

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
          <ChevronLeft className="text-blue-500" size={14} />
        ) : sortConfig.direction === 'descending' ? (
          <ChevronRight className="text-blue-500" size={14} />
        ) : null}
      </span>
    );
  };

  const currentTableData = getCurrentPageData();

  return (
    <div className="space-y-0">
      {/* 페이지 사이즈 및 전체보기 컨트롤 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className={`border border-gray-300 rounded-md px-2 py-1.5 sm:px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              showAll ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={showAll}
          >
            {CONSULTATION_PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}개씩 보기
              </option>
            ))}
          </select>
          <button
            onClick={handleShowAllToggle}
            className={`px-2 py-1.5 sm:px-3 text-sm rounded-md transition-colors ${
              showAll
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showAll ? '페이지 보기' : '전체 보기'}
          </button>
        </div>
        <div className="text-sm text-gray-500">
          총 {totalItems}명의 상담회원
          {!showAll &&
            ` (${startIndex + 1} - ${Math.min(endIndex, totalItems)}번째 표시)`}
        </div>
      </div>

      {/* 테이블 */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-500">로딩 중...</span>
          </div>
        </div>
      ) : (
        <ConsultationTableRefactored
          members={currentTableData}
          sortConfig={sortConfig}
          onSort={onSort}
          onView={onView}
          onPromote={onPromote}
        />
      )}

      {/* 페이지네이션 (전체 보기 모드일 때는 숨김) */}
      {!showAll && totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between sm:px-6">
          <div className="flex justify-between flex-1 sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                총 <span className="font-medium">{totalItems}</span>명 중{' '}
                <span className="font-medium">{startIndex + 1}</span>
                {' - '}
                <span className="font-medium">
                  {Math.min(endIndex, totalItems)}
                </span>{' '}
                명 표시
              </p>
            </div>
            <div>
              <nav
                className="inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* 페이지 번호들 */}
                {Array.from({ length: Math.min(CONSULTATION_PAGINATION_CONFIG.MAX_VISIBLE_PAGES, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, Math.min(totalPages - CONSULTATION_PAGINATION_CONFIG.MAX_VISIBLE_PAGES + 1, currentPage - Math.floor(CONSULTATION_PAGINATION_CONFIG.MAX_VISIBLE_PAGES / 2))) + i;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNumber
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationTableWithPagination; 