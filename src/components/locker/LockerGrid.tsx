import React from 'react';
import { Locker } from '../../models/types';
import { LockerAction } from '../../config/lockerConfig';
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
      return "grid gap-3 auto-cols-max";
    }
    // 행 우선: 기본 그리드 (가로로 먼저 채우고 세로로 확장)
    return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3";
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

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={getGridClasses()}>
        {Array.from({ length: 16 }).map((_, index) => (
          <div
            key={index}
            className="p-3 rounded-lg border animate-pulse bg-gray-50"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="flex gap-1">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 락커가 없는 경우
  if (lockers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg 
            className="w-12 h-12 text-gray-400" 
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          락커가 없습니다
        </h3>
        <p className="text-gray-500 mb-6">
          새 락커를 추가하여 시작해보세요.
        </p>
      </div>
    );
  }

  // 락커 목록 표시
  return (
    <div className={getGridClasses()} style={getGridStyle()}>
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