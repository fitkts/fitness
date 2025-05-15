import React from 'react';
import { MembershipTypeOption } from '../../types/payment';
import { formatCurrency } from './PaymentUtils'; // PaymentUtils 경로 수정

interface MembershipTypeSelectProps {
  membershipType: string;
  membershipTypeOptions: MembershipTypeOption[];
  isViewMode: boolean;
  isSubmitting: boolean;
  error?: string;
  handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onOpenMembershipTypeModal?: () => void;
}

const MembershipTypeSelect: React.FC<MembershipTypeSelectProps> = ({
  membershipType,
  membershipTypeOptions,
  isViewMode,
  isSubmitting,
  error,
  handleChange,
  onOpenMembershipTypeModal,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          이용권 종류 <span className="text-red-500">*</span>
        </label>
        {!isViewMode && onOpenMembershipTypeModal && (
          <button
            type="button"
            onClick={onOpenMembershipTypeModal}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            disabled={isSubmitting}
          >
            + 이용권 관리
          </button>
        )}
      </div>
      {isViewMode ? (
        <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">
          {membershipType}
        </div>
      ) : (
        <select
          name="membershipType"
          value={membershipType}
          onChange={handleChange}
          className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
          disabled={isSubmitting}
          required
        >
          <option value="">이용권 선택</option>
          {membershipTypeOptions.map((type, index) => (
            <option key={index} value={type.name}>
              {type.name} ({formatCurrency(type.price)}원)
            </option>
          ))}
        </select>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default MembershipTypeSelect;
