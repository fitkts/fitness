import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getVisiblePageNumbers } from '../../utils/lockerUtils';

interface LockerPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

const LockerPagination: React.FC<LockerPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 50
}) => {
  const visiblePages = getVisiblePageNumbers(currentPage, totalPages);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // 디버깅 정보 출력
  console.log('🔍 페이지네이션 디버깅:', {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    startItem,
    endItem,
    visiblePages,
    shouldShow: totalPages > 1
  });

  // 페이지가 1개 이하면 페이지네이션 숨김
  if (totalPages <= 1) {
    return (
      <div className="text-center py-4 text-sm text-gray-500">
        전체 {totalItems}개 락커 표시 중 (페이지네이션 불필요)
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      {/* 결과 정보 */}
      <div className="text-sm text-gray-700">
        <span>
          {totalItems > 0 ? (
            <>
              <span className="font-medium">{startItem}</span>
              {' - '}
              <span className="font-medium">{endItem}</span>
              {' / '}
              <span className="font-medium">{totalItems}</span>
              개 결과
            </>
          ) : (
            '결과 없음'
          )}
        </span>
      </div>

      {/* 페이지네이션 버튼들 */}
      <div className="flex items-center gap-2">
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="이전 페이지"
        >
          <ChevronLeft size={16} />
        </button>

        {/* 첫 페이지 버튼 (시작 페이지가 1이 아닐 때) */}
        {visiblePages[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              1
            </button>
            {visiblePages[0] > 2 && (
              <span className="px-2 text-gray-500">...</span>
            )}
          </>
        )}

        {/* 페이지 번호 버튼들 */}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded border transition-colors ${
              currentPage === page
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        {/* 마지막 페이지 버튼 (끝 페이지가 총 페이지수가 아닐 때) */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="다음 페이지"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default LockerPagination; 