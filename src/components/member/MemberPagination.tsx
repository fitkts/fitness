import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Member } from '../../models/types';
import { PaginationConfig } from '../../types/member';
import { calculatePagination } from '../../utils/memberUtils';
import { PAGINATION_CONFIG } from '../../config/memberConfig';

interface MemberPaginationProps {
  filteredMembers: Member[];
  pagination: PaginationConfig;
  onPaginationChange: (newPagination: Partial<PaginationConfig>) => void;
}

const MemberPagination: React.FC<MemberPaginationProps> = ({
  filteredMembers,
  pagination,
  onPaginationChange,
}) => {
  const { currentPage, pageSize, showAll } = pagination;
  const totalItems = filteredMembers.length;

  const paginationInfo = calculatePagination(
    totalItems,
    currentPage,
    pageSize,
    PAGINATION_CONFIG.MAX_VISIBLE_PAGES
  );

  const { totalPages, pageNumbers, hasNextPage, hasPrevPage, startPage, endPage } = paginationInfo;

  const handlePageChange = (page: number) => {
    onPaginationChange({ currentPage: page });
  };

  const handlePageSizeChange = (size: number) => {
    onPaginationChange({ 
      pageSize: size, 
      currentPage: 1 
    });
  };

  const handleShowAllToggle = () => {
    onPaginationChange({ 
      showAll: !showAll,
      currentPage: 1 
    });
  };

  return (
    <>
      {/* 페이지 사이즈 및 전체보기 컨트롤 */}
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className={`border border-gray-300 rounded-md px-2 py-1.5 sm:px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              showAll ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={showAll}
          >
            {PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.map((size) => (
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
          총 {totalItems}명의 회원
          {!showAll &&
            ` (${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, totalItems)}번째 표시)`}
        </div>
      </div>

      {/* 페이지네이션 (전체 보기 모드일 때는 숨김) */}
      {!showAll && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
          <div className="flex justify-between flex-1 sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                총 <span className="font-medium">{totalItems}</span>명 중{' '}
                <span className="font-medium">
                  {(currentPage - 1) * pageSize + 1}
                </span>
                {' - '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalItems)}
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
                  disabled={!hasPrevPage}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {startPage > 1 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      1
                    </button>
                    {startPage > 2 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}
                  </>
                )}

                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === number
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}

                {endPage < totalPages && (
                  <>
                    {endPage < totalPages - 1 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MemberPagination; 