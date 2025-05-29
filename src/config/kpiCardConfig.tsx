import React from 'react';
import { 
  DollarSign,
  Users, 
  UserCheck,
  Activity,
  CreditCard,
  UserPlus,
  MapPin,
  Target,
  Calendar,
  Clock,
  TrendingUp
} from 'lucide-react';
import { KPICardConfig } from '../types/statistics';

// KPI 카드 기본 설정
export const defaultKPICards: KPICardConfig[] = [
  {
    id: 'totalRevenue',
    title: '총 매출',
    description: '선택 기간 내 총 매출액',
    category: '매출',
    icon: <DollarSign size={20} className="text-white" />,
    color: 'bg-green-500',
    enabled: true
  },
  {
    id: 'totalMembers',
    title: '총 회원 수',
    description: '전체 등록 회원 수',
    category: '회원',
    icon: <Users size={20} className="text-white" />,
    color: 'bg-blue-500',
    enabled: true
  },
  {
    id: 'activeMembers',
    title: '활성 회원',
    description: '현재 유효한 회원권을 가진 회원',
    category: '회원',
    icon: <UserCheck size={20} className="text-white" />,
    color: 'bg-emerald-500',
    enabled: true
  },
  {
    id: 'attendanceToday',
    title: '오늘 출석',
    description: '당일 출석한 회원 수',
    category: '운영',
    icon: <Activity size={20} className="text-white" />,
    color: 'bg-orange-500',
    enabled: true
  },
  {
    id: 'averagePayment',
    title: '평균 결제 금액',
    description: '선택 기간 내 평균 결제 금액',
    category: '매출',
    icon: <CreditCard size={20} className="text-white" />,
    color: 'bg-purple-500',
    enabled: true
  },
  {
    id: 'newMembers',
    title: '신규 가입',
    description: '선택 기간 내 신규 가입자 수',
    category: '회원',
    icon: <UserPlus size={20} className="text-white" />,
    color: 'bg-indigo-500',
    enabled: true
  },
  {
    id: 'lockerUtilization',
    title: '락커 이용률',
    description: '전체 락커 대비 사용 중인 락커 비율',
    category: '운영',
    icon: <MapPin size={20} className="text-white" />,
    color: 'bg-cyan-500',
    enabled: true
  },
  {
    id: 'memberRetention',
    title: '회원 유지율',
    description: '전체 회원 대비 활성 회원 비율',
    category: '회원',
    icon: <Target size={20} className="text-white" />,
    color: 'bg-pink-500',
    enabled: true
  },
  {
    id: 'totalPayments',
    title: '결제 건수',
    description: '선택 기간 내 총 결제 건수',
    category: '매출',
    icon: <Calendar size={20} className="text-white" />,
    color: 'bg-red-500',
    enabled: true
  },
  {
    id: 'monthlyVisits',
    title: '월 평균 방문',
    description: '월별 평균 방문 횟수',
    category: '운영',
    icon: <Clock size={20} className="text-white" />,
    color: 'bg-amber-500',
    enabled: true
  },
  {
    id: 'renewalRate',
    title: '회원권 갱신률',
    description: '회원권 만료 후 갱신 비율',
    category: '성과',
    icon: <TrendingUp size={20} className="text-white" />,
    color: 'bg-teal-500',
    enabled: true
  },
  {
    id: 'ptUtilization',
    title: 'PT 이용률',
    description: 'PT 서비스 이용 비율',
    category: '성과',
    icon: <Users size={20} className="text-white" />,
    color: 'bg-violet-500',
    enabled: true
  }
];

// KPI 카드 카테고리 목록
export const KPI_CATEGORIES: string[] = ['매출', '회원', '운영', '성과']; 