// 상담일지 시스템 유틸리티 함수들

import { 
  ConsultationMember, 
  ConsultationTableFilters,
  ConsultationTableSort,
  NewMemberFormData,
  ConsultationRecord,
  WorkoutSchedule,
  PersonalTrainingSession
} from '../types/consultation';

/**
 * 회원 목록을 필터링하는 함수
 */
export const filterMembers = (
  members: ConsultationMember[],
  filters: ConsultationTableFilters
): ConsultationMember[] => {
  return members.filter(member => {
    // 상담 상태 필터
    if (filters.status && member.consultation_status !== filters.status) {
      return false;
    }
    
    // 회원권 타입 필터
    if (filters.membership_type && member.membership_type !== filters.membership_type) {
      return false;
    }
    
    // 담당 직원 필터
    if (filters.staff_id && member.staff_id !== filters.staff_id) {
      return false;
    }
    
    // 검색 쿼리 필터 (이름, 전화번호에서 검색)
    if (filters.search_query) {
      const searchLower = filters.search_query.toLowerCase();
      const nameMatch = member.name.toLowerCase().includes(searchLower);
      const phoneMatch = member.phone.includes(searchLower);
      
      if (!nameMatch && !phoneMatch) {
        return false;
      }
    }
    
    // 날짜 범위 필터
    if (filters.date_from || filters.date_to) {
      const joinDate = new Date(member.join_date * 1000);
      const joinDateStr = joinDate.toISOString().split('T')[0];
      
      if (filters.date_from && joinDateStr < filters.date_from) {
        return false;
      }
      
      if (filters.date_to && joinDateStr > filters.date_to) {
        return false;
      }
    }
    
    return true;
  });
};

/**
 * 회원 목록을 정렬하는 함수
 */
export const sortMembers = (
  members: ConsultationMember[],
  sort: ConsultationTableSort
): ConsultationMember[] => {
  const sortedMembers = [...members];
  
  sortedMembers.sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sort.field) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'birth_date':
        aValue = a.birth_date || 0;
        bValue = b.birth_date || 0;
        break;
      case 'first_visit':
        aValue = a.first_visit || 0;
        bValue = b.first_visit || 0;
        break;
      case 'last_visit':
        aValue = a.last_visit || 0;
        bValue = b.last_visit || 0;
        break;
      case 'consultation_status':
        aValue = a.consultation_status || '';
        bValue = b.consultation_status || '';
        break;
      default:
        return 0;
    }
    
    // 문자열 비교
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sort.direction === 'asc' ? comparison : -comparison;
    }
    
    // 숫자 비교
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return sort.direction === 'asc' ? comparison : -comparison;
    }
    
    return 0;
  });
  
  return sortedMembers;
};

/**
 * 신규 회원 폼 데이터를 ConsultationMember 형식으로 변환
 */
export const transformNewMemberData = (formData: NewMemberFormData): any => {
  const now = Math.floor(Date.now() / 1000);
  
  // Member API에 맞는 형식으로 변환
  return {
    name: formData.name.trim(),
    phone: formData.phone.replace(/[^\d-]/g, ''), // 숫자와 하이픈만 유지
    email: formData.email?.trim() || undefined,
    gender: formData.gender,
    birthDate: formData.birth_date || undefined, // YYYY-MM-DD 형식 유지
    joinDate: new Date().toISOString().split('T')[0], // 오늘 날짜
    membershipType: formData.membership_type,
    staffId: formData.staff_id,
    staffName: formData.staff_name,
    notes: formData.notes?.trim() || undefined,
    // 추가 정보들은 별도로 처리할 수 있도록 메타데이터로 전달
    metadata: {
      first_visit: formData.first_visit,
      consultation_status: formData.consultation_status || 'pending',
      health_conditions: formData.health_conditions?.trim() || undefined,
      fitness_goals: formData.fitness_goals || []
    }
  };
};

/**
 * 회원의 다음 상담 일정을 계산하는 함수
 */
export const calculateNextConsultation = (
  consultationRecords: ConsultationRecord[]
): Date | null => {
  if (consultationRecords.length === 0) return null;
  
  // 가장 최근 상담 기록 찾기
  const latestRecord = consultationRecords
    .sort((a, b) => b.consultation_date - a.consultation_date)[0];
  
  if (latestRecord.next_appointment) {
    return new Date(latestRecord.next_appointment * 1000);
  }
  
  return null;
};

/**
 * 회원의 운동 일정 충돌을 확인하는 함수
 */
export const checkScheduleConflict = (
  existingSchedules: WorkoutSchedule[],
  newSchedule: Partial<WorkoutSchedule>
): boolean => {
  if (!newSchedule.days_of_week || !newSchedule.start_time) {
    return false;
  }
  
  const newStartTime = parseTimeString(newSchedule.start_time);
  const newEndTime = newStartTime + (newSchedule.duration_minutes || 0) * 60000; // ms로 변환
  
  return existingSchedules.some(schedule => {
    if (!schedule.is_active) return false;
    
    // 같은 요일이 있는지 확인
    const hasCommonDay = schedule.days_of_week.some(day => 
      newSchedule.days_of_week!.includes(day)
    );
    
    if (!hasCommonDay) return false;
    
    // 시간 충돌 확인
    const existingStartTime = parseTimeString(schedule.start_time);
    const existingEndTime = existingStartTime + schedule.duration_minutes * 60000;
    
    return (newStartTime < existingEndTime && newEndTime > existingStartTime);
  });
};

/**
 * 시간 문자열을 milliseconds로 변환하는 함수
 */
const parseTimeString = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60 + minutes) * 60000; // milliseconds
};

/**
 * 회원의 PT 세션 통계를 계산하는 함수
 */
export const calculatePTStats = (sessions: PersonalTrainingSession[]) => {
  const total = sessions.length;
  const completed = sessions.filter(s => s.status === 'completed').length;
  const scheduled = sessions.filter(s => s.status === 'scheduled').length;
  const cancelled = sessions.filter(s => s.status === 'cancelled').length;
  const noShow = sessions.filter(s => s.status === 'no_show').length;
  
  return {
    total,
    completed,
    scheduled,
    cancelled,
    noShow,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

/**
 * 회원의 상담 진행률을 계산하는 함수
 */
export const calculateConsultationProgress = (
  member: ConsultationMember,
  consultationRecords: ConsultationRecord[]
): number => {
  const totalRecords = consultationRecords.length;
  const completedRecords = consultationRecords.filter(
    record => record.status === 'completed'
  ).length;
  
  if (totalRecords === 0) return 0;
  
  // 기본 진행률: 완료된 상담 비율
  let progress = (completedRecords / totalRecords) * 100;
  
  // 추가 점수 계산
  if (member.fitness_goals && member.fitness_goals.length > 0) {
    progress += 10; // 목표 설정 완료
  }
  
  if (member.health_conditions) {
    progress += 5; // 건강 상태 기록 완료
  }
  
  // 최대 100%로 제한
  return Math.min(Math.round(progress), 100);
};

/**
 * 운동 강도 레벨에 따른 색상 반환
 */
export const getIntensityColor = (level: number): string => {
  const colors = {
    1: '#10b981', // green
    2: '#84cc16', // lime
    3: '#f59e0b', // yellow
    4: '#f97316', // orange
    5: '#ef4444'  // red
  };
  
  return colors[level as keyof typeof colors] || '#6b7280';
};

/**
 * 상담 상태에 따른 우선순위 반환 (정렬용)
 */
export const getStatusPriority = (status?: string): number => {
  const priorities = {
    'follow_up': 1,      // 추가 상담 필요 (가장 높은 우선순위)
    'in_progress': 2,    // 진행 중
    'pending': 3,        // 대기 중
    'completed': 4       // 완료 (가장 낮은 우선순위)
  };
  
  return priorities[status as keyof typeof priorities] || 5;
};

/**
 * 회원 데이터의 유효성을 검증하는 함수
 */
export const validateMemberData = (data: NewMemberFormData): string[] => {
  const errors: string[] = [];
  
  // 필수 필드 검증
  if (!data.name.trim()) {
    errors.push('회원명은 필수 입력 항목입니다.');
  }
  
  if (!data.phone.trim()) {
    errors.push('연락처는 필수 입력 항목입니다.');
  }
  
  // 전화번호 형식 검증
  const phoneRegex = /^[0-9-]+$/;
  if (data.phone && !phoneRegex.test(data.phone)) {
    errors.push('전화번호는 숫자와 하이픈만 포함할 수 있습니다.');
  }
  
  // 이메일 형식 검증
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('올바른 이메일 형식이 아닙니다.');
    }
  }
  
  // 생년월일 검증
  if (data.birth_date) {
    const birthDate = new Date(data.birth_date);
    const today = new Date();
    
    if (birthDate > today) {
      errors.push('생년월일은 오늘보다 이전 날짜여야 합니다.');
    }
    
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age > 120) {
      errors.push('올바른 생년월일을 입력해주세요.');
    }
  }

  // 최초 방문일 검증
  if (data.first_visit) {
    const firstVisitDate = new Date(data.first_visit);
    const today = new Date();
    
    if (firstVisitDate > today) {
      errors.push('최초 방문일은 오늘보다 이전 날짜여야 합니다.');
    }
  }
  
  return errors;
};

/**
 * 검색 키워드 하이라이트를 위한 함수
 */
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * 회원 목록을 페이지네이션하는 함수
 */
export const paginateMembers = (
  members: ConsultationMember[],
  page: number,
  pageSize: number
) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: members.slice(startIndex, endIndex),
    total: members.length,
    currentPage: page,
    pageSize,
    totalPages: Math.ceil(members.length / pageSize)
  };
}; 