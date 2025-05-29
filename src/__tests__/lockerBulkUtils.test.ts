import {
  generateRangeNumbers,
  parseMultipleNumbers,
  validateLockerNumbers,
  generateLockersFromBulkData,
  calculateEstimatedCount,
  formatLockerNumber
} from '../utils/lockerBulkUtils';
import { BulkAddFormData } from '../types/lockerBulkAdd';
import { Locker, LockerSize } from '../models/types';

describe('lockerBulkUtils', () => {
  // 기존 락커 데이터 (테스트용)
  const existingLockers: Locker[] = [
    {
      id: 1,
      number: '001',
      status: 'available',
      size: LockerSize.MEDIUM,
      location: '1층 A구역',
      feeOptions: [{ durationDays: 30, price: 50000 }]
    },
    {
      id: 2,
      number: '002',
      status: 'occupied',
      size: LockerSize.SMALL,
      location: '1층 A구역',
      feeOptions: [{ durationDays: 30, price: 30000 }]
    }
  ];

  describe('generateRangeNumbers', () => {
    test('정상적인 범위에서 번호 배열을 생성해야 한다', () => {
      const rangeData = {
        startNumber: 10,
        endNumber: 13,
        size: LockerSize.MEDIUM,
        location: '1층',
        notes: ''
      };

      const result = generateRangeNumbers(rangeData);
      expect(result).toEqual(['10', '11', '12', '13']);
    });

    test('시작 번호가 종료 번호보다 클 때 빈 배열을 반환해야 한다', () => {
      const rangeData = {
        startNumber: 15,
        endNumber: 10,
        size: LockerSize.MEDIUM,
        location: '1층',
        notes: ''
      };

      const result = generateRangeNumbers(rangeData);
      expect(result).toEqual([]);
    });

    test('단일 번호일 때 하나의 요소를 가진 배열을 반환해야 한다', () => {
      const rangeData = {
        startNumber: 5,
        endNumber: 5,
        size: LockerSize.MEDIUM,
        location: '1층',
        notes: ''
      };

      const result = generateRangeNumbers(rangeData);
      expect(result).toEqual(['5']);
    });
  });

  describe('parseMultipleNumbers', () => {
    test('쉼표로 구분된 번호들을 파싱해야 한다', () => {
      const text = '101, 102, 103';
      const result = parseMultipleNumbers(text);
      expect(result).toEqual(['101', '102', '103']);
    });

    test('공백으로 구분된 번호들을 파싱해야 한다', () => {
      const text = '101 102 103';
      const result = parseMultipleNumbers(text);
      expect(result).toEqual(['101', '102', '103']);
    });

    test('줄바꿈으로 구분된 번호들을 파싱해야 한다', () => {
      const text = '101\n102\n103';
      const result = parseMultipleNumbers(text);
      expect(result).toEqual(['101', '102', '103']);
    });

    test('혼합된 구분자를 처리해야 한다', () => {
      const text = '101, 102\n103 104';
      const result = parseMultipleNumbers(text);
      expect(result).toEqual(['101', '102', '103', '104']);
    });

    test('중복 번호를 제거해야 한다', () => {
      const text = '101, 102, 101, 103';
      const result = parseMultipleNumbers(text);
      expect(result).toEqual(['101', '102', '103']);
    });

    test('빈 문자열에 대해 빈 배열을 반환해야 한다', () => {
      const text = '';
      const result = parseMultipleNumbers(text);
      expect(result).toEqual([]);
    });
  });

  describe('validateLockerNumbers', () => {
    test('유효한 번호들에 대해 검증을 통과해야 한다', async () => {
      const numbers = ['003', '004', '005'];
      const result = await validateLockerNumbers(numbers, existingLockers);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.duplicates).toEqual([]);
      expect(result.invalidNumbers).toEqual([]);
    });

    test('중복 번호들을 감지해야 한다', async () => {
      const numbers = ['001', '003', '002'];
      const result = await validateLockerNumbers(numbers, existingLockers);
      
      expect(result.isValid).toBe(false);
      expect(result.duplicates).toEqual(['001', '002']);
      expect(result.errors).toContain('이미 존재하는 락커 번호: 001, 002');
    });

    test('잘못된 번호 형식을 감지해야 한다', async () => {
      const numbers = ['abc', '0', '10000'];
      const result = await validateLockerNumbers(numbers, existingLockers);
      
      expect(result.isValid).toBe(false);
      expect(result.invalidNumbers).toContain('abc');
      expect(result.invalidNumbers).toContain('0');
      expect(result.invalidNumbers).toContain('10000');
    });
  });

  describe('calculateEstimatedCount', () => {
    test('단일 모드에서 개수를 계산해야 한다', () => {
      const formData: BulkAddFormData = {
        mode: 'single',
        single: {
          number: '101',
          size: LockerSize.MEDIUM,
          location: '1층',
          notes: ''
        },
        range: {
          startNumber: 1,
          endNumber: 10,
          size: LockerSize.MEDIUM,
          location: '',
          notes: ''
        },
        multiple: {
          numbers: [],
          size: LockerSize.MEDIUM,
          location: '',
          notes: ''
        }
      };

      const result = calculateEstimatedCount(formData);
      expect(result).toBe(1);
    });

    test('범위 모드에서 개수를 계산해야 한다', () => {
      const formData: BulkAddFormData = {
        mode: 'range',
        single: {
          number: '',
          size: LockerSize.MEDIUM,
          location: '',
          notes: ''
        },
        range: {
          startNumber: 10,
          endNumber: 15,
          size: LockerSize.MEDIUM,
          location: '1층',
          notes: ''
        },
        multiple: {
          numbers: [],
          size: LockerSize.MEDIUM,
          location: '',
          notes: ''
        }
      };

      const result = calculateEstimatedCount(formData);
      expect(result).toBe(6); // 10, 11, 12, 13, 14, 15
    });

    test('다중 모드에서 개수를 계산해야 한다', () => {
      const formData: BulkAddFormData = {
        mode: 'multiple',
        single: {
          number: '',
          size: LockerSize.MEDIUM,
          location: '',
          notes: ''
        },
        range: {
          startNumber: 1,
          endNumber: 10,
          size: LockerSize.MEDIUM,
          location: '',
          notes: ''
        },
        multiple: {
          numbers: ['101', '102', '103', '104'],
          size: LockerSize.MEDIUM,
          location: '1층',
          notes: ''
        }
      };

      const result = calculateEstimatedCount(formData);
      expect(result).toBe(4);
    });
  });

  describe('formatLockerNumber', () => {
    test('숫자를 지정된 길이로 패딩해야 한다', () => {
      expect(formatLockerNumber('1', 3)).toBe('001');
      expect(formatLockerNumber('12', 3)).toBe('012');
      expect(formatLockerNumber('123', 3)).toBe('123');
    });

    test('이미 충분한 길이인 경우 그대로 반환해야 한다', () => {
      expect(formatLockerNumber('1234', 3)).toBe('1234');
    });

    test('숫자가 아닌 경우 원본을 반환해야 한다', () => {
      expect(formatLockerNumber('abc', 3)).toBe('abc');
    });
  });

  describe('generateLockersFromBulkData', () => {
    test('단일 모드에서 락커 객체를 생성해야 한다', () => {
      const formData: BulkAddFormData = {
        mode: 'single',
        single: {
          number: '101',
          size: LockerSize.LARGE,
          location: '2층 B구역',
          notes: '테스트 락커'
        },
        range: {
          startNumber: 1,
          endNumber: 10,
          size: LockerSize.MEDIUM,
          location: '',
          notes: ''
        },
        multiple: {
          numbers: [],
          size: LockerSize.MEDIUM,
          location: '',
          notes: ''
        }
      };

      const result = generateLockersFromBulkData(formData);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        number: '101',
        status: 'available',
        size: LockerSize.LARGE,
        location: '2층 B구역',
        notes: '테스트 락커'
      });
    });

    test('범위 모드에서 여러 락커 객체를 생성해야 한다', () => {
      const formData: BulkAddFormData = {
        mode: 'range',
        single: {
          number: '',
          size: LockerSize.MEDIUM,
          location: '',
          notes: ''
        },
        range: {
          startNumber: 10,
          endNumber: 12,
          size: LockerSize.SMALL,
          location: '1층 A구역',
          notes: '범위 추가'
        },
        multiple: {
          numbers: [],
          size: LockerSize.MEDIUM,
          location: '',
          notes: ''
        }
      };

      const result = generateLockersFromBulkData(formData);
      
      expect(result).toHaveLength(3);
      expect(result.map(l => l.number)).toEqual(['10', '11', '12']);
      expect(result[0]).toMatchObject({
        status: 'available',
        size: LockerSize.SMALL,
        location: '1층 A구역',
        notes: '범위 추가'
      });
    });
  });
}); 