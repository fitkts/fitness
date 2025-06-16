import React from 'react';
import { MemberStatistics as StatisticsType } from '../../types/member';

interface MemberStatisticsProps {
  statistics?: StatisticsType;
  isLoading?: boolean;
}

const MemberStatistics: React.FC<MemberStatisticsProps> = ({
  statistics,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg animate-pulse">
              <div 
                className="h-4 bg-gray-300 rounded mb-2" 
                data-testid="skeleton"
              />
              <div className="h-8 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const { total, active, expired, expiringIn30Days } = statistics;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 총 회원수 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">총 회원수</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">
            {total}명
          </p>
        </div>

        {/* 활성 회원 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 font-medium">활성 회원</p>
          <p className="text-2xl font-bold text-green-800 mt-1">
            {active}명
            <span className="text-sm font-normal ml-1">
              ({((active / total) * 100 || 0).toFixed(1)}%)
            </span>
          </p>
        </div>

        {/* 만료 회원 */}
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600 font-medium">만료 회원</p>
          <p className="text-2xl font-bold text-red-800 mt-1">
            {expired}명
            <span className="text-sm font-normal ml-1">
              ({((expired / total) * 100 || 0).toFixed(1)}%)
            </span>
          </p>
        </div>

        {/* 30일 내 만료 예정 */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600 font-medium">
            30일 내 만료 예정
          </p>
          <p className="text-2xl font-bold text-yellow-800 mt-1">
            {expiringIn30Days}명
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberStatistics; 