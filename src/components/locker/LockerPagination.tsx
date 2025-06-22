import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getVisiblePageNumbers } from '../../utils/lockerUtils';
import { PAGINATION_COMPACT_CONFIG } from '../../config/lockerConfig';

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
      <div className={`text-center ${PAGINATION_COMPACT_CONFIG.CONTAINER.padding} ${PAGINATION_COMPACT_CONFIG.CONTAINER.textSize} text-gray-500`}>
        전체 {totalItems}개 락커 표시 중 (페이지네이션 불필요)
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${PAGINATION_COMPACT_CONFIG.CONTAINER.padding}`}>
      {/* 왼쪽: 정보 텍스트 */}
      <div className={PAGINATION_COMPACT_CONFIG.INFO.textSize}>
        {startItem}-{endItem} / {totalItems}
      </div>

      {/* 오른쪽: 페이지네이션 버튼들 */}
      <div className="flex items-center space-x-1">
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${PAGINATION_COMPACT_CONFIG.BUTTONS.padding} rounded-md border transition-colors ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
          }`}
          title="이전 페이지"
        >
          <ChevronLeft size={PAGINATION_COMPACT_CONFIG.BUTTONS.iconSize} />
        </button>

        {/* 페이지 번호 버튼들 */}
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${PAGINATION_COMPACT_CONFIG.BUTTONS.numberPadding} ${PAGINATION_COMPACT_CONFIG.BUTTONS.textSize} rounded-md border transition-colors ${
              page === currentPage
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
            }`}
          >
            {page}
          </button>
        ))}

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${PAGINATION_COMPACT_CONFIG.BUTTONS.padding} rounded-md border transition-colors ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
          }`}
          title="다음 페이지"
        >
          <ChevronRight size={PAGINATION_COMPACT_CONFIG.BUTTONS.iconSize} />
        </button>
      </div>
    </div>
  );
};

export default LockerPagination; 