// 락커 결제 설정 테스트 (TDD)
import { 
  MONTH_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_FORM_CONFIG,
  VALIDATION_MESSAGES,
  MESSAGES,
  STYLE_CLASSES
} from '../../config/lockerPaymentConfig';

describe('LockerPaymentConfig', () => {
  describe('MONTH_OPTIONS', () => {
    it('월 옵션이 올바른 구조를 가져야 한다', () => {
      expect(Array.isArray(MONTH_OPTIONS)).toBe(true);
      expect(MONTH_OPTIONS.length).toBeGreaterThan(0);
      
      const firstOption = MONTH_OPTIONS[0];
      expect(firstOption).toHaveProperty('value');
      expect(firstOption).toHaveProperty('label');
      expect(typeof firstOption.value).toBe('number');
      expect(typeof firstOption.label).toBe('string');
    });

    it('인기 옵션을 포함해야 한다', () => {
      const popularOptions = MONTH_OPTIONS.filter(option => option.popular);
      expect(popularOptions.length).toBeGreaterThan(0);
    });

    it('1개월부터 12개월까지 옵션을 포함해야 한다', () => {
      const values = MONTH_OPTIONS.map(option => option.value);
      expect(values).toContain(1);
      expect(values).toContain(3);
      expect(values).toContain(6);
      expect(values).toContain(12);
    });
  });

  describe('PAYMENT_METHOD_OPTIONS', () => {
    it('결제 방법 옵션이 올바른 구조를 가져야 한다', () => {
      expect(Array.isArray(PAYMENT_METHOD_OPTIONS)).toBe(true);
      expect(PAYMENT_METHOD_OPTIONS.length).toBe(4);
      
      const firstOption = PAYMENT_METHOD_OPTIONS[0];
      expect(firstOption).toHaveProperty('value');
      expect(firstOption).toHaveProperty('label');
      expect(firstOption).toHaveProperty('icon');
    });

    it('모든 결제 방법을 포함해야 한다', () => {
      const values = PAYMENT_METHOD_OPTIONS.map(option => option.value);
      expect(values).toContain('cash');
      expect(values).toContain('card');
      expect(values).toContain('transfer');
      expect(values).toContain('other');
    });
  });

  describe('PAYMENT_FORM_CONFIG', () => {
    it('폼 설정이 모든 필요한 라벨을 포함해야 한다', () => {
      expect(PAYMENT_FORM_CONFIG).toHaveProperty('TITLE');
      expect(PAYMENT_FORM_CONFIG).toHaveProperty('EXTENSION_TITLE');
      expect(PAYMENT_FORM_CONFIG).toHaveProperty('MONTHS_LABEL');
      expect(PAYMENT_FORM_CONFIG).toHaveProperty('START_DATE_LABEL');
      expect(PAYMENT_FORM_CONFIG).toHaveProperty('PAYMENT_METHOD_LABEL');
      expect(PAYMENT_FORM_CONFIG).toHaveProperty('NOTES_LABEL');
      expect(PAYMENT_FORM_CONFIG).toHaveProperty('SUBMIT_BUTTON');
      expect(PAYMENT_FORM_CONFIG).toHaveProperty('CANCEL_BUTTON');
      expect(PAYMENT_FORM_CONFIG).toHaveProperty('LOADING_TEXT');
    });

    it('모든 라벨이 문자열이어야 한다', () => {
      Object.values(PAYMENT_FORM_CONFIG).forEach(value => {
        expect(typeof value).toBe('string');
      });
    });
  });

  describe('VALIDATION_MESSAGES', () => {
    it('유효성 검증 메시지가 모든 필드를 포함해야 한다', () => {
      expect(VALIDATION_MESSAGES).toHaveProperty('MONTHS_REQUIRED');
      expect(VALIDATION_MESSAGES).toHaveProperty('MONTHS_MIN');
      expect(VALIDATION_MESSAGES).toHaveProperty('MONTHS_MAX');
      expect(VALIDATION_MESSAGES).toHaveProperty('START_DATE_REQUIRED');
      expect(VALIDATION_MESSAGES).toHaveProperty('START_DATE_FUTURE');
      expect(VALIDATION_MESSAGES).toHaveProperty('PAYMENT_METHOD_REQUIRED');
      expect(VALIDATION_MESSAGES).toHaveProperty('AMOUNT_REQUIRED');
      expect(VALIDATION_MESSAGES).toHaveProperty('AMOUNT_MIN');
    });
  });

  describe('MESSAGES', () => {
    it('사용자 메시지가 정의되어야 한다', () => {
      expect(MESSAGES).toHaveProperty('PAYMENT_SUCCESS');
      expect(MESSAGES).toHaveProperty('EXTENSION_SUCCESS');
      expect(MESSAGES).toHaveProperty('PAYMENT_ERROR');
      expect(MESSAGES).toHaveProperty('VALIDATION_ERROR');
    });
  });

  describe('STYLE_CLASSES', () => {
    it('스타일 클래스가 정의되어야 한다', () => {
      expect(STYLE_CLASSES).toHaveProperty('AMOUNT_HIGHLIGHT');
      expect(STYLE_CLASSES).toHaveProperty('DISCOUNT_AMOUNT');
      expect(STYLE_CLASSES).toHaveProperty('ORIGINAL_AMOUNT');
      expect(STYLE_CLASSES).toHaveProperty('POPULAR_BADGE');
    });

    it('모든 스타일 클래스가 문자열이어야 한다', () => {
      Object.values(STYLE_CLASSES).forEach(value => {
        expect(typeof value).toBe('string');
      });
    });
  });
}); 