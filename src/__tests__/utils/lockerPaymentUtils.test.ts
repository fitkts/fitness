// 락커 결제 유틸리티 테스트 (TDD)
import {
  calculateFullPayment,
  formatCurrency,
  formatNumber,
  formatDateKorean,
  getCurrentDate,
  validatePaymentData,
  generatePaymentHistoryNote,
  getDiscountDescription,
  calculateDiscount,
  addMonthsToDate,
  calculateMonthsDifference
} from '../../utils/lockerPaymentUtils';
import { PaymentValidationData } from '../../types/lockerPayment';

describe('LockerPaymentUtils', () => {
  describe('formatCurrency', () => {
    it('숫자를 한국 원화 형식으로 변환해야 한다', () => {
      expect(formatCurrency(50000)).toBe('50,000원');
      expect(formatCurrency(1000000)).toBe('1,000,000원');
      expect(formatCurrency(0)).toBe('0원');
    });

    it('소수점이 있는 경우 반올림해야 한다', () => {
      expect(formatCurrency(50000.7)).toBe('50,001원');
      expect(formatCurrency(50000.3)).toBe('50,000원');
    });
  });

  describe('formatNumber', () => {
    it('숫자에 천 단위 구분자를 추가해야 한다', () => {
      expect(formatNumber(1234)).toBe('1,234');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatDateKorean', () => {
    it('ISO 날짜를 한국 형식으로 변환해야 한다', () => {
      expect(formatDateKorean('2025-01-15')).toBe('2025년 1월 15일');
      expect(formatDateKorean('2025-12-31')).toBe('2025년 12월 31일');
    });
  });

  describe('getCurrentDate', () => {
    it('오늘 날짜를 YYYY-MM-DD 형식으로 반환해야 한다', () => {
      const today = getCurrentDate();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('addMonthsToDate', () => {
    it('날짜에 월을 더해야 한다', () => {
      expect(addMonthsToDate('2025-01-15', 1)).toBe('2025-02-15');
      expect(addMonthsToDate('2025-01-15', 3)).toBe('2025-04-15');
      expect(addMonthsToDate('2025-01-15', 12)).toBe('2026-01-15');
    });

    it('월 말일 처리를 올바르게 해야 한다', () => {
      expect(addMonthsToDate('2025-01-31', 1)).toBe('2025-02-28');
      expect(addMonthsToDate('2025-01-31', 2)).toBe('2025-03-31');
    });
  });

  describe('calculateMonthsDifference', () => {
    it('두 날짜 사이의 월 차이를 계산해야 한다', () => {
      expect(calculateMonthsDifference('2025-01-15', '2025-04-15')).toBe(3);
      expect(calculateMonthsDifference('2025-01-15', '2025-02-15')).toBe(1);
      expect(calculateMonthsDifference('2025-01-15', '2026-01-15')).toBe(12);
    });
  });

  describe('calculateDiscount', () => {
    it('월 수에 따른 할인율을 계산해야 한다', () => {
      expect(calculateDiscount(1)).toBe(0);  // 1개월 할인 없음
      expect(calculateDiscount(3)).toBe(5);  // 3개월 5% 할인
      expect(calculateDiscount(6)).toBe(10); // 6개월 10% 할인
      expect(calculateDiscount(12)).toBe(15); // 12개월 15% 할인
    });
  });

  describe('calculateFullPayment', () => {
    const monthlyFee = 50000;
    const startDate = '2025-01-15';

    it('기본 결제 금액을 계산해야 한다', () => {
      const result = calculateFullPayment(3, monthlyFee, startDate);
      
      expect(result.originalAmount).toBe(150000); // 3개월 * 50000
      expect(result.discountRate).toBe(5);
      expect(result.discountAmount).toBe(7500);   // 150000 * 0.05
      expect(result.finalAmount).toBe(142500);    // 150000 - 7500
      expect(result.startDate).toBe(startDate);
      expect(result.endDate).toBe('2025-04-15');
    });

    it('할인이 없는 경우를 처리해야 한다', () => {
      const result = calculateFullPayment(1, monthlyFee, startDate);
      
      expect(result.originalAmount).toBe(50000);
      expect(result.discountRate).toBe(0);
      expect(result.discountAmount).toBe(0);
      expect(result.finalAmount).toBe(50000);
    });

    it('연장의 경우 기존 종료일 이후부터 계산해야 한다', () => {
      const result = calculateFullPayment(3, monthlyFee, startDate, true, '2025-03-15');
      
      expect(result.startDate).toBe('2025-03-15');
      expect(result.endDate).toBe('2025-06-15');
    });
  });

  describe('validatePaymentData', () => {
    const validData: PaymentValidationData = {
      months: 3,
      paymentMethod: 'cash',
      startDate: '2025-12-15', // 미래 날짜로 변경
      amount: 100000
    };

    it('유효한 데이터에 대해 성공을 반환해야 한다', () => {
      const result = validatePaymentData(validData);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('월 수가 유효하지 않으면 오류를 반환해야 한다', () => {
      const invalidData = { ...validData, months: 0 };
      const result = validatePaymentData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.months).toBeDefined();
    });

    it('결제 금액이 0 이하면 오류를 반환해야 한다', () => {
      const invalidData = { ...validData, amount: 0 };
      const result = validatePaymentData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.amount).toBeDefined();
    });
  });

  describe('getDiscountDescription', () => {
    it('할인 설명을 반환해야 한다', () => {
      expect(getDiscountDescription(3)).toContain('5%');
      expect(getDiscountDescription(6)).toContain('10%');
      expect(getDiscountDescription(12)).toContain('15%');
    });

    it('할인이 없는 경우 null을 반환해야 한다', () => {
      expect(getDiscountDescription(1)).toBeNull();
    });
  });

  describe('generatePaymentHistoryNote', () => {
    it('결제 내역 메모를 생성해야 한다', () => {
      const note = generatePaymentHistoryNote('A-001', 3, '2025-01-15', '2025-04-15');
      expect(note).toContain('A-001');
      expect(note).toContain('3개월');
      expect(note).toContain('2025년 1월 15일'); // 한국어 날짜 형식으로 변경
      expect(note).toContain('2025년 4월 15일'); // 한국어 날짜 형식으로 변경
    });
  });
}); 