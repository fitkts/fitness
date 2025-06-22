import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  DollarSign,
  CreditCard,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  ListChecks,
  Settings2,
  BarChart3,
} from 'lucide-react';
import NewPaymentModal from '../components/payment/NewPaymentModal';
import MembershipTypeModal from '../components/payment/MembershipTypeModal';
import PaymentTable from '../components/payment/PaymentTable';
import MembershipTypeList from '../components/payment/MembershipTypeList';
import PaymentSearchFilter from '../components/payment/PaymentSearchFilter';
import MembershipTypeSearchFilter from '../components/payment/MembershipTypeSearchFilter';
import PaymentStatistics from '../components/payment/PaymentStatistics';
import {
  getAllMembers,
  getAllPayments,
  getAllMembershipTypes,
  getAllStaff,
  deletePayment,
  deleteMembershipType,
} from '../database/ipcService';
import { useToast } from '../contexts/ToastContext';
import { Member, Payment, MembershipType, Staff } from '../models/types';
import { MembershipTypeFilter } from '../types/payment';
import { MemberOption } from '../components/payment/NewMemberSearchInput';
import { 
  filterPayments, 
  filterMembershipTypes, 
  calculatePaymentStatistics,
  formatDate,
  formatCurrency,
  PaymentFilter
} from '../utils/paymentUtils';

// 포맷팅 함수들은 utils로 이동했으므로 삭제

const ITEMS_PER_PAGE = 10; // 페이지당 항목 수

const PaymentPage: React.FC = () => {
  const { showToast } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentViewMode, setIsPaymentViewMode] = useState<boolean>(false);

  const [membershipTypeModalOpen, setMembershipTypeModalOpen] = useState<boolean>(false);
  const [selectedMembershipType, setSelectedMembershipType] = useState<MembershipType | null>(null);
  const [isMembershipTypeViewMode, setIsMembershipTypeViewMode] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState<'payments' | 'membershipTypes' | 'statistics'>('payments');

  const [paymentSortConfig, setPaymentSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' | null }>({ key: 'paymentDate', direction: 'descending' });
  const [membershipTypeSortConfig, setMembershipTypeSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' | null }>({ key: 'name', direction: 'ascending' });

  // 페이지네이션 상태 추가
  const [paymentsCurrentPage, setPaymentsCurrentPage] = useState<number>(1);
  const [membershipTypesCurrentPage, setMembershipTypesCurrentPage] = useState<number>(1);

  // 필터 상태 추가
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>({
    search: '',
    status: 'all',
    membershipType: 'all',
    paymentMethod: 'all',
    staffName: 'all',
    startDate: '',
    endDate: '',
    minAmount: undefined,
    maxAmount: undefined,
  });

  const [membershipTypeFilter, setMembershipTypeFilter] = useState<MembershipTypeFilter>({
    search: '',
    minPrice: undefined,
    maxPrice: undefined,
    minDuration: undefined,
    maxDuration: undefined,
  });

  // 필터링된 데이터 계산
  const filteredPayments = useMemo(() => {
    return filterPayments(payments, paymentFilter);
  }, [payments, paymentFilter]);

  const filteredMembershipTypes = useMemo(() => {
    return filterMembershipTypes(membershipTypes, membershipTypeFilter);
  }, [membershipTypes, membershipTypeFilter]);

  // 통계 데이터 계산
  const paymentStatistics = useMemo(() => {
    return calculatePaymentStatistics(filteredPayments);
  }, [filteredPayments]);

  // 이용권 종류 목록 (필터용)
  const membershipTypeNames = useMemo(() => {
    return [...new Set(payments.map(p => p.membershipType).filter(Boolean))];
  }, [payments]);

  // 필터 초기화 함수들
  const resetPaymentFilter = useCallback(() => {
    setPaymentFilter({
      search: '',
      status: 'all',
      membershipType: 'all',
      paymentMethod: 'all',
      staffName: 'all',
      startDate: '',
      endDate: '',
      minAmount: undefined,
      maxAmount: undefined,
    });
    setPaymentsCurrentPage(1);
  }, []);

  const resetMembershipTypeFilter = useCallback(() => {
    setMembershipTypeFilter({
      search: '',
      minPrice: undefined,
      maxPrice: undefined,
      minDuration: undefined,
      maxDuration: undefined,
    });
    setMembershipTypesCurrentPage(1);
  }, []);

  const requestPaymentSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (paymentSortConfig.key === key && paymentSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setPaymentSortConfig({ key, direction });
    setPaymentsCurrentPage(1); // 정렬 시 첫 페이지로 이동
  };

  const requestMembershipTypeSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (membershipTypeSortConfig.key === key && membershipTypeSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setMembershipTypeSortConfig({ key, direction });
    setMembershipTypesCurrentPage(1); // 정렬 시 첫 페이지로 이동
  };
  
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [paymentsRes, membershipTypesRes, membersRes, staffRes] = await Promise.all([
        getAllPayments(),
        getAllMembershipTypes(),
        getAllMembers(),
        getAllStaff(),
      ]);

      if (paymentsRes.success && paymentsRes.data) {
        setPayments(paymentsRes.data);
      } else {
        setError(prev => (prev ? prev + '\n' : '') + ('결제 내역 로드 실패: ' + (paymentsRes.error || '알 수 없는 오류')));
      }

      if (membershipTypesRes.success && membershipTypesRes.data) {
        setMembershipTypes(membershipTypesRes.data);
      } else {
        setError(prev => (prev ? prev + '\n' : '') + ('이용권 종류 로드 실패: ' + (membershipTypesRes.error || '알 수 없는 오류')));
      }

      if (membersRes.success && membersRes.data) {
        setMembers(membersRes.data);
      } else {
        console.warn('회원 목록 로드 실패 (결제용):', membersRes.error);
        setMembers([]);
      }

      if (staffRes.success && staffRes.data) {
        setStaffList(staffRes.data);
      } else {
        console.warn('직원 목록 로드 실패 (결제용):', staffRes.error);
        setStaffList([]);
      }

    } catch (err: any) {
      console.error('데이터 로딩 중 심각한 오류 발생:', err);
      setError('데이터를 불러오는 중 심각한 오류가 발생했습니다. ' + err.message);
      setPayments([]);
      setMembershipTypes([]);
      setMembers([]);
      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const memberOptionsForModal: MemberOption[] = useMemo(() => {
    return members.map(member => ({
      id: member.id as number,
      name: member.name,
      memberId: String(member.id)
    }));
  }, [members]);

  const handleOpenPaymentModal = (payment: Payment | null = null, viewMode: boolean = false) => {
    setSelectedPayment(payment);
    setIsPaymentViewMode(viewMode);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedPayment(null);
    setIsPaymentViewMode(false);
  };

  const handlePaymentSaveSuccess = () => {
    handleClosePaymentModal();
    loadData(); 
    showToast('success', selectedPayment ? '결제 정보가 성공적으로 수정되었습니다.' : '새 결제가 성공적으로 등록되었습니다.');
  };

  const handleOpenMembershipTypeModal = (type: MembershipType | null = null, viewMode: boolean = false) => {
    setSelectedMembershipType(type);
    setIsMembershipTypeViewMode(viewMode);
    setMembershipTypeModalOpen(true);
  };

  const handleCloseMembershipTypeModal = () => {
    setMembershipTypeModalOpen(false);
    setSelectedMembershipType(null);
    setIsMembershipTypeViewMode(false);
  };

  const handleMembershipTypeSaveSuccess = () => {
    handleCloseMembershipTypeModal();
    loadData();
    showToast('success', selectedMembershipType ? '이용권 정보가 성공적으로 수정되었습니다.' : '새 이용권이 성공적으로 추가되었습니다.');
  };

  const sortedPayments = useMemo(() => {
    let sortableItems = [...filteredPayments];
    if (paymentSortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = (a as any)[paymentSortConfig.key!];
        const valB = (b as any)[paymentSortConfig.key!];
        if (valA < valB) {
          return paymentSortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return paymentSortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredPayments, paymentSortConfig]);

  const sortedMembershipTypes = useMemo(() => {
    let sortableItems = [...filteredMembershipTypes];
    if (membershipTypeSortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = (a as any)[membershipTypeSortConfig.key!];
        const valB = (b as any)[membershipTypeSortConfig.key!];
        if (valA < valB) {
          return membershipTypeSortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return membershipTypeSortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredMembershipTypes, membershipTypeSortConfig]);

  // 페이지네이션된 데이터
  const paginatedPayments = useMemo(() => {
    const startIndex = (paymentsCurrentPage - 1) * ITEMS_PER_PAGE;
    return sortedPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedPayments, paymentsCurrentPage]);

  const paginatedMembershipTypes = useMemo(() => {
    const startIndex = (membershipTypesCurrentPage - 1) * ITEMS_PER_PAGE;
    return sortedMembershipTypes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedMembershipTypes, membershipTypesCurrentPage]);

  // 총 페이지 수 계산
  const totalPaymentPages = Math.ceil(sortedPayments.length / ITEMS_PER_PAGE);
  const totalMembershipTypePages = Math.ceil(sortedMembershipTypes.length / ITEMS_PER_PAGE);

  // 페이지 변경 핸들러
  const handlePaymentPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPaymentPages) {
      setPaymentsCurrentPage(newPage);
    }
  };

  const handleMembershipTypePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalMembershipTypePages) {
      setMembershipTypesCurrentPage(newPage);
    }
  };
  
  // Pagination UI 컴포넌트
  const PaginationControls: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemCount: number;
  }> = ({ currentPage, totalPages, onPageChange, itemCount }) => {
    if (itemCount === 0) return null;
    return (
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
        <div className="mb-2 sm:mb-0">
          총 {itemCount}개 중 { (currentPage -1) * ITEMS_PER_PAGE + 1 } - { Math.min(currentPage * ITEMS_PER_PAGE, itemCount) } 표시
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} className="mr-1 inline" /> 첫 페이지
          </button>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2.5 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-3 py-1.5">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            마지막 페이지 <ChevronRight size={14} className="ml-1 inline"/>
          </button>
        </div>
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-3" size={24} />
            <div className="text-red-700">
              <p className="font-bold">오류 발생</p>
              {error.split('\n').map((line, index) => <p key={index}>{line}</p>)}
              <button
                onClick={loadData}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('payments')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'payments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <ListChecks size={16} className="inline mr-2" /> 결제 내역 ({sortedPayments.length})
          </button>
          <button
            onClick={() => setActiveTab('membershipTypes')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'membershipTypes'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Settings2 size={16} className="inline mr-2" /> 이용권 관리 ({sortedMembershipTypes.length})
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'statistics'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <BarChart3 size={16} className="inline mr-2" /> 통계 분석 ({filteredPayments.length})
          </button>
        </nav>
      </div>

      {/* 통계 탭 */}
      {activeTab === 'statistics' && (
        <div className="space-y-6">
          <PaymentStatistics 
            statistics={paymentStatistics} 
            isLoading={isLoading} 
          />
          
          {/* 결제 필터와 결과 */}
          <PaymentSearchFilter
            filter={paymentFilter}
            onFilterChange={setPaymentFilter}
            onReset={resetPaymentFilter}
            membershipTypes={membershipTypeNames}
            staffList={staffList}
            showActionButtons={true}
            onAddPayment={() => handleOpenPaymentModal(null, false)}
            onAddMembershipType={() => handleOpenMembershipTypeModal(null, false)}
            onImportSuccess={loadData}
            showToast={showToast}
            payments={payments}
          />
          
          {/* 필터링된 결제 목록 (간략 버전) */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">필터링된 결제 내역</h2>
            <PaymentTable
              payments={paginatedPayments}
              membershipTypes={membershipTypes}
              sortConfig={paymentSortConfig}
              requestSort={requestPaymentSort}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              onViewPayment={(payment) => handleOpenPaymentModal(payment, true)}
              onEditPayment={(payment) => handleOpenPaymentModal(payment, false)}
              onDeletePayment={async (paymentId) => {
                if (window.confirm('정말로 이 결제 내역을 삭제하시겠습니까?')) {
                  try {
                    const result = await deletePayment(paymentId);
                    if (result.success) {
                      showToast('success', '결제 내역이 성공적으로 삭제되었습니다.');
                      loadData(); 
                      setPaymentsCurrentPage(1);
                    } else {
                      showToast('error', `결제 내역 삭제 실패: ${result.error || '알 수 없는 오류'}`);
                    }
                  } catch (error: any) {
                    showToast('error', `삭제 중 오류 발생: ${error.message || '알 수 없는 오류'}`);
                  }
                }
              }}
            />
            <PaginationControls
              currentPage={paymentsCurrentPage}
              totalPages={totalPaymentPages}
              onPageChange={handlePaymentPageChange}
              itemCount={sortedPayments.length}
            />
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* 결제 검색 필터 */}
          <PaymentSearchFilter
            filter={paymentFilter}
            onFilterChange={setPaymentFilter}
            onReset={resetPaymentFilter}
            membershipTypes={membershipTypeNames}
            staffList={staffList}
            showActionButtons={true}
            onAddPayment={() => handleOpenPaymentModal(null, false)}
            onAddMembershipType={() => handleOpenMembershipTypeModal(null, false)}
            onImportSuccess={loadData}
            showToast={showToast}
            payments={payments}
          />
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">결제 내역</h2>
            {paginatedPayments.length === 0 && sortedPayments.length > 0 && (
               <div className="text-center py-10">
                  <p className="text-gray-500">현재 페이지에 표시할 결제 내역이 없습니다.</p>
               </div>
            )}
            {sortedPayments.length === 0 ? (
              <div className="text-center py-10">
                <DollarSign size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">등록된 결제 내역이 없습니다.</p>
                <p className="text-sm text-gray-400 mt-1">
                  '새 결제 등록' 버튼을 클릭하여 결제를 추가하세요.
                </p>
              </div>
            ) : (
              <>
                <PaymentTable
                  payments={paginatedPayments}
                  membershipTypes={membershipTypes}
                  sortConfig={paymentSortConfig}
                  requestSort={requestPaymentSort}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                  onViewPayment={(payment) => handleOpenPaymentModal(payment, true)}
                  onEditPayment={(payment) => handleOpenPaymentModal(payment, false)}
                  onDeletePayment={async (paymentId) => {
                    if (window.confirm('정말로 이 결제 내역을 삭제하시겠습니까?')) {
                      try {
                        const result = await deletePayment(paymentId);
                        if (result.success) {
                          showToast('success', '결제 내역이 성공적으로 삭제되었습니다.');
                          loadData(); 
                          setPaymentsCurrentPage(1);
                        } else {
                          showToast('error', `결제 내역 삭제 실패: ${result.error || '알 수 없는 오류'}`);
                        }
                      } catch (error: any) {
                        showToast('error', `삭제 중 오류 발생: ${error.message || '알 수 없는 오류'}`);
                      }
                    }
                  }}
                />
                <PaginationControls
                  currentPage={paymentsCurrentPage}
                  totalPages={totalPaymentPages}
                  onPageChange={handlePaymentPageChange}
                  itemCount={sortedPayments.length}
                />
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'membershipTypes' && (
        <div className="space-y-6">
          {/* 이용권 검색 필터 */}
          <MembershipTypeSearchFilter
            filter={membershipTypeFilter}
            onFilterChange={setMembershipTypeFilter}
            onReset={resetMembershipTypeFilter}
            showActionButtons={true}
            onAddMembershipType={() => handleOpenMembershipTypeModal(null, false)}
            onImportSuccess={loadData}
            showToast={showToast}
            membershipTypes={membershipTypes}
          />
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">이용권 관리</h2>
            {paginatedMembershipTypes.length === 0 && sortedMembershipTypes.length > 0 && (
               <div className="text-center py-10">
                  <p className="text-gray-500">현재 페이지에 표시할 이용권 종류가 없습니다.</p>
               </div>
            )}
            {sortedMembershipTypes.length === 0 ? (
              <div className="text-center py-10">
                <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">등록된 이용권 종류가 없습니다.</p>
                <p className="text-sm text-gray-400 mt-1">
                  '새 이용권 추가' 버튼을 클릭하여 이용권을 추가하세요.
                </p>
              </div>
            ) : (
              <>
                <MembershipTypeList
                  membershipTypes={paginatedMembershipTypes}
                  sortConfig={membershipTypeSortConfig}
                  requestSort={requestMembershipTypeSort}
                  formatCurrency={formatCurrency}
                  onViewType={(type) => handleOpenMembershipTypeModal(type, true)}
                  onEditType={(type) => handleOpenMembershipTypeModal(type, false)}
                  onDeleteType={async (typeId) => {
                    if (window.confirm('정말로 이 이용권 종류를 삭제하시겠습니까? 이 작업은 연결된 결제 내역에 영향을 줄 수 있습니다.')) {
                      try {
                        const result = await deleteMembershipType(typeId);
                        if (result.success) {
                          showToast('success', '이용권 종류가 성공적으로 삭제되었습니다.');
                          loadData();
                          setMembershipTypesCurrentPage(1);
                        } else {
                          showToast('error', `이용권 종류 삭제 실패: ${result.error || '알 수 없는 오류'}`);
                        }
                      } catch (error: any) {
                        showToast('error', `삭제 중 오류 발생: ${error.message || '알 수 없는 오류'}`);
                      }
                    }
                  }}
                />
                <PaginationControls
                  currentPage={membershipTypesCurrentPage}
                  totalPages={totalMembershipTypePages}
                  onPageChange={handleMembershipTypePageChange}
                  itemCount={sortedMembershipTypes.length}
                />
              </>
            )}
          </div>
        </div>
      )}

      {paymentModalOpen && (
        <NewPaymentModal
          isOpen={paymentModalOpen}
          onClose={handleClosePaymentModal}
          onSaveSuccess={handlePaymentSaveSuccess}
          payment={selectedPayment}
          isViewMode={isPaymentViewMode}
          members={memberOptionsForModal}
          membershipTypes={membershipTypes}
          staffList={staffList}
        />
      )}

      {membershipTypeModalOpen && (
        <MembershipTypeModal
          isOpen={membershipTypeModalOpen}
          onClose={handleCloseMembershipTypeModal}
          onSaveSuccess={handleMembershipTypeSaveSuccess}
          membershipType={selectedMembershipType}
          isViewMode={isMembershipTypeViewMode}
        />
      )}
    </div>
  );
};

export default PaymentPage;
