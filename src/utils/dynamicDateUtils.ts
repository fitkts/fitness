import { QuickDateRange, DateRange } from '../types/statistics';
import { formatDateString } from './formatters';

/**
 * 현재 선택된 날짜를 기준으로 날짜 범위를 계산하는 함수
 * @param currentDate 현재 선택된 날짜 (YYYY-MM-DD 형식)
 * @param type 날짜 타입 ('today', 'week', 'month', 'year')
 * @param offset 오프셋 (0: 현재, -1: 이전, 1: 다음)
 * @returns 계산된 날짜 범위
 */
export const getDateRangeFromCurrent = (
  currentDate: string, 
  type: string, 
  offset: number = 0
): DateRange => {
  const baseDate = new Date(currentDate);
  let start: Date;
  let end: Date;

  switch (type) {
    case 'today':
      start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset);
      end = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset);
      break;
      
    case 'week':
      const dayOfWeek = baseDate.getDay();
      // 이번 주 월요일 계산 (일요일을 0으로 가정)
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startOfWeek = new Date(
        baseDate.getFullYear(), 
        baseDate.getMonth(), 
        baseDate.getDate() + mondayOffset + (offset * 7)
      );
      start = startOfWeek;
      end = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6);
      break;
      
    case 'month':
      // 월별 계산 시 연도 경계 고려
      const baseYear = baseDate.getFullYear();
      const baseMonth = baseDate.getMonth();
      const targetYear = baseYear;
      const targetMonth = baseMonth + offset;
      
      // 첫째 날
      start = new Date(targetYear, targetMonth, 1);
      
      // 마지막 날 (다음 달 0일 = 이번 달 마지막 날)
      end = new Date(targetYear, targetMonth + 1, 0);
      break;
      
    case 'year':
      const year = baseDate.getFullYear() + offset;
      start = new Date(year, 0, 1);  // 1월 1일
      end = new Date(year, 11, 31);  // 12월 31일
      break;
      
    default:
      start = new Date(baseDate);
      end = new Date(baseDate);
      break;
  }

  return {
    start: formatDateString(start),
    end: formatDateString(end)
  };
};

/**
 * 현재 실제 날짜를 기준으로 날짜 범위를 계산하는 함수 (항상 현재 시점)
 * @param type 날짜 타입 ('today', 'week', 'month', 'year')
 * @returns 현재 시점 기준 날짜 범위
 */
export const getCurrentDateRange = (type: string): DateRange => {
  const today = new Date();
  const todayString = formatDateString(today);
  return getDateRangeFromCurrent(todayString, type, 0);
};

/**
 * 현재 선택된 날짜를 기준으로 동적 빠른 날짜 범위를 생성하는 함수
 * @param currentDate 현재 선택된 날짜 (YYYY-MM-DD 형식)
 * @returns 동적으로 생성된 QuickDateRange 배열
 */
export const createDynamicQuickDateRanges = (currentDate: string): QuickDateRange[] => [
  {
    label: '오늘',
    type: 'day',
    getRange: () => getCurrentDateRange('today'), // 현재 날짜 기준
    getPrevRange: () => getDateRangeFromCurrent(currentDate, 'today', -1),
    getNextRange: () => getDateRangeFromCurrent(currentDate, 'today', 1)
  },
  {
    label: '이번 주',
    type: 'week',
    getRange: () => getCurrentDateRange('week'), // 현재 날짜 기준
    getPrevRange: () => getDateRangeFromCurrent(currentDate, 'week', -1),
    getNextRange: () => getDateRangeFromCurrent(currentDate, 'week', 1)
  },
  {
    label: '이번 달',
    type: 'month',
    getRange: () => getCurrentDateRange('month'), // 현재 날짜 기준
    getPrevRange: () => getDateRangeFromCurrent(currentDate, 'month', -1),
    getNextRange: () => getDateRangeFromCurrent(currentDate, 'month', 1)
  },
  {
    label: '올해',
    type: 'year',
    getRange: () => getCurrentDateRange('year'), // 현재 날짜 기준
    getPrevRange: () => getDateRangeFromCurrent(currentDate, 'year', -1),
    getNextRange: () => getDateRangeFromCurrent(currentDate, 'year', 1)
  }
];

/**
 * 현재 선택된 날짜를 기준으로 동적으로 이전/다음 범위를 계산하는 함수
 * @param currentStartDate 현재 선택된 시작 날짜
 * @param currentEndDate 현재 선택된 종료 날짜  
 * @param type 날짜 타입
 * @param direction 방향 ('prev' | 'next')
 * @returns 계산된 날짜 범위
 */
export const getDynamicRelativeDateRange = (
  currentStartDate: string,
  currentEndDate: string,
  type: string,
  direction: 'prev' | 'next'
): DateRange => {
  const offset = direction === 'prev' ? -1 : 1;
  
  // 시작 날짜를 기준으로 계산
  return getDateRangeFromCurrent(currentStartDate, type, offset);
}; 