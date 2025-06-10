import { LockerAction } from '../types/lockerHistory';

// 액션 타입별 한글 라벨
export const LOCKER_ACTION_LABELS: Record<LockerAction, string> = {
  assign: '락커 배정',
  release: '락커 해제',
  extend: '사용 연장',
  transfer: '락커 이전',
  payment: '사용료 결제',
  expire: '사용 만료',
  maintenance: '유지보수',
  repair: '수리'
};

// 액션별 색상 설정
export const LOCKER_ACTION_COLORS: Record<LockerAction, string> = {
  assign: 'bg-green-100 text-green-800',
  release: 'bg-red-100 text-red-800',
  extend: 'bg-blue-100 text-blue-800',
  transfer: 'bg-yellow-100 text-yellow-800',
  payment: 'bg-indigo-100 text-indigo-800',
  expire: 'bg-gray-100 text-gray-800',
  maintenance: 'bg-orange-100 text-orange-800',
  repair: 'bg-purple-100 text-purple-800'
};

// 검색 옵션 기본값
export const DEFAULT_SEARCH_OPTIONS = {
  pageSize: 20,
  page: 1,
  action: 'all'
};

// 페이지 크기 옵션
export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10개' },
  { value: 20, label: '20개' },
  { value: 50, label: '50개' },
  { value: 100, label: '100개' }
];

// 차트 색상 팔레트
export const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  secondary: '#6B7280'
}; 