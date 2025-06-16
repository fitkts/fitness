// 락커 결제 타입 테스트 (TDD)
import { 
  PaymentMethod, 
  LockerPaymentFormData, 
  LockerPaymentCalculation,
  LockerPaymentData,
  LockerPaymentFormProps 
} from '../../types/lockerPayment';

describe('LockerPayment Types', () => {
  describe('PaymentMethod', () => {
    it('결제 방법 타입이 정의되어야 한다', () => {
      const methods: PaymentMethod[] = ['cash', 'card', 'transfer', 'other'];
      expect(methods).toContain('cash');
      expect(methods).toContain('card');
      expect(methods).toContain('transfer');
      expect(methods).toContain('other');
    });
  });

  describe('LockerPaymentFormData', () => {
    it('결제 폼 데이터 타입이 올바른 구조를 가져야 한다', () => {
      const formData: LockerPaymentFormData = {
        months: 3,
        paymentMethod: 'cash',
        startDate: '2025-01-01',
        notes: '테스트 메모'
      };

      expect(typeof formData.months).toBe('number');
      expect(typeof formData.paymentMethod).toBe('string');
      expect(typeof formData.startDate).toBe('string');
      expect(typeof formData.notes).toBe('string');
    });

    it('notes는 선택적 필드여야 한다', () => {
      const formData: LockerPaymentFormData = {
        months: 1,
        paymentMethod: 'card',
        startDate: '2025-01-01'
        // notes는 없어도 됨
      };

      expect(formData.notes).toBeUndefined();
    });
  });

  describe('LockerPaymentCalculation', () => {
    it('결제 계산 타입이 올바른 구조를 가져야 한다', () => {
      const calculation: LockerPaymentCalculation = {
        originalAmount: 150000,
        discountRate: 10,
        discountAmount: 15000,
        finalAmount: 135000,
        startDate: '2025-01-01',
        endDate: '2025-04-01'
      };

      expect(typeof calculation.originalAmount).toBe('number');
      expect(typeof calculation.discountRate).toBe('number');
      expect(typeof calculation.discountAmount).toBe('number');
      expect(typeof calculation.finalAmount).toBe('number');
      expect(typeof calculation.startDate).toBe('string');
      expect(typeof calculation.endDate).toBe('string');
    });

    it('할인이 없는 경우도 처리해야 한다', () => {
      const calculation: LockerPaymentCalculation = {
        originalAmount: 50000,
        discountRate: 0,
        discountAmount: 0,
        finalAmount: 50000,
        startDate: '2025-01-01',
        endDate: '2025-02-01'
      };

      expect(calculation.discountRate).toBe(0);
      expect(calculation.discountAmount).toBe(0);
      expect(calculation.finalAmount).toBe(calculation.originalAmount);
    });
  });

  describe('LockerPaymentData', () => {
    it('결제 데이터 타입이 모든 필수 정보를 포함해야 한다', () => {
      const paymentData: LockerPaymentData = {
        lockerId: '123',
        memberId: '456',
        memberName: '홍길동',
        lockerNumber: 'A-001',
        months: 3,
        startDate: '2025-01-01',
        endDate: '2025-04-01',
        amount: 135000,
        originalAmount: 150000,
        discountRate: 10,
        discountAmount: 15000,
        paymentMethod: 'cash',
        notes: '테스트 결제'
      };

      expect(typeof paymentData.lockerId).toBe('string');
      expect(typeof paymentData.memberId).toBe('string');
      expect(typeof paymentData.memberName).toBe('string');
      expect(typeof paymentData.lockerNumber).toBe('string');
      expect(typeof paymentData.months).toBe('number');
      expect(typeof paymentData.amount).toBe('number');
      expect(typeof paymentData.paymentMethod).toBe('string');
    });
  });
}); 