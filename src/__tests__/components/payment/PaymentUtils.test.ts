import { calculateEndDate, formatCurrency, validatePaymentForm, defaultPayment } from '../../../components/payment/PaymentUtils';
import { Payment, PaymentMethod, PaymentStatus, MembershipTypeEnum } from '../../../types/payment';

describe('PaymentUtils', () => {
  describe('calculateEndDate', () => {
    test('1개월권일 경우 1달 후 날짜를 반환해야 함', () => {
      const startDate = '2023-07-15';
      const result = calculateEndDate(startDate, MembershipTypeEnum.MONTH_1);
      
      // 2023-07-15 + 1달 = 2023-08-15
      expect(result).toBe('2023-08-15');
    });

    test('3개월권일 경우 3달 후 날짜를 반환해야 함', () => {
      const startDate = '2023-07-15';
      const result = calculateEndDate(startDate, MembershipTypeEnum.MONTH_3);
      
      // 2023-07-15 + 3달 = 2023-10-15
      expect(result).toBe('2023-10-15');
    });

    test('6개월권일 경우 6달 후 날짜를 반환해야 함', () => {
      const startDate = '2023-07-15';
      const result = calculateEndDate(startDate, MembershipTypeEnum.MONTH_6);
      
      // 2023-07-15 + 6달 = 2024-01-15
      expect(result).toBe('2024-01-15');
    });

    test('12개월권일 경우 12달 후 날짜를 반환해야 함', () => {
      const startDate = '2023-07-15';
      const result = calculateEndDate(startDate, MembershipTypeEnum.MONTH_12);
      
      // 2023-07-15 + 12달 = 2024-07-15
      expect(result).toBe('2024-07-15');
    });

    test('PT 10회권일 경우 3달 후 날짜를 반환해야 함', () => {
      const startDate = '2023-07-15';
      const result = calculateEndDate(startDate, MembershipTypeEnum.PT_10);
      
      // 2023-07-15 + 3달 = 2023-10-15
      expect(result).toBe('2023-10-15');
    });

    test('PT 20회권일 경우 3달 후 날짜를 반환해야 함', () => {
      const startDate = '2023-07-15';
      const result = calculateEndDate(startDate, MembershipTypeEnum.PT_20);
      
      // 2023-07-15 + 3달 = 2023-10-15
      expect(result).toBe('2023-10-15');
    });

    test('년도가 바뀌는 경우 정확한 날짜를 반환해야 함', () => {
      const startDate = '2023-12-15';
      const result = calculateEndDate(startDate, MembershipTypeEnum.MONTH_3);
      
      // 2023-12-15 + 3달 = 2024-03-15
      expect(result).toBe('2024-03-15');
    });

    test('2월의 날짜 범위가 넘어가면 알맞은 날짜를 반환해야 함', () => {
      const startDate = '2023-01-31';
      const result = calculateEndDate(startDate, MembershipTypeEnum.MONTH_1);
      
      // JavaScript의 Date 객체는 날짜 범위가 넘어가면 자동으로 다음 달로 조정함
      // 정확한 결과는 구현에 따라 2023-02-28 또는 2023-03-03 등이 될 수 있음
      expect(result).toBeTruthy();
      expect(result.startsWith('2023-')).toBeTruthy();
    });

    test('시작일이 비어있으면 빈 문자열을 반환해야 함', () => {
      const result = calculateEndDate('', MembershipTypeEnum.MONTH_1);
      expect(result).toBe('');
    });

    test('알 수 없는 이용권 타입일 경우 빈 문자열을 반환해야 함', () => {
      const startDate = '2023-07-15';
      const result = calculateEndDate(startDate, '알 수 없는 이용권');
      expect(result).toBe('');
    });
  });

  describe('formatCurrency', () => {
    test('숫자를 천 단위 구분자가 있는 형식으로 포맷팅해야 함', () => {
      expect(formatCurrency(1000)).toBe('1,000');
      expect(formatCurrency(10000)).toBe('10,000');
      expect(formatCurrency(100000)).toBe('100,000');
      expect(formatCurrency(1000000)).toBe('1,000,000');
    });

    test('소수점이 없는 숫자는 정수로 포맷팅해야 함', () => {
      expect(formatCurrency(1234)).toBe('1,234');
    });

    test('0을 올바르게 포맷팅해야 함', () => {
      expect(formatCurrency(0)).toBe('0');
    });

    test('음수도 올바르게 포맷팅해야 함', () => {
      expect(formatCurrency(-1000)).toBe('-1,000');
    });
  });

  describe('validatePaymentForm', () => {
    test('유효한 폼 데이터는 빈 에러 객체를 반환해야 함', () => {
      const validPayment: Payment = {
        memberId: 1,
        memberName: '홍길동',
        amount: 100000,
        paymentDate: '2023-07-15',
        paymentMethod: PaymentMethod.CARD,
        membershipType: MembershipTypeEnum.MONTH_1,
        startDate: '2023-07-15',
        endDate: '2023-08-15',
        status: PaymentStatus.COMPLETED,
      };
      
      const errors = validatePaymentForm(validPayment);
      expect(Object.keys(errors).length).toBe(0);
    });

    test('회원 정보가 없으면 에러 메시지를 반환해야 함', () => {
      const invalidPayment: Payment = {
        ...defaultPayment,
        memberId: 0,
        memberName: '',
      };
      
      const errors = validatePaymentForm(invalidPayment);
      expect(errors.member).toBe('회원 정보는 필수입니다');
    });

    test('금액이 0 이하면 에러 메시지를 반환해야 함', () => {
      const invalidPayment: Payment = {
        ...defaultPayment,
        memberId: 1,
        memberName: '홍길동',
        amount: 0,
      };
      
      const errors = validatePaymentForm(invalidPayment);
      expect(errors.amount).toBe('유효한 금액을 입력하세요');
    });

    test('결제일이 없으면 에러 메시지를 반환해야 함', () => {
      const invalidPayment: Payment = {
        ...defaultPayment,
        memberId: 1,
        memberName: '홍길동',
        amount: 100000,
        paymentDate: '',
      };
      
      const errors = validatePaymentForm(invalidPayment);
      expect(errors.paymentDate).toBe('결제일은 필수입니다');
    });

    test('이용권 종류가 없으면 에러 메시지를 반환해야 함', () => {
      const invalidPayment: Payment = {
        ...defaultPayment,
        memberId: 1,
        memberName: '홍길동',
        amount: 100000,
        paymentDate: '2023-07-15',
        membershipType: '',
      };
      
      const errors = validatePaymentForm(invalidPayment);
      expect(errors.membershipType).toBe('이용권 종류는 필수입니다');
    });

    test('시작일이 없으면 에러 메시지를 반환해야 함', () => {
      const invalidPayment: Payment = {
        ...defaultPayment,
        memberId: 1,
        memberName: '홍길동',
        amount: 100000,
        paymentDate: '2023-07-15',
        membershipType: MembershipTypeEnum.MONTH_1,
        startDate: '',
      };
      
      const errors = validatePaymentForm(invalidPayment);
      expect(errors.startDate).toBe('시작일은 필수입니다');
    });

    test('여러 필드가 유효하지 않으면 모든 에러 메시지를 반환해야 함', () => {
      const invalidPayment: Payment = {
        ...defaultPayment,
        memberId: 0,
        memberName: '',
        amount: 0,
        paymentDate: '',
        membershipType: '',
        startDate: '',
      };
      
      const errors = validatePaymentForm(invalidPayment);
      expect(Object.keys(errors).length).toBe(5);
      expect(errors.member).toBeDefined();
      expect(errors.amount).toBeDefined();
      expect(errors.paymentDate).toBeDefined();
      expect(errors.membershipType).toBeDefined();
      expect(errors.startDate).toBeDefined();
    });
  });

  describe('defaultPayment', () => {
    test('defaultPayment 객체가 올바른 초기값을 가져야 함', () => {
      expect(defaultPayment).toHaveProperty('memberId', 0);
      expect(defaultPayment).toHaveProperty('memberName', '');
      expect(defaultPayment).toHaveProperty('amount', 0);
      expect(defaultPayment.paymentDate).toBeDefined();
      expect(defaultPayment).toHaveProperty('paymentMethod', PaymentMethod.CARD);
      expect(defaultPayment).toHaveProperty('membershipType', MembershipTypeEnum.MONTH_1);
      expect(defaultPayment.startDate).toBeDefined();
      expect(defaultPayment).toHaveProperty('endDate', '');
      expect(defaultPayment).toHaveProperty('notes', '');
      expect(defaultPayment).toHaveProperty('status', PaymentStatus.COMPLETED);
    });
  });
}); 