import React from 'react';
import { PaymentStatistics as StatisticsType } from '../../types/payment';
import { formatCurrency, formatNumber } from '../../utils/paymentUtils';
import { STATISTICS_COMPACT_CONFIG } from '../../config/memberConfig';

interface PaymentStatisticsProps {
  statistics?: StatisticsType;
  isLoading?: boolean;
}

const PaymentStatistics: React.FC<PaymentStatisticsProps> = ({
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

  const { 
    totalPayments, 
    totalAmount, 
    completedPayments, 
    completedAmount,
    canceledPayments,
    canceledAmount,
    averageAmount 
  } = statistics;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${STATISTICS_COMPACT_CONFIG.CONTAINER.margin}`}>
      <div className={`${STATISTICS_COMPACT_CONFIG.CONTAINER.padding} grid grid-cols-1 md:grid-cols-4 ${STATISTICS_COMPACT_CONFIG.CONTAINER.gridGap}`}>
        {/* 총 결제 건수 */}
        <div className={`bg-blue-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-blue-600 font-medium`}>총 결제 건수</p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.valueSize} font-bold text-blue-800 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {formatNumber(totalPayments)}건
          </p>
        </div>

        {/* 총 결제 금액 */}
        <div className={`bg-green-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-green-600 font-medium`}>총 결제 금액</p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.valueSize} font-bold text-green-800 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {formatCurrency(totalAmount)}
          </p>
        </div>

        {/* 완료된 결제 */}
        <div className={`bg-emerald-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-emerald-600 font-medium`}>완료된 결제</p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.valueSize} font-bold text-emerald-800 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {formatNumber(completedPayments)}건
            <span className={`${STATISTICS_COMPACT_CONFIG.CARD.percentageSize} font-normal ml-1`}>
              ({((completedPayments / totalPayments) * 100 || 0).toFixed(1)}%)
            </span>
          </p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-emerald-600 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {formatCurrency(completedAmount)}
          </p>
        </div>

        {/* 평균 결제 금액 */}
        <div className={`bg-purple-50 ${STATISTICS_COMPACT_CONFIG.CARD.padding} rounded-lg`}>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-purple-600 font-medium`}>평균 결제 금액</p>
          <p className={`${STATISTICS_COMPACT_CONFIG.CARD.valueSize} font-bold text-purple-800 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
            {formatCurrency(averageAmount)}
          </p>
          {canceledPayments > 0 && (
            <p className={`${STATISTICS_COMPACT_CONFIG.CARD.labelSize} text-red-600 ${STATISTICS_COMPACT_CONFIG.CARD.marginTop}`}>
              취소: {formatNumber(canceledPayments)}건 ({formatCurrency(canceledAmount)})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatistics; 