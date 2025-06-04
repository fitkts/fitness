// 상담일지 시스템 설정 및 상수
import React from 'react';
import { 
  ConsultationStatus, 
  WorkoutType, 
  SessionType, 
  PTStatus 
} from '../types/consultation';

// 상담 상태 옵션
export const CONSULTATION_STATUS_OPTIONS = [
  { value: 'pending' as ConsultationStatus, label: '대기 중', color: 'yellow' },
  { value: 'in_progress' as ConsultationStatus, label: '진행 중', color: 'blue' },
  { value: 'completed' as ConsultationStatus, label: '완료', color: 'green' },
  { value: 'follow_up' as ConsultationStatus, label: '추가 상담 필요', color: 'orange' }
];

// 상담 유형 옵션
export const CONSULTATION_TYPE_OPTIONS = [
  { value: 'initial', label: '초기 상담', icon: '🆕' },
  { value: 'progress', label: '진도 점검', icon: '📈' },
  { value: 'follow_up', label: '추가 상담', icon: '🔄' },
  { value: 'special', label: '특별 상담', icon: '⭐' }
];

// 성별 옵션
export const GENDER_OPTIONS = [
  { value: '남', label: '남성' },
  { value: '여', label: '여성' }
];

// 운동 타입 옵션
export const WORKOUT_TYPE_OPTIONS = [
  { value: 'cardio' as WorkoutType, label: '유산소', icon: '🏃', color: 'red' },
  { value: 'strength' as WorkoutType, label: '근력 운동', icon: '💪', color: 'blue' },
  { value: 'flexibility' as WorkoutType, label: '유연성', icon: '🧘', color: 'green' },
  { value: 'mixed' as WorkoutType, label: '복합 운동', icon: '🏋️', color: 'purple' }
];

// 운동 강도 옵션
export const INTENSITY_LEVELS = [
  { value: 1, label: '매우 쉬움', color: 'green' },
  { value: 2, label: '쉬움', color: 'lime' },
  { value: 3, label: '보통', color: 'yellow' },
  { value: 4, label: '어려움', color: 'orange' },
  { value: 5, label: '매우 어려움', color: 'red' }
];

// 요일 옵션
export const DAYS_OF_WEEK = [
  { value: 0, label: '일', shortLabel: '일' },
  { value: 1, label: '월', shortLabel: '월' },
  { value: 2, label: '화', shortLabel: '화' },
  { value: 3, label: '수', shortLabel: '수' },
  { value: 4, label: '목', shortLabel: '목' },
  { value: 5, label: '금', shortLabel: '금' },
  { value: 6, label: '토', shortLabel: '토' }
];

// PT 세션 타입 옵션
export const PT_SESSION_TYPE_OPTIONS = [
  { value: 'assessment' as SessionType, label: '체력 측정', icon: '📊' },
  { value: 'training' as SessionType, label: '개인 트레이닝', icon: '🏋️' },
  { value: 'follow_up' as SessionType, label: '점검 세션', icon: '🔍' }
];

// PT 세션 상태 옵션
export const PT_STATUS_OPTIONS = [
  { value: 'scheduled' as PTStatus, label: '예약됨', color: 'blue' },
  { value: 'completed' as PTStatus, label: '완료', color: 'green' },
  { value: 'cancelled' as PTStatus, label: '취소됨', color: 'red' },
  { value: 'no_show' as PTStatus, label: '노쇼', color: 'gray' }
];

// 운동 목표 옵션
export const FITNESS_GOALS_OPTIONS = [
  '체중 감량',
  '근육량 증가',
  '체력 향상',
  '스트레스 해소',
  '자세 교정',
  '재활 운동',
  '건강 유지',
  '운동 기능 향상',
  '경기력 향상',
  '체형 관리'
];

// 집중 운동 부위 옵션
export const FOCUS_AREAS_OPTIONS = [
  '상체',
  '하체',
  '코어',
  '팔',
  '어깨',
  '등',
  '가슴',
  '복근',
  '다리',
  '힙',
  '전신',
  '유산소',
  '유연성'
];

// 식단 제한 사항 옵션
export const DIET_RESTRICTIONS_OPTIONS = [
  '견과류 알레르기',
  '해산물 알레르기',
  '유제품 불내증',
  '글루텐 프리',
  '채식주의',
  '비건',
  '당뇨',
  '고혈압',
  '저염식',
  '저칼로리',
  '고단백'
];

// 운동 시간대 옵션
export const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00'
];

// PT 세션 시간 옵션 (분)
export const PT_DURATION_OPTIONS = [
  { value: 30, label: '30분' },
  { value: 45, label: '45분' },
  { value: 60, label: '1시간' },
  { value: 90, label: '1시간 30분' },
  { value: 120, label: '2시간' }
];

// 테이블 컬럼 설정
export const CONSULTATION_TABLE_COLUMNS = [
  { key: 'name', label: '회원명', sortable: true, width: '120px' },
  { key: 'phone', label: '연락처', sortable: false, width: '120px' },
  { key: 'gender', label: '성별', sortable: false, width: '60px' },
  { key: 'birth_date', label: '생년월일', sortable: true, width: '110px' },
  { key: 'consultation_status', label: '상담 상태', sortable: true, width: '100px' },
  { key: 'staff_name', label: '담당자', sortable: false, width: '80px' },
  { key: 'first_visit', label: '최초 방문일', sortable: true, width: '110px' },
  { key: 'last_visit', label: '최근 방문', sortable: true, width: '100px' },
  { key: 'actions', label: '작업', sortable: false, width: '120px' }
];

// 페이지네이션 설정
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `${range[0]}-${range[1]} / 총 ${total}명`
};

// 색상 테마
export const CONSULTATION_COLORS = {
  primary: '#3b82f6',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  background: '#f8fafc',
  cardBackground: '#ffffff',
  border: '#e2e8f0',
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    muted: '#94a3b8'
  }
};

// 상담 상태별 배지 스타일
export const STATUS_BADGE_STYLES = {
  pending: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
    border: '1px solid #fcd34d'
  },
  in_progress: {
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    border: '1px solid #93c5fd'
  },
  completed: {
    backgroundColor: '#d1fae5',
    color: '#059669',
    border: '1px solid #6ee7b7'
  },
  follow_up: {
    backgroundColor: '#fed7aa',
    color: '#ea580c',
    border: '1px solid #fdba74'
  }
};

// 기본 폼 설정
export const FORM_CONFIG = {
  validateMessages: {
    required: '${label}은(는) 필수 입력 항목입니다.',
    types: {
      email: '올바른 이메일 형식이 아닙니다.',
      number: '숫자만 입력 가능합니다.'
    },
    pattern: {
      mismatch: '올바른 형식이 아닙니다.'
    }
  },
  layout: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  }
};

// 모달 기본 설정
export const MODAL_CONFIG = {
  width: 800,
  maskClosable: false,
  destroyOnClose: true,
  centered: true
};

// 성공/에러 메시지
export const MESSAGES = {
  success: {
    memberCreated: '회원이 성공적으로 등록되었습니다.',
    consultationSaved: '상담 기록이 저장되었습니다.',
    scheduleCreated: '운동 스케줄이 생성되었습니다.',
    ptScheduled: 'PT 세션이 예약되었습니다.',
    dataUpdated: '정보가 업데이트되었습니다.'
  },
  error: {
    loadFailed: '데이터를 불러오는데 실패했습니다.',
    saveFailed: '저장에 실패했습니다.',
    deleteFailed: '삭제에 실패했습니다.',
    networkError: '네트워크 오류가 발생했습니다.',
    validationError: '입력 정보를 확인해주세요.'
  }
}; 