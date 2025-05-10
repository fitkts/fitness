import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { CreditCard, Calendar, User } from 'lucide-react';
import { useToast, ToastType } from '../contexts/ToastContext';
import { Payment } from '../models/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Payment) => Promise<boolean>;
  payment?: Payment | null;
  isViewMode?: boolean;
  memberOptions?: { id: number; name: string }[];
  membershipTypeOptions?: string[];
}

const defaultPayment: Payment = {
  memberId: 0,
  memberName: '',
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: '카드',
  membershipType: '1개월권',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  notes: '',
  status: '완료',
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  payment,
  isViewMode = false,
  memberOptions = [],
  membershipTypeOptions = ['1개월권', '3개월권', '6개월권', '12개월권', 'PT 10회', 'PT 20회'],
}) => {
  const [formData, setFormData] = useState<Payment>(defaultPayment);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentIsViewMode, setCurrentIsViewMode] = useState(isViewMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  let showToast: (type: ToastType, message: string) => void;
  try {
    const toastContext = useToast();
    showToast = toastContext?.showToast || ((type, message) => console.log(`Fallback Toast (${type}): ${message}`));
  } catch (error) {
    console.error("PaymentModal: Toast 컨텍스트를 사용할 수 없습니다:", error);
    showToast = (type, message) => console.log(`Error Toast (${type}): ${message}`);
  }

  useEffect(() => {
    if (payment) {
      setFormData({
        ...defaultPayment,
        ...payment,
        notes: payment.notes || '',
      });
      setCurrentIsViewMode(isViewMode);
    } else {
      setFormData(defaultPayment);
      setCurrentIsViewMode(false);
    }
    setErrors({});
  }, [payment, isOpen, isViewMode]);

  // 날짜 계산 헬퍼 함수
  const calculateEndDate = (startDate: string, type: string): string => {
    if (!startDate) return '';
    
    const date = new Date(startDate);
    let months = 0;
    
    switch (type) {
      case '1개월권':
        months = 1;
        break;
      case '3개월권':
        months = 3;
        break;
      case '6개월권':
        months = 6;
        break;
      case '12개월권':
        months = 12;
        break;
      case 'PT 10회':
      case 'PT 20회':
        months = 3; // PT는 기본 3개월 유효
        break;
      default:
        return '';
    }
    
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  // 금액 포맷팅 함수
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(value);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 유효성 검사
      const newErrors: Record<string, string> = {};
      
      if (!formData.memberId || !formData.memberName) {
        newErrors.member = '회원 정보는 필수입니다';
      }
      
      if (!formData.amount || formData.amount <= 0) {
        newErrors.amount = '유효한 금액을 입력하세요';
      }
      
      if (!formData.paymentDate) {
        newErrors.paymentDate = '결제일은 필수입니다';
      }
      
      if (!formData.membershipType) {
        newErrors.membershipType = '이용권 종류는 필수입니다';
      }
      
      if (!formData.startDate) {
        newErrors.startDate = '시작일은 필수입니다';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // 저장 상태로 변경
      setIsSubmitting(true);
      
      // 저장 요청
      const success = await onSave(formData);
      
      // 결과에 따라 토스트 알림 표시
      if (success) {
        showToast('success', currentIsViewMode ? '결제 정보가 수정되었습니다.' : '새 결제가 등록되었습니다.');
        onClose();
      } else {
        showToast('error', '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('폼 제출 오류:', error);
      showToast('error', '처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // 숫자만 허용
      const numericValue = value.replace(/[^\d]/g, '');
      setFormData(prev => ({ ...prev, [name]: parseInt(numericValue) || 0 }));
    } else if (name === 'membershipType' || name === 'startDate') {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // 이용권 타입이나 시작일이 변경되면 종료일 자동 계산
      if (formData.startDate && (name === 'membershipType' ? value : formData.membershipType)) {
        const endDate = calculateEndDate(
          name === 'startDate' ? value : formData.startDate,
          name === 'membershipType' ? value : formData.membershipType
        );
        setFormData(prev => ({ ...prev, endDate }));
      }
    } else if (name === 'memberId' && value) {
      // 회원 선택 시 이름도 업데이트
      const selectedMember = memberOptions.find(member => member.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        memberId: parseInt(value),
        memberName: selectedMember ? selectedMember.name : prev.memberName
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // 오류 메시지 지우기
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 회원 검색 핸들러 (실제로는 이 함수를 구현하거나 외부에서 전달)
  const handleMemberSearch = (searchTerm: string) => {
    // API를 통해 회원 검색 로직 구현
    console.log('회원 검색:', searchTerm);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentIsViewMode ? '결제 상세 정보' : '신규 결제 등록'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 회원 정보 섹션 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">회원 정보</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회원 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  name="memberId"
                  value={formData.memberId || ''}
                  onChange={handleChange}
                  className={`input w-full ${errors.member ? 'border-red-500' : ''}`}
                  disabled={currentIsViewMode}
                  required
                >
                  <option value="">회원을 선택하세요</option>
                  {memberOptions.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
                {errors.member && (
                  <p className="text-red-500 text-xs mt-1">{errors.member}</p>
                )}
              </div>
              
              {currentIsViewMode && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User size={20} className="text-gray-500 mr-2" />
                    <span className="font-semibold">{formData.memberName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 결제 상세 섹션 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">결제 상세</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제 금액 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount ? formatCurrency(formData.amount) : ''}
                    onChange={handleChange}
                    className={`input w-full pl-8 ${errors.amount ? 'border-red-500' : ''}`}
                    placeholder="0"
                    disabled={currentIsViewMode}
                    required
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₩</span>
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제 일자 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleChange}
                    className={`input w-full ${errors.paymentDate ? 'border-red-500' : ''}`}
                    disabled={currentIsViewMode}
                    required
                  />
                </div>
                {errors.paymentDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  결제 방법 <span className="text-red-500">*</span>
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="input w-full"
                  disabled={currentIsViewMode}
                  required
                >
                  <option value="카드">카드</option>
                  <option value="현금">현금</option>
                  <option value="계좌이체">계좌이체</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  영수증 번호
                </label>
                <input
                  type="text"
                  name="receiptNumber"
                  value={formData.receiptNumber || ''}
                  onChange={handleChange}
                  className="input w-full"
                  disabled={currentIsViewMode}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 이용권 정보 섹션 */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 pb-2 border-b">이용권 정보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이용권 종류 <span className="text-red-500">*</span>
              </label>
              <select
                name="membershipType"
                value={formData.membershipType}
                onChange={handleChange}
                className={`input w-full ${errors.membershipType ? 'border-red-500' : ''}`}
                disabled={currentIsViewMode}
                required
              >
                <option value="">이용권을 선택하세요</option>
                {membershipTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.membershipType && (
                <p className="text-red-500 text-xs mt-1">{errors.membershipType}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`input w-full ${errors.startDate ? 'border-red-500' : ''}`}
                disabled={currentIsViewMode}
                required
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료일
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input w-full"
                disabled={currentIsViewMode || true} // 자동 계산되므로 비활성화
              />
            </div>
          </div>
        </div>
        
        {/* 상태 및 메모 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              결제 상태
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input w-full"
              disabled={currentIsViewMode}
            >
              <option value="완료">완료</option>
              <option value="취소">취소</option>
              <option value="환불">환불</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              className="input w-full"
              rows={2}
              disabled={currentIsViewMode}
            ></textarea>
          </div>
        </div>
        
        {/* 뷰 모드일 때 결제 요약 정보 */}
        {currentIsViewMode && (
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h4 className="font-semibold mb-3">결제 요약</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <CreditCard size={16} className="text-gray-500 mr-2" />
                <span>{formData.paymentMethod} 결제</span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="text-gray-500 mr-2" />
                <span>{formData.paymentDate} 결제됨</span>
              </div>
            </div>
            <div className="mt-4 text-right">
              <p className="text-gray-500 text-sm">최종 결제 금액</p>
              <p className="text-xl font-bold text-indigo-600">₩ {formatCurrency(formData.amount)}</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            {currentIsViewMode ? '닫기' : '취소'}
          </button>
          
          {!currentIsViewMode && (
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  저장 중...
                </span>
              ) : '저장'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal; 