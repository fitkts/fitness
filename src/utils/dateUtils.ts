import { QuickDateRange } from '../types/statistics';
import { formatDateString } from './formatters';

// 안전한 날짜 범위 계산 (로컬 시간대 기준)
export const getDateRange = (type: string, offset: number = 0) => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (type) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      break;
      
    case 'week':
      const dayOfWeek = now.getDay();
      // 이번 주 월요일 계산 (일요일을 0으로 가정)
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset + (offset * 7));
      start = startOfWeek;
      end = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6);
      break;
      
    case 'month':
      // 월별 계산 시 연도 경계 고려
      const targetYear = now.getFullYear();
      const targetMonth = now.getMonth() + offset;
      
      // 첫째 날
      start = new Date(targetYear, targetMonth, 1);
      
      // 마지막 날 (다음 달 0일 = 이번 달 마지막 날)
      end = new Date(targetYear, targetMonth + 1, 0);
      break;
      
    case 'year':
      const year = now.getFullYear() + offset;
      start = new Date(year, 0, 1);  // 1월 1일
      end = new Date(year, 11, 31);  // 12월 31일
      break;
      
    default:
      start = new Date(now);
      end = new Date(now);
      break;
  }

  return {
    start: formatDateString(start),
    end: formatDateString(end)
  };
};

// 상대적 날짜 범위 계산
export const getRelativeDateRange = (type: string, direction: 'prev' | 'next') => {
  const offset = direction === 'prev' ? -1 : 1;
  return getDateRange(type, offset);
};

// 빠른 날짜 범위 설정
export const createQuickDateRanges = (): QuickDateRange[] => [
  {
    label: '오늘',
    type: 'day',
    getRange: () => getDateRange('today'),
    getPrevRange: () => getDateRange('today', -1),
    getNextRange: () => getDateRange('today', 1)
  },
  {
    label: '이번 주',
    type: 'week',
    getRange: () => getDateRange('week'),
    getPrevRange: () => getDateRange('week', -1),
    getNextRange: () => getDateRange('week', 1)
  },
  {
    label: '이번 달',
    type: 'month',
    getRange: () => getDateRange('month'),
    getPrevRange: () => getDateRange('month', -1),
    getNextRange: () => getDateRange('month', 1)
  },
  {
    label: '올해',
    type: 'year',
    getRange: () => getDateRange('year'),
    getPrevRange: () => getDateRange('year', -1),
    getNextRange: () => getDateRange('year', 1)
  }
]; 