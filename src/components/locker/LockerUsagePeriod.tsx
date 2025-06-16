import React from 'react';
import { LockerUsagePeriodProps } from '../../types/lockerModal';

const LockerUsagePeriod: React.FC<LockerUsagePeriodProps> = ({
  formData,
  onChange,
  onPeriodSelect,
  errors,
  isViewMode
}) => {
  return (
    <div className="bg-green-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 사용 기간</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          사용 기간 <span className="text-red-500">*</span>
        </label>
        
        {/* 기간 프리셋 버튼 */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[1, 3, 6, 12].map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => onPeriodSelect(months)}
              className="p-2 text-sm border rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isViewMode}
            >
              {months}개월
            </button>
          ))}
        </div>
        
        {/* 상세 날짜 설정 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-xs text-gray-600 mb-1">
              시작일
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={formData.startDate || ''}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isViewMode}
              required
            />
            {errors.startDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.startDate}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-xs text-gray-600 mb-1">
              종료일
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={formData.endDate || ''}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isViewMode}
              required
            />
            {errors.endDate && (
              <p className="text-red-500 text-xs mt-1">
                {errors.endDate}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockerUsagePeriod; 