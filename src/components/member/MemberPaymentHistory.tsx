import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Payment as PaymentType, MembershipType, Staff } from '../../models/types';
import { getAllPayments, getAllMembershipTypes, getAllStaff } from '../../database/ipcService';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import NewPaymentModal from '../payment/NewPaymentModal';
import { MemberOption } from '../payment/NewMemberSearchInput';
import { useToast } from '../../contexts/ToastContext';

interface MemberPaymentHistoryProps {
  memberId: number;
  memberName?: string;
}

const MemberPaymentHistory: React.FC<MemberPaymentHistoryProps> = ({
  memberId,
  memberName,
}) => {
  const { showToast } = useToast();
  
  const [payments, setPayments] = useState<PaymentType[]>([]);
  const [loadingPayments, setLoadingPayments] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showAll, setShowAll] = useState<boolean>(false);

  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loadingModalData, setLoadingModalData] = useState<boolean>(false);

  const formatDateToYYMMDD = (dateString: string | undefined | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\.$/, '');
  };

  const loadPayments = useCallback(async () => {
    if (!memberId) {
      setLoadingPayments(false);
      return;
    }
    setLoadingPayments(true);
    try {
      const res = await getAllPayments();
      if (res.success && res.data) {
        const memberPayments = res.data.filter(
          (payment) => payment.memberId === memberId,
        );
        memberPayments.sort(
          (a, b) =>
            new Date(b.paymentDate).getTime() -
            new Date(a.paymentDate).getTime(),
        );
        setPayments(memberPayments);
      } else {
        setPayments([]);
      }
    } catch (error) {
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  }, [memberId]);

  useEffect(() => {
    loadPayments();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'paymentUpdated') {
        loadPayments();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadPayments]);

  useEffect(() => {
    if (showAll) {
      setTotalPages(1);
      setCurrentPage(1);
    } else {
      setTotalPages(Math.max(1, Math.ceil(payments.length / pageSize)));
    }
  }, [payments, pageSize, showAll]);

  const currentTableData = useMemo(() => {
    if (showAll) {
      return payments;
    }
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return payments.slice(firstPageIndex, lastPageIndex);
  }, [payments, currentPage, pageSize, showAll]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleShowAllToggle = () => {
    setShowAll(!showAll);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(value);
  };

  const renderPagination = () => {
    if (payments.length === 0 && !loadingPayments) return null;
    const pageNumbers = [];
    const maxVisiblePages = 3;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200 sm:px-0">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || showAll}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || showAll}
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              총 <span className="font-medium">{payments.length}</span>건
              {!showAll && (
                <>
                  {' '}
                  중{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * pageSize + 1}
                  </span>
                  {' - '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, payments.length)}
                  </span>{' '}
                  건 표시
                </>
              )}
            </p>
          </div>
          {!showAll && totalPages > 1 && (
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
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 모달용 데이터 로딩
  const loadModalData = useCallback(async () => {
    setLoadingModalData(true);
    try {
      const [membershipTypesRes, staffRes] = await Promise.all([
        getAllMembershipTypes(),
        getAllStaff(),
      ]);

      if (membershipTypesRes.success && membershipTypesRes.data) {
        setMembershipTypes(membershipTypesRes.data);
      }

      if (staffRes.success && staffRes.data) {
        setStaffList(staffRes.data);
      }
    } catch (error) {
      console.error('모달 데이터 로딩 실패:', error);
    } finally {
      setLoadingModalData(false);
    }
  }, []);

  // 결제 모달 열기
  const handleOpenPaymentModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // 부모 form submit 방지
      e.stopPropagation(); // 이벤트 전파 중단
    }
    setPaymentModalOpen(true);
    if (membershipTypes.length === 0 || staffList.length === 0) {
      loadModalData();
    }
  };

  // 결제 모달 닫기
  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
  };

  // 결제 저장 성공 시
  const handlePaymentSaveSuccess = () => {
    handleClosePaymentModal();
    loadPayments(); // 결제 내역 새로고침
    
    // localStorage 이벤트 발생시켜서 다른 컴포넌트들도 업데이트
    localStorage.setItem('paymentUpdated', new Date().toISOString());
    
    showToast('success', '새 결제가 성공적으로 등록되었습니다.');
  };

  // 현재 회원을 MemberOption 형태로 변환
  const currentMemberOption: MemberOption[] = useMemo(() => {
    if (memberId && memberName) {
      return [{ id: memberId, name: memberName, memberId: String(memberId) }];
    }
    return [];
  }, [memberId, memberName]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">결제 내역</h3>
        <button
          type="button"
          onClick={handleOpenPaymentModal}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          결제 추가
        </button>
      </div>
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className={`border border-gray-300 rounded-md px-2 py-1.5 sm:px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                showAll ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={showAll || payments.length === 0}
            >
              <option value={5}>5개씩 보기</option>
              <option value={10}>10개씩 보기</option>
              <option value={15}>15개씩 보기</option>
            </select>
            <button
              onClick={handleShowAllToggle}
              disabled={payments.length === 0}
              className={`px-2 py-1.5 sm:px-3 text-sm rounded-md transition-colors ${
                showAll
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {showAll ? '페이지 보기' : '전체 보기'}
            </button>
          </div>
        </div>

        {loadingPayments ? (
          <div className="p-6 text-center text-gray-500">
            결제 내역을 불러오는 중입니다...
          </div>
        ) : payments.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            이 회원의 결제 내역이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    결제일
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    이용권
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    금액
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    상태
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTableData.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatDateToYYMMDD(payment.paymentDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {payment.membershipType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === '완료'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === '취소'
                              ? 'bg-red-100 text-red-800'
                              : payment.status === '환불'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loadingPayments && !showAll && totalPages > 1 && renderPagination()}
      </div>

      {/* 결제 추가 모달 */}
      <NewPaymentModal
        isOpen={paymentModalOpen}
        onClose={handleClosePaymentModal}
        onSaveSuccess={handlePaymentSaveSuccess}
        payment={null} // 새 결제이므로 null
        isViewMode={false} // 편집 모드
        members={currentMemberOption} // 현재 회원만 포함된 배열
        membershipTypes={membershipTypes}
        staffList={staffList}
      />
    </div>
  );
};

export default MemberPaymentHistory; 