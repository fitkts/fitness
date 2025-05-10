import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, CreditCard, Calendar, Download, MoreHorizontal, Settings, Edit, Trash2 } from 'lucide-react';
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

  // 날짜 필터링 함수
  const getFilteredPaymentsByDate = (payments: Payment[]): Payment[] => {
    if (dateFilter === 'all') return payments;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return payments.filter(payment => {
      const paymentDate = new Date(payment.paymentDate);
      if (dateFilter === 'today') {
        return paymentDate >= today;
      } else if (dateFilter === 'this-week') {
        return paymentDate >= thisWeekStart;
      } else if (dateFilter === 'this-month') {
        return paymentDate >= thisMonthStart;
      }
      return true;
    });
  };

  // 상태 필터링 함수
  const getFilteredPaymentsByStatus = (payments: Payment[]): Payment[] => {
    if (statusFilter === 'all') return payments;
    return payments.filter(payment => payment.status === statusFilter);
  };

  // 검색 필터링 함수
  const getFilteredPaymentsBySearch = (payments: Payment[]): Payment[] => {
    if (!searchTerm) return payments;
    
    const term = searchTerm.toLowerCase();
    return payments.filter(payment => 
      payment.memberName.toLowerCase().includes(term) ||
      payment.receiptNumber?.toLowerCase().includes(term) ||
      payment.membershipType.toLowerCase().includes(term)
    );
  };

  // 결합된 필터링 적용
  const filteredPayments = getFilteredPaymentsBySearch(
    getFilteredPaymentsByStatus(
      getFilteredPaymentsByDate(payments)
    )
  );

  // 이용권 상태별 필터링
  const filteredMembershipTypes = membershipTypes.filter(type => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return type.name.toLowerCase().includes(term) ||
           type.description?.toLowerCase().includes(term);
  });

  // 결제 모달 핸들러
  const handleOpenNewPaymentModal = () => {
    setSelectedPayment(null);
    setIsViewMode(false);
    setPaymentModalOpen(true);
  };

  const handleOpenPaymentViewModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewMode(true);
    setPaymentModalOpen(true);
  };

  const handleOpenPaymentEditModal = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewMode(false);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedPayment(null);
    setIsViewMode(false);
  };

  const handleSavePayment = async (payment: Payment): Promise<boolean> => {
    try {
      let result;
      const dataToSend = { ...payment };

      if (payment.id) {
        result = await updatePayment(dataToSend);
      } else {
        const { id, ...newPaymentData } = dataToSend;
        result = await addPayment(newPaymentData);
      }

      if (result.success) {
        showToast('success', payment.id ? '결제 정보가 수정되었습니다.' : '새 결제가 등록되었습니다.');
        loadData();
        handleClosePaymentModal();
        return true;
      } else {
        showToast('error', '결제 정보 저장 실패: ' + (result.error || '알 수 없는 오류'));
        return false;
      }
    } catch (error) {
      console.error('결제 저장 오류:', error);
      showToast('error', '결제 저장 중 오류가 발생했습니다.');
      return false;
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (window.confirm('이 결제 기록을 삭제하시겠습니까?')) {
      try {
        const result = await deletePayment(id);
        if (result.success) {
          showToast('success', '결제 기록이 삭제되었습니다.');
          loadData();
        } else {
          showToast('error', '결제 기록 삭제 실패: ' + (result.error || '알 수 없는 오류'));
        }
      } catch (error) {
        console.error('결제 삭제 오류:', error);
        showToast('error', '결제 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 이용권 모달 핸들러
  const handleOpenNewMembershipTypeModal = () => {
    setSelectedMembershipType(null);
    setIsViewMode(false);
    setMembershipTypeModalOpen(true);
  };

  const handleOpenMembershipTypeViewModal = (type: MembershipType) => {
    setSelectedMembershipType(type);
    setIsViewMode(true);
    setMembershipTypeModalOpen(true);
  };

  const handleOpenMembershipTypeEditModal = (type: MembershipType) => {
    setSelectedMembershipType(type);
    setIsViewMode(false);
    setMembershipTypeModalOpen(true);
  };

  const handleCloseMembershipTypeModal = () => {
    setMembershipTypeModalOpen(false);
    setSelectedMembershipType(null);
    setIsViewMode(false);
  };

  const handleSaveMembershipType = async (type: MembershipType): Promise<boolean> => {
    try {
      let result;
      if (type.id) {
        result = await updateMembershipType(type);
      } else {
        const { id, ...newTypeData } = type;
        result = await addMembershipType(newTypeData);
      }

      if (result.success) {
        showToast('success', type.id ? '이용권 정보가 수정되었습니다.' : '새 이용권이 추가되었습니다.');
        loadData();
        handleCloseMembershipTypeModal();
        return true;
      } else {
        showToast('error', '이용권 정보 저장 실패: ' + (result.error || '알 수 없는 오류'));
        return false;
      }
    } catch (error) {
      console.error('이용권 저장 오류:', error);
      showToast('error', '이용권 저장 중 오류가 발생했습니다.');
      return false;
    }
  };

  const handleDeleteMembershipType = async (id: number) => {
    if (window.confirm('이 이용권을 삭제하시겠습니까? 관련된 결제 기록에는 영향이 없습니다.')) {
      try {
        const result = await deleteMembershipType(id);
        if (result.success) {
          showToast('success', '이용권이 삭제되었습니다.');
          loadData();
        } else {
          showToast('error', '이용권 삭제 실패: ' + (result.error || '알 수 없는 오류'));
        }
      } catch (error) {
        console.error('이용권 삭제 오류:', error);
        showToast('error', '이용권 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">결제 관리</h1>
      
      {/* 탭 메뉴 */}
      <div className="mb-6 border-b">
        <div className="flex space-x-8">
          <button
            className={`pb-2 font-medium ${
              activeTab === 'payments'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('payments')}
          >
            결제 내역
          </button>
        <button 
            className={`pb-2 font-medium ${
              activeTab === 'membership-types'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
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
          {/* 검색 및 필터링 */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="회원명, 이용권, 영수증 번호로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="input"
              >
                <option value="all">모든 기간</option>
                <option value="today">오늘</option>
                <option value="this-week">이번 주</option>
                <option value="this-month">이번 달</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input"
              >
                <option value="all">모든 상태</option>
                <option value="완료">완료</option>
                <option value="취소">취소</option>
                <option value="환불">환불</option>
              </select>
            </div>

            <button 
              onClick={handleOpenNewPaymentModal}
              className="btn btn-primary"
            >
              <Plus size={18} className="mr-1" />
              새 결제 등록
            </button>
          </div>
          
          {/* 결제 내역 테이블 */}
          {loading ? (
            <p>로딩 중...</p>
          ) : (
      <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      회원명
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결제일
                </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이용권
                </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      결제 방법
                </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length === 0 ? (
                <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        결제 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                    filteredPayments.map((payment) => (
                      <tr 
                        key={payment.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleOpenPaymentViewModal(payment)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payment.memberName}</div>
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{payment.paymentDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{payment.membershipType}</div>
                          <div className="text-xs text-gray-500">
                            {payment.startDate} ~ {payment.endDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          ₩ {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === '완료' 
                              ? 'bg-green-100 text-green-800' 
                              : payment.status === '취소'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPaymentEditModal(payment);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePayment(payment.id);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
          )}
        </>
      )}
      
      {/* 이용권 관리 탭 */}
      {activeTab === 'membership-types' && (
        <>
          {/* 검색 및 필터링 */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="이용권 이름 또는 설명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            
            <button
              onClick={handleOpenNewMembershipTypeModal}
              className="btn btn-primary"
            >
              <Plus size={18} className="mr-1" />
              새 이용권 추가
            </button>
          </div>
          
          {/* 이용권 목록 */}
          {loading ? (
            <p>로딩 중...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembershipTypes.length === 0 ? (
                <p className="col-span-full text-center text-gray-500 p-6">
                  등록된 이용권이 없습니다.
                </p>
              ) : (
                filteredMembershipTypes.map((type) => (
                  <div
                    key={type.id}
                    className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md"
                    onClick={() => handleOpenMembershipTypeViewModal(type)}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{type.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{type.durationMonths}개월</p>
                        </div>
                        
                        <div className="flex">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            type.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {type.isActive ? '활성화' : '비활성화'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-gray-900 text-2xl font-bold">
                        ₩ {formatCurrency(type.price)}
                      </div>
                      
                      {type.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{type.description}</p>
                      )}
                      
                      {type.maxUses && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                          {type.maxUses}회 이용 가능
                        </div>
                      )}
                    </div>
                    
                    <div className="px-5 py-3 bg-gray-50 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMembershipTypeEditModal(type);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMembershipType(type.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
      </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
      
      {/* 결제 모달 */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={handleClosePaymentModal}
        onSave={handleSavePayment}
        payment={selectedPayment}
        isViewMode={isViewMode}
        memberOptions={members.map(m => ({ id: m.id!, name: m.name }))}
        membershipTypeOptions={membershipTypes.filter(t => t.isActive).map(t => t.name)}
      />
      
      {/* 이용권 모달 */}
      <MembershipTypeModal
        isOpen={membershipTypeModalOpen}
        onClose={handleCloseMembershipTypeModal}
        onSave={handleSaveMembershipType}
        membershipType={selectedMembershipType}
        isViewMode={isViewMode}
      />
    </div>
  );
};

export default Payment; 