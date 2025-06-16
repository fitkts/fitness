import React from 'react';
import { LockerSize } from '../../models/types';
import { LockerBasicInfoProps } from '../../types/lockerModal';

const LockerBasicInfo: React.FC<LockerBasicInfoProps> = ({
  formData,
  onChange,
  onSizeChange,
  errors,
  isViewMode
}) => {
  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e);
    if (onSizeChange && e.target.value) {
      onSizeChange(e.target.value as LockerSize);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 기본 정보</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
            락커 번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="number"
            id="number"
            value={formData.number || ''}
            onChange={onChange}
            disabled={isViewMode}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
            required
            placeholder="예: A-001, 101"
          />
          {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            상태 <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            id="status"
            value={formData.status}
            onChange={onChange}
            disabled={isViewMode}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          >
            <option value="available">🟢 사용 가능</option>
            <option value="occupied">🔴 사용 중</option>
            <option value="maintenance">🟡 수리 중</option>
          </select>
          {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
        </div>

        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
            크기
          </label>
          <select
            name="size"
            id="size"
            value={formData.size || ''}
            onChange={handleSizeChange}
            disabled={isViewMode}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
          >
            <option value="">크기 선택</option>
            {Object.values(LockerSize).map((sizeValue) => (
              <option key={sizeValue} value={sizeValue}>
                {sizeValue === LockerSize.SMALL ? '📦 소형' : sizeValue === LockerSize.MEDIUM ? '📋 중형' : '📚 대형'}
              </option>
            ))}
          </select>
          {errors.size && <p className="text-xs text-red-500 mt-1">{errors.size}</p>}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            위치
          </label>
          <input
            type="text"
            name="location"
            id="location"
            value={formData.location || ''}
            onChange={onChange}
            disabled={isViewMode}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
            placeholder="예: A구역, 1층 왼쪽"
          />
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>
      </div>
    </div>
  );
};

export default LockerBasicInfo; 