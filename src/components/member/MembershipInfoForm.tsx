import React from 'react';
import { Member, Staff } from '../../models/types';
import { COMPACT_MODAL_CONFIG } from '../../config/memberConfig';

interface MembershipInfoFormProps {
  formData: Partial<Member>;
  staffList: Staff[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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
  const handleMembershipTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = membershipTypeOptions.find(
      (option) => option.value === e.target.value,
    );
    if (selectedType && formData.membershipStart) {
      const startDate = new Date(formData.membershipStart);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + selectedType.months);

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
  const handleMembershipStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = new Date(e.target.value);
    const joinDate = new Date(formData.joinDate || '');

    if (startDate < joinDate) {
      e.target.value = formData.joinDate || '';
    }
    
    // 회원권 종류가 선택되어 있으면 종료일 자동 계산
    if (formData.membershipType) {
      const selectedType = membershipTypeOptions.find(
        (option) => option.value === formData.membershipType,
      );
      if (selectedType) {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + selectedType.months);
        
        const endDateEvent = {
          target: {
            name: 'membershipEnd',
            value: endDate.toISOString().split('T')[0],
          },
        } as React.ChangeEvent<HTMLInputElement>;
        
        handleChange(e);
        handleChange(endDateEvent);
        return;
      }
    }
    
    handleChange(e);
  };

  const inputClass = (fieldName: string) => 
    `block w-full ${COMPACT_MODAL_CONFIG.INPUT.padding} ${COMPACT_MODAL_CONFIG.INPUT.height} border ${
      errors[fieldName] ? 'border-red-500' : 'border-gray-300'
    } ${COMPACT_MODAL_CONFIG.INPUT.borderRadius} ${COMPACT_MODAL_CONFIG.INPUT.textSize} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`;

  const labelClass = `block ${COMPACT_MODAL_CONFIG.INPUT.labelSize} text-gray-700 ${COMPACT_MODAL_CONFIG.INPUT.labelMargin}`;
  const helpTextClass = `${COMPACT_MODAL_CONFIG.INPUT.helpTextSize} text-gray-500 ${COMPACT_MODAL_CONFIG.INPUT.helpTextMargin}`;
  const errorClass = `${COMPACT_MODAL_CONFIG.INPUT.helpTextSize} text-red-600 ${COMPACT_MODAL_CONFIG.INPUT.helpTextMargin}`;

  return (
    <div className={`grid ${COMPACT_MODAL_CONFIG.FORM.membershipGrid} ${COMPACT_MODAL_CONFIG.FORM.gridGap}`}>
      
      {/* 가입일 */}
      <div className={`${COMPACT_MODAL_CONFIG.FIELD_SPANS.joinDate} ${COMPACT_MODAL_CONFIG.FORM.fieldSpacing}`}>
        <label htmlFor="joinDate" className={labelClass}>
          가입일 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="joinDate"
          id="joinDate"
          value={formData.joinDate || ''}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          className={inputClass('joinDate')}
          disabled={isSubmitting}
          required
        />
        <p className={helpTextClass}>오늘 이전 날짜</p>
        {errors.joinDate && <p className={errorClass}>{errors.joinDate}</p>}
      </div>

      {/* 회원권 종류 */}
      <div className={`${COMPACT_MODAL_CONFIG.FIELD_SPANS.membershipType} ${COMPACT_MODAL_CONFIG.FORM.fieldSpacing}`}>
        <label htmlFor="membershipType" className={labelClass}>
          회원권 <span className="text-red-500">*</span>
        </label>
        <select
          name="membershipType"
          id="membershipType"
          value={formData.membershipType || ''}
          onChange={handleMembershipTypeChange}
          className={inputClass('membershipType')}
          disabled={isSubmitting}
          required
        >
          <option value="">선택하세요</option>
          {membershipTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className={helpTextClass}>종료일 자동 계산</p>
        {errors.membershipType && <p className={errorClass}>{errors.membershipType}</p>}
      </div>

      {/* 회원권 시작일 */}
      <div className={`${COMPACT_MODAL_CONFIG.FIELD_SPANS.membershipStart} ${COMPACT_MODAL_CONFIG.FORM.fieldSpacing}`}>
        <label htmlFor="membershipStart" className={labelClass}>
          시작일 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="membershipStart"
          id="membershipStart"
          value={formData.membershipStart || ''}
          onChange={handleMembershipStartChange}
          min={formData.joinDate || ''}
          className={inputClass('membershipStart')}
          disabled={isSubmitting}
          required
        />
        <p className={helpTextClass}>가입일 이후</p>
        {errors.membershipStart && <p className={errorClass}>{errors.membershipStart}</p>}
      </div>

      {/* 담당자 */}
      <div className={`${COMPACT_MODAL_CONFIG.FIELD_SPANS.staff} ${COMPACT_MODAL_CONFIG.FORM.fieldSpacing}`}>
        <label htmlFor="staffId" className={labelClass}>
          담당자 <span className="text-red-500">*</span>
        </label>
        <select
          name="staffId"
          id="staffId"
          value={formData.staffId || ''}
          onChange={handleChange}
          className={inputClass('staffId')}
          disabled={isSubmitting}
          required
        >
          <option value="">선택하세요</option>
          {staffList.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.name}
            </option>
          ))}
        </select>
        <p className={helpTextClass}>담당 직원 선택</p>
        {errors.staffId && <p className={errorClass}>{errors.staffId}</p>}
      </div>
    </div>
  );
};

export default MembershipInfoForm;
