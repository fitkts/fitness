import React from 'react';
import { MONTHLY_FEE_CONFIG, FEE_PRESET_OPTIONS } from '../../config/lockerConfig';

interface LockerMonthlyFeeProps {
  monthlyFee: number;
  feeError: string;
  onFeeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPresetSelect: (fee: number) => void;
  isViewMode: boolean;
}

const LockerMonthlyFee: React.FC<LockerMonthlyFeeProps> = ({
  monthlyFee,
  feeError,
  onFeeChange,
  onPresetSelect,
  isViewMode
}) => {
  return (
    <div className="bg-yellow-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 월 사용료</h3>
      
      {!isViewMode && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            요금 프리셋
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {FEE_PRESET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onPresetSelect(option.value)}
                className={`p-2 text-xs border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  monthlyFee === option.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                disabled={isViewMode}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="monthlyFee" className="block text-sm font-medium text-gray-700 mb-1">
          월 사용료 <span className="text-red-500">*</span>
        </label>
        <div className="relative max-w-xs">
          <input
            type="text"
            id="monthlyFee"
            value={monthlyFee.toLocaleString()}
            onChange={onFeeChange}
            disabled={isViewMode}
            className={`mt-1 block w-full px-3 py-2 pr-12 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 ${
              feeError ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="50,000"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            원
          </span>
        </div>
        {feeError && (
          <p className="text-xs text-red-500 mt-1">{feeError}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {MONTHLY_FEE_CONFIG.MIN.toLocaleString()}원 ~ {MONTHLY_FEE_CONFIG.MAX.toLocaleString()}원 범위로 설정해주세요
        </p>
      </div>
    </div>
  );
};

export default LockerMonthlyFee; 