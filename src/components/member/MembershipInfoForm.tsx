import React from 'react';
import { Member, Staff } from '../../models/types'; // Staff 타입 import 추가

interface MembershipInfoFormProps {
  formData: Partial<Member>;
  staffList: Staff[]; // staffList prop 추가
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
  // isViewMode는 항상 false이므로 MembershipInfoForm에서는 받을 필요 없음
  // calculateEndDate는 MemberModal에 있으므로 여기서는 필요 없음
}

const MembershipInfoForm: React.FC<MembershipInfoFormProps> = ({
  formData,
  staffList,
  handleChange,
  errors,
  isSubmitting,
}) => {
  // 회원권 종류 옵션 (MemberModal의 defaultMember 또는 다른 곳에서 관리될 수 있음)
  const membershipTypeOptions = [
    { value: '1개월권', label: '1개월권' },
    { value: '3개월권', label: '3개월권' },
    { value: '6개월권', label: '6개월권' },
    { value: '12개월권', label: '12개월권' },
    // 필요시 추가
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* 가입일 */}
      <div>
        <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">
          가입일
        </label>
        <input
          type="date"
          name="joinDate"
          id="joinDate"
          value={formData.joinDate || ''}
          onChange={handleChange}
          className={`input ${errors.joinDate ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
        />
        {errors.joinDate && <p className="text-red-500 text-xs mt-1">{errors.joinDate}</p>}
      </div>

      {/* 회원권 종류 */}
      <div>
        <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700 mb-1">
          회원권 종류
        </label>
        <select
          name="membershipType"
          id="membershipType"
          value={formData.membershipType || ''}
          onChange={handleChange}
          className={`input ${errors.membershipType ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
        >
          <option value="">선택...</option>
          {membershipTypeOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {errors.membershipType && <p className="text-red-500 text-xs mt-1">{errors.membershipType}</p>}
      </div>

      {/* 회원권 시작일 */}
      <div>
        <label htmlFor="membershipStart" className="block text-sm font-medium text-gray-700 mb-1">
          회원권 시작일
        </label>
        <input
          type="date"
          name="membershipStart"
          id="membershipStart"
          value={formData.membershipStart || ''}
          onChange={handleChange}
          className={`input ${errors.membershipStart ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
        />
        {errors.membershipStart && <p className="text-red-500 text-xs mt-1">{errors.membershipStart}</p>}
      </div>
      
      {/* 담당자 */}
      <div>
        <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-1">
          담당자
        </label>
        <select
          name="staffId"
          id="staffId"
          value={formData.staffId || ''}
          onChange={handleChange}
          className={`input ${errors.staffId ? 'border-red-500' : ''}`}
          disabled={isSubmitting}
        >
          <option value="">담당자 선택</option>
          {staffList.map(staff => (
            <option key={staff.id} value={staff.id}>
              {staff.name}
            </option>
          ))}
        </select>
        {errors.staffId && <p className="text-red-500 text-xs mt-1">{errors.staffId}</p>}
      </div>
    </div>
  );
};

export default MembershipInfoForm; 