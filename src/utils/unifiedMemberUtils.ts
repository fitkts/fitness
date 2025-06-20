// 통합 회원 관리 유틸리티 함수들
// 상태 확인, 데이터 포맷팅, 필터링 등의 헬퍼 함수

import { 
  UnifiedMember, 
  Member, 
  ConsultationMember, 
  MemberStatusInfo,
  UnifiedMemberStats 
} from '../types/unifiedMember';
import { MemberConversionService } from '../services/memberConversionService';
import { STATUS_COLORS, STATUS_ICONS } from '../config/unifiedMemberConfig';

/**
 * 회원의 현재 상태를 사람이 읽기 쉬운 형태로 반환
 */
export function getMemberStatusDisplay(member: UnifiedMember): {
  text: string;
  color: string;
  icon: string;
  badge: 'success' | 'warning' | 'error' | 'info';
} {
  const statusInfo = MemberConversionService.getMemberStatusInfo(member);
  
  if (member.memberType === 'consultation') {
    const consultationMember = member as ConsultationMember;
    const status = consultationMember.consultationStatus || 'pending';
    
    return {
      text: getConsultationStatusText(status),
      color: STATUS_COLORS.consultation,
      icon: STATUS_ICONS.consultation,
      badge: 'info'
    };
  }

  // 정식 회원의 경우
  if (statusInfo.status === 'expired') {
    return {
      text: '만료됨',
      color: STATUS_COLORS.expired,
      icon: STATUS_ICONS.expired,
      badge: 'error'
    };
  }

  if (statusInfo.isExpiringSoon) {
    return {
      text: `${statusInfo.daysUntilExpiry}일 후 만료`,
      color: STATUS_COLORS.expiringSoon,
      icon: STATUS_ICONS.expiringSoon,
      badge: 'warning'
    };
  }

  return {
    text: '활성',
    color: STATUS_COLORS.active,
    icon: STATUS_ICONS.active,
    badge: 'success'
  };
}

/**
 * 상담 상태를 사람이 읽기 쉬운 텍스트로 변환
 */
export function getConsultationStatusText(status: string): string {
  const statusMap = {
    pending: '대기중',
    in_progress: '진행중',
    completed: '완료',
    follow_up: '후속 상담'
  };
  
  return statusMap[status as keyof typeof statusMap] || status;
}

/**
 * 회원 타입을 사람이 읽기 쉬운 텍스트로 변환
 */
export function getMemberTypeDisplay(member: UnifiedMember): {
  text: string;
  icon: string;
  color: string;
} {
  if (member.memberType === 'regular') {
    return {
      text: '정식 회원',
      icon: STATUS_ICONS.regular,
      color: STATUS_COLORS.active
    };
  }
  
  return {
    text: '상담 회원',
    icon: STATUS_ICONS.consultation,
    color: STATUS_COLORS.consultation
  };
}

/**
 * 승격 가능 여부 확인
 */
export function canPromoteMember(member: UnifiedMember): boolean {
  if (member.memberType !== 'consultation') return false;
  
  const consultationMember = member as ConsultationMember;
  return consultationMember.consultationStatus === 'completed' && !consultationMember.isPromoted;
}

/**
 * 강등 가능 여부 확인
 */
export function canDemoteMember(member: UnifiedMember): boolean {
  if (member.memberType !== 'regular') return false;
  
  const statusInfo = MemberConversionService.getMemberStatusInfo(member);
  return statusInfo.status === 'expired';
}

/**
 * 회원 검색 (이름, 전화번호, 이메일)
 */
export function searchMembers(members: UnifiedMember[], searchTerm: string): UnifiedMember[] {
  if (!searchTerm.trim()) return members;
  
  const lowercaseSearch = searchTerm.toLowerCase();
  
  return members.filter(member => 
    member.name.toLowerCase().includes(lowercaseSearch) ||
    member.phone?.toLowerCase().includes(lowercaseSearch) ||
    member.email?.toLowerCase().includes(lowercaseSearch)
  );
}

/**
 * 회원 정렬
 */
export function sortMembers(
  members: UnifiedMember[], 
  sortKey: keyof UnifiedMember, 
  direction: 'ascending' | 'descending'
): UnifiedMember[] {
  return [...members].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    let comparison = 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return direction === 'ascending' ? comparison : -comparison;
  });
}

/**
 * 회원 필터링 (상태별)
 */
export function filterMembersByStatus(
  members: UnifiedMember[], 
  status: 'all' | 'active' | 'expired' | 'pending' | 'consultation'
): UnifiedMember[] {
  if (status === 'all') return members;
  
  return members.filter(member => {
    const statusInfo = MemberConversionService.getMemberStatusInfo(member);
    return statusInfo.status === status;
  });
}

/**
 * 날짜 포맷팅 (한국어)
 */
export function formatDateKorean(dateString?: string): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

/**
 * 상대적 날짜 표시 (예: "3일 전", "오늘", "2일 후")
 */
export function getRelativeDateText(dateString?: string): string {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return '오늘';
    if (diffInDays === 1) return '내일';
    if (diffInDays === -1) return '어제';
    if (diffInDays > 0) return `${diffInDays}일 후`;
    if (diffInDays < 0) return `${Math.abs(diffInDays)}일 전`;
    
    return formatDateKorean(dateString);
  } catch (error) {
    return dateString;
  }
}

/**
 * 통계 요약 텍스트 생성
 */
export function generateStatsummary(stats: UnifiedMemberStats): string {
  const { total, regular, consultation } = stats;
  
  return `전체 ${total}명 (정식 ${regular.total}명, 상담 ${consultation.total}명)`;
}

/**
 * 만료 임박 회원 필터링
 */
export function getExpiringMembers(members: UnifiedMember[], daysThreshold: number = 7): Member[] {
  const now = new Date();
  const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
  
  return members.filter((member): member is Member => {
    if (member.memberType !== 'regular') return false;
    
    const regularMember = member as Member;
    if (!regularMember.membershipEnd) return false;
    
    const endDate = new Date(regularMember.membershipEnd);
    return endDate > now && endDate <= thresholdDate;
  });
}

/**
 * 승격 대상 회원 필터링
 */
export function getPromotionCandidates(members: UnifiedMember[]): ConsultationMember[] {
  return members.filter((member): member is ConsultationMember => {
    if (member.memberType !== 'consultation') return false;
    
    const consultationMember = member as ConsultationMember;
    return consultationMember.consultationStatus === 'completed' && !consultationMember.isPromoted;
  });
}

/**
 * 회원 데이터 유효성 검증
 */
export function validateMemberData(memberData: Partial<UnifiedMember>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  
  // 이름 검증
  if (!memberData.name || memberData.name.trim().length < 2) {
    errors.name = '이름은 2글자 이상 입력해주세요.';
  }
  
  // 전화번호 검증
  if (!memberData.phone) {
    errors.phone = '전화번호를 입력해주세요.';
  } else if (!/^010-\d{4}-\d{4}$/.test(memberData.phone)) {
    errors.phone = '올바른 전화번호 형식을 입력해주세요. (010-0000-0000)';
  }
  
  // 이메일 검증 (선택사항)
  if (memberData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberData.email)) {
    errors.email = '올바른 이메일 주소를 입력해주세요.';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * 통계 데이터 백분율 계산
 */
export function calculatePercentages(stats: UnifiedMemberStats) {
  const { total, regular, consultation } = stats;
  
  if (total === 0) {
    return {
      regularPercentage: 0,
      consultationPercentage: 0,
      activePercentage: 0,
      expiredPercentage: 0
    };
  }
  
  return {
    regularPercentage: Math.round((regular.total / total) * 100),
    consultationPercentage: Math.round((consultation.total / total) * 100),
    activePercentage: Math.round((regular.active / regular.total) * 100) || 0,
    expiredPercentage: Math.round((regular.expired / regular.total) * 100) || 0
  };
}

/**
 * 회원 활동 점수 계산 (최근 방문 빈도 기반)
 */
export function calculateActivityScore(member: UnifiedMember): number {
  if (!member.lastVisit) return 0;
  
  const now = new Date();
  const lastVisit = new Date(member.lastVisit);
  const daysSinceVisit = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceVisit <= 3) return 100;
  if (daysSinceVisit <= 7) return 80;
  if (daysSinceVisit <= 14) return 60;
  if (daysSinceVisit <= 30) return 40;
  if (daysSinceVisit <= 60) return 20;
  
  return 0;
}

/**
 * 추천 액션 생성
 */
export function getRecommendedActions(member: UnifiedMember): Array<{
  type: 'promotion' | 'renewal' | 'contact' | 'followup';
  priority: 'high' | 'medium' | 'low';
  message: string;
}> {
  const actions = [];
  const statusInfo = MemberConversionService.getMemberStatusInfo(member);
  const activityScore = calculateActivityScore(member);
  
  // 승격 추천
  if (canPromoteMember(member)) {
    actions.push({
      type: 'promotion' as const,
      priority: 'high' as const,
      message: '상담이 완료되어 정식회원으로 승격 가능합니다.'
    });
  }
  
  // 갱신 추천
  if (statusInfo.isExpiringSoon) {
    actions.push({
      type: 'renewal' as const,
      priority: 'high' as const,
      message: `회원권이 ${statusInfo.daysUntilExpiry}일 후 만료됩니다. 갱신을 권유하세요.`
    });
  }
  
  // 연락 추천
  if (activityScore < 40) {
    actions.push({
      type: 'contact' as const,
      priority: 'medium' as const,
      message: '최근 방문이 없습니다. 안부 연락을 해보세요.'
    });
  }
  
  // 후속 상담 추천
  if (member.memberType === 'consultation') {
    const consultationMember = member as ConsultationMember;
    if (consultationMember.consultationStatus === 'in_progress') {
      actions.push({
        type: 'followup' as const,
        priority: 'medium' as const,
        message: '상담이 진행 중입니다. 후속 상담을 예약하세요.'
      });
    }
  }
  
  return actions;
} 