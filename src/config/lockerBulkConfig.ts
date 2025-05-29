import { LockerSize } from '../models/types';
import { BulkAddMode } from '../types/lockerBulkAdd';

// 벌크 추가 모드 설정
export const BULK_ADD_MODES: Array<{ value: BulkAddMode; label: string; description: string }> = [
  {
    value: 'single',
    label: '단일 추가',
    description: '하나의 락커만 추가'
  },
  {
    value: 'range',
    label: '범위 추가',
    description: '연속된 번호의 락커들을 한번에 추가'
  },
  {
    value: 'multiple',
    label: '다중 추가',
    description: '여러 번호를 직접 입력하여 추가'
  }
];

// 락커 크기 옵션
export const LOCKER_SIZE_OPTIONS = [
  { value: LockerSize.SMALL, label: '소형', color: 'bg-green-100 text-green-800' },
  { value: LockerSize.MEDIUM, label: '중형', color: 'bg-blue-100 text-blue-800' },
  { value: LockerSize.LARGE, label: '대형', color: 'bg-purple-100 text-purple-800' }
];

// 위치 옵션 (예시 - 실제 체육관에 맞게 수정 필요)
export const LOCATION_OPTIONS = [
  '1층 A구역',
  '1층 B구역',
  '1층 C구역',
  '2층 A구역',
  '2층 B구역',
  '2층 C구역',
  '지하 1층',
  '탈의실 앞',
  '입구 근처'
];

// 기본값 설정
export const DEFAULT_BULK_ADD_DATA = {
  mode: 'single' as BulkAddMode,
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
    numbers: [],
    size: LockerSize.MEDIUM,
    location: '',
    notes: ''
  }
};

// 제한값 설정
export const BULK_ADD_LIMITS = {
  MAX_RANGE_SIZE: 100, // 한번에 추가할 수 있는 최대 범위
  MAX_MULTIPLE_COUNT: 50, // 다중 추가 시 최대 개수
  MAX_LOCKER_NUMBER: 9999, // 최대 락커 번호
  MIN_LOCKER_NUMBER: 1 // 최소 락커 번호
};

// 드래그 앤 드롭 설정
export const DRAG_DROP_CONFIG = {
  ACCEPTED_FORMATS: ['text/plain'],
  DROP_ZONE_CLASSES: 'border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors',
  DROP_ZONE_ACTIVE_CLASSES: 'border-blue-500 bg-blue-50',
  PLACEHOLDER_TEXT: '락커 번호를 여기에 드래그하거나 직접 입력하세요\n(예: 101, 102, 103)',
}; 