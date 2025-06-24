import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../pages/Dashboard';
import { ToastProvider } from '../../contexts/ToastContext';
import * as ipcService from '../../database/ipcService'; // ipcService 임포트

// ipcService 모듈 전체를 모킹
jest.mock('../../database/ipcService');

// 모킹된 함수에 대한 타입 캐스팅 (선택적이지만, 타입스크립트에서 명확성을 위해 추가)
const mockGetDashboardStats = ipcService.getDashboardStats as jest.MockedFunction<
  typeof ipcService.getDashboardStats
>;

// Mock 차트 라이브러리
jest.mock('react-chartjs-2', () => ({
  Line: ({ 'data-testid': testId }: any) => (
    <div data-testid={testId || "line-chart"}>Line Chart</div>
  ),
  Doughnut: ({ 'data-testid': testId }: any) => (
    <div data-testid={testId || "doughnut-chart"}>Doughnut Chart</div>
  ),
  Bar: ({ 'data-testid': testId }: any) => (
    <div data-testid={testId || "bar-chart"}>Bar Chart</div>
  ),
}));

// Mock IPC 서비스
jest.mock('../../database/ipcService', () => ({
  getDashboardStats: jest.fn().mockResolvedValue({
    totalMembers: 150,
    activeMembers: 120,
    consultationMembers: 18,
    newMembersThisMonth: 15,
    attendanceToday: 45,
    membershipDistribution: [
      { type: '1개월 회원권', count: 60 },
      { type: '3개월 회원권', count: 40 },
      { type: 'PT 10회', count: 30 },
      { type: 'PT 20회', count: 20 },
    ],
    monthlyAttendance: [
      { month: '2024-10', count: 850 },
      { month: '2024-11', count: 920 },
      { month: '2024-12', count: 1100 },
    ],
    recentActivities: {
      recentMembers: [
        { id: 1, name: '김철수', joinDate: '2024-12-15T10:00:00Z', membershipType: '1개월 회원권' },
        { id: 2, name: '이영희', joinDate: '2024-12-14T14:30:00Z', membershipType: '3개월 회원권' },
      ],
      recentAttendance: [
        { id: 1, name: '박민수', visitDate: '2024-12-15T08:00:00Z', membershipType: 'PT 10회' },
        { id: 2, name: '정수진', visitDate: '2024-12-15T07:30:00Z', membershipType: 'PT 20회' },
      ],
    },
    lockerStats: {
      totalLockers: 100,
      occupiedLockers: 75,
      availableLockers: 25,
      occupancyRate: 75,
    },
    revenueStats: {
      todaysRevenue: 450000,
      monthlyRevenue: 12500000,
      averagePerMember: 83333,
    },
    memberEngagement: {
      highEngagement: 45, // 주 3회 이상
      mediumEngagement: 60, // 주 1-2회
      lowEngagement: 15, // 주 1회 미만
    },
    upcomingExpiry: {
      thisWeek: 8,
      thisMonth: 22,
      nextMonth: 35,
    },
  }),
}));

// Dashboard 컴포넌트를 ToastProvider로 감싸서 렌더링하는 헬퍼 함수
const renderDashboard = () => {
  return render(
    <ToastProvider>
      <Dashboard />
    </ToastProvider>,
  );
};

describe('개선된 Dashboard 컴포넌트', () => {
  describe('기본 렌더링', () => {
    it('대시보드 제목이 올바르게 표시되어야 한다', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('피트니스 센터 대시보드')).toBeInTheDocument();
      });
    });

    it('로딩 상태가 올바르게 표시되어야 한다', () => {
      renderDashboard();
      
      expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
    });
  });

  describe('핵심 KPI 카드들', () => {
    beforeEach(async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.queryByText('데이터를 불러오는 중...')).not.toBeInTheDocument();
      });
    });

    it('회원 관련 KPI가 올바르게 표시되어야 한다', () => {
      expect(screen.getByText('총 회원 수')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      
      expect(screen.getByText('활성 회원')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      
      expect(screen.getByText('상담 회원')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
    });

    it('출석 관련 KPI가 올바르게 표시되어야 한다', () => {
      expect(screen.getByText('오늘 출석')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('락커 점유율이 올바르게 표시되어야 한다', () => {
      expect(screen.getByText('락커 점유율')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('매출 정보가 올바르게 표시되어야 한다', () => {
      expect(screen.getByText('오늘 매출')).toBeInTheDocument();
      expect(screen.getByText('450,000원')).toBeInTheDocument();
      
      expect(screen.getByText('이번 달 매출')).toBeInTheDocument();
      expect(screen.getByText('12,500,000원')).toBeInTheDocument();
    });
  });

  describe('차트 시각화', () => {
    beforeEach(async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.queryByText('데이터를 불러오는 중...')).not.toBeInTheDocument();
      });
    });

    it('월별 출석 현황 차트가 표시되어야 한다', () => {
      expect(screen.getByText('월별 출석 현황')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart-attendance')).toBeInTheDocument();
    });

    it('회원권 분포 차트가 표시되어야 한다', () => {
      expect(screen.getByText('회원권 분포')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });

    it('회원 참여도 차트가 표시되어야 한다', () => {
      expect(screen.getByText('회원 참여도')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('매출 트렌드 차트가 표시되어야 한다', () => {
      expect(screen.getByText('매출 트렌드')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart-revenue')).toBeInTheDocument();
    });
  });

  describe('최근 활동 및 알림', () => {
    beforeEach(async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.queryByText('데이터를 불러오는 중...')).not.toBeInTheDocument();
      });
    });

    it('최근 가입 회원이 표시되어야 한다', () => {
      expect(screen.getByText('최근 활동')).toBeInTheDocument();
      // 회원 이름이 활동 설명에 포함되어 있는지 확인
      expect(screen.getByText(/김철수님이 회원으로 등록되었습니다/)).toBeInTheDocument();
      expect(screen.getByText(/이영희님이 회원으로 등록되었습니다/)).toBeInTheDocument();
    });

    it('회원권 만료 예정 알림이 표시되어야 한다', () => {
      expect(screen.getByText('주요 알림 현황')).toBeInTheDocument();
      expect(screen.getAllByText('이번 주 만료')).toHaveLength(2); // KPI 카드와 알림 패널에서 모두 표시
      expect(screen.getAllByText('8')).toHaveLength(2); // KPI 카드와 알림 패널에서 모두 표시
    });
  });

  describe('반응형 디자인', () => {
    it('모바일 화면에서 카드들이 올바르게 배치되어야 한다', async () => {
      // 화면 크기 변경을 시뮬레이션
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderDashboard();
      
      await waitFor(() => {
        expect(screen.queryByText('데이터를 불러오는 중...')).not.toBeInTheDocument();
      });

      // 모바일에서는 카드들이 세로로 배치되어야 함
      const statsCards = screen.getAllByTestId(/stat-card/);
      expect(statsCards.length).toBeGreaterThan(0);
    });
  });

  describe('에러 처리', () => {
    it('데이터 로딩 실패 시 에러 메시지가 표시되어야 한다', async () => {
      const mockError = new Error('API 호출 실패');
      require('../../database/ipcService').getDashboardStats.mockRejectedValueOnce(mockError);

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText(/데이터 로드 실패/)).toBeInTheDocument();
      });
    });
  });
}); 