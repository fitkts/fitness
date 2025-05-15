import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { CreditCard } from 'lucide-react';
import { useToast, ToastType } from '../../contexts/ToastContext';
import {
  Payment,
  MembershipTypeOption,
  PaymentOption,
} from '../../types/payment';
import PaymentForm from './PaymentForm';
import {
  defaultPayment,
  validatePaymentForm,
  calculateEndDate,
} from './PaymentUtils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Payment) => Promise<boolean>;
  payment?: Payment | null;
  isViewMode?: boolean;
  memberOptions?: PaymentOption[];
  membershipTypeOptions?: MembershipTypeOption[];
  onOpenMembershipTypeModal?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  payment,
  isViewMode = false,
  memberOptions = [],
  membershipTypeOptions = [],
  onOpenMembershipTypeModal,
}) => {
  const [formData, setFormData] = useState<Payment>(defaultPayment);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentIsViewMode, setCurrentIsViewMode] = useState(isViewMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [filteredMembers, setFilteredMembers] = useState(memberOptions);

  // Toast 컨텍스트 사용
  let showToast: (type: ToastType, message: string) => void;
  try {
    const toastContext = useToast();
    showToast =
      toastContext?.showToast ||
      ((type, message) => console.log(`Fallback Toast (${type}): ${message}`));
  } catch (error) {
    console.error('PaymentModal: Toast 컨텍스트를 사용할 수 없습니다:', error);
    showToast = (type, message) =>
      console.log(`Error Toast (${type}): ${message}`);
  }

  // 폼 데이터 초기화
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

  // 회원 검색 필터링
  useEffect(() => {
    if (!memberSearch) {
      setFilteredMembers(memberOptions);
    } else {
      setFilteredMembers(
        memberOptions.filter((m) =>
          m.name.toLowerCase().includes(memberSearch.toLowerCase()),
        ),
      );
    }
  }, [memberSearch, memberOptions]);

  // 회원 검색어 변경 핸들러
  const handleMemberSearchChange = (value: string) => {
    setMemberSearch(value);
  };

  // 회원 선택 핸들러
  const handleSelectMember = (id: number, name: string) => {
    setFormData((prev) => ({
      ...prev,
      memberId: id,
      memberName: name,
    }));
    setMemberSearch('');
  };

  // 입력 핸들러
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      // 숫자만 허용
      const numericValue = value.replace(/[^\d]/g, '');
      setFormData((prev) => ({ ...prev, [name]: parseInt(numericValue) || 0 }));
    } else if (name === 'membershipType') {
      // 이용권 종류 변경 시 금액 자동 입력
      const selectedType = membershipTypeOptions.find((t) => t.name === value);
      setFormData((prev) => ({
        ...prev,
        membershipType: value,
        amount: selectedType ? selectedType.price : prev.amount,
      }));
      // 종료일 자동 계산
      if (formData.startDate && value) {
        const endDate = calculateEndDate(formData.startDate, value);
        setFormData((prev) => ({ ...prev, endDate }));
      }
    } else if (name === 'startDate') {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // 종료일 자동 계산
      if (formData.membershipType && value) {
        const endDate = calculateEndDate(value, formData.membershipType);
        setFormData((prev) => ({ ...prev, endDate }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 유효성 검사
      const newErrors = validatePaymentForm(formData);

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
        showToast(
          'success',
          currentIsViewMode
            ? '결제 정보가 수정되었습니다.'
            : '새 결제가 등록되었습니다.',
        );
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

  // 모달 헤더 렌더링
  const renderHeader = () => {
    return (
      <div className="flex items-center">
        <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
        <h2>
          {payment
            ? currentIsViewMode
              ? '결제 정보'
              : '결제 수정'
            : '새 결제'}
        </h2>
      </div>
    );
  };

  // 모달 푸터 렌더링
  const renderFooter = () => {
    return (
      <>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          disabled={isSubmitting}
        >
          취소
        </button>
        {!currentIsViewMode && (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : payment ? '수정' : '등록'}
          </button>
        )}
        {currentIsViewMode && payment && (
          <button
            type="button"
            onClick={() => setCurrentIsViewMode(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            수정하기
          </button>
        )}
      </>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={renderHeader()}
      footer={renderFooter()}
      size="md"
    >
      <PaymentForm
        formData={formData}
        errors={errors}
        memberSearch={memberSearch}
        filteredMembers={filteredMembers}
        membershipTypeOptions={membershipTypeOptions}
        isViewMode={currentIsViewMode}
        isSubmitting={isSubmitting}
        onMemberSearchChange={handleMemberSearchChange}
        onSelectMember={handleSelectMember}
        handleChange={handleChange}
        onOpenMembershipTypeModal={onOpenMembershipTypeModal}
      />
    </Modal>
  );
};

export default PaymentModal;
