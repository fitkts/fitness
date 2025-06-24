import React from 'react';
import { 
  Users, 
  UserCheck, 
  MessageCircle, 
  Calendar, 
  Key, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { KPICard as KPICardType } from '../../types/dashboard';
import { getGridStyle, createCardStyle, getTypographyClass, getColorClass } from '../../utils/designSystemUtils';

interface KPICardGridProps {
  cards: KPICardType[];
  isLoading?: boolean;
  onCardClick?: (card: KPICardType) => void;
}

// 아이콘 매필링
const iconMap = {
  Users,
  UserCheck,
  MessageCircle,
  Calendar,
  Key,
  CreditCard,
  TrendingUp,
  AlertCircle,
};

// 개별 KPI 카드 컴포넌트
const KPICard: React.FC<{ 
  card: KPICardType; 
  onClick?: () => void; 
  isLoading?: boolean;
}> = ({ card, onClick, isLoading }) => {
  const IconComponent = iconMap[card.icon as keyof typeof iconMap];
  
  const getCardColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      red: 'from-red-500 to-red-600',
      purple: 'from-purple-500 to-purple-600',
      indigo: 'from-indigo-500 to-indigo-600',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconBackgroundColor = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (isLoading) {
    return (
      <div className={`${createCardStyle('stats')} animate-pulse`} data-testid="stat-card-loading">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${createCardStyle('stats')} cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg relative overflow-hidden group`}
      onClick={onClick}
      data-testid="stat-card"
    >
      {/* 그라디언트 배경 */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getCardColorClasses(card.color)} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex-1">
          <p className={`${getTypographyClass('caption')} text-gray-600 mb-1`}>
            {card.title}
          </p>
          <p className={`${getTypographyClass('cardTitle')} text-gray-900 mb-1`}>
            {card.value}
          </p>
          <p className="text-xs text-gray-500">
            {card.subtitle}
          </p>
          
          {/* 트렌드 표시 */}
          {card.trend && (
            <div className="flex items-center mt-2">
              {card.trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs ${card.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {typeof card.trend.value === 'number' ? 
                  `${card.trend.value > 0 ? '+' : ''}${card.trend.value}` : 
                  card.trend.value
                }
              </span>
              <span className="text-xs text-gray-500 ml-1">
                {card.trend.period}
              </span>
            </div>
          )}
        </div>
        
        {/* 아이콘 */}
        <div className={`p-3 rounded-lg ${getIconBackgroundColor(card.color)} group-hover:scale-110 transition-transform duration-200`}>
          {IconComponent && <IconComponent className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
};

// KPI 카드 그리드 컴포넌트
const KPICardGrid: React.FC<KPICardGridProps> = ({ 
  cards, 
  isLoading = false, 
  onCardClick 
}) => {
  const handleCardClick = (card: KPICardType) => {
    if (onCardClick) {
      onCardClick(card);
    } else if (card.actionUrl) {
      // 라우팅 로직 (실제 구현에서는 React Router 사용)
      console.log(`Navigate to: ${card.actionUrl}`);
    }
  };

  return (
    <div className="mb-6">
      <div className={getGridStyle(4)}>
        {isLoading 
          ? Array.from({ length: 8 }).map((_, index) => (
              <KPICard 
                key={index}
                card={{} as KPICardType}
                isLoading={true}
              />
            ))
          : cards.map((card) => (
              <KPICard
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card)}
              />
            ))
        }
      </div>
    </div>
  );
};

export default KPICardGrid; 