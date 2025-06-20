import React from 'react';
import { MemberStatistics as StatisticsType } from '../../types/member';
import { STATISTICS_COMPACT_CONFIG } from '../../config/memberConfig';

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
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${STATISTICS_COMPACT_CONFIG.CONTAINER.margin}`}>
        <div className={`${STATISTICS_COMPACT_CONFIG.CONTAINER.padding} grid grid-cols-1 md:grid-cols-4 ${STATISTICS_COMPACT_CONFIG.CONTAINER.gridGap}`}>
          {[...Array(4)].map((_, index) => (
            <div key={index} className={`bg-gray-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg animate-pulse`}>
              <div 
                className={`${STATISTICS_COMPACT_CONFIG.SKELETON.height} bg-gray-300 rounded ${STATISTICS_COMPACT_CONFIG.SKELETON.margin}`}
                data-testid="skeleton"
              />
              <div className={`${STATISTICS_COMPACT_CONFIG.SKELETON.valueHeight} bg-gray-300 rounded`} />
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
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${STATISTICS_COMPACT_CONFIG.CONTAINER.margin}`}>
      <div className={`${STATISTICS_COMPACT_CONFIG.CONTAINER.padding} grid grid-cols-1 md:grid-cols-4 ${STATISTICS_COMPACT_CONFIG.CONTAINER.gridGap}`}>
        {/* 총 회원수 */}
        <div className={`bg-blue-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-blue-600 font-medium`}>총 회원수</p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.valueSize} font-bold text-blue-800 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {total}명
          </p>
        </div>

        {/* 활성 회원 */}
        <div className={`bg-green-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-green-600 font-medium`}>활성 회원</p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.valueSize} font-bold text-green-800 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {active}명
            <span className={`${STATISTICS_COMPACT_CONFIG.CARD.percentageSize} font-normal ml-1`}>
              ({((active / total) * 100 || 0).toFixed(1)}%)
            </span>
          </p>
        </div>

        {/* 만료 회원 */}
        <div className={`bg-red-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-red-600 font-medium`}>만료 회원</p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.valueSize} font-bold text-red-800 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {expired}명
            <span className={`${STATISTICS_COMPACT_CONFIG.CARD.percentageSize} font-normal ml-1`}>
              ({((expired / total) * 100 || 0).toFixed(1)}%)
            </span>
          </p>
        </div>

        {/* 30일 내 만료 예정 */}
        <div className={`bg-yellow-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-yellow-600 font-medium`}>
            30일 내 만료 예정
          </p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.valueSize} font-bold text-yellow-800 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {expiringIn30Days}명
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberStatistics; 