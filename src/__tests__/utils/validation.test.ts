import { validatePhoneNumber, validateName, validateMembershipType } from '../../utils/validation';

describe('회원 정보 검증 테스트', () => {
  describe('전화번호 검증', () => {
    test('올바른 전화번호 형식이면 true를 반환해야 함', () => {
      expect(validatePhoneNumber('010-1234-5678')).toBe(true);
      expect(validatePhoneNumber('010-1234-5678')).toBe(true);
    });

    test('잘못된 전화번호 형식이면 false를 반환해야 함', () => {
      expect(validatePhoneNumber('1234')).toBe(false);
      expect(validatePhoneNumber('010-123-5678')).toBe(false);
      expect(validatePhoneNumber('abc-defg-hijk')).toBe(false);
    });
  });

  describe('이름 검증', () => {
    test('올바른 이름이면 true를 반환해야 함', () => {
      expect(validateName('홍길동')).toBe(true);
      expect(validateName('John Doe')).toBe(true);
    });

    test('잘못된 이름이면 false를 반환해야 함', () => {
      expect(validateName('')).toBe(false);
      expect(validateName(' ')).toBe(false);
      expect(validateName('123')).toBe(false);
    });
  });

  describe('회원권 타입 검증', () => {
    test('올바른 회원권 타입이면 true를 반환해야 함', () => {
      expect(validateMembershipType('1개월')).toBe(true);
      expect(validateMembershipType('3개월')).toBe(true);
      expect(validateMembershipType('6개월')).toBe(true);
      expect(validateMembershipType('12개월')).toBe(true);
    });

    test('잘못된 회원권 타입이면 false를 반환해야 함', () => {
      expect(validateMembershipType('2개월')).toBe(false);
      expect(validateMembershipType('13개월')).toBe(false);
      expect(validateMembershipType('일개월')).toBe(false);
    });
  });
}); 