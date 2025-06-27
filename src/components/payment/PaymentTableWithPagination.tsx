import React from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  Info, 
  Database,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Payment } from '../../models/types';
import { SortConfig, PaginationConfig } from '../../types/member';
import { calculatePagination } from '../../utils/memberUtils';
import { PAGINATION_CONFIG, TABLE_COMPACT_CONFIG } from '../../config/memberConfig';

interface PaymentTableWithPaginationProps {
  payments: Payment[];
  sortConfig: SortConfig;
  pagination: PaginationConfig;
  isLoading?: boolean;
  onSort: (key: string) => void;
  onView: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (id: number) => void;
  onPaginationChange: (pagination: Partial<PaginationConfig>) => void;
  formatDate: (dateString: string | undefined | null) => string;
  formatCurrency: (value: number) => string;
}

const PaymentTableWithPagination: React.FC<PaymentTableWithPaginationProps> = ({
  payments,
  sortConfig,
  pagination,
  isLoading = false,
  onSort,
  onView,
  onEdit,
  onDelete,
  onPaginationChange,
  formatDate,
  formatCurrency,
}) => {
  const { currentPage, pageSize, showAll } = pagination;
  const totalItems = payments.length;

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
    if (showAll) return payments;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return payments.slice(startIndex, endIndex);
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

  const getStatusBadge = (status: Payment['status']) => {
    const badgeClass = `px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full`;
    
    switch (status) {
      case '완료':
        return <span className={`${badgeClass} bg-green-100 text-green-800`}>완료</span>;
      case '취소':
        return <span className={`${badgeClass} bg-yellow-100 text-yellow-800`}>취소</span>;
      case '환불':
        return <span className={`${badgeClass} bg-red-100 text-red-800`}>환불</span>;
      default:
        return <span className={`${badgeClass} bg-gray-100 text-gray-800`}>{status || '알 수 없음'}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 헤더 */}
      <div className={`px-4 ${TABLE_COMPACT_CONFIG.HEADER.containerPadding} bg-gray-50 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={TABLE_COMPACT_CONFIG.HEADER.iconSize} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">결제 내역</h3>
            <span className={`bg-blue-100 text-blue-800 ${TABLE_COMPACT_CONFIG.HEADER.badgeTextSize} font-medium px-2 py-0.5 rounded-full`}>
              총 {totalItems}건
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
        <div className={`${TABLE_COMPACT_CONFIG.LOADING.containerPadding} text-center`}>
          <div className={`animate-spin rounded-full ${TABLE_COMPACT_CONFIG.LOADING.spinnerSize} border-b-2 border-blue-600 mx-auto mb-4`}></div>
          <p className="text-gray-500">결제 내역을 불러오는 중...</p>
        </div>
      ) : totalItems === 0 ? (
        /* 빈 상태 */
        <div className={`${TABLE_COMPACT_CONFIG.EMPTY_STATE.containerPadding} text-center`}>
          <Database size={TABLE_COMPACT_CONFIG.EMPTY_STATE.iconSize} className="text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">결제 내역이 없습니다</h4>
          <p className="text-gray-500 mb-4">
            결제를 등록하려면 상단의 '새 결제 등록' 버튼을 클릭하세요.
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
                    { key: 'memberName', label: '회원명' },
                    { key: 'paymentDate', label: '결제일' },
                    { key: 'membershipType', label: '이용권' },
                    { key: 'paymentMethod', label: '결제 방법' },
                    { key: 'amount', label: '금액' },
                    { key: 'status', label: '상태' },
                    { key: 'staffName', label: '담당 직원' },
                    { key: 'actions', label: '작업', sortable: false },
                  ].map((column) => (
                    <th
                      key={column.key}
                      className={`${TABLE_COMPACT_CONFIG.HEADER.cellPadding} text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.sortable !== false
                          ? 'cursor-pointer hover:bg-gray-100 transition-colors'
                          : ''
                      } ${column.key === 'actions' ? 'text-center' : ''} ${column.key === 'amount' ? 'text-right' : ''}`}
                      onClick={() => 
                        column.sortable !== false ? onSort(column.key) : undefined
                      }
                    >
                      <div className={`flex items-center ${column.key === 'amount' ? 'justify-end' : ''}`}>
                        {column.label}
                        {column.sortable !== false && renderSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentPageData.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                    onClick={() => onView(payment)}
                  >
                    <td className={`${TABLE_COMPACT_CONFIG.CELL.padding} whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600`}>
                      {payment.memberName || `ID:${payment.memberId}`}
                    </td>
                    <td className={`${TABLE_COMPACT_CONFIG.CELL.padding} whitespace-nowrap ${TABLE_COMPACT_CONFIG.CELL.textSize} text-gray-700`}>
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className={`${TABLE_COMPACT_CONFIG.CELL.padding} whitespace-nowrap ${TABLE_COMPACT_CONFIG.CELL.textSize} text-gray-700`}>
                      {payment.membershipType || 'N/A'}
                    </td>
                    <td className={`${TABLE_COMPACT_CONFIG.CELL.padding} whitespace-nowrap ${TABLE_COMPACT_CONFIG.CELL.textSize} text-gray-700`}>
                      {payment.paymentMethod || payment.paymentType}
                    </td>
                    <td className={`${TABLE_COMPACT_CONFIG.CELL.padding} whitespace-nowrap text-right ${TABLE_COMPACT_CONFIG.CELL.textSize} text-gray-900`}>
                      ₩ {formatCurrency(payment.amount)}
                    </td>
                    <td className={`${TABLE_COMPACT_CONFIG.CELL.padding} whitespace-nowrap`}>
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className={`${TABLE_COMPACT_CONFIG.CELL.padding} whitespace-nowrap ${TABLE_COMPACT_CONFIG.CELL.textSize} text-gray-700`}>
                      {payment.staffName || '-'}
                    </td>
                    <td className={`${TABLE_COMPACT_CONFIG.CELL.padding} whitespace-nowrap text-center`}>
                      <div
                        className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onView(payment);
                          }}
                          className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                          title="상세보기"
                        >
                          <Info size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(payment);
                          }}
                          className="text-yellow-500 hover:text-yellow-700 transition-colors p-1"
                          title="수정"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('이 결제 기록을 삭제하시겠습니까?')) {
                              onDelete(payment.id!);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
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

          {/* 페이지네이션 (전체 보기 모드일 때는 숨김) */}
          {!showAll && totalPages > 1 && (
            <div className={`flex items-center justify-between ${TABLE_COMPACT_CONFIG.PAGINATION.containerPadding} bg-white border-t border-gray-200`}>
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
                    총 <span className="font-medium">{totalItems}</span>건 중{' '}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>
                    {' - '}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalItems)}
                    </span>{' '}
                    건 표시
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
                      className={`relative inline-flex items-center ${TABLE_COMPACT_CONFIG.PAGINATION.buttonPadding} text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {startPage > 1 && (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          className={`relative inline-flex items-center ${TABLE_COMPACT_CONFIG.PAGINATION.numberButtonPadding} border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50`}
                        >
                          1
                        </button>
                        {startPage > 2 && (
                          <span className={`relative inline-flex items-center ${TABLE_COMPACT_CONFIG.PAGINATION.numberButtonPadding} border border-gray-300 bg-white text-sm font-medium text-gray-700`}>
                            ...
                          </span>
                        )}
                      </>
                    )}

                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`relative inline-flex items-center ${TABLE_COMPACT_CONFIG.PAGINATION.numberButtonPadding} border text-sm font-medium ${
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
                          <span className={`relative inline-flex items-center ${TABLE_COMPACT_CONFIG.PAGINATION.numberButtonPadding} border border-gray-300 bg-white text-sm font-medium text-gray-700`}>
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className={`relative inline-flex items-center ${TABLE_COMPACT_CONFIG.PAGINATION.numberButtonPadding} border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage}
                      className={`relative inline-flex items-center ${TABLE_COMPACT_CONFIG.PAGINATION.buttonPadding} text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentTableWithPagination; 