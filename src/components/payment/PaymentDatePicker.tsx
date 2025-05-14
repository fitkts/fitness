import React from 'react';

interface PaymentDatePickerProps {
  label: string;
  name: string;
  value: string;
  isViewMode: boolean;
  isSubmitting: boolean;
  error?: string;
  required?: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PaymentDatePicker: React.FC<PaymentDatePickerProps> = ({
  label,
  name,
  value,
  isViewMode,
  isSubmitting,
  error,
  required = false,
  handleChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {isViewMode ? (
        <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">{value}</div>
      ) : (
        <input
          type="date"
          name={name}
          value={value}
          onChange={handleChange}
          className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
          disabled={isSubmitting}
          required={required}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default PaymentDatePicker; 