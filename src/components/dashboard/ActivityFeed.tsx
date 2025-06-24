import React from 'react';
import { 
  UserPlus, 
  Calendar, 
  MessageCircle, 
  CreditCard, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { RecentActivities } from '../../types/dashboard';
import { createCardStyle, getTypographyClass, getStatusBadgeStyle } from '../../utils/designSystemUtils';
import { formatTimeAgo, formatTime } from '../../utils/dashboardUtils';

interface ActivityFeedProps {
  activities: RecentActivities;
  isLoading?: boolean;
  maxItems?: number;
}

interface ActivityItem {
  id: string;
  type: 'member_join' | 'attendance' | 'consultation' | 'payment' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
  metadata?: {
    memberName?: string;
    amount?: number;
    membershipType?: string;
    status?: string;
  };
}

// 활동 아이템 생성 함수
const createActivityItems = (activities: RecentActivities): ActivityItem[] => {
  const items: ActivityItem[] = [];

  // 최근 가입 회원
  activities.recentMembers?.forEach(member => {
    items.push({
      id: `member-${member.id}`,
      type: 'member_join',
      title: '새 회원 가입',
      description: `${member.name}님이 회원으로 등록되었습니다`,
      timestamp: member.joinDate,
      icon: <UserPlus className="w-4 h-4" />,
      color: 'blue',
      metadata: {
        memberName: member.name,
        membershipType: member.membershipType,
      },
    });
  });

  // 최근 출석
  activities.recentAttendance?.forEach(attendance => {
    items.push({
      id: `attendance-${attendance.id}`,
      type: 'attendance',
      title: '회원 출석',
      description: `${attendance.name}님이 체크인했습니다`,
      timestamp: attendance.visitDate,
      icon: <Calendar className="w-4 h-4" />,
      color: 'green',
      metadata: {
        memberName: attendance.name,
        membershipType: attendance.membershipType,
      },
    });
  });

  // 최근 상담 (있는 경우)
  activities.recentConsultations?.forEach(consultation => {
    items.push({
      id: `consultation-${consultation.id}`,
      type: 'consultation',
      title: '상담 활동',
      description: `${consultation.name}님 상담이 ${consultation.status === 'completed' ? '완료' : '진행 중'}입니다`,
      timestamp: consultation.consultationDate,
      icon: <MessageCircle className="w-4 h-4" />,
      color: consultation.status === 'completed' ? 'green' : 'yellow',
      metadata: {
        memberName: consultation.name,
        status: consultation.status,
      },
    });
  });

  // 시간순 정렬 (최신순)
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// 개별 활동 아이템 컴포넌트
const ActivityItem: React.FC<{ 
  item: ActivityItem; 
  isLast: boolean;
}> = ({ item, isLast }) => {
  const getIconBgColor = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusMap = {
      'pending': 'warning',
      'in_progress': 'warning', 
      'completed': 'active',
      'cancelled': 'inactive',
    };
    
    const badgeType = statusMap[status as keyof typeof statusMap] || 'inactive';
    
    return (
      <span className={getStatusBadgeStyle(badgeType as any)}>
        {status === 'completed' ? '완료' : 
         status === 'in_progress' ? '진행중' : 
         status === 'pending' ? '대기' : '취소'}
      </span>
    );
  };

  return (
    <div className="flex items-start space-x-3 pb-4 last:pb-0">
      {/* 아이콘과 연결선 */}
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-full ${getIconBgColor(item.color)}`}>
          {item.icon}
        </div>
        {!isLast && (
          <div className="w-px h-8 bg-gray-200 mt-2"></div>
        )}
      </div>
      
      {/* 활동 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={`${getTypographyClass('bodyText')} font-medium text-gray-900`}>
            {item.title}
          </p>
          <div className="flex items-center space-x-2">
            {getStatusBadge(item.metadata?.status)}
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatTime(item.timestamp)}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-1">
          {item.description}
        </p>
        
        {/* 추가 메타데이터 */}
        {item.metadata && (
          <div className="flex items-center space-x-4 mt-2">
            {item.metadata.membershipType && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {item.metadata.membershipType}
              </span>
            )}
            {item.metadata.amount && (
              <span className="text-xs text-green-600 font-medium">
                {new Intl.NumberFormat('ko-KR', {
                  style: 'currency',
                  currency: 'KRW',
                  minimumFractionDigits: 0,
                }).format(item.metadata.amount)}
              </span>
            )}
          </div>
        )}
        
        <p className="text-xs text-gray-400 mt-1">
          {formatTimeAgo(item.timestamp)}
        </p>
      </div>
    </div>
  );
};

// 로딩 상태 컴포넌트
const ActivityItemSkeleton: React.FC<{ isLast: boolean }> = ({ isLast }) => (
  <div className="flex items-start space-x-3 pb-4 last:pb-0 animate-pulse">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      {!isLast && <div className="w-px h-8 bg-gray-200 mt-2"></div>}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-3 bg-gray-200 rounded w-12"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

// 메인 활동 피드 컴포넌트
const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  isLoading = false, 
  maxItems = 10 
}) => {
  const activityItems = createActivityItems(activities);
  const displayItems = activityItems.slice(0, maxItems);

  return (
    <div className={createCardStyle('default')}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${getTypographyClass('sectionTitle')} text-gray-800`}>
          최근 활동
        </h3>
        <span className="text-sm text-gray-500">
          실시간 업데이트
        </span>
      </div>

      <div className="space-y-0">
        {isLoading ? (
          // 로딩 상태
          Array.from({ length: 5 }).map((_, index) => (
            <ActivityItemSkeleton 
              key={index} 
              isLast={index === 4} 
            />
          ))
        ) : displayItems.length > 0 ? (
          // 활동 목록
          displayItems.map((item, index) => (
            <ActivityItem
              key={item.id}
              item={item}
              isLast={index === displayItems.length - 1}
            />
          ))
        ) : (
          // 빈 상태
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">
              최근 활동 내역이 없습니다
            </p>
            <p className="text-gray-400 text-xs mt-1">
              회원 활동이 있으면 여기에 표시됩니다
            </p>
          </div>
        )}
      </div>

      {/* 더 보기 버튼 */}
      {!isLoading && activityItems.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            더 많은 활동 보기 ({activityItems.length - maxItems}개 더)
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed; 