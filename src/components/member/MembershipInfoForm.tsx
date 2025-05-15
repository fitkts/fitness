import React, { useEffect } from 'react';
import { Member, Staff } from '../../models/types';

interface MembershipInfoFormProps {
  formData: Partial<Member>;
  staffList: Staff[];
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
}

const MembershipInfoForm: React.FC<MembershipInfoFormProps> = ({
  formData,
  staffList,
  handleChange,
  errors,
  isSubmitting,
}) => {
  // 회원권 종류 옵션
  const membershipTypeOptions = [
    { value: '1개월권', label: '1개월권', months: 1 },
    { value: '3개월권', label: '3개월권', months: 3 },
    { value: '6개월권', label: '6개월권', months: 6 },
    { value: '12개월권', label: '12개월권', months: 12 },
  ];

  // 회원권 종류 변경 시 종료일 자동 계산
  const handleMembershipTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedType = membershipTypeOptions.find(
      (option) => option.value === e.target.value,
    );
    if (selectedType && formData.membershipStart) {
      const startDate = new Date(formData.membershipStart);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + selectedType.months);

      // 종료일 이벤트 생성
      const endDateEvent = {
        target: {
          name: 'membershipEnd',
          value: endDate.toISOString().split('T')[0],
        },
      } as React.ChangeEvent<HTMLInputElement>;

      handleChange(e);
      handleChange(endDateEvent);
    } else {
      handleChange(e);
    }
  };

  // 회원권 시작일 변경 시 가입일보다 이전일 수 없도록 제한
  const handleMembershipStartChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const startDate = new Date(e.target.value);
    const joinDate = new Date(formData.joinDate || '');

    if (startDate < joinDate) {
      e.target.value = formData.joinDate || '';
    }
    handleChange(e);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* 가입일 */}
      <div className="space-y-1">
        <label
          htmlFor="joinDate"
          className="block text-sm font-medium text-gray-700"
        >
          가입일 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="joinDate"
          id="joinDate"
          value={formData.joinDate || ''}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          className={`mt-1 block w-full p-2 border ${errors.joinDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          disabled={isSubmitting}
          required
        />
        <p className="text-xs text-gray-500">
          오늘 이전의 날짜만 선택 가능합니다.
        </p>
        {errors.joinDate && (
          <p className="mt-1 text-sm text-red-600">{errors.joinDate}</p>
        )}
      </div>

      {/* 회원권 종류 */}
      <div className="space-y-1">
        <label
          htmlFor="membershipType"
          className="block text-sm font-medium text-gray-700"
        >
          회원권 종류 <span className="text-red-500">*</span>
        </label>
        <select
          name="membershipType"
          id="membershipType"
          value={formData.membershipType || ''}
          onChange={handleMembershipTypeChange}
          className={`mt-1 block w-full p-2 border ${errors.membershipType ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          disabled={isSubmitting}
          required
        >
          <option value="">선택해주세요</option>
          {membershipTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          회원권 종류를 선택하면 종료일이 자동으로 계산됩니다.
        </p>
        {errors.membershipType && (
          <p className="mt-1 text-sm text-red-600">{errors.membershipType}</p>
        )}
      </div>

      {/* 회원권 시작일 */}
      <div className="space-y-1">
        <label
          htmlFor="membershipStart"
          className="block text-sm font-medium text-gray-700"
        >
          회원권 시작일 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="membershipStart"
          id="membershipStart"
          value={formData.membershipStart || ''}
          onChange={handleMembershipStartChange}
          min={formData.joinDate || ''}
          className={`mt-1 block w-full p-2 border ${errors.membershipStart ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          disabled={isSubmitting}
          required
        />
        <p className="text-xs text-gray-500">
          가입일 이후의 날짜만 선택 가능합니다.
        </p>
        {errors.membershipStart && (
          <p className="mt-1 text-sm text-red-600">{errors.membershipStart}</p>
        )}
      </div>

      {/* 담당자 */}
      <div className="space-y-1">
        <label
          htmlFor="staffId"
          className="block text-sm font-medium text-gray-700"
        >
          담당자 <span className="text-red-500">*</span>
        </label>
        <select
          name="staffId"
          id="staffId"
          value={formData.staffId || ''}
          onChange={handleChange}
          className={`mt-1 block w-full p-2 border ${errors.staffId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          disabled={isSubmitting}
          required
        >
          <option value="">담당자 선택</option>
          {staffList.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.name} ({staff.position})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          회원을 담당할 직원을 선택해주세요.
        </p>
        {errors.staffId && (
          <p className="mt-1 text-sm text-red-600">{errors.staffId}</p>
        )}
      </div>
    </div>
  );
};

export default MembershipInfoForm;
