import React from 'react';
import { ConsultationStatistics as StatisticsType } from '../../types/consultation';
import { CONSULTATION_STATISTICS_CONFIG } from '../../config/consultationFilterConfig';

interface ConsultationStatisticsProps {
  statistics?: StatisticsType;
  isLoading?: boolean;
}

const ConsultationStatistics: React.FC<ConsultationStatisticsProps> = ({
  statistics,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${CONSULTATION_STATISTICS_CONFIG.CONTAINER.margin}`}>
        <div className={`${CONSULTATION_STATISTICS_CONFIG.CONTAINER.padding} grid grid-cols-1 md:grid-cols-5 ${CONSULTATION_STATISTICS_CONFIG.CONTAINER.gridGap}`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={CONSULTATION_STATISTICS_CONFIG.CARD.padding}>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { total = 0, pending = 0, inProgress = 0, completed = 0, followUp = 0 } = statistics || {};

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${CONSULTATION_STATISTICS_CONFIG.CONTAINER.margin}`}>
      <div className={`${CONSULTATION_STATISTICS_CONFIG.CONTAINER.padding} grid grid-cols-1 md:grid-cols-5 ${CONSULTATION_STATISTICS_CONFIG.CONTAINER.gridGap}`}>
        {/* 총 상담회원수 */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className={`${CONSULTATION_STATISTICS_CONFIG.CARD.labelSize} text-blue-600 font-medium`}>총 상담회원</p>
          <p className={`${CONSULTATION_STATISTICS_CONFIG.CARD.valueSize} font-bold text-blue-800 ${CONSULTATION_STATISTICS_CONFIG.CARD.marginTop}`}>
            {total}명
          </p>
        </div>

        {/* 대기 중 */}
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className={`${CONSULTATION_STATISTICS_CONFIG.CARD.labelSize} text-yellow-600 font-medium`}>대기 중</p>
          <p className={`${CONSULTATION_STATISTICS_CONFIG.CARD.valueSize} font-bold text-yellow-800 ${CONSULTATION_STATISTICS_CONFIG.CARD.marginTop}`}>
            {pending}명
            <span className={`${CONSULTATION_STATISTICS_CONFIG.CARD.percentageSize} font-normal ml-1`}>
              ({((pending / total) * 100 || 0).toFixed(1)}%)
            </span>
          </p>
        </div>

        {/* 진행 중 */}
        <div className="bg-green-50 p-3 rounded-lg">
          <p className={`${CONSULTATION_STATISTICS_CONFIG.CARD.labelSize} text-green-600 font-medium`}>진행 중</p>
          <p className={`${CONSULTATION_STATISTICS_CONFIG.CARD.valueSize} font-bold text-green-800 ${CONSULTATION_STATISTICS_CONFIG.CARD.marginTop}`}>
            {inProgress}명
            <span className={`${CONSULTATION_STATISTICS_CONFIG.CARD.percentageSize} font-normal ml-1`}>
              ({((inProgress / total) * 100 || 0).toFixed(1)}%)
            </span>
          </p>
        </div>

        {/* 완료 */}
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className={`${CONSULTATION_STATISTICS_CONFIG.CARD.labelSize} text-purple-600 font-medium`}>완료</p>
          <p className={`${CONSULTATION_STATISTICS_CONFIG.CARD.valueSize} font-bold text-purple-800 ${CONSULTATION_STATISTICS_CONFIG.CARD.marginTop}`}>
            {completed}명
            <span className={`${CONSULTATION_STATISTICS_CONFIG.CARD.percentageSize} font-normal ml-1`}>
              ({((completed / total) * 100 || 0).toFixed(1)}%)
            </span>
          </p>
        </div>

        {/* 추가 상담 필요 */}
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className={`${CONSULTATION_STATISTICS_CONFIG.CARD.labelSize} text-orange-600 font-medium`}>추가 상담</p>
          <p className={`${CONSULTATION_STATISTICS_CONFIG.CARD.valueSize} font-bold text-orange-800 ${CONSULTATION_STATISTICS_CONFIG.CARD.marginTop}`}>
            {followUp}명
            <span className={`${CONSULTATION_STATISTICS_CONFIG.CARD.percentageSize} font-normal ml-1`}>
              ({((followUp / total) * 100 || 0).toFixed(1)}%)
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConsultationStatistics; 