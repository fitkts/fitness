import { getDateRange, getRelativeDateRange, createQuickDateRanges } from '../../utils/dateUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    // 테스트를 위해 현재 날짜를 2025년 5월 15일로 고정
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-05-15T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getDateRange', () => {
    test('오늘 날짜 범위를 올바르게 계산한다', () => {
      const result = getDateRange('today');
      expect(result.start).toBe('2025-05-15');
      expect(result.end).toBe('2025-05-15');
    });

    test('이번 달 범위를 올바르게 계산한다', () => {
      const result = getDateRange('month');
      expect(result.start).toBe('2025-05-01');
      expect(result.end).toBe('2025-05-31');
    });

    test('지난 달 범위를 올바르게 계산한다', () => {
      const result = getDateRange('month', -1);
      expect(result.start).toBe('2025-04-01');
      expect(result.end).toBe('2025-04-30');
    });

    test('다음 달 범위를 올바르게 계산한다', () => {
      const result = getDateRange('month', 1);
      expect(result.start).toBe('2025-06-01');
      expect(result.end).toBe('2025-06-30');
    });

    test('올해 범위를 올바르게 계산한다', () => {
      const result = getDateRange('year');
      expect(result.start).toBe('2025-01-01');
      expect(result.end).toBe('2025-12-31');
    });

    test('작년 범위를 올바르게 계산한다', () => {
      const result = getDateRange('year', -1);
      expect(result.start).toBe('2024-01-01');
      expect(result.end).toBe('2024-12-31');
    });

    test('이번 주 범위를 올바르게 계산한다 (월요일 시작)', () => {
      // 2025-05-15는 목요일이므로, 이번 주 월요일은 2025-05-12
      const result = getDateRange('week');
      expect(result.start).toBe('2025-05-12');
      expect(result.end).toBe('2025-05-18');
    });
  });

  describe('getRelativeDateRange', () => {
    test('이전 달 범위를 올바르게 계산한다', () => {
      const result = getRelativeDateRange('month', 'prev');
      expect(result.start).toBe('2025-04-01');
      expect(result.end).toBe('2025-04-30');
    });

    test('다음 달 범위를 올바르게 계산한다', () => {
      const result = getRelativeDateRange('month', 'next');
      expect(result.start).toBe('2025-06-01');
      expect(result.end).toBe('2025-06-30');
    });
  });

  describe('createQuickDateRanges', () => {
    test('빠른 날짜 범위 설정이 올바르게 작동한다', () => {
      const ranges = createQuickDateRanges();
      
      expect(ranges).toHaveLength(4);
      expect(ranges[0].label).toBe('오늘');
      expect(ranges[1].label).toBe('이번 주');
      expect(ranges[2].label).toBe('이번 달');
      expect(ranges[3].label).toBe('올해');

      // 이번 달 테스트
      const thisMonth = ranges[2].getRange();
      expect(thisMonth.start).toBe('2025-05-01');
      expect(thisMonth.end).toBe('2025-05-31');

      // 지난 달 테스트
      const lastMonth = ranges[2].getPrevRange();
      expect(lastMonth.start).toBe('2025-04-01');
      expect(lastMonth.end).toBe('2025-04-30');

      // 다음 달 테스트
      const nextMonth = ranges[2].getNextRange();
      expect(nextMonth.start).toBe('2025-06-01');
      expect(nextMonth.end).toBe('2025-06-30');
    });
  });

  describe('연도 경계 조건 테스트', () => {
    test('1월에서 지난 달을 선택하면 작년 12월이 나온다', () => {
      // 2025년 1월 15일로 설정
      jest.setSystemTime(new Date('2025-01-15T10:00:00.000Z'));
      
      const result = getDateRange('month', -1);
      expect(result.start).toBe('2024-12-01');
      expect(result.end).toBe('2024-12-31');
    });

    test('12월에서 다음 달을 선택하면 내년 1월이 나온다', () => {
      // 2025년 12월 15일로 설정
      jest.setSystemTime(new Date('2025-12-15T10:00:00.000Z'));
      
      const result = getDateRange('month', 1);
      expect(result.start).toBe('2026-01-01');
      expect(result.end).toBe('2026-01-31');
    });
  });

  describe('윤년 처리 테스트', () => {
    test('윤년 2월의 마지막 날을 올바르게 계산한다', () => {
      // 2024년은 윤년
      jest.setSystemTime(new Date('2024-02-15T10:00:00.000Z'));
      
      const result = getDateRange('month');
      expect(result.start).toBe('2024-02-01');
      expect(result.end).toBe('2024-02-29'); // 윤년이므로 29일까지
    });

    test('평년 2월의 마지막 날을 올바르게 계산한다', () => {
      // 2025년은 평년
      jest.setSystemTime(new Date('2025-02-15T10:00:00.000Z'));
      
      const result = getDateRange('month');
      expect(result.start).toBe('2025-02-01');
      expect(result.end).toBe('2025-02-28'); // 평년이므로 28일까지
    });
  });
}); 