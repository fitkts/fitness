import { BulkAddFormData, RangeLockerData, MultipleLockerData, LockerNumberValidation } from '../types/lockerBulkAdd';
import { Locker } from '../models/types';
import { BULK_ADD_LIMITS } from '../config/lockerBulkConfig';

/**
 * 범위 데이터에서 락커 번호 배열 생성
 */
export const generateRangeNumbers = (rangeData: RangeLockerData): string[] => {
  const numbers: string[] = [];
  const { startNumber, endNumber } = rangeData;
  
  if (startNumber > endNumber) {
    return [];
  }
  
  const count = endNumber - startNumber + 1;
  if (count > BULK_ADD_LIMITS.MAX_RANGE_SIZE) {
    return [];
  }
  
  for (let i = startNumber; i <= endNumber; i++) {
    numbers.push(i.toString());
  }
  
  return numbers;
};

/**
 * 다중 입력 텍스트에서 락커 번호 배열 추출
 */
export const parseMultipleNumbers = (text: string): string[] => {
  if (!text.trim()) return [];
  
  // 쉼표, 공백, 줄바꿈으로 분리
  const numbers = text
    .split(/[,\s\n]+/)
    .map(num => num.trim())
    .filter(num => num.length > 0)
    .filter((num, index, arr) => arr.indexOf(num) === index); // 중복 제거
  
  return numbers.slice(0, BULK_ADD_LIMITS.MAX_MULTIPLE_COUNT);
};

/**
 * 락커 번호 유효성 검증
 */
export const validateLockerNumbers = async (
  numbers: string[], 
  existingLockers: Locker[]
): Promise<LockerNumberValidation> => {
  const errors: string[] = [];
  const duplicates: string[] = [];
  const invalidNumbers: string[] = [];
  
  // 기존 락커 번호 목록
  const existingNumbers = new Set(existingLockers.map(locker => locker.number));
  
  numbers.forEach(number => {
    // 빈 값 검증
    if (!number.trim()) {
      invalidNumbers.push(number);
      return;
    }
    
    // 숫자 형식 검증
    const numValue = parseInt(number, 10);
    if (isNaN(numValue) || numValue < BULK_ADD_LIMITS.MIN_LOCKER_NUMBER || numValue > BULK_ADD_LIMITS.MAX_LOCKER_NUMBER) {
      invalidNumbers.push(number);
      return;
    }
    
    // 중복 검증
    if (existingNumbers.has(number)) {
      duplicates.push(number);
    }
  });
  
  // 오류 메시지 생성
  if (invalidNumbers.length > 0) {
    errors.push(`잘못된 락커 번호: ${invalidNumbers.join(', ')}`);
  }
  
  if (duplicates.length > 0) {
    errors.push(`이미 존재하는 락커 번호: ${duplicates.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    duplicates,
    invalidNumbers
  };
};

/**
 * 벌크 추가 데이터에서 락커 객체 배열 생성
 */
export const generateLockersFromBulkData = (formData: BulkAddFormData): Locker[] => {
  const lockers: Locker[] = [];
  
  switch (formData.mode) {
    case 'single':
      lockers.push({
        number: formData.single.number,
        status: 'available',
        size: formData.single.size,
        location: formData.single.location,
        notes: formData.single.notes,
        feeOptions: [{ durationDays: 30, price: 0 }]
      });
      break;
      
    case 'range':
      const rangeNumbers = generateRangeNumbers(formData.range);
      rangeNumbers.forEach(number => {
        lockers.push({
          number,
          status: 'available',
          size: formData.range.size,
          location: formData.range.location,
          notes: formData.range.notes,
          feeOptions: [{ durationDays: 30, price: 0 }]
        });
      });
      break;
      
    case 'multiple':
      formData.multiple.numbers.forEach(number => {
        lockers.push({
          number,
          status: 'available',
          size: formData.multiple.size,
          location: formData.multiple.location,
          notes: formData.multiple.notes,
          feeOptions: [{ durationDays: 30, price: 0 }]
        });
      });
      break;
  }
  
  return lockers;
};

/**
 * 드래그 앤 드롭 이벤트에서 텍스트 추출
 */
export const extractTextFromDrop = (event: DragEvent): string => {
  const items = event.dataTransfer?.items;
  if (!items) return '';
  
  for (let i = 0; i < items.length; i++) {
    if (items[i].type === 'text/plain') {
      return event.dataTransfer?.getData('text/plain') || '';
    }
  }
  
  return '';
};

/**
 * 락커 번호 포맷팅 (앞에 0을 붙여서 통일된 형식으로)
 */
export const formatLockerNumber = (number: string, padLength = 3): string => {
  const numValue = parseInt(number, 10);
  if (isNaN(numValue)) return number;
  
  return numValue.toString().padStart(padLength, '0');
};

/**
 * 예상 생성될 락커 개수 계산
 */
export const calculateEstimatedCount = (formData: BulkAddFormData): number => {
  switch (formData.mode) {
    case 'single':
      return formData.single.number ? 1 : 0;
      
    case 'range':
      const count = formData.range.endNumber - formData.range.startNumber + 1;
      return Math.max(0, Math.min(count, BULK_ADD_LIMITS.MAX_RANGE_SIZE));
      
    case 'multiple':
      return formData.multiple.numbers.length;
      
    default:
      return 0;
  }
}; 