import { QuickDateRange } from '../types/statistics';
import { formatDateString } from './formatters';

// 날짜 범위 계산
export const getDateRange = (type: string, offset: number = 0) => {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  switch (type) {
    case 'today':
      start.setDate(now.getDate() + offset);
      end.setDate(now.getDate() + offset);
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek + (offset * 7));
      start = startOfWeek;
      end = new Date(startOfWeek);
      end.setDate(startOfWeek.getDate() + 6);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
      break;
    case 'year':
      start = new Date(now.getFullYear() + offset, 0, 1);
      end = new Date(now.getFullYear() + offset, 11, 31);
      break;
    default:
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