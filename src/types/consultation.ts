// 상담일지 시스템 관련 타입 정의

// 기존 Member 타입 확장
export interface ConsultationMember {
  id?: number;
  name: string;
  phone: string;
  email?: string;
  gender?: '남' | '여';
  birth_date?: number; // Unix timestamp
  join_date: number; // Unix timestamp
  first_visit?: number; // Unix timestamp
  membership_type?: string;
  membership_start?: number;
  membership_end?: number;
  last_visit?: number;
  notes?: string;
  staff_id?: number;
  staff_name?: string;
  created_at?: number;
  updated_at?: number;
  // 상담 관련 추가 정보
  consultation_status?: 'pending' | 'in_progress' | 'completed' | 'follow_up';
  emergency_contact?: string;
  health_conditions?: string;
  fitness_goals?: string[];
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
  emergency_contact?: string;
  health_conditions?: string;
  fitness_goals?: string[];
  membership_type?: string;
  staff_id?: number;
  notes?: string;
}

export interface ConsultationFormData {
  consultation_type: ConsultationRecord['consultation_type'];
  consultation_date: string; // YYYY-MM-DD 형태
  content: string;
  goals_discussed: string[];
  recommendations: string;
  next_appointment?: string; // YYYY-MM-DD 형태
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

// 유틸리티 타입
export type ConsultationStatus = ConsultationMember['consultation_status'];
export type WorkoutType = WorkoutSchedule['workout_type'];
export type SessionType = PersonalTrainingSession['session_type'];
export type PTStatus = PersonalTrainingSession['status']; 