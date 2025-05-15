import React from 'react';
import { formatCurrency } from './PaymentUtils';

interface AmountInputProps {
  amount: number;
  isViewMode: boolean;
  isSubmitting: boolean;
  error?: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AmountInput: React.FC<AmountInputProps> = ({
  amount,
  isViewMode,
  isSubmitting,
  error,
  handleChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        금액 <span className="text-red-500">*</span>
      </label>
      {isViewMode ? (
        <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">
          {formatCurrency(amount)}원
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            name="amount"
            value={amount ? formatCurrency(amount) : '0'}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 pr-6 ${error ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isSubmitting}
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-500">원</span>
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default AmountInput;
