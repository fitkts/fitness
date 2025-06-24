import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Settings, Download, Filter } from 'lucide-react';
import { DashboardStats } from '../types/dashboard';
import { useToast } from '../contexts/ToastContext';
import { createPageStructure, getButtonStyle, getLoadingSpinnerStyle } from '../utils/designSystemUtils';
import { generateKPICards } from '../utils/dashboardUtils';
import { DASHBOARD_CONFIG } from '../config/dashboardConfig';
import { getDashboardStats } from '../database/ipcService';

// 대시보드 하위 컴포넌트들
import KPICardGrid from '../components/dashboard/KPICardGrid';
import ChartSection from '../components/dashboard/ChartSection';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import AlertsPanel from '../components/dashboard/AlertsPanel';

// 개선된 Dashboard 컴포넌트
const Dashboard: React.FC = () => {
  // 상태 관리
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  const { showToast } = useToast();
  const pageStructure = createPageStructure('피트니스 센터 대시보드');

  // 데이터 가져오기 함수
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const dashboardStats = await getDashboardStats();
      
      // 디버깅을 위한 로그 추가
      console.log('받은 대시보드 데이터:', dashboardStats);
      
      // null이 아니고 기본 필드들이 있으면 처리
      if (dashboardStats) {
        // 확장된 대시보드 통계로 변환 (누락된 필드는 기본값 설정)
        const enhancedStats: DashboardStats = {
          totalMembers: dashboardStats.totalMembers || 0,
          activeMembers: dashboardStats.activeMembers || 0,
          consultationMembers: 18, // Mock data - 실제로는 API에서 받아야 함
          newMembersThisMonth: dashboardStats.newMembersThisMonth || 0,
          attendanceToday: dashboardStats.attendanceToday || 0,
          membershipDistribution: dashboardStats.membershipDistribution || [],
          monthlyAttendance: dashboardStats.monthlyAttendance || [],
          recentActivities: {
            recentMembers: dashboardStats.recentActivities?.recentMembers || [],
            recentAttendance: dashboardStats.recentActivities?.recentAttendance || [],
            recentConsultations: [], // Mock data
          },
          // 새로운 확장 데이터 (실제로는 API에서 받아야 함)
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
            growth: {
              daily: 15,
              monthly: 8,
            },
          },
          memberEngagement: {
            highEngagement: 45,
            mediumEngagement: 60,
            lowEngagement: 15,
            inactive: 5,
          },
          upcomingExpiry: {
            thisWeek: 8,
            thisMonth: 22,
            nextMonth: 35,
          },
        };

        setStats(enhancedStats);
        setLastUpdated(new Date().toISOString());
        
        if (isRefresh) {
          showToast('success', '대시보드 데이터가 업데이트되었습니다.');
        }
      } else {
        throw new Error('대시보드 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      showToast('error', `대시보드 통계 데이터를 불러오는데 실패했습니다: ${errorMessage}`);
      console.error('대시보드 데이터 로드 오류:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (!DASHBOARD_CONFIG.autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, DASHBOARD_CONFIG.refreshInterval);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // 수동 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // 설정 모달 핸들러 (추후 구현)
  const handleSettings = useCallback(() => {
    showToast('info', '설정 기능은 준비 중입니다.');
  }, [showToast]);

  // 데이터 내보내기 핸들러 (추후 구현)
  const handleExport = useCallback(() => {
    showToast('info', '데이터 내보내기 기능은 준비 중입니다.');
  }, [showToast]);

  // KPI 카드 클릭 핸들러
  const handleKPICardClick = useCallback((card: any) => {
    if (card.actionUrl) {
      showToast('info', `${card.title} 상세 페이지로 이동합니다.`);
      // 실제 구현에서는 라우팅 처리
      console.log(`Navigate to: ${card.actionUrl}`);
    }
  }, [showToast]);

  // 알림 클릭 핸들러
  const handleAlertClick = useCallback((alert: any) => {
    if (alert.actionUrl) {
      showToast('info', `${alert.title} 관련 페이지로 이동합니다.`);
      console.log(`Navigate to: ${alert.actionUrl}`);
    }
  }, [showToast]);

  // 알림 해제 핸들러
  const handleAlertDismiss = useCallback((alertId: string) => {
    showToast('success', '알림이 해제되었습니다.');
    console.log(`Dismiss alert: ${alertId}`);
  }, [showToast]);

  // 로딩 상태 렌더링
  if (isLoading && !stats) {
    return (
      <div className={pageStructure.containerClass}>
        <div className="text-center py-20">
          <div className={`${getLoadingSpinnerStyle('lg')} mx-auto mb-4`}></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  // 에러 상태 렌더링
  if (error && !stats) {
    return (
      <div className={pageStructure.containerClass}>
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            데이터 로드 실패
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className={getButtonStyle('primary')}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 메인 대시보드 렌더링
  return (
    <div className={pageStructure.containerClass}>
      {/* 헤더 섹션 */}
      <div className={pageStructure.headerClass}>
        <div>
          <h1 className={pageStructure.titleClass}>
            {pageStructure.title}
          </h1>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              마지막 업데이트: {new Date(lastUpdated).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
        
        {/* 액션 버튼들 */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`${getButtonStyle('outline')} ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </button>
          
          <button
            onClick={handleExport}
            className={getButtonStyle('outline')}
          >
            <Download className="w-4 h-4 mr-2" />
            내보내기
          </button>
          
          <button
            onClick={handleSettings}
            className={getButtonStyle('secondary')}
          >
            <Settings className="w-4 h-4 mr-2" />
            설정
          </button>
        </div>
      </div>

      {stats && (
        <>
          {/* KPI 카드 그리드 */}
          <KPICardGrid
            cards={generateKPICards(stats)}
            isLoading={isRefreshing}
            onCardClick={handleKPICardClick}
          />

          {/* 차트 섹션 */}
          <ChartSection
            stats={stats}
            isLoading={isRefreshing}
          />

          {/* 하단 섹션: 활동 피드와 알림 패널 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 최근 활동 피드 */}
            <ActivityFeed
              activities={stats.recentActivities}
              isLoading={isRefreshing}
              maxItems={8}
            />

            {/* 알림 패널 */}
            <AlertsPanel
              upcomingExpiry={stats.upcomingExpiry}
              memberEngagement={stats.memberEngagement}
              isLoading={isRefreshing}
              onAlertClick={handleAlertClick}
              onAlertDismiss={handleAlertDismiss}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
