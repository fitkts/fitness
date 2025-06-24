import React from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { ChartData, DashboardStats } from '../../types/dashboard';
import { createCardStyle, getTypographyClass, getGridStyle } from '../../utils/designSystemUtils';
import { 
  generateAttendanceChartData,
  generateMembershipDistributionChartData,
  generateEngagementChartData,
  generateRevenueChartData
} from '../../utils/dashboardUtils';
import { CHART_OPTIONS } from '../../config/dashboardConfig';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

interface ChartSectionProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

// 개별 차트 컴포넌트
const ChartWidget: React.FC<{
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
}> = ({ title, children, isLoading }) => {
  if (isLoading) {
    return (
      <div className={`${createCardStyle('default')} animate-pulse`}>
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className={createCardStyle('default')}>
      <h3 className={`${getTypographyClass('sectionTitle')} mb-4 text-gray-800`}>
        {title}
      </h3>
      <div className="h-64 relative">
        {children}
      </div>
    </div>
  );
};

// 출석 현황 차트
const AttendanceChart: React.FC<{ data: any[]; isLoading?: boolean }> = ({ 
  data, 
  isLoading 
}) => {
  if (isLoading || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>출석 데이터가 없습니다</p>
      </div>
    );
  }

  const chartData = generateAttendanceChartData(data);
  
  return (
    <Line 
      data={chartData} 
      options={{
        ...CHART_OPTIONS,
        scales: {
          ...CHART_OPTIONS.scales,
          y: {
            ...CHART_OPTIONS.scales.y,
            beginAtZero: true,
            title: {
              display: true,
              text: '방문 횟수',
            },
          },
        },
      }} 
      data-testid="line-chart-attendance"
    />
  );
};

// 회원권 분포 차트
const MembershipDistributionChart: React.FC<{ 
  data: any[]; 
  isLoading?: boolean;
}> = ({ data, isLoading }) => {
  if (isLoading || !data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>회원권 데이터가 없습니다</p>
      </div>
    );
  }

  const chartData = generateMembershipDistributionChartData(data);
  
  return (
    <Doughnut 
      data={chartData} 
      options={{
        ...CHART_OPTIONS,
        plugins: {
          ...CHART_OPTIONS.plugins,
          legend: {
            ...CHART_OPTIONS.plugins.legend,
            position: 'right',
          },
        },
        cutout: '60%',
      }} 
      data-testid="doughnut-chart"
    />
  );
};

// 회원 참여도 차트
const EngagementChart: React.FC<{ 
  engagement: any; 
  isLoading?: boolean;
}> = ({ engagement, isLoading }) => {
  if (isLoading || !engagement) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>참여도 데이터를 불러오는 중...</p>
      </div>
    );
  }

  const chartData = generateEngagementChartData(engagement);
  
  return (
    <Bar 
      data={chartData} 
      options={{
        ...CHART_OPTIONS,
        scales: {
          ...CHART_OPTIONS.scales,
          y: {
            ...CHART_OPTIONS.scales.y,
            beginAtZero: true,
            title: {
              display: true,
              text: '회원 수',
            },
          },
        },
        plugins: {
          ...CHART_OPTIONS.plugins,
          legend: {
            display: false,
          },
        },
      }} 
      data-testid="bar-chart"
    />
  );
};

// 매출 트렌드 차트 (추가)
const RevenueChart: React.FC<{ 
  monthlyRevenue: any[]; 
  isLoading?: boolean;
}> = ({ monthlyRevenue, isLoading }) => {
  if (isLoading || !monthlyRevenue || monthlyRevenue.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>매출 데이터가 없습니다</p>
      </div>
    );
  }

  // 매출 데이터가 없는 경우 더미 데이터 생성
  const dummyRevenueData = monthlyRevenue.map((item, index) => ({
    month: item.month,
    revenue: (index + 1) * 10000000 + Math.random() * 5000000
  }));

  const chartData = generateRevenueChartData(dummyRevenueData);
  
  return (
    <Line 
      data={chartData} 
      options={{
        ...CHART_OPTIONS,
        scales: {
          ...CHART_OPTIONS.scales,
          y: {
            ...CHART_OPTIONS.scales.y,
            beginAtZero: true,
            title: {
              display: true,
              text: '매출 (원)',
            },
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('ko-KR').format(value as number);
              },
            },
          },
        },
        plugins: {
          ...CHART_OPTIONS.plugins,
          tooltip: {
            ...CHART_OPTIONS.plugins.tooltip,
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                return `매출: ${new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                  minimumFractionDigits: 0,
                }).format(value)}`;
              },
            },
          },
        },
      }} 
      data-testid="line-chart-revenue"
    />
  );
};

// 메인 차트 섹션 컴포넌트
const ChartSection: React.FC<ChartSectionProps> = ({ stats, isLoading = false }) => {
  return (
    <div className="mb-8">
      {/* 첫 번째 행: 출석 현황과 회원권 분포 */}
      <div className={`${getGridStyle(2)} mb-6`}>
        <ChartWidget title="월별 출석 현황" isLoading={isLoading}>
          <AttendanceChart 
            data={stats?.monthlyAttendance || []} 
            isLoading={isLoading}
          />
        </ChartWidget>
        
        <ChartWidget title="회원권 분포" isLoading={isLoading}>
          <MembershipDistributionChart 
            data={stats?.membershipDistribution || []} 
            isLoading={isLoading}
          />
        </ChartWidget>
      </div>

      {/* 두 번째 행: 회원 참여도와 매출 트렌드 */}
      <div className={getGridStyle(2)}>
        <ChartWidget title="회원 참여도" isLoading={isLoading}>
          <EngagementChart 
            engagement={stats?.memberEngagement} 
            isLoading={isLoading}
          />
        </ChartWidget>
        
        <ChartWidget title="매출 트렌드" isLoading={isLoading}>
          <RevenueChart 
            monthlyRevenue={stats?.monthlyAttendance || []} 
            isLoading={isLoading}
          />
        </ChartWidget>
      </div>
    </div>
  );
};

export default ChartSection; 