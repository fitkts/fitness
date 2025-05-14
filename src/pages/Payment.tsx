import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Filter, CreditCard, Calendar, Download, MoreHorizontal, Settings, Edit, Trash2, AlertTriangle, Info, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Database, Upload, X as CloseIcon } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import MembershipTypeModal from '../components/MembershipTypeModal';
import {
  getAllPayments,
  addPayment,
  updatePayment,
  deletePayment,
  getAllMembershipTypes,
  addMembershipType,
  updateMembershipType,
  deleteMembershipType,
  getAllMembers,
} from '../database/ipcService';
import { useToast, ToastType } from '../contexts/ToastContext';
import { Member, Payment, MembershipType } from '../models/types';
import * as XLSX from 'xlsx';

const Payment: React.FC = () => {
  // 상태 관리
  const [payments, setPayments] = useState<Payment[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'membership-types'>('payments');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this-week' | 'this-month'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | '완료' | '취소' | '환불'>('all');
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);
  
  // 정렬 관련 상태
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending' | null;
  }>({ key: '', direction: null });

  // 페이지네이션 관련 상태
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(30);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [pagedPayments, setPagedPayments] = useState<Payment[]>([]);
  
  // 모달 상태 관리
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [membershipTypeModalOpen, setMembershipTypeModalOpen] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedMembershipType, setSelectedMembershipType] = useState<MembershipType | null>(null);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);

  // useToast를 try-catch로 감싸서 오류 방지
  let showToast: (type: ToastType, message: string) => void;
  try {
    const toastContext = useToast();
    showToast = toastContext?.showToast || ((type, message) => console.log(`Fallback Toast (${type}): ${message}`));
  } catch (error) {
    console.error("Payment: Toast 컨텍스트를 사용할 수 없습니다:", error);
    showToast = (type, message) => console.log(`Error Toast (${type}): ${message}`);
  }

  // 통계 데이터 계산 (useMemo로 성능 최적화)
  const statistics = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const totalAmount = payments.reduce((sum, payment) => 
      payment.status === '완료' ? sum + payment.amount : sum, 0);
    
    const thisMonthAmount = payments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.paymentDate);
      return payment.status === '완료' && paymentDate >= thisMonth ? sum + payment.amount : sum;
    }, 0);
    
    const lastMonthAmount = payments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.paymentDate);
      return payment.status === '완료' && paymentDate >= lastMonth && paymentDate < thisMonth ? sum + payment.amount : sum;
    }, 0);
    
    const paymentMethods: {[key: string]: number} = {};
    payments.forEach(payment => {
      if (payment.status === '완료') {
        paymentMethods[payment.paymentMethod] = (paymentMethods[payment.paymentMethod] || 0) + payment.amount;
      }
    });
    
    const membershipTypeStats: {[key: string]: number} = {};
    payments.forEach(payment => {
      if (payment.status === '완료') {
        membershipTypeStats[payment.membershipType] = (membershipTypeStats[payment.membershipType] || 0) + payment.amount;
      }
    });
    
    const sortedMembershipTypes = Object.entries(membershipTypeStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return {
      totalAmount,
      thisMonthAmount,
      lastMonthAmount,
      paymentMethods,
      topMembershipTypes: sortedMembershipTypes,
      totalPayments: payments.length,
      completedPayments: payments.filter(p => p.status === '완료').length,
      cancelledPayments: payments.filter(p => p.status === '취소').length,
      refundedPayments: payments.filter(p => p.status === '환불').length
    };
  }, [payments]);

  // 데이터 로드 함수
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsRes, typesRes, membersRes] = await Promise.all([
        getAllPayments(),
        getAllMembershipTypes(),
        getAllMembers()
      ]);

      if (paymentsRes.success && paymentsRes.data) {
        setPayments(paymentsRes.data);
      } else {
        showToast('error', '결제 내역 로드 실패: ' + (paymentsRes.error || '알 수 없는 오류'));
        setPayments([]);
      }

      if (typesRes.success && typesRes.data) {
        setMembershipTypes(typesRes.data);
      } else {
        showToast('error', '이용권 종류 로드 실패: ' + (typesRes.error || '알 수 없는 오류'));
        setMembershipTypes([]);
      }

      if (membersRes.success && membersRes.data) {
        setMembers(membersRes.data);
      } else {
        showToast('error', '회원 목록 로드 실패: ' + (membersRes.error || '알 수 없는 오류'));
        setMembers([]);
      }

    } catch (error) {
      console.error('데이터 로드 중 오류 발생:', error);
      showToast('error', '데이터 로드 중 오류가 발생했습니다.');
      setPayments([]);
      setMembershipTypes([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 금액 포맷팅 함수
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(value);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 정렬 요청 처리 함수
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null;
      }
    }
    
    setSortConfig({ key, direction });
  };

  // 정렬된 결제 목록 생성
  const sortedPayments = useMemo(() => {
    let sortablePayments = [...payments];
    
    if (sortConfig.direction === null) {
      return sortablePayments;
    }
    
    return sortablePayments.sort((a, b) => {
      if (a[sortConfig.key as keyof Payment] === undefined || b[sortConfig.key as keyof Payment] === undefined) {
        return 0;
      }
      
      // 금액 정렬
      if (sortConfig.key === 'amount') {
        if (sortConfig.direction === 'ascending') {
          return a.amount - b.amount;
        } else {
          return b.amount - a.amount;
        }
      }
      
      // 날짜 정렬
      if (sortConfig.key === 'paymentDate' || sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
        const aDate = new Date(a[sortConfig.key] as string).getTime();
        const bDate = new Date(b[sortConfig.key] as string).getTime();
        
        if (sortConfig.direction === 'ascending') {
          return aDate - bDate;
        } else {
          return bDate - aDate;
        }
      }
      
      // 문자열 정렬
      if (typeof a[sortConfig.key as keyof Payment] === 'string') {
        const aValue = (a[sortConfig.key as keyof Payment] as string) || '';
        const bValue = (b[sortConfig.key as keyof Payment] as string) || '';
        
        if (sortConfig.direction === 'ascending') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      return 0;
    });
  }, [payments, sortConfig]);

  // 필터링된 결제 목록
  const filteredPayments = useMemo(() => {
    return sortedPayments.filter(payment => {
      // 검색어 필터링
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!payment.memberName.toLowerCase().includes(term) &&
            !payment.receiptNumber?.toLowerCase().includes(term) &&
            !payment.membershipType.toLowerCase().includes(term)) {
          return false;
        }
      }

      // 날짜 필터링
      if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const paymentDate = new Date(payment.paymentDate);
        
        if (dateFilter === 'today' && paymentDate < today) {
          return false;
        }
        if (dateFilter === 'this-week' && paymentDate < thisWeekStart) {
          return false;
        }
        if (dateFilter === 'this-month' && paymentDate < thisMonthStart) {
          return false;
        }
      }

      // 상태 필터링
      if (statusFilter !== 'all' && payment.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [sortedPayments, searchTerm, dateFilter, statusFilter]);

  // 페이지당 표시 결제 수 변경 핸들러
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // 전체 보기 토글 핸들러
  const handleShowAllToggle = () => {
    setShowAll(!showAll);
    setCurrentPage(1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 페이지네이션 컴포넌트
  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
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
              총 <span className="font-medium">{filteredPayments.length}</span>건 중{' '}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>
              {' - '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, filteredPayments.length)}
              </span>
              {' '}건 표시
            </p>
          </div>
          <div>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
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
        </div>
      </div>
    );
  };

  // 엑셀 내보내기 함수
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(payments);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '결제내역');
    XLSX.writeFile(wb, '결제내역.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col rounded mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">결제 관리</h1>
        
        {/* 탭 메뉴 */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('payments')}
            >
              결제 내역
            </button>
            <button
              className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'membership-types'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('membership-types')}
            >
              이용권 관리
            </button>
          </div>
        </div>

        {/* 결제 내역 탭 */}
        {activeTab === 'payments' && (
          <>
            {/* 검색 및 필터 영역 */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-wrap gap-4 items-center mb-4">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="회원명, 이용권, 영수증 번호로 검색..."
                    className="border border-gray-300 p-3 rounded-md w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-md flex items-center transition-colors"
                  onClick={() => setShowFilterOptions(!showFilterOptions)}
                >
                  <Filter size={18} className="mr-2" />
                  필터 {showFilterOptions ? '숨기기' : '보기'}
                </button>
                
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md flex items-center transition-colors ml-auto"
                  onClick={() => setPaymentModalOpen(true)}
                >
                  <Plus size={18} className="mr-2" />
                  새 결제 등록
                </button>

                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button
                    title="엑셀 내보내기"
                    style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: 6, cursor: 'pointer' }}
                    onClick={handleExportExcel}
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
              
              {showFilterOptions && (
                <div className="bg-gray-50 p-4 rounded-md flex flex-wrap gap-4 items-center animate-fadeIn">
                  <div>
                    <label htmlFor="dateFilter" className="mr-2 font-medium text-gray-700">기간:</label>
                    <select
                      id="dateFilter"
                      className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as any)}
                    >
                      <option value="all">전체 기간</option>
                      <option value="today">오늘</option>
                      <option value="this-week">이번 주</option>
                      <option value="this-month">이번 달</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="statusFilter" className="mr-2 font-medium text-gray-700">상태:</label>
                    <select
                      id="statusFilter"
                      className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                      <option value="all">전체</option>
                      <option value="완료">완료</option>
                      <option value="취소">취소</option>
                      <option value="환불">환불</option>
                    </select>
                  </div>
                  
                  <button 
                    className="text-sm text-blue-500 hover:text-blue-700 ml-auto"
                    onClick={() => {
                      setDateFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    필터 초기화
                  </button>
                </div>
              )}
            </div>

            {/* 통계 요약 영역 */}
            {!loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">총 결제액</p>
                    <p className="text-2xl font-bold text-blue-800 mt-1">
                      ₩ {formatCurrency(statistics.totalAmount)}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">이번 달 결제액</p>
                    <p className="text-2xl font-bold text-green-800 mt-1">
                      ₩ {formatCurrency(statistics.thisMonthAmount)}
                      <span className="text-sm font-normal ml-1">
                        ({((statistics.thisMonthAmount / statistics.totalAmount) * 100 || 0).toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-600 font-medium">지난 달 결제액</p>
                    <p className="text-2xl font-bold text-yellow-800 mt-1">
                      ₩ {formatCurrency(statistics.lastMonthAmount)}
                      <span className="text-sm font-normal ml-1">
                        ({((statistics.lastMonthAmount / statistics.totalAmount) * 100 || 0).toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-800 mt-1">
                      {statistics.totalPayments}건
                      <div className="text-sm font-normal mt-1">
                        <span className="text-green-600">완료: {statistics.completedPayments}건</span>
                        <br />
                        <span className="text-red-600">취소: {statistics.cancelledPayments}건</span>
                        <br />
                        <span className="text-yellow-600">환불: {statistics.refundedPayments}건</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 결제 내역 테이블 */}
            {!loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                      <option value={10}>10개씩 보기</option>
                      <option value={20}>20개씩 보기</option>
                      <option value={30}>30개씩 보기</option>
                      <option value={50}>50개씩 보기</option>
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
                    총 {filteredPayments.length}건의 결제
                    {!showAll && ` (${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, filteredPayments.length)}번째 표시)`}
                  </div>
                </div>

                <div className="w-full overflow-x-auto" style={{ maxHeight: 'calc(100vh - 350px)', minWidth: 600 }}>
                  <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
                    <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('memberName')}>
                          <div className="flex items-center">
                            회원명
                            {sortConfig.key === 'memberName' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? (
                                  <ChevronUp className="text-blue-500" size={14} />
                                ) : sortConfig.direction === 'descending' ? (
                                  <ChevronDown className="text-blue-500" size={14} />
                                ) : null}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('paymentDate')}>
                          <div className="flex items-center">
                            결제일
                            {sortConfig.key === 'paymentDate' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? (
                                  <ChevronUp className="text-blue-500" size={14} />
                                ) : sortConfig.direction === 'descending' ? (
                                  <ChevronDown className="text-blue-500" size={14} />
                                ) : null}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('membershipType')}>
                          <div className="flex items-center">
                            이용권
                            {sortConfig.key === 'membershipType' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? (
                                  <ChevronUp className="text-blue-500" size={14} />
                                ) : sortConfig.direction === 'descending' ? (
                                  <ChevronDown className="text-blue-500" size={14} />
                                ) : null}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('paymentMethod')}>
                          <div className="flex items-center">
                            결제 방법
                            {sortConfig.key === 'paymentMethod' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? (
                                  <ChevronUp className="text-blue-500" size={14} />
                                ) : sortConfig.direction === 'descending' ? (
                                  <ChevronDown className="text-blue-500" size={14} />
                                ) : null}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="py-2 px-2 sm:py-2.5 sm:px-3 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('amount')}>
                          <div className="flex items-center justify-end">
                            금액
                            {sortConfig.key === 'amount' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? (
                                  <ChevronUp className="text-blue-500" size={14} />
                                ) : sortConfig.direction === 'descending' ? (
                                  <ChevronDown className="text-blue-500" size={14} />
                                ) : null}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => requestSort('status')}>
                          <div className="flex items-center">
                            상태
                            {sortConfig.key === 'status' && (
                              <span className="ml-1">
                                {sortConfig.direction === 'ascending' ? (
                                  <ChevronUp className="text-blue-500" size={14} />
                                ) : sortConfig.direction === 'descending' ? (
                                  <ChevronDown className="text-blue-500" size={14} />
                                ) : null}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="py-2 px-2 sm:py-2.5 sm:px-3 text-center text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsViewMode(true);
                              setPaymentModalOpen(true);
                            }}
                          >
                            <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600">{payment.memberName}</td>
                            <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">{formatDate(payment.paymentDate)}</td>
                            <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                              {payment.membershipType}
                              <div className="text-xs text-gray-500">
                                {formatDate(payment.startDate)} ~ {formatDate(payment.endDate)}
                              </div>
                            </td>
                            <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">{payment.paymentMethod}</td>
                            <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-right text-gray-900">
                              ₩ {formatCurrency(payment.amount)}
                            </td>
                            <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === '완료' 
                                  ? 'bg-green-100 text-green-800' 
                                  : payment.status === '취소'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-center">
                              <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPayment(payment);
                                    setIsViewMode(true);
                                    setPaymentModalOpen(true);
                                  }} 
                                  className="text-blue-500 hover:text-blue-700 transition-colors p-1" 
                                  title="상세보기"
                                >
                                  <Info size={16} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedPayment(payment);
                                    setIsViewMode(false);
                                    setPaymentModalOpen(true);
                                  }} 
                                  className="text-yellow-500 hover:text-yellow-700 transition-colors p-1" 
                                  title="수정"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('이 결제 기록을 삭제하시겠습니까?')) {
                                      deletePayment(payment.id!);
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
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center">
                              <Database size={48} className="text-gray-300 mb-3" />
                              <p className="text-lg">결제 내역이 없습니다.</p>
                              <p className="text-sm text-gray-400 mt-1">결제를 등록하려면 '새 결제 등록' 버튼을 클릭하세요.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* 페이지네이션은 전체 보기 모드일 때는 숨김 */}
                {!showAll && renderPagination()}
              </div>
            )}
          </>
        )}

        {/* 이용권 관리 탭 */}
        {activeTab === 'membership-types' && (
          <>
            {/* 검색 및 필터 영역 */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="이용권 이름 또는 설명으로 검색..."
                    className="border border-gray-300 p-3 rounded-md w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                
                <button 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md flex items-center transition-colors"
                  onClick={() => {
                    setSelectedMembershipType(null);
                    setIsViewMode(false);
                    setMembershipTypeModalOpen(true);
                  }}
                >
                  <Plus size={18} className="mr-2" />
                  새 이용권 추가
                </button>
              </div>
            </div>

            {/* 이용권 목록 */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {membershipTypes.length === 0 ? (
                  <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Database size={48} className="text-gray-300 mb-3" />
                      <p className="text-lg text-gray-500">등록된 이용권이 없습니다.</p>
                      <p className="text-sm text-gray-400 mt-1">새 이용권을 추가하려면 '새 이용권 추가' 버튼을 클릭하세요.</p>
                    </div>
                  </div>
                ) : (
                  membershipTypes
                    .filter(type => {
                      if (!searchTerm) return true;
                      const term = searchTerm.toLowerCase();
                      return type.name.toLowerCase().includes(term) ||
                             type.description?.toLowerCase().includes(term);
                    })
                    .map((type) => (
                      <div
                        key={type.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                              <p className="text-sm text-gray-500 mb-2">{type.durationMonths}개월</p>
                            </div>
                            
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              type.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {type.isActive ? '활성화' : '비활성화'}
                            </span>
                          </div>
                          
                          <div className="mt-4 text-gray-900 text-2xl font-bold">
                            ₩ {formatCurrency(type.price)}
                          </div>
                          
                          {type.description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{type.description}</p>
                          )}
                          
                          {type.maxUses && (
                            <div className="mt-2 inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {type.maxUses}회 이용 가능
                            </div>
                          )}
                        </div>
                        
                        <div className="px-5 py-3 bg-gray-50 flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedMembershipType(type);
                              setIsViewMode(true);
                              setMembershipTypeModalOpen(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                            title="상세보기"
                          >
                            <Info size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMembershipType(type);
                              setIsViewMode(false);
                              setMembershipTypeModalOpen(true);
                            }}
                            className="text-yellow-500 hover:text-yellow-700 transition-colors p-1"
                            title="수정"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('이 이용권을 삭제하시겠습니까? 관련된 결제 기록에는 영향이 없습니다.')) {
                                deleteMembershipType(type.id!);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                            title="삭제"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* 결제 모달 */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedPayment(null);
          setIsViewMode(false);
        }}
        onSave={async (payment) => {
          try {
            if (payment.id) {
              await updatePayment(payment);
            } else {
              await addPayment(payment);
            }
            showToast('success', payment.id ? '결제 정보가 수정되었습니다.' : '새 결제가 등록되었습니다.');
            loadData();
            return true;
          } catch (error) {
            console.error('결제 저장 오류:', error);
            showToast('error', '결제 저장 중 오류가 발생했습니다.');
            return false;
          }
        }}
        payment={selectedPayment}
        isViewMode={isViewMode}
        memberOptions={members.map(m => ({ id: m.id!, name: m.name }))}
        membershipTypeOptions={membershipTypes.filter(t => t.isActive).map(t => ({ name: t.name!, price: t.price! }))}
        onOpenMembershipTypeModal={() => setMembershipTypeModalOpen(true)}
      />
      
      {/* 이용권 모달 */}
      <MembershipTypeModal
        isOpen={membershipTypeModalOpen}
        onClose={() => {
          setMembershipTypeModalOpen(false);
          setSelectedMembershipType(null);
          setIsViewMode(false);
        }}
        onSave={async (type) => {
          try {
            if (type.id) {
              await updateMembershipType(type);
            } else {
              await addMembershipType(type);
            }
            showToast('success', type.id ? '이용권 정보가 수정되었습니다.' : '새 이용권이 추가되었습니다.');
            loadData();
            return true;
          } catch (error) {
            console.error('이용권 저장 오류:', error);
            showToast('error', '이용권 저장 중 오류가 발생했습니다.');
            return false;
          }
        }}
        membershipType={selectedMembershipType}
        isViewMode={isViewMode}
      />
    </div>
  );
};

export default Payment; 