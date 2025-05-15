import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  MembershipTypeEnum,
} from '../../types/payment';

// 날짜 계산 헬퍼 함수
export const calculateEndDate = (startDate: string, type: string): string => {
  if (!startDate) return '';

  const date = new Date(startDate);
  let months = 0;

  switch (type) {
    case MembershipTypeEnum.MONTH_1:
      months = 1;
      break;
    case MembershipTypeEnum.MONTH_3:
      months = 3;
      break;
    case MembershipTypeEnum.MONTH_6:
      months = 6;
      break;
    case MembershipTypeEnum.MONTH_12:
      months = 12;
      break;
    case MembershipTypeEnum.PT_10:
    case MembershipTypeEnum.PT_20:
      months = 3; // PT는 기본 3개월 유효
      break;
    default:
      return '';
  }

  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

// 금액 포맷팅 함수
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(value);
};

// 결제 폼 유효성 검사
export const validatePaymentForm = (
  formData: Payment,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.memberId || !formData.memberName) {
    errors.member = '회원 정보는 필수입니다';
  }

  if (!formData.amount || formData.amount <= 0) {
    errors.amount = '유효한 금액을 입력하세요';
  }

  if (!formData.paymentDate) {
    errors.paymentDate = '결제일은 필수입니다';
  }

  if (!formData.membershipType) {
    errors.membershipType = '이용권 종류는 필수입니다';
  }

  if (!formData.startDate) {
    errors.startDate = '시작일은 필수입니다';
  }

  return errors;
};

// 기본 결제 객체
export const defaultPayment: Payment = {
  memberId: 0,
  memberName: '',
  amount: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: PaymentMethod.CARD,
  membershipType: MembershipTypeEnum.MONTH_1,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  notes: '',
  status: PaymentStatus.COMPLETED,
};
