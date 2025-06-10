// 상담일지 시스템 포맷팅 유틸리티 함수들

/**
 * Unix timestamp를 날짜 문자열로 변환
 */
export const formatDate = (timestamp?: number): string => {
  if (!timestamp) return '-';
  
  try {
    // timestamp가 초 단위인지 밀리초 단위인지 확인
    const date = timestamp > 9999999999 
      ? new Date(timestamp) 
      : new Date(timestamp * 1000);
    
    if (isNaN(date.getTime())) return '-';
    
    return date.toISOString().split('T')[0];
  } catch {
    return '-';
  }
};

/**
 * 상대적 시간 표시 (예: "3일 전", "1주일 전")
 */
export const formatRelativeTime = (timestamp?: number): string => {
  if (!timestamp) return '-';
  
  try {
    const date = timestamp > 9999999999 
      ? new Date(timestamp) 
      : new Date(timestamp * 1000);
    
    if (isNaN(date.getTime())) return '-';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}주일 전`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}개월 전`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years}년 전`;
    }
  } catch {
    return '-';
  }
};

/**
 * 전화번호 포맷팅 (표시용)
 */
export const formatPhoneNumber = (phone?: string): string => {
  if (!phone) return '-';
  
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  }
  return phone;
};

/**
 * 나이 계산
 */
export const calculateAge = (birthTimestamp?: number): string => {
  if (!birthTimestamp) return '-';
  
  try {
    const birthDate = birthTimestamp > 9999999999 
      ? new Date(birthTimestamp) 
      : new Date(birthTimestamp * 1000);
    
    if (isNaN(birthDate.getTime())) return '-';
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age}세`;
  } catch {
    return '-';
  }
};

/**
 * 운동 시간 포맷팅 (분 -> 시간:분)
 */
export const formatDuration = (minutes?: number): string => {
  if (typeof minutes !== 'number' || minutes <= 0) return '-';
  
  if (minutes < 60) {
    return `${minutes}분`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }
  
  return `${hours}시간 ${remainingMinutes}분`;
};

/**
 * 요일 배열을 문자열로 포맷팅
 */
export const formatDaysOfWeek = (days?: number[]): string => {
  if (!days || days.length === 0) return '-';
  
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return days.map(day => dayNames[day]).join(', ');
};

/**
 * 운동 강도 레벨을 텍스트로 포맷팅
 */
export const formatIntensityLevel = (level: number): string => {
  const levels = {
    1: '매우 쉬움',
    2: '쉬움', 
    3: '보통',
    4: '어려움',
    5: '매우 어려움'
  };
  
  return levels[level as keyof typeof levels] || '-';
};

/**
 * 상담 상태를 한글로 포맷팅
 */
export const formatConsultationStatus = (status?: string): string => {
  const statusMap: Record<string, string> = {
    'pending': '대기 중',
    'in_progress': '진행 중',
    'completed': '완료',
    'follow_up': '추가 상담 필요'
  };
  
  return statusMap[status || ''] || status || '-';
};

/**
 * PT 세션 상태를 한글로 포맷팅
 */
export const formatPTStatus = (status: string): string => {
  const statusMap = {
    'scheduled': '예약됨',
    'completed': '완료',
    'cancelled': '취소됨',
    'no_show': '노쇼'
  };
  
  return statusMap[status as keyof typeof statusMap] || status;
};

/**
 * 운동 타입을 한글로 포맷팅
 */
export const formatWorkoutType = (type: string): string => {
  const typeMap = {
    'cardio': '유산소',
    'strength': '근력 운동',
    'flexibility': '유연성',
    'mixed': '복합 운동'
  };
  
  return typeMap[type as keyof typeof typeMap] || type;
};

/**
 * 목표 배열을 문자열로 포맷팅
 */
export const formatGoals = (goals?: string[]): string => {
  if (!goals || goals.length === 0) return '-';
  
  if (goals.length <= 2) {
    return goals.join(', ');
  }
  
  return `${goals.slice(0, 2).join(', ')} 외 ${goals.length - 2}개`;
};

/**
 * 체중을 포맷팅
 */
export const formatWeight = (weight?: number): string => {
  if (!weight) return '-';
  return `${weight}kg`;
};

/**
 * 칼로리를 포맷팅
 */
export const formatCalories = (calories?: number): string => {
  if (!calories) return '-';
  return `${calories.toLocaleString()}kcal`;
};

/**
 * 영양소를 포맷팅 (단백질, 탄수화물, 지방)
 */
export const formatNutrient = (amount?: number, unit: 'g' | 'mg' = 'g'): string => {
  if (!amount) return '-';
  return `${amount}${unit}`;
};

/**
 * 퍼센트를 포맷팅
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * 회원권 만료일까지 남은 일수 계산
 */
export const formatMembershipRemaining = (endTimestamp?: number): string => {
  if (!endTimestamp) return '-';
  
  const endDate = new Date(endTimestamp * 1000);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `${Math.abs(diffDays)}일 지남`;
  } else if (diffDays === 0) {
    return '오늘 만료';
  } else if (diffDays <= 7) {
    return `${diffDays}일 남음`;
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    if (remainingDays === 0) {
      return `${weeks}주 남음`;
    }
    return `${weeks}주 ${remainingDays}일 남음`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `약 ${months}개월 남음`;
  }
};

/**
 * 파일 크기를 포맷팅
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 시간대를 12시간 형식으로 포맷팅
 */
export const formatTimeSlot = (time: string): string => {
  if (!time) return '-';
  
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * 진행률을 시각적으로 포맷팅
 */
export const formatProgress = (current: number, total: number): { percentage: number; text: string } => {
  if (total === 0) return { percentage: 0, text: '0/0' };
  
  const percentage = Math.round((current / total) * 100);
  return {
    percentage,
    text: `${current}/${total} (${percentage}%)`
  };
};

/**
 * 마지막 방문일 포맷팅 (특별한 스타일링)
 */
export const formatLastVisit = (timestamp?: number): { text: string; status: 'recent' | 'warning' | 'danger' } => {
  if (!timestamp) {
    return { text: '방문 기록 없음', status: 'danger' };
  }
  
  const now = Date.now();
  const diffDays = Math.floor((now - timestamp * 1000) / (1000 * 60 * 60 * 24));
  
  const text = formatRelativeTime(timestamp);
  
  if (diffDays <= 7) {
    return { text, status: 'recent' };
  } else if (diffDays <= 30) {
    return { text, status: 'warning' };
  } else {
    return { text, status: 'danger' };
  }
};

// 상담 관련 포맷팅 유틸리티 함수들

// 운동 목표 배열을 문자열로 변환
export const formatFitnessGoals = (goals?: string[] | string): string => {
  if (!goals) return '-';
  
  if (Array.isArray(goals)) {
    return goals.length > 0 ? goals.join(', ') : '-';
  }
  
  if (typeof goals === 'string') {
    try {
      const parsed = JSON.parse(goals);
      return Array.isArray(parsed) ? parsed.join(', ') : goals;
    } catch {
      return goals;
    }
  }
  
  return '-';
};

// 성별을 아이콘과 함께 표시
export const formatGender = (gender?: string): string => {
  if (gender === '남') return '👨 남성';
  if (gender === '여') return '👩 여성';
  return '-';
};

// 회원권 기간 포맷팅
export const formatMembershipPeriod = (startTimestamp?: number, endTimestamp?: number): string => {
  if (!startTimestamp || !endTimestamp) return '-';
  
  const startDate = formatDate(startTimestamp);
  const endDate = formatDate(endTimestamp);
  
  if (startDate === '-' || endDate === '-') return '-';
  
  return `${startDate} ~ ${endDate}`;
};

// 금액 포맷팅 (천 단위 콤마)
export const formatCurrency = (amount?: number): string => {
  if (typeof amount !== 'number') return '-';
  return `${amount.toLocaleString()}원`;
};

// 시간 포맷팅 (HH:MM)
export const formatTime = (timestamp?: number): string => {
  if (!timestamp || timestamp === 0) return '-';
  
  try {
    const date = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } catch {
    return '-';
  }
};

// 날짜와 시간 함께 포맷팅
export const formatDateTime = (timestamp?: number): string => {
  if (!timestamp || timestamp === 0) return '-';
  
  try {
    const date = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return '-';
  }
};

// 운동 강도를 이모지와 함께 표시
export const formatIntensity = (level?: number): string => {
  const intensityMap: Record<number, string> = {
    1: '😌 매우 쉬움',
    2: '🙂 쉬움',
    3: '😐 보통',
    4: '😅 어려움',
    5: '😰 매우 어려움'
  };
  
  return intensityMap[level || 0] || '-';
};

// 텍스트 길이 제한 (말줄임표 추가)
export const truncateText = (text?: string, maxLength: number = 50): string => {
  if (!text) return '-';
  
  if (text.length <= maxLength) return text;
  
  return `${text.slice(0, maxLength)}...`;
};

// 빈 값 체크 후 기본값 반환
export const formatWithDefault = (value?: string | number, defaultValue: string = '-'): string => {
  if (value === null || value === undefined || value === '') return defaultValue;
  return String(value);
};

// 회원 가입 경과 일수
export const formatDaysSinceJoin = (joinTimestamp?: number): string => {
  if (!joinTimestamp) return '-';
  
  try {
    const joinDate = joinTimestamp > 9999999999 
      ? new Date(joinTimestamp) 
      : new Date(joinTimestamp * 1000);
    
    if (isNaN(joinDate.getTime())) return '-';
    
    const today = new Date();
    const diffMs = today.getTime() - joinDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '오늘 가입';
    } else if (diffDays === 1) {
      return '어제 가입';
    } else {
      return `가입 ${diffDays}일차`;
    }
  } catch {
    return '-';
  }
}; 