import { LockerSize } from '../models/types';

// 벌크 추가 모드 타입
export type BulkAddMode = 'single' | 'range' | 'multiple';

// 단일 락커 추가 데이터
export interface SingleLockerData {
  number: string;
  size: LockerSize;
  location: string;
  notes?: string;
}

// 범위 락커 추가 데이터
export interface RangeLockerData {
  startNumber: number;
  endNumber: number;
  size: LockerSize;
  location: string;
  notes?: string;
}

// 다중 락커 추가 데이터
export interface MultipleLockerData {
  numbers: string[];
  size: LockerSize;
  location: string;
  notes?: string;
}

// 벌크 추가 폼 데이터
export interface BulkAddFormData {
  mode: BulkAddMode;
  single: SingleLockerData;
  range: RangeLockerData;
  multiple: MultipleLockerData;
}

// 벌크 추가 결과
export interface BulkAddResult {
  success: boolean;
  created: number;
  failed: number;
  errors?: string[];
  failedNumbers?: string[];
}

// 락커 번호 검증 결과
export interface LockerNumberValidation {
  isValid: boolean;
  errors: string[];
  duplicates: string[];
  invalidNumbers: string[];
} 