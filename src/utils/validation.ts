import { z } from 'zod';
import { addDays, isAfter, isBefore, parseISO } from 'date-fns';
// types.ts에서 lockerSchema (mainLockerSchema로 별칭)를 import
import { lockerSchema as mainLockerSchema } from '../models/types';
// electronLog는 여기서 직접 사용하지 않으므로 import 제거 또는 필요시 추가

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

export const validateName = (name: string): boolean => {
  // 이름은 2글자 이상이어야 하며, 숫자나 특수문자를 포함하지 않아야 함
  const nameRegex = /^[가-힣a-zA-Z\s]{2,}$/;
  return nameRegex.test(name);
};

export const validateMembershipType = (type: string): boolean => {
  const validTypes = ['1개월', '3개월', '6개월', '12개월'];
  return validTypes.includes(type);
};

// 날짜 유효성 검사
export const validateDates = (
  startDate: string | null | undefined,
  endDate: string | null | undefined
): { isValid: boolean; error?: string } => {
  if (!startDate || !endDate) {
    return { isValid: false, error: '시작일과 종료일은 필수입니다' };
  }

  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const today = new Date();

  // 종료일이 시작일보다 이후인지 확인
  if (!isAfter(end, start)) {
    return { isValid: false, error: '종료일은 시작일보다 이후여야 합니다' };
  }

  // 최대 사용 기간 체크 (1년)
  const maxEndDate = addDays(start, 365);
  if (isAfter(end, maxEndDate)) {
    return { isValid: false, error: '최대 사용 기간은 1년입니다' };
  }

  return { isValid: true };
};

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getFullYear() === today.getFullYear() &&
         date.getMonth() === today.getMonth() &&
         date.getDate() === today.getDate();
}

// 락커 상태 검증
export const validateLockerStatus = (
  status: string,
  memberId?: number,
  startDate?: string,
  endDate?: string
): { isValid: boolean; error?: string } => {
  if (status === 'occupied') {
    if (!memberId) {
      return { isValid: false, error: '사용 중인 락커는 회원을 선택해야 합니다' };
    }
    if (!startDate || !endDate) {
      return { isValid: false, error: '사용 중인 락커는 시작일과 종료일이 필요합니다' };
    }
  }

  return { isValid: true };
};

// 락커 데이터 검증
export const validateLocker = (data: unknown): { isValid: boolean; errors?: Record<string, string> } => {
  try {
    mainLockerSchema.parse(data);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path && err.path.length > 0) {
          errors[err.path.join('.')] = err.message;
        } else {
          errors['_form'] = errors['_form'] ? `${errors['_form']}, ${err.message}` : err.message;
        }
      });
      return { isValid: false, errors };
    }
    // electronLog를 사용하려면 import 필요
    // electronLog.error('validateLocker - Unexpected error:', error);
    console.error('validateLocker - Unexpected error:', error); // 콘솔 에러로 변경
    return { isValid: false, errors: { _form: '데이터 검증 중 예기치 않은 오류가 발생했습니다.' } };
  }
};
