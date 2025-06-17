import React from 'react';
import { PaymentStatistics as StatisticsType } from '../../types/payment';
import { formatCurrency, formatNumber } from '../../utils/paymentUtils';
import { DollarSign, TrendingUp, CreditCard, AlertTriangle } from 'lucide-react';

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 총 결제 건수 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">총 결제 건수</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">
                {formatNumber(totalPayments)}건
              </p>
            </div>
            <DollarSign className="text-blue-500" size={24} />
          </div>
        </div>

        {/* 총 결제 금액 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">총 결제 금액</p>
              <p className="text-2xl font-bold text-green-800 mt-1">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
        </div>

        {/* 완료된 결제 */}
        <div className="bg-emerald-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">완료된 결제</p>
              <p className="text-2xl font-bold text-emerald-800 mt-1">
                {formatNumber(completedPayments)}건
                <span className="text-sm font-normal ml-1">
                  ({((completedPayments / totalPayments) * 100 || 0).toFixed(1)}%)
                </span>
              </p>
              <p className="text-sm text-emerald-600 mt-1">
                {formatCurrency(completedAmount)}
              </p>
            </div>
            <CreditCard className="text-emerald-500" size={24} />
          </div>
        </div>

        {/* 평균 결제 금액 */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">평균 결제 금액</p>
              <p className="text-2xl font-bold text-purple-800 mt-1">
                {formatCurrency(averageAmount)}
              </p>
              {canceledPayments > 0 && (
                <p className="text-sm text-red-600 mt-1">
                  취소: {formatNumber(canceledPayments)}건 ({formatCurrency(canceledAmount)})
                </p>
              )}
            </div>
            <AlertTriangle className="text-purple-500" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatistics; 