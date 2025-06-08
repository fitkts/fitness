import { Staff, StaffStatus } from '../../types/staff';

// 기본 권한 설정
export const defaultPermissions = {
  dashboard: true,
  members: false,
  attendance: false,
  payment: false,
  lockers: false,
  staff: false,
  excel: false,
  backup: false,
  settings: false,
};

// 기본 직원 객체
export const defaultStaff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  position: '일반 직원',
  phone: '',
  email: '',
  hireDate: new Date().toISOString().split('T')[0],
  birthDate: '', // 생년월일 기본값 추가
  status: StaffStatus.ACTIVE,
  permissions: defaultPermissions,
  notes: '',
};

// 전화번호 형식 변환 함수
export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  const limitedNumbers = numbers.slice(0, 11);

  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 7) {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
  }
};

// 관리자 권한 프리셋
export const adminPermissions = {
  dashboard: true,
  members: true,
  attendance: true,
  payment: true,
  lockers: true,
  staff: true,
  excel: true,
  backup: true,
  settings: true,
};

// 프론트 데스크 권한 프리셋
export const frontDeskPermissions = {
  dashboard: true,
  members: true,
  attendance: true,
  payment: true,
  lockers: true,
  staff: false,
  excel: false,
  backup: false,
  settings: false,
};

// 트레이너 권한 프리셋
export const trainerPermissions = {
  dashboard: true,
  members: true,
  attendance: true,
  payment: false,
  lockers: false,
  staff: false,
  excel: false,
  backup: false,
  settings: false,
};

// 아르바이트 권한 프리셋
export const partTimePermissions = {
  dashboard: true,
  members: false,
  attendance: true,
  payment: false,
  lockers: false,
  staff: false,
  excel: false,
  backup: false,
  settings: false,
};

// Staff 유효성 검사
export const validateStaffForm = (formData: Staff): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.name.trim()) {
    errors.name = '이름은 필수입니다';
  }

  if (!formData.position.trim()) {
    errors.position = '직책은 필수입니다';
  }

  if (formData.email && !formData.email.includes('@')) {
    errors.email = '유효한 이메일을 입력하세요';
  }

  if (formData.phone && !/^[\d-]{9,13}$/.test(formData.phone)) {
    errors.phone = '유효한 전화번호를 입력하세요';
  }

  // 입사일 유효성 검사 추가
  if (!formData.hireDate) {
    errors.hireDate = '입사일은 필수입니다';
  }

  return errors;
};
