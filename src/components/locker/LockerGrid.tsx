import React from 'react';
import { Locker } from '../../models/types';
import { LockerAction, GRID_COMPACT_CONFIG } from '../../config/lockerConfig';
import LockerCard from './LockerCard';

interface LockerGridProps {
  lockers: Locker[];
  onAction: (action: LockerAction, locker: Locker) => void;
  isLoading?: boolean;
  layoutDirection?: 'row' | 'column';
}

const LockerGrid: React.FC<LockerGridProps> = ({ 
  lockers, 
  onAction,
  isLoading = false,
  layoutDirection = 'row'
}) => {
  // 레이아웃 방향에 따른 그리드 스타일
  const getGridClasses = () => {
    if (layoutDirection === 'column') {
      // 열 우선: 세로로 먼저 채우고 가로로 확장
      return "grid gap-2 auto-cols-max";
    }
    // 행 우선: 기본 그리드 (가로로 먼저 채우고 세로로 확장)
    return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2";
  };

  const getGridStyle = () => {
    if (layoutDirection === 'column') {
      // 열 우선: rows를 동적으로 계산하고 column flow 사용
      const itemsPerColumn = Math.ceil(lockers.length / 8); // 최대 8개 컬럼 가정
      return { 
        gridTemplateRows: `repeat(${Math.min(itemsPerColumn, 10)}, minmax(0, 1fr))`, // 최대 10행
        gridAutoFlow: 'column',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' // 최소 200px 너비
      };
    }
    return { gridAutoFlow: 'row' };
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className={`text-center ${GRID_COMPACT_CONFIG.EMPTY_STATE.padding}`}>
        <div className={`animate-spin rounded-full ${GRID_COMPACT_CONFIG.EMPTY_STATE.containerSize.replace('w-', 'h-').replace('h-', 'w-')} border-b-2 border-gray-600 mx-auto mb-4`}></div>
        <p className={`${GRID_COMPACT_CONFIG.EMPTY_STATE.subtitleSize} text-gray-600`}>락커 목록을 불러오는 중...</p>
      </div>
    );
  }

  // 락커가 없는 경우
  if (lockers.length === 0) {
    return (
      <div className={`text-center ${GRID_COMPACT_CONFIG.EMPTY_STATE.padding}`}>
        <div className={`mx-auto ${GRID_COMPACT_CONFIG.EMPTY_STATE.containerSize} bg-gray-100 rounded-full flex items-center justify-center ${GRID_COMPACT_CONFIG.EMPTY_STATE.spacing}`}>
          <svg 
            className={`w-${GRID_COMPACT_CONFIG.EMPTY_STATE.iconSize} h-${GRID_COMPACT_CONFIG.EMPTY_STATE.iconSize} text-gray-400`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        <h3 className={`${GRID_COMPACT_CONFIG.EMPTY_STATE.titleSize} font-medium text-gray-900 mb-2`}>
          락커가 없습니다
        </h3>
        <p className={`${GRID_COMPACT_CONFIG.EMPTY_STATE.subtitleSize} text-gray-500 mb-6`}>
          새 락커를 추가하여 시작해보세요.
        </p>
      </div>
    );
  }

  // 락커 목록 표시
  return (
    <div className={`${getGridClasses()} ${GRID_COMPACT_CONFIG.CONTAINER.gap}`} style={getGridStyle()}>
      {lockers.map((locker) => (
        <LockerCard
          key={locker.id || locker.number}
          locker={locker}
          onAction={onAction}
        />
      ))}
    </div>
  );
};

export default LockerGrid; 