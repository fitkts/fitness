import { createDynamicQuickDateRanges, getDateRangeFromCurrent } from '../../utils/dynamicDateUtils';

describe('동적 날짜 범위 유틸리티 테스트', () => {
  beforeEach(() => {
    // 모든 테스트에서 고정된 날짜 사용 (2024-06-15)
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('현재 날짜 기준 범위 계산', () => {
    test('현재 날짜 기준으로 오늘 범위를 계산해야 한다', () => {
      const result = getDateRangeFromCurrent('2024-06-15', 'today', 0);
      expect(result.start).toBe('2024-06-15');
      expect(result.end).toBe('2024-06-15');
    });

    test('선택된 날짜 기준으로 이전 일을 계산해야 한다', () => {
      const result = getDateRangeFromCurrent('2024-06-15', 'today', -1);
      expect(result.start).toBe('2024-06-14');
      expect(result.end).toBe('2024-06-14');
    });

    test('선택된 날짜 기준으로 다음 일을 계산해야 한다', () => {
      const result = getDateRangeFromCurrent('2024-06-15', 'today', 1);
      expect(result.start).toBe('2024-06-16');
      expect(result.end).toBe('2024-06-16');
    });

    test('현재 주 범위를 정확히 계산해야 한다', () => {
      // 2024-06-15는 토요일 -> 월요일(10일)~일요일(16일)
      const result = getDateRangeFromCurrent('2024-06-15', 'week', 0);
      expect(result.start).toBe('2024-06-10');
      expect(result.end).toBe('2024-06-16');
    });

    test('이전 주 범위를 정확히 계산해야 한다', () => {
      const result = getDateRangeFromCurrent('2024-06-15', 'week', -1);
      expect(result.start).toBe('2024-06-03');
      expect(result.end).toBe('2024-06-09');
    });

    test('현재 월 범위를 정확히 계산해야 한다', () => {
      const result = getDateRangeFromCurrent('2024-06-15', 'month', 0);
      expect(result.start).toBe('2024-06-01');
      expect(result.end).toBe('2024-06-30');
    });

    test('현재 년 범위를 정확히 계산해야 한다', () => {
      const result = getDateRangeFromCurrent('2024-06-15', 'year', 0);
      expect(result.start).toBe('2024-01-01');
      expect(result.end).toBe('2024-12-31');
    });
  });

  describe('동적 빠른 날짜 범위 생성', () => {
    test('현재 선택된 날짜를 기준으로 빠른 날짜 범위를 생성해야 한다', () => {
      const currentDate = '2024-06-15';
      const ranges = createDynamicQuickDateRanges(currentDate);
      
      expect(ranges).toHaveLength(4);
      expect(ranges[0].label).toBe('오늘');
      expect(ranges[1].label).toBe('이번 주');
      expect(ranges[2].label).toBe('이번 달');
      expect(ranges[3].label).toBe('올해');

      // 오늘 범위 테스트
      const todayRange = ranges[0].getRange();
      expect(todayRange.start).toBe('2024-06-15');
      expect(todayRange.end).toBe('2024-06-15');

      // 이전 일 테스트
      const prevDayRange = ranges[0].getPrevRange();
      expect(prevDayRange.start).toBe('2024-06-14');
      expect(prevDayRange.end).toBe('2024-06-14');

      // 다음 일 테스트
      const nextDayRange = ranges[0].getNextRange();
      expect(nextDayRange.start).toBe('2024-06-16');
      expect(nextDayRange.end).toBe('2024-06-16');
    });

    test('날짜가 변경되면 새로운 기준으로 범위를 계산해야 한다', () => {
      // 첫 번째 날짜 기준
      const ranges1 = createDynamicQuickDateRanges('2024-06-15');
      const todayRange1 = ranges1[0].getRange();
      expect(todayRange1.start).toBe('2024-06-15');

      // 두 번째 날짜 기준 (다른 날짜)
      const ranges2 = createDynamicQuickDateRanges('2024-06-20');
      const todayRange2 = ranges2[0].getRange();
      expect(todayRange2.start).toBe('2024-06-20');

      // 서로 다른 결과가 나와야 함
      expect(todayRange1.start).not.toBe(todayRange2.start);
    });
  });

  describe('연속 클릭 시나리오 테스트', () => {
    test('오늘에서 이전 일로 여러 번 이동해야 한다', () => {
      let currentDate = '2024-06-15';
      
      // 첫 번째 이동: 2024-06-15 -> 2024-06-14
      let ranges = createDynamicQuickDateRanges(currentDate);
      let prevRange = ranges[0].getPrevRange();
      expect(prevRange.start).toBe('2024-06-14');
      
      // 두 번째 이동: 2024-06-14 -> 2024-06-13
      currentDate = prevRange.start;
      ranges = createDynamicQuickDateRanges(currentDate);
      prevRange = ranges[0].getPrevRange();
      expect(prevRange.start).toBe('2024-06-13');
      
      // 세 번째 이동: 2024-06-13 -> 2024-06-12
      currentDate = prevRange.start;
      ranges = createDynamicQuickDateRanges(currentDate);
      prevRange = ranges[0].getPrevRange();
      expect(prevRange.start).toBe('2024-06-12');
    });

    test('이번 주에서 이전 주로 여러 번 이동해야 한다', () => {
      let currentDate = '2024-06-15'; // 토요일
      
      // 첫 번째 이동: 현재 주 -> 이전 주
      let ranges = createDynamicQuickDateRanges(currentDate);
      let prevRange = ranges[1].getPrevRange();
      expect(prevRange.start).toBe('2024-06-03'); // 이전 주 월요일
      
      // 두 번째 이동: 이전 주 -> 그 이전 주
      currentDate = prevRange.start;
      ranges = createDynamicQuickDateRanges(currentDate);
      prevRange = ranges[1].getPrevRange();
      expect(prevRange.start).toBe('2024-05-27'); // 그 이전 주 월요일
    });
  });
}); 