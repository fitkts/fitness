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

// Dashboard 컴포넌트를 ToastProvider로 감싸서 렌더링하는 헬퍼 함수
const renderDashboard = () => {
  return render(
    <ToastProvider>
      <Dashboard />
    </ToastProvider>,
  );
};

describe('Dashboard 페이지', () => {
  beforeEach(() => {
    // 각 테스트 전에 모킹된 함수의 호출 기록 등을 초기화
    mockGetDashboardStats.mockReset();
  });

  test('초기 로딩 상태가 올바르게 표시되어야 한다', async () => {
    mockGetDashboardStats.mockReturnValue(new Promise(() => {}));

    renderDashboard();
    // Dashboard.tsx를 보면 로딩 중일 때 특정 텍스트나 스피너를 표시하는 로직이 있을 것입니다.
    // 여기서는 "총 회원 수"와 같은 데이터 기반 텍스트가 아직 보이지 않는 것으로 로딩 상태를 간접적으로 확인합니다.
    // 실제 로딩 UI에 맞춰서 더 정확한 단언으로 수정할 수 있습니다.
    expect(screen.queryByText(/총 회원 수/i)).toBeNull();
    // 예시: 로딩 스피너가 있다면
    // expect(screen.getByTestId('loading-spinner')).toBeInTheDocument(); 
  });

  test('데이터 로딩 후 주요 통계 정보가 표시되어야 한다', async () => {
    const mockStats = {
      totalMembers: 100,
      activeMembers: 80,
      newMembersThisMonth: 10,
      attendanceToday: 5,
      membershipDistribution: [{ type: '1개월', count: 50 }, { type: '3개월', count: 30 }],
      monthlyAttendance: [{ month: '2023년 1월', count: 200 }, { month: '2022년 12월', count: 180 }],
      recentActivities: {
        recentMembers: [
          { id: 1, name: '최근가입자1', joinDate: '2023-01-15', phone:'', gender:'남성', birthDate:'', membershipType:'', membershipStart:'', membershipEnd:'', createdAt: '2023-01-15', updatedAt: '2023-01-15' },
          { id: 2, name: '최근가입자2', joinDate: '2023-01-10', phone:'', gender:'여성', birthDate:'', membershipType:'', membershipStart:'', membershipEnd:'', createdAt: '2023-01-10', updatedAt: '2023-01-10' },
        ],
        recentAttendance: [
          { id: 101, memberId: 1, memberName: '홍길동', visitDate: '2023-01-20', createdAt: '2023-01-20' },
          { id: 102, memberId: 2, memberName: '김영희', visitDate: '2023-01-20' }, // createdAt은 옵셔널
        ],
      },
    };
    // @ts-ignore: 모킹된 함수에 Promise가 아닌 값을 직접 할당하기 위함
    mockGetDashboardStats.mockResolvedValue(mockStats);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/총 회원 수/i)).toBeInTheDocument();
    });

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/활성 회원/i)).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText(/이달 신규/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/오늘 출석/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // membershipDistribution 데이터 확인 (예시: 첫 번째 항목)
    // Dashboard.tsx에서 이 데이터를 어떻게 표시하는지에 따라 selector 수정 필요
    // 예를 들어, "1개월: 50명"과 같이 표시된다면:
    // expect(await screen.findByText(/1개월: 50명/i)).toBeInTheDocument();

    // monthlyAttendance 데이터 확인 (예시: 첫 번째 항목)
    // Dashboard.tsx에서 이 데이터를 어떻게 표시하는지에 따라 selector 수정 필요
    // 예를 들어, "2023년 1월: 200회"와 같이 표시된다면:
    // expect(await screen.findByText(/2023년 1월: 200회/i)).toBeInTheDocument();

    // recentMembers 데이터 확인
    expect(await screen.findByText('최근가입자1')).toBeInTheDocument();
    expect(await screen.findByText('2023-01-15')).toBeInTheDocument(); // 최근가입자1의 joinDate
    expect(await screen.findByText('최근가입자2')).toBeInTheDocument();

    // recentAttendance 데이터 확인
    // Dashboard.tsx에서 recentAttendance의 memberName과 visitDate를 표시한다고 가정
    expect(await screen.findByText('홍길동')).toBeInTheDocument(); // 최근 출석한 홍길동
    expect(await screen.findByText('2023-01-20')).toBeInTheDocument(); // 홍길동의 visitDate
    expect(await screen.findByText('김영희')).toBeInTheDocument(); // 최근 출석한 김영희

    const canvases = screen.getAllByRole('img');
    expect(canvases.length).toBeGreaterThanOrEqual(1);
  });

  test('데이터 로딩 실패 시 에러 메시지가 표시되어야 한다', async () => {
    mockGetDashboardStats.mockRejectedValue(new Error('API Error'));

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText(/대시보드 통계 데이터를 불러오는데 실패했습니다./i),
      ).toBeInTheDocument();
    });
  });

  test('최근 활동 내역이 없을 때 적절한 메시지가 표시되어야 한다', async () => {
    const mockStatsEmptyActivity = {
      totalMembers: 10,
      activeMembers: 8,
      newMembersThisMonth: 1,
      attendanceToday: 0,
      membershipDistribution: [],
      monthlyAttendance: [],
      recentActivities: {
        recentMembers: [], // Member[] 타입이므로 빈 배열
        recentAttendance: [], // 위에서 정의한 recentAttendance 객체 타입의 빈 배열
      },
    };
    // @ts-ignore
    mockGetDashboardStats.mockResolvedValue(mockStatsEmptyActivity);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/최근 활동 내역이 없습니다/i)).toBeInTheDocument();
    });
  });
}); 