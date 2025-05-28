// 날짜 범위 계산 및 네비게이션 테스트
describe('날짜 범위 계산 및 네비게이션 테스트', () => {
  // 공통 유틸리티 함수들
  const formatDateString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getRelativeDateRange = (type: string, direction: 'prev' | 'next', startDateStr: string) => {
    const currentStart = new Date(startDateStr);
    
    switch (type) {
      case 'day': {
        const targetDate = new Date(currentStart);
        targetDate.setDate(currentStart.getDate() + (direction === 'next' ? 1 : -1));
        const dateStr = formatDateString(targetDate);
        return { start: dateStr, end: dateStr };
      }
      
      case 'week': {
        const targetDate = new Date(currentStart);
        targetDate.setDate(currentStart.getDate() + (direction === 'next' ? 7 : -7));
        const dayOfWeek = targetDate.getDay();
        const startDate = new Date(targetDate);
        startDate.setDate(targetDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        
        return { start: formatDateString(startDate), end: formatDateString(endDate) };
      }
      
      case 'month': {
        const targetDate = new Date(currentStart.getFullYear(), currentStart.getMonth() + (direction === 'next' ? 1 : -1), 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        
        const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
        const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
        
        return { start: firstDay, end: lastDay };
      }
      
      case 'year': {
        const targetYear = currentStart.getFullYear() + (direction === 'next' ? 1 : -1);
        const firstDay = `${targetYear}-01-01`;
        const lastDay = `${targetYear}-12-31`;
        
        return { start: firstDay, end: lastDay };
      }
      
      default:
        return { start: formatDateString(currentStart), end: formatDateString(currentStart) };
    }
  };

  describe('일간 네비게이션 테스트', () => {
    test('현재 날짜에서 이전/다음 일로 올바르게 이동', () => {
      const currentDate = '2025-05-15';
      
      // 이전 일
      const prevDay = getRelativeDateRange('day', 'prev', currentDate);
      expect(prevDay.start).toBe('2025-05-14');
      expect(prevDay.end).toBe('2025-05-14');
      
      // 다음 일
      const nextDay = getRelativeDateRange('day', 'next', currentDate);
      expect(nextDay.start).toBe('2025-05-16');
      expect(nextDay.end).toBe('2025-05-16');
    });

    test('월말/월초 경계에서 올바르게 이동', () => {
      // 월말에서 다음 일
      const endOfMonth = '2025-05-31';
      const nextDay = getRelativeDateRange('day', 'next', endOfMonth);
      expect(nextDay.start).toBe('2025-06-01');
      expect(nextDay.end).toBe('2025-06-01');
      
      // 월초에서 이전 일
      const startOfMonth = '2025-06-01';
      const prevDay = getRelativeDateRange('day', 'prev', startOfMonth);
      expect(prevDay.start).toBe('2025-05-31');
      expect(prevDay.end).toBe('2025-05-31');
    });
  });

  describe('주간 네비게이션 테스트', () => {
    test('현재 주에서 이전/다음 주로 올바르게 이동', () => {
      const currentWeekStart = '2025-05-12'; // 월요일
      
      // 이전 주
      const prevWeek = getRelativeDateRange('week', 'prev', currentWeekStart);
      expect(prevWeek.start).toBe('2025-05-05'); // 이전 주 월요일
      expect(prevWeek.end).toBe('2025-05-11');   // 이전 주 일요일
      
      // 다음 주
      const nextWeek = getRelativeDateRange('week', 'next', currentWeekStart);
      expect(nextWeek.start).toBe('2025-05-19'); // 다음 주 월요일
      expect(nextWeek.end).toBe('2025-05-25');   // 다음 주 일요일
    });
  });

  describe('월간 네비게이션 테스트', () => {
    test('현재 월에서 이전/다음 월로 올바르게 이동', () => {
      const currentMonth = '2025-05-01';
      
      // 이전 월
      const prevMonth = getRelativeDateRange('month', 'prev', currentMonth);
      expect(prevMonth.start).toBe('2025-04-01');
      expect(prevMonth.end).toBe('2025-04-30');
      
      // 다음 월
      const nextMonth = getRelativeDateRange('month', 'next', currentMonth);
      expect(nextMonth.start).toBe('2025-06-01');
      expect(nextMonth.end).toBe('2025-06-30');
    });

    test('1월에서 이전 월로 이동 시 작년 12월로 이동', () => {
      const january = '2025-01-15';
      
      const prevMonth = getRelativeDateRange('month', 'prev', january);
      expect(prevMonth.start).toBe('2024-12-01');
      expect(prevMonth.end).toBe('2024-12-31');
    });

    test('12월에서 다음 월로 이동 시 다음 해 1월로 이동', () => {
      const december = '2025-12-15';
      
      const nextMonth = getRelativeDateRange('month', 'next', december);
      expect(nextMonth.start).toBe('2026-01-01');
      expect(nextMonth.end).toBe('2026-01-31');
    });
  });

  describe('연간 네비게이션 테스트', () => {
    test('현재 연도에서 이전/다음 연도로 올바르게 이동', () => {
      const currentYear = '2025-05-15';
      
      // 이전 연도
      const prevYear = getRelativeDateRange('year', 'prev', currentYear);
      expect(prevYear.start).toBe('2024-01-01');
      expect(prevYear.end).toBe('2024-12-31');
      
      // 다음 연도
      const nextYear = getRelativeDateRange('year', 'next', currentYear);
      expect(nextYear.start).toBe('2026-01-01');
      expect(nextYear.end).toBe('2026-12-31');
    });
  });

  describe('연속 네비게이션 테스트', () => {
    test('일간 네비게이션을 여러 번 연속으로 실행', () => {
      let currentDate = '2025-05-15';
      
      // 3일 연속 이전으로
      for (let i = 0; i < 3; i++) {
        const result = getRelativeDateRange('day', 'prev', currentDate);
        currentDate = result.start;
      }
      expect(currentDate).toBe('2025-05-12');
      
      // 5일 연속 다음으로
      for (let i = 0; i < 5; i++) {
        const result = getRelativeDateRange('day', 'next', currentDate);
        currentDate = result.start;
      }
      expect(currentDate).toBe('2025-05-17');
    });

    test('월간 네비게이션을 여러 번 연속으로 실행', () => {
      let currentDate = '2025-05-01';
      
      // 3개월 연속 이전으로
      for (let i = 0; i < 3; i++) {
        const result = getRelativeDateRange('month', 'prev', currentDate);
        currentDate = result.start;
      }
      expect(currentDate).toBe('2025-02-01');
      
      // 6개월 연속 다음으로
      for (let i = 0; i < 6; i++) {
        const result = getRelativeDateRange('month', 'next', currentDate);
        currentDate = result.start;
      }
      expect(currentDate).toBe('2025-08-01');
    });
  });
}); 