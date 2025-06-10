import { MemberEditFormData, ConsultationMember, ConsultationMemberUpdateData } from '../types/consultation';

// 회원 정보 수정 유효성 검사
export function validateMemberEdit(formData: MemberEditFormData): string[] {
  const errors: string[] = [];

  // 필수 필드 검사
  if (!formData.name.trim()) {
    errors.push('이름은 필수 입력 항목입니다.');
  }

  if (!formData.phone.trim()) {
    errors.push('전화번호는 필수 입력 항목입니다.');
  }

  // 전화번호 형식 검사
  const phoneRegex = /^\d{3}-\d{4}-\d{4}$/;
  if (formData.phone && !phoneRegex.test(formData.phone)) {
    errors.push('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
  }

  // 이메일 형식 검사 (선택사항이지만 입력된 경우)
  if (formData.email && formData.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('이메일 형식이 올바르지 않습니다.');
    }
  }

  // 생년월일 형식 검사 (선택사항이지만 입력된 경우)
  if (formData.birth_date && formData.birth_date.trim()) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.birth_date)) {
      errors.push('생년월일 형식이 올바르지 않습니다. (예: 1990-01-01)');
    }
  }

  return errors;
}

// API 업데이트 데이터로 변환
export function convertToUpdateData(id: number, formData: MemberEditFormData): ConsultationMemberUpdateData {
  return {
    id,
    name: formData.name.trim(),
    phone: formData.phone.trim(),
    email: formData.email.trim() || undefined,
    gender: formData.gender || undefined,
    birth_date: formData.birth_date || undefined,
    consultation_status: formData.consultation_status || undefined,
    health_conditions: formData.health_conditions.trim() || undefined,
    fitness_goals: formData.fitness_goals,
    notes: formData.notes.trim() || undefined,
    staff_id: formData.staff_id
  };
}

// 폼 데이터로 변환
export function convertToFormData(member: ConsultationMember): MemberEditFormData {
  return {
    name: member.name || '',
    phone: member.phone || '',
    email: member.email || '',
    gender: member.gender || '',
    birth_date: member.birth_date ? formatUnixToDate(member.birth_date) : '',
    consultation_status: member.consultation_status || '',
    health_conditions: member.health_conditions || '',
    fitness_goals: Array.isArray(member.fitness_goals) ? member.fitness_goals : [],
    notes: member.notes || '',
    staff_id: member.staff_id
  };
}

// 전화번호 포맷팅
export function formatPhoneNumber(value: string): string {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '');
  
  // 11자리를 넘지 않도록 제한
  const limitedNumbers = numbers.slice(0, 11);
  
  // 형식에 맞게 포맷팅
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 7) {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
  }
}

// Unix timestamp를 YYYY-MM-DD 형식으로 변환
function formatUnixToDate(timestamp: number): string {
  if (!timestamp) return '';
  
  try {
    // timestamp가 초 단위인지 밀리초 단위인지 확인
    const date = timestamp > 9999999999 
      ? new Date(timestamp) 
      : new Date(timestamp * 1000);
    
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

// 중복 데이터 검사
export const checkDuplicateData = (
  formData: MemberEditFormData,
  originalData: any,
  allMembers: any[]
): string[] => {
  const errors: string[] = [];

  // 전화번호 중복 검사 (자신 제외)
  const phoneExists = allMembers.some(
    member => 
      member.id !== originalData.id && 
      member.phone === formData.phone.trim()
  );

  if (phoneExists) {
    errors.push('이미 등록된 전화번호입니다.');
  }

  // 이메일 중복 검사 (자신 제외, 이메일이 있는 경우만)
  if (formData.email && formData.email.trim()) {
    const emailExists = allMembers.some(
      member => 
        member.id !== originalData.id && 
        member.email === formData.email.trim()
    );

    if (emailExists) {
      errors.push('이미 등록된 이메일입니다.');
    }
  }

  return errors;
}; 