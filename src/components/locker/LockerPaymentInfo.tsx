import React from 'react';
import { LockerPaymentInfoProps } from '../../types/lockerModal';
import { calculateMonthsDifference, formatCurrency } from '../../utils/lockerPaymentUtils';

const LockerPaymentInfo: React.FC<LockerPaymentInfoProps> = ({
  startDate,
  endDate,
  monthlyFee,
  paymentMethod,
  onPaymentMethodChange,
  isVisible
}) => {
  if (!isVisible) return null;

  const months = calculateMonthsDifference(startDate, endDate);
  const totalAmount = months * monthlyFee;

  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="text-sm font-medium text-gray-900 mb-3">💳 결제 정보</h4>
      
      {/* 결제 계산 */}
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">사용 기간:</span>
          <span className="font-medium">{months}개월</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">월 사용료:</span>
          <span className="font-medium">{formatCurrency(monthlyFee)}</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="font-semibold">총 결제 금액:</span>
          <span className="font-bold text-blue-600">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* 결제 방법 선택 */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          결제 방법
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['현금', '카드', '계좌이체', '기타'].map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => onPaymentMethodChange(method)}
              className={`p-2 text-xs border rounded transition-colors ${
                paymentMethod === method
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LockerPaymentInfo; 