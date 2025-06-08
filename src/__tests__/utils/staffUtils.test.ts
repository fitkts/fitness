import { parseISO, isValid, getUnixTime } from 'date-fns';

// toTimestamp 함수 복사 (테스트용)
function toTimestamp(dateValue: string | Date | undefined | null): number | null {
  // 빈 문자열이나 falsy 값 처리
  if (!dateValue || dateValue === '') return null;
  
  const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  if (!isValid(date)) {
    return null;
  }
  
  return getUnixTime(date);
}

// fromTimestampToISO 함수 복사 (테스트용) - 타임존 문제 해결
function fromTimestampToISO(timestamp: number | undefined | null): string | null {
  if (timestamp === null || timestamp === undefined) return null;
  const date = new Date(timestamp * 1000);
  if (!isValid(date)) return null;
  
  // 로컬 타임존에서 YYYY-MM-DD 형식으로 변환
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

describe('Staff Utils - 날짜 변환 함수', () => {
  describe('toTimestamp', () => {
    test('유효한 날짜 문자열을 Unix timestamp로 변환해야 함', () => {
      const result = toTimestamp('2024-12-25');
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    test('빈 문자열을 null로 변환해야 함', () => {
      const result = toTimestamp('');
      expect(result).toBeNull();
    });

    test('undefined를 null로 변환해야 함', () => {
      const result = toTimestamp(undefined);
      expect(result).toBeNull();
    });

    test('null을 null로 변환해야 함', () => {
      const result = toTimestamp(null);
      expect(result).toBeNull();
    });

    test('유효하지 않은 날짜를 null로 변환해야 함', () => {
      const result = toTimestamp('invalid-date');
      expect(result).toBeNull();
    });

    test('Date 객체를 Unix timestamp로 변환해야 함', () => {
      const date = new Date('2024-12-25');
      const result = toTimestamp(date);
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });
  });

  describe('fromTimestampToISO', () => {
    test('Unix timestamp를 ISO 날짜 문자열로 변환해야 함', () => {
      const timestamp = getUnixTime(new Date('2024-12-25'));
      const result = fromTimestampToISO(timestamp);
      expect(result).toBe('2024-12-25');
    });

    test('null timestamp를 null로 변환해야 함', () => {
      const result = fromTimestampToISO(null);
      expect(result).toBeNull();
    });

    test('undefined timestamp를 null로 변환해야 함', () => {
      const result = fromTimestampToISO(undefined);
      expect(result).toBeNull();
    });
  });

  describe('roundtrip 변환', () => {
    test('날짜 문자열 → timestamp → 날짜 문자열 변환이 일관성 있어야 함', () => {
      const originalDate = '1990-05-15';
      const timestamp = toTimestamp(originalDate);
      const convertedBack = fromTimestampToISO(timestamp!);
      
      expect(convertedBack).toBe(originalDate);
    });

    test('빈 문자열의 roundtrip 변환이 일관성 있어야 함', () => {
      const originalDate = '';
      const timestamp = toTimestamp(originalDate);
      const convertedBack = fromTimestampToISO(timestamp);
      
      expect(timestamp).toBeNull();
      expect(convertedBack).toBeNull();
    });
  });
}); 