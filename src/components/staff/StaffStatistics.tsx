import React from 'react';
import { StaffStatisticsData } from '../../types/staff';
import { STATISTICS_COMPACT_CONFIG } from '../../config/staffConfig';

interface StaffStatisticsProps {
  statistics?: StaffStatisticsData;
  isLoading?: boolean;
}

const StaffStatistics: React.FC<StaffStatisticsProps> = ({
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

  const { total, active, inactive, byPosition } = statistics;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${STATISTICS_COMPACT_CONFIG.CONTAINER.margin}`}>
      <div className={`${STATISTICS_COMPACT_CONFIG.CONTAINER.padding} grid grid-cols-1 md:grid-cols-4 ${STATISTICS_COMPACT_CONFIG.CONTAINER.gridGap}`}>
        {/* 총 직원수 */}
        <div className={`bg-blue-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-blue-600 font-medium`}>총 직원수</p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.valueSize} font-bold text-blue-800 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {total}명
          </p>
        </div>

        {/* 재직 중 */}
        <div className={`bg-green-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-green-600 font-medium`}>재직 중</p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.valueSize} font-bold text-green-800 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {active}명
            <span className={`${STATISTICS_COMPACT_CONFIG.CARD.percentageSize} font-normal ml-1`}>
              ({((active / total) * 100 || 0).toFixed(1)}%)
            </span>
          </p>
        </div>

        {/* 퇴사 */}
        <div className={`bg-red-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-red-600 font-medium`}>퇴사</p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.valueSize} font-bold text-red-800 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {inactive}명
            <span className={`${STATISTICS_COMPACT_CONFIG.CARD.percentageSize} font-normal ml-1`}>
              ({((inactive / total) * 100 || 0).toFixed(1)}%)
            </span>
          </p>
        </div>

        {/* 직책별 현황 */}
        <div className={`bg-yellow-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-yellow-600 font-medium`}>
            직책별 현황
          </p>
          <div className={`${STATISTICS_COMPACT_CONFIG.CARD.marginTop} space-y-1`}>
            {Object.entries(byPosition).slice(0, 3).map(([position, count]) => (
              <div key={position} className="text-xs text-yellow-800">
                {position}: {count}명
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffStatistics; 