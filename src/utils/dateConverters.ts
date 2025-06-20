// 날짜 변환 유틸리티
// Unix timestamp와 ISO 문자열 간 변환 함수들

import { 
  getUnixTime, 
  fromUnixTime, 
  parseISO, 
  isValid, 
  format 
} from 'date-fns';
import { DateString, TimestampNumber } from '../types/common';

/**
 * Unix timestamp를 ISO 날짜 문자열로 변환
 * @param timestamp Unix timestamp (초 단위)
 * @returns YYYY-MM-DD 형식의 문자열 또는 null
 */
export function timestampToDateString(timestamp: TimestampNumber | null | undefined): DateString | null {
  if (timestamp === null || timestamp === undefined) return null;
  
  try {
    const date = fromUnixTime(timestamp);
    if (!isValid(date)) return null;
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Timestamp 변환 오류:', error);
    return null;
  }
}

/**
 * ISO 날짜 문자열을 Unix timestamp로 변환
 * @param dateString YYYY-MM-DD 형식의 문자열
 * @returns Unix timestamp (초 단위) 또는 null
 */
export function dateStringToTimestamp(dateString: DateString | null | undefined): TimestampNumber | null {
  if (!dateString) return null;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return null;
    return getUnixTime(date);
  } catch (error) {
    console.error('날짜 문자열 변환 오류:', error);
    return null;
  }
}

/**
 * 현재 날짜를 ISO 문자열로 반환
 * @returns 오늘 날짜 (YYYY-MM-DD)
 */
export function getCurrentDateString(): DateString {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * 현재 날짜를 Unix timestamp로 반환
 * @returns 현재 Unix timestamp (초 단위)
 */
export function getCurrentTimestamp(): TimestampNumber {
  return getUnixTime(new Date());
}

/**
 * 날짜 유효성 검사
 * @param dateValue 검사할 날짜 값
 * @returns 유효한 날짜인지 여부
 */
export function isValidDate(dateValue: string | number | Date): boolean {
  try {
    let date: Date;
    
    if (typeof dateValue === 'string') {
      date = parseISO(dateValue);
    } else if (typeof dateValue === 'number') {
      date = fromUnixTime(dateValue);
    } else {
      date = dateValue;
    }
    
    return isValid(date);
  } catch {
    return false;
  }
}

/**
 * 날짜 형식 자동 감지 및 표준화
 * @param dateValue 다양한 형식의 날짜 값
 * @returns 표준화된 ISO 날짜 문자열
 */
export function normalizeDateToString(dateValue: string | number | Date | null | undefined): DateString | null {
  if (!dateValue) return null;
  
  try {
    if (typeof dateValue === 'string') {
      return timestampToDateString(dateStringToTimestamp(dateValue));
    } else if (typeof dateValue === 'number') {
      return timestampToDateString(dateValue);
    } else {
      return format(dateValue, 'yyyy-MM-dd');
    }
  } catch {
    return null;
  }
}

/**
 * 날짜 형식 자동 감지 및 timestamp로 변환
 * @param dateValue 다양한 형식의 날짜 값
 * @returns Unix timestamp (초 단위)
 */
export function normalizeDateToTimestamp(dateValue: string | number | Date | null | undefined): TimestampNumber | null {
  if (!dateValue) return null;
  
  try {
    if (typeof dateValue === 'string') {
      return dateStringToTimestamp(dateValue);
    } else if (typeof dateValue === 'number') {
      return dateValue;
    } else {
      return getUnixTime(dateValue);
    }
  } catch {
    return null;
  }
} 