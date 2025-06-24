import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X, 
  AlertCircle,
  Calendar,
  Users,
  TrendingDown,
  Bell
} from 'lucide-react';
import { DashboardAlert, UpcomingExpiry, MemberEngagement } from '../../types/dashboard';
import { createCardStyle, getTypographyClass, getButtonStyle } from '../../utils/designSystemUtils';
import { generateExpiryAlerts, generateEngagementAlerts } from '../../utils/dashboardUtils';

interface AlertsPanelProps {
  upcomingExpiry: UpcomingExpiry;
  memberEngagement: MemberEngagement;
  systemAlerts?: DashboardAlert[];
  isLoading?: boolean;
  onAlertClick?: (alert: DashboardAlert) => void;
  onAlertDismiss?: (alertId: string) => void;
}

// 알림 타입별 아이콘과 색상 매핑
const getAlertStyle = (type: DashboardAlert['type']) => {
  const styles = {
    info: {
      icon: <Info className="w-4 h-4" />,
      bgColor: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4" />,
      bgColor: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-600',
    },
    error: {
      icon: <AlertCircle className="w-4 h-4" />,
      bgColor: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-600',
    },
    success: {
      icon: <CheckCircle className="w-4 h-4" />,
      bgColor: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
    },
  };
  return styles[type] || styles.info;
};

// 개별 알림 컴포넌트
const AlertItem: React.FC<{
  alert: DashboardAlert;
  onDismiss?: (id: string) => void;
  onClick?: (alert: DashboardAlert) => void;
}> = ({ alert, onDismiss, onClick }) => {
  const style = getAlertStyle(alert.type);

  return (
    <div 
      className={`${style.bgColor} border rounded-lg p-3 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-all duration-200`}
      onClick={() => onClick?.(alert)}
    >
      <div className="flex items-start space-x-3">
        <div className={style.iconColor}>
          {style.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`${getTypographyClass('bodyText')} font-medium ${style.textColor}`}>
            {alert.title}
          </h4>
          <p className={`text-sm ${style.textColor} opacity-90 mt-1`}>
            {alert.message}
          </p>
          
          {alert.actionText && alert.actionUrl && (
            <button 
              className={`${getButtonStyle('outline')} mt-2 text-xs px-2 py-1 ${style.textColor} border-current hover:bg-current hover:bg-opacity-10`}
              onClick={(e) => {
                e.stopPropagation();
                // 실제 구현에서는 라우팅 처리
                console.log(`Navigate to: ${alert.actionUrl}`);
              }}
            >
              {alert.actionText}
            </button>
          )}
          
          <p className="text-xs opacity-60 mt-2">
            {new Date(alert.timestamp).toLocaleString('ko-KR')}
          </p>
        </div>
        
        {onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(alert.id);
            }}
            className={`${style.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// 요약 카드 컴포넌트
const SummaryCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'red' | 'green';
  subtitle?: string;
  onClick?: () => void;
}> = ({ title, value, icon, color, subtitle, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
  };

  return (
    <div 
      className={`${colorClasses[color]} border rounded-lg p-3 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-all duration-200`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-white bg-opacity-50 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">
            {title}
          </p>
          <p className="text-lg font-bold">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs opacity-75">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// 로딩 상태 컴포넌트
const AlertSkeleton: React.FC = () => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 animate-pulse">
    <div className="flex items-start space-x-3">
      <div className="w-4 h-4 bg-gray-300 rounded"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

// 메인 알림 패널 컴포넌트
const AlertsPanel: React.FC<AlertsPanelProps> = ({
  upcomingExpiry,
  memberEngagement,
  systemAlerts = [],
  isLoading = false,
  onAlertClick,
  onAlertDismiss,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // 알림 생성
  const expiryAlerts = generateExpiryAlerts(upcomingExpiry);
  const engagementAlerts = generateEngagementAlerts(memberEngagement);
  
  // 모든 알림 합치기
  const allAlerts = [
    ...expiryAlerts,
    ...engagementAlerts,
    ...systemAlerts,
  ].filter(alert => !dismissedAlerts.includes(alert.id));

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    onAlertDismiss?.(alertId);
  };

  return (
    <div className="space-y-6">
      {/* 요약 카드들 */}
      <div className={createCardStyle('default')}>
        <h3 className={`${getTypographyClass('sectionTitle')} mb-4 text-gray-800`}>
          주요 알림 현황
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            title="이번 주 만료"
            value={upcomingExpiry.thisWeek}
            icon={<Calendar className="w-4 h-4" />}
            color="red"
            subtitle="회원권 만료"
            onClick={() => console.log('Navigate to expiring members')}
          />
          
          <SummaryCard
            title="이번 달 만료"
            value={upcomingExpiry.thisMonth}
            icon={<Calendar className="w-4 h-4" />}
            color="yellow"
            subtitle="연장 안내 필요"
            onClick={() => console.log('Navigate to monthly expiring')}
          />
          
          <SummaryCard
            title="낮은 참여도"
            value={memberEngagement.lowEngagement}
            icon={<TrendingDown className="w-4 h-4" />}
            color="yellow"
            subtitle="관리 필요 회원"
            onClick={() => console.log('Navigate to low engagement')}
          />
          
          <SummaryCard
            title="전체 알림"
            value={allAlerts.length}
            icon={<Bell className="w-4 h-4" />}
            color="blue"
            subtitle="확인 필요"
          />
        </div>
      </div>

      {/* 상세 알림 목록 */}
      <div className={createCardStyle('default')}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${getTypographyClass('sectionTitle')} text-gray-800`}>
            알림 상세
          </h3>
          <span className="text-sm text-gray-500">
            {allAlerts.length}개의 알림
          </span>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            // 로딩 상태
            Array.from({ length: 3 }).map((_, index) => (
              <AlertSkeleton key={index} />
            ))
          ) : allAlerts.length > 0 ? (
            // 알림 목록
            allAlerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onDismiss={handleDismiss}
                onClick={onAlertClick}
              />
            ))
          ) : (
            // 빈 상태
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 font-medium">
                모든 알림을 확인했습니다
              </p>
              <p className="text-gray-400 text-sm mt-1">
                새로운 알림이 있으면 여기에 표시됩니다
              </p>
            </div>
          )}
        </div>

        {/* 전체 알림 보기 버튼 */}
        {allAlerts.length > 5 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button 
              className={`${getButtonStyle('outline')} w-full`}
              onClick={() => console.log('Show all alerts')}
            >
              모든 알림 보기 ({allAlerts.length}개)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel; 