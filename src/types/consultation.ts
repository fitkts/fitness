// 상담일지 시스템 관련 타입 정의

// 상담 회원 타입 (승격 전 상담 대상자)
export interface ConsultationMember {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  gender?: '남' | '여';
  birth_date?: number; // Unix timestamp
  join_date: number; // Unix timestamp (상담 회원에서는 생성일)
  first_visit?: number; // Unix timestamp
  membership_type?: string; // 상담 회원은 일반적으로 undefined
  membership_start?: number;
  membership_end?: number;
  last_visit?: number;
  notes?: string;
  staff_id?: number;
  staff_name?: string;
  created_at?: number;
  updated_at?: number;
  // 상담 관련 정보
  consultation_status?: 'pending' | 'in_progress' | 'completed' | 'follow_up';
  health_conditions?: string;
  fitness_goals?: string[];
  // 승격 관련 정보
  is_promoted?: boolean; // 회원으로 승격 여부
  promoted_at?: number; // 승격일시 (Unix timestamp)
  promoted_member_id?: number; // 승격 후 생성된 회원 ID
}

// 상담 기록 타입
export interface ConsultationRecord {
  id?: number;
  member_id: number;
  consultation_date: number; // Unix timestamp
  consultation_type: 'initial' | 'progress' | 'follow_up' | 'special';
  consultant_id: number; // staff_id
  consultant_name: string;
  content: string;
  goals_discussed: string[];
  recommendations: string;
  next_appointment?: number; // Unix timestamp
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  created_at?: number;
  updated_at?: number;
}

// 운동 스케줄 타입
export interface WorkoutSchedule {
  id?: number;
  member_id: number;
  schedule_name: string;
  workout_type: 'cardio' | 'strength' | 'flexibility' | 'mixed';
  days_of_week: number[]; // 0=일요일, 1=월요일, ... 6=토요일
  start_time: string; // "HH:mm" 형태
  duration_minutes: number;
  intensity_level: 1 | 2 | 3 | 4 | 5; // 1=매우 쉬움, 5=매우 어려움
  exercises?: WorkoutExercise[];
  notes?: string;
  is_active: boolean;
  created_at?: number;
  updated_at?: number;
}

// 운동 종목 타입
export interface WorkoutExercise {
  id?: number;
  schedule_id: number;
  exercise_name: string;
  sets?: number;
  reps?: number;
  weight?: number; // kg
  duration_minutes?: number; // 유산소 운동용
  rest_seconds?: number;
  order_index: number;
  notes?: string;
}

// 식단 정보 타입
export interface DietPlan {
  id?: number;
  member_id: number;
  plan_name: string;
  target_calories?: number;
  target_protein?: number; // gram
  target_carbs?: number; // gram
  target_fat?: number; // gram
  meal_count: number; // 하루 식사 횟수
  restrictions?: string[]; // 알레르기, 선호도 등
  notes?: string;
  is_active: boolean;
  created_at?: number;
  updated_at?: number;
}

// OT(개인 트레이닝) 예약 타입
export interface PersonalTrainingSession {
  id?: number;
  member_id: number;
  trainer_id: number; // staff_id
  trainer_name: string;
  session_date: number; // Unix timestamp
  duration_minutes: number;
  session_type: 'assessment' | 'training' | 'follow_up';
  focus_areas: string[]; // 집중 운동 부위
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  feedback?: string; // 세션 후 피드백
  next_session_date?: number; // Unix timestamp
  created_at?: number;
  updated_at?: number;
}

// 테이블 필터 및 정렬 옵션
export interface ConsultationTableFilters {
  status?: ConsultationMember['consultation_status'];
  membership_type?: string;
  staff_id?: number;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  search_query?: string;
}

export interface ConsultationTableSort {
  field: 'name' | 'birth_date' | 'first_visit' | 'last_visit' | 'consultation_status';
  direction: 'asc' | 'desc';
}

// 폼 데이터 타입
export interface NewMemberFormData {
  name: string;
  phone: string;
  email?: string;
  gender?: '남' | '여';
  birth_date?: string; // YYYY-MM-DD 형태
  first_visit?: string; // YYYY-MM-DD 형태 - 최초 방문일 추가
  health_conditions?: string;
  fitness_goals?: string[];
  membership_type?: string;
  staff_id?: number; // 담당자 ID
  staff_name?: string; // 담당자 이름
  consultation_status?: 'pending' | 'in_progress' | 'completed' | 'follow_up'; // 상담 상태 추가
  notes?: string;
}

export interface ConsultationFormData {
  consultation_type: ConsultationRecord['consultation_type'];
  consultation_date: string; // YYYY-MM-DD 형태
  content: string;
  goals_discussed: string[];
  recommendations: string;
  next_appointment?: string; // YYYY-MM-DD 형태
  status?: ConsultationRecord['status'];
  consultant_id?: number;
  consultant_name?: string;
}

// 컴포넌트 Props 타입
export interface ConsultationTableProps {
  members: ConsultationMember[];
  filters: ConsultationTableFilters;
  sort: ConsultationTableSort;
  onFilterChange: (filters: ConsultationTableFilters) => void;
  onSortChange: (sort: ConsultationTableSort) => void;
  onMemberSelect: (member: ConsultationMember) => void;
  onAddNewMember: () => void;
  onViewDetail?: (memberId: number) => void;
  loading?: boolean;
}

export interface NewMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewMemberFormData) => Promise<void>;
  loading?: boolean;
}

export interface ConsultationDetailProps {
  member: ConsultationMember;
  consultationRecords: ConsultationRecord[];
  workoutSchedules: WorkoutSchedule[];
  dietPlans: DietPlan[];
  ptSessions: PersonalTrainingSession[];
  onAddConsultation: (data: ConsultationFormData) => Promise<void>;
  onSchedulePT: (data: Partial<PersonalTrainingSession>) => Promise<void>;
  loading?: boolean;
}

// 수정 관련 타입
export interface ConsultationMemberUpdateData {
  id: number;
  name: string;
  phone: string;
  email?: string;
  gender?: '남' | '여';
  birth_date?: string; // YYYY-MM-DD 형태
  consultation_status?: 'pending' | 'in_progress' | 'completed' | 'follow_up';
  health_conditions?: string;
  fitness_goals?: string[];
  notes?: string;
  staff_id?: number;
}

export interface ConsultationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationMemberId: number | null;
  onUpdate: () => void;
  onPromote?: (member: ConsultationMember) => void;
}

export interface MemberEditFormData {
  name: string;
  phone: string;
  email: string;
  gender: '남' | '여' | '';
  birth_date: string;
  consultation_status: 'pending' | 'in_progress' | 'completed' | 'follow_up' | '';
  health_conditions: string;
  fitness_goals: string[];
  notes: string;
  staff_id: number | undefined;
}

// 승격 관련 타입
export interface PromotionData {
  consultationMemberId: number;
  membershipTypeId: number;
  membershipType: string;
  startDate: string;
  endDate: string;
  paymentAmount: number;
  paymentMethod: 'card' | 'cash' | 'transfer';
  notes?: string;
}

// 유틸리티 타입
export type ConsultationStatus = ConsultationMember['consultation_status'];
export type WorkoutType = WorkoutSchedule['workout_type'];
export type SessionType = PersonalTrainingSession['session_type'];
export type PTStatus = PersonalTrainingSession['status'];

// 상담 회원 필터 인터페이스 (회원관리와 동일한 구조)
export interface ConsultationFilter {
  search?: string;
  status?: ConsultationStatus | 'all';
  staffName?: string | 'all';
  gender?: string | 'all';
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
}

// 정렬 설정 (회원관리와 동일한 구조)  
export interface ConsultationSortConfig {
  key: string;
  direction: 'ascending' | 'descending' | null;
}

// 페이지네이션 설정 (회원관리와 동일한 구조)
export interface ConsultationPaginationConfig {
  currentPage: number;
  pageSize: number;
  showAll: boolean;
}

// 통계 정보 인터페이스
export interface ConsultationStatistics {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  followUp: number;
}

// 검색 필터 액션 인터페이스
export interface ConsultationSearchFilterActions {
  onAddMember?: () => void;
  onImportSuccess?: () => void;
  showToast?: (type: 'success' | 'error', message: string) => void;
  members?: ConsultationMember[];
  showActionButtons?: boolean;
} 