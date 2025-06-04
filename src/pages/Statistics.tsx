import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye,
  RefreshCw,
  AlertCircle,
  Settings
} from 'lucide-react';
import { getAllPayments, getDashboardStats, getAllMembers, getAllLockers, getAllStaff } from '../database/ipcService';
import { Payment, Member, Locker, Staff } from '../models/types';
import { useToast } from '../contexts/ToastContext';
import { 
  ViewType, 
  KPICardConfig, 
  PaymentStatusFilter
} from '../types/statistics';
import { defaultKPICards } from '../config/kpiCardsConfig';
import { useKPICalculations } from '../hooks/useKPICalculations';
import { getKPICardRenderData } from '../utils/kpiCardRenderer';
import KPICard from '../components/KPICard';
import StatisticsFilters from '../components/StatisticsFilters';
import KPICardEditModal from '../components/KPICardEditModal';
import StatisticsSummary from '../components/StatisticsSummary';
import KPIDetailModal from '../components/KPIDetailModal';

// --- Statistics 컴포넌트 ---
const Statistics: React.FC = () => {
  const { showToast } = useToast();
  const [paymentsData, setPaymentsData] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 데이터 상태
  const [membersData, setMembersData] = useState<Member[]>([]);
  const [lockersData, setLockersData] = useState<Locker[]>([]);
  const [staffData, setStaffData] = useState<Staff[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  // 필터 상태
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState<string>(firstDayOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(today.toISOString().split('T')[0]);
  const [viewType, setViewType] = useState<ViewType>('monthly');
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>('전체');

  // 카드 편집 관련 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // 상세보기 모달 상태
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedCardConfig, setSelectedCardConfig] = useState<KPICardConfig | null>(null);
  const [selectedCardData, setSelectedCardData] = useState<{
    value: string;
    change?: number;
    chartData: any[];
  } | null>(null);

  const [kpiCards, setKpiCards] = useState<KPICardConfig[]>(() => {
    // localStorage에서 설정 불러오기
    const savedConfig = localStorage.getItem('kpi-cards-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        // 기본 설정과 저장된 설정을 병합 (새로운 카드가 추가된 경우 대비)
        return defaultKPICards.map(defaultCard => {
          const savedCard = parsedConfig.find((card: KPICardConfig) => card.id === defaultCard.id);
          return savedCard ? { ...defaultCard, enabled: savedCard.enabled } : defaultCard;
        });
      } catch (error) {
        console.error('KPI 카드 설정 로드 실패:', error);
        return defaultKPICards;
      }
    }
    return defaultKPICards;
  });

  // 카드 설정 저장
  const saveKPICardsConfig = (config: KPICardConfig[]) => {
    try {
      localStorage.setItem('kpi-cards-config', JSON.stringify(config));
      showToast('success', 'KPI 카드 설정이 저장되었습니다.');
    } catch (error) {
      console.error('KPI 카드 설정 저장 실패:', error);
      showToast('error', 'KPI 카드 설정 저장에 실패했습니다.');
    }
  };

  // 카드 표시/숨김 토글
  const toggleKPICard = (cardId: string) => {
    const updatedCards = kpiCards.map(card =>
      card.id === cardId ? { ...card, enabled: !card.enabled } : card
    );
    setKpiCards(updatedCards);
  };

  // 카드 편집 모달 열기/닫기
  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  // 카드 편집 저장
  const handleSaveCardConfig = () => {
    saveKPICardsConfig(kpiCards);
    closeEditModal();
  };

  // 모든 카드 선택/해제
  const toggleAllCards = (enabled: boolean) => {
    const updatedCards = kpiCards.map(card => ({ ...card, enabled }));
    setKpiCards(updatedCards);
  };

  // 카테고리별 카드 선택/해제
  const toggleCategoryCards = (category: string, enabled: boolean) => {
    const updatedCards = kpiCards.map(card =>
      card.category === category ? { ...card, enabled } : card
    );
    setKpiCards(updatedCards);
  };

  // 활성화된 카드 필터링
  const enabledCards = kpiCards.filter(card => card.enabled);

  // 데이터 로딩 함수
  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [paymentsResponse, membersResponse, lockersResponse, staffResponse, dashboardResponse] = await Promise.all([
        getAllPayments(),
        getAllMembers(),
        getAllLockers(1, 1000, '', 'all'),
        getAllStaff(),
        getDashboardStats()
      ]);

      if (paymentsResponse.success && paymentsResponse.data) {
        setPaymentsData(paymentsResponse.data);
      }

      if (membersResponse.success && membersResponse.data) {
        setMembersData(membersResponse.data);
      }

      if (lockersResponse.success && lockersResponse.data) {
        setLockersData(lockersResponse.data.data);
      }

      if (staffResponse.success && staffResponse.data) {
        setStaffData(staffResponse.data);
      }

      if (dashboardResponse) {
        setDashboardStats(dashboardResponse);
      }

      console.log('모든 KPI 데이터 로드 완료');
    } catch (err: any) {
      const errorMessage = err.message || 'KPI 데이터를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('KPI 데이터 로딩 중 오류:', err);
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);
  
  const refreshData = () => {
    console.log('KPI 데이터 새로고침 시작');
    loadAllData().then(() => {
      showToast('success', 'KPI 데이터를 새로고침했습니다.');
    });
  };

  // KPI 데이터 계산
  const kpiData = useKPICalculations({
    paymentsData,
    membersData,
    lockersData,
    staffData,
    dashboardStats,
    startDate,
    endDate,
    statusFilter
  });

  // 카드 상세보기 클릭 핸들러
  const handleDetailClick = (cardId: string) => {
    const cardConfig = kpiCards.find(card => card.id === cardId);
    if (!cardConfig) {
      showToast('error', '카드 정보를 찾을 수 없습니다.');
      return;
    }

    const renderData = getKPICardRenderData(
      cardConfig,
      kpiData,
      paymentsData,
      membersData,
      startDate,
      endDate,
      viewType,
      statusFilter
    );

    if (!renderData) {
      showToast('error', '카드 데이터를 불러올 수 없습니다.');
      return;
    }

    setSelectedCardConfig(cardConfig);
    setSelectedCardData({
      value: renderData.value,
      change: renderData.change,
      chartData: renderData.chartData
    });
    setIsDetailModalOpen(true);
    
    console.log(`${cardConfig.title} 상세보기 열림`);
  };

  // 상세보기 모달 닫기
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCardConfig(null);
    setSelectedCardData(null);
  };

  const handleQuickDateRange = (rangeGetter: () => {start: string, end: string}) => {
    const {start, end} = rangeGetter();
    setStartDate(start);
    setEndDate(end);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-gray-50">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-lg text-gray-600">KPI 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-red-50">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg text-red-700 mb-2">오류가 발생했습니다.</p>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={refreshData}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center transition-colors"
        >
          <RefreshCw size={18} className="mr-2" />
          다시 시도
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">KPI 대시보드</h1>
            <p className="text-gray-600 mt-1">핵심 성과 지표를 한눈에 확인하세요.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openEditModal}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center transition-colors"
            >
              <Settings size={18} className="mr-2" />
              카드 편집
            </button>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center transition-colors"
              disabled={isLoading}
            >
              <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
          </div>
        </div>
      </header>

      {/* 필터 컨트롤 패널 */}
      <StatisticsFilters
        startDate={startDate}
        endDate={endDate}
        viewType={viewType}
        statusFilter={statusFilter}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onViewTypeChange={setViewType}
        onStatusFilterChange={setStatusFilter}
        onQuickDateRange={handleQuickDateRange}
      />

      {/* KPI 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {enabledCards.map(cardConfig => {
          const renderData = getKPICardRenderData(
            cardConfig,
            kpiData,
            paymentsData,
            membersData,
            startDate,
            endDate,
            viewType,
            statusFilter
          );
          
          if (!renderData) return null;
          
          return (
            <KPICard
              key={cardConfig.id}
              title={renderData.displayTitle}
              value={renderData.value}
              change={renderData.change}
              icon={cardConfig.icon}
              color={cardConfig.color}
              chartData={renderData.chartData}
              chartType={renderData.chartType}
              onDetailClick={() => handleDetailClick(cardConfig.id)}
            />
          );
        })}
      </div>

      {/* 카드 편집 모달 */}
      {isEditModalOpen && (
        <KPICardEditModal
          isOpen={isEditModalOpen}
          kpiCards={kpiCards}
          enabledCards={enabledCards}
          onClose={closeEditModal}
          onSave={handleSaveCardConfig}
          onToggleCard={toggleKPICard}
          onToggleAllCards={toggleAllCards}
          onToggleCategoryCards={toggleCategoryCards}
        />
      )}

      {/* KPI 상세보기 모달 */}
      <KPIDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        cardConfig={selectedCardConfig}
        kpiData={kpiData}
        chartData={selectedCardData?.chartData || []}
        value={selectedCardData?.value || ''}
        change={selectedCardData?.change}
        startDate={startDate}
        endDate={endDate}
        viewType={viewType}
        statusFilter={statusFilter}
        paymentsData={paymentsData}
        membersData={membersData}
        lockersData={lockersData}
        staffData={staffData}
      />

      {/* 요약 정보 */}
      <StatisticsSummary 
        kpiData={kpiData}
        startDate={startDate}
        endDate={endDate}
        viewType={viewType}
        statusFilter={statusFilter}
      />
    </div>
  );
};

export default Statistics; 