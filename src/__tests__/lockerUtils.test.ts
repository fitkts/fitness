import {
  filterLockers,
  calculatePagination,
  getVisiblePageNumbers,
  calculateDaysUntilExpiry,
  normalizeLockerNumber,
  sortLockers
} from '../utils/lockerUtils';
import { Locker, LockerSize } from '../models/types';

describe('lockerUtils', () => {
  // 테스트용 락커 데이터
  const mockLockers: Locker[] = [
    {
      id: 1,
      number: '001',
      status: 'available',
      size: LockerSize.SMALL,
      location: '1층 A구역',
      feeOptions: [{ durationDays: 30, price: 30000 }]
    },
    {
      id: 2,
      number: '102',
      status: 'occupied',
      size: LockerSize.MEDIUM,
      location: '1층 B구역',
      memberName: '홍길동',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      feeOptions: [{ durationDays: 30, price: 50000 }]
    },
    {
      id: 3,
      number: '203',
      status: 'maintenance',
      size: LockerSize.LARGE,
      location: '2층 A구역',
      feeOptions: [{ durationDays: 30, price: 70000 }]
    }
  ];

  describe('filterLockers', () => {
    test('상태로 필터링해야 한다', () => {
      const result = filterLockers(mockLockers, '', 'available');
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('available');
    });

    test('검색어로 필터링해야 한다', () => {
      const result = filterLockers(mockLockers, '홍길동', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].memberName).toBe('홍길동');
    });

    test('락커 번호로 검색해야 한다', () => {
      const result = filterLockers(mockLockers, '102', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].number).toBe('102');
    });

    test('검색어와 상태를 모두 적용해야 한다', () => {
      const result = filterLockers(mockLockers, '홍길동', 'occupied');
      expect(result).toHaveLength(1);
      expect(result[0].memberName).toBe('홍길동');
      expect(result[0].status).toBe('occupied');
    });
  });

  describe('calculatePagination', () => {
    test('페이지네이션 정보를 계산해야 한다', () => {
      const result = calculatePagination(25, 2); // 25개 항목, 2페이지
      expect(result.totalPages).toBe(3); // 12개씩 나누면 3페이지
      expect(result.startIndex).toBe(12); // 2페이지 시작 인덱스
      expect(result.endIndex).toBe(24); // 2페이지 끝 인덱스
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(true);
    });

    test('첫 페이지일 때 이전 페이지가 없어야 한다', () => {
      const result = calculatePagination(25, 1);
      expect(result.hasPrevPage).toBe(false);
    });

    test('마지막 페이지일 때 다음 페이지가 없어야 한다', () => {
      const result = calculatePagination(25, 3);
      expect(result.hasNextPage).toBe(false);
    });
  });

  describe('getVisiblePageNumbers', () => {
    test('페이지가 적을 때 모든 페이지를 표시해야 한다', () => {
      const result = getVisiblePageNumbers(2, 3);
      expect(result).toEqual([1, 2, 3]);
    });

    test('페이지가 많을 때 제한된 범위를 표시해야 한다', () => {
      const result = getVisiblePageNumbers(5, 10);
      expect(result).toEqual([3, 4, 5, 6, 7]);
    });

    test('첫 부분에서 올바른 범위를 표시해야 한다', () => {
      const result = getVisiblePageNumbers(1, 10);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('calculateDaysUntilExpiry', () => {
    test('만료일까지 남은 일수를 계산해야 한다', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const dateString = futureDate.toISOString().split('T')[0];
      
      const result = calculateDaysUntilExpiry(dateString);
      expect(result).toBe(10);
    });

    test('과거 날짜에 대해 음수를 반환해야 한다', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const dateString = pastDate.toISOString().split('T')[0];
      
      const result = calculateDaysUntilExpiry(dateString);
      expect(result).toBe(-5);
    });

    test('날짜가 없으면 null을 반환해야 한다', () => {
      const result = calculateDaysUntilExpiry(undefined);
      expect(result).toBeNull();
    });
  });

  describe('normalizeLockerNumber', () => {
    test('숫자 부분을 패딩해야 한다', () => {
      expect(normalizeLockerNumber('A1')).toBe('A0000000001');
      expect(normalizeLockerNumber('B123')).toBe('B0000000123');
    });

    test('순수 숫자도 처리해야 한다', () => {
      expect(normalizeLockerNumber('1')).toBe('0000000001');
      expect(normalizeLockerNumber('123')).toBe('0000000123');
    });
  });

  describe('sortLockers', () => {
    test('락커 번호로 정렬해야 한다', () => {
      const unsorted = [...mockLockers].reverse();
      const result = sortLockers(unsorted, 'number');
      
      expect(result[0].number).toBe('001');
      expect(result[1].number).toBe('102');
      expect(result[2].number).toBe('203');
    });

    test('상태로 정렬해야 한다', () => {
      const result = sortLockers(mockLockers, 'status');
      
      expect(result[0].status).toBe('available');
      expect(result[1].status).toBe('maintenance');
      expect(result[2].status).toBe('occupied');
    });

    test('회원명으로 정렬해야 한다', () => {
      const result = sortLockers(mockLockers, 'memberName');
      
      // 빈 값들이 먼저 오고, 그 다음 홍길동
      expect(result[result.length - 1].memberName).toBe('홍길동');
    });
  });
}); 