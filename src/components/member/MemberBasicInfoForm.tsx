import React from 'react';
import { Member } from '../../models/types';
import { COMPACT_MODAL_CONFIG, AGE_LIMITS } from '../../config/memberConfig';

interface MemberBasicInfoFormProps {
  formData: Partial<Member>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors: Record<string, string>;
  isViewMode: boolean;
  isSubmitting: boolean;
}

const MemberBasicInfoForm: React.FC<MemberBasicInfoFormProps> = ({
  formData,
  handleChange,
  errors,
  isViewMode,
  isSubmitting,
}) => {
  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    e.target.value = formattedValue;
    handleChange(e);
  };

  // 생년월일 범위 계산 (더 유연하게)
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - AGE_LIMITS.MAX_AGE,
    today.getMonth(),
    today.getDate(),
  );
  const maxDate = new Date(
    today.getFullYear() - AGE_LIMITS.MIN_AGE,
    today.getMonth(),
    today.getDate(),
  );

  const inputClass = (fieldName: string) => 
    `block w-full ${COMPACT_MODAL_CONFIG.INPUT.padding} ${COMPACT_MODAL_CONFIG.INPUT.height} border ${
      errors[fieldName] ? 'border-red-500' : 'border-gray-300'
    } ${COMPACT_MODAL_CONFIG.INPUT.borderRadius} ${COMPACT_MODAL_CONFIG.INPUT.textSize} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`;

  const labelClass = `block ${COMPACT_MODAL_CONFIG.INPUT.labelSize} text-gray-700 ${COMPACT_MODAL_CONFIG.INPUT.labelMargin}`;
  const helpTextClass = `${COMPACT_MODAL_CONFIG.INPUT.helpTextSize} text-gray-500 ${COMPACT_MODAL_CONFIG.INPUT.helpTextMargin}`;
  const errorClass = `${COMPACT_MODAL_CONFIG.INPUT.helpTextSize} text-red-600 ${COMPACT_MODAL_CONFIG.INPUT.helpTextMargin}`;

  return (
    <div className={`grid ${COMPACT_MODAL_CONFIG.FORM.basicInfoGrid} ${COMPACT_MODAL_CONFIG.FORM.gridGap}`}>
      
      {/* 이름 */}
      <div className={`${COMPACT_MODAL_CONFIG.FIELD_SPANS.name} ${COMPACT_MODAL_CONFIG.FORM.fieldSpacing}`}>
        <label htmlFor="name" className={labelClass}>
          이름 <span className="text-red-500">*</span>
        </label>
        {isViewMode ? (
          <div className={`${inputClass('name')} bg-gray-50 flex items-center`}>
            {formData.name || '-'}
          </div>
        ) : (
          <>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name || ''}
              onChange={handleChange}
              className={inputClass('name')}
              disabled={isSubmitting}
              required
              placeholder="홍길동"
              autoComplete="name"
            />
            <p className={helpTextClass}>실명을 입력해주세요</p>
          </>
        )}
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      {/* 전화번호 */}
      <div className={`${COMPACT_MODAL_CONFIG.FIELD_SPANS.phone} ${COMPACT_MODAL_CONFIG.FORM.fieldSpacing}`}>
        <label htmlFor="phone" className={labelClass}>
          전화번호 <span className="text-red-500">*</span>
        </label>
        {isViewMode ? (
          <div className={`${inputClass('phone')} bg-gray-50 flex items-center`}>
            {formData.phone || '-'}
          </div>
        ) : (
          <>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone || ''}
              onChange={handlePhoneChange}
              placeholder="010-1234-5678"
              className={inputClass('phone')}
              disabled={isSubmitting}
              required
              maxLength={13}
              autoComplete="tel"
            />
            <p className={helpTextClass}>하이픈 자동 입력</p>
          </>
        )}
        {errors.phone && <p className={errorClass}>{errors.phone}</p>}
      </div>

      {/* 성별 */}
      <div className={`${COMPACT_MODAL_CONFIG.FIELD_SPANS.gender} ${COMPACT_MODAL_CONFIG.FORM.fieldSpacing}`}>
        <label htmlFor="gender" className={labelClass}>
          성별 <span className="text-red-500">*</span>
        </label>
        {isViewMode ? (
          <div className={`${inputClass('gender')} bg-gray-50 flex items-center`}>
            {formData.gender || '-'}
          </div>
        ) : (
          <select
            name="gender"
            id="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            className={inputClass('gender')}
            disabled={isSubmitting}
            required
          >
            <option value="">선택하세요</option>
            <option value="남성">남성</option>
            <option value="여성">여성</option>
            <option value="기타">기타</option>
          </select>
        )}
        {errors.gender && <p className={errorClass}>{errors.gender}</p>}
      </div>

      {/* 생년월일 */}
      <div className={`${COMPACT_MODAL_CONFIG.FIELD_SPANS.birthDate} ${COMPACT_MODAL_CONFIG.FORM.fieldSpacing}`}>
        <label htmlFor="birthDate" className={labelClass}>
          생년월일
        </label>
        {isViewMode ? (
          <div className={`${inputClass('birthDate')} bg-gray-50 flex items-center`}>
            {formData.birthDate || '-'}
          </div>
        ) : (
          <>
            <input
              type="date"
              name="birthDate"
              id="birthDate"
              value={formData.birthDate || ''}
              onChange={handleChange}
              min={minDate.toISOString().split('T')[0]}
              max={maxDate.toISOString().split('T')[0]}
              className={inputClass('birthDate')}
              disabled={isSubmitting}
            />
            <p className={helpTextClass}>{AGE_LIMITS.MIN_AGE}-{AGE_LIMITS.MAX_AGE}세 입력 가능</p>
          </>
        )}
        {errors.birthDate && <p className={errorClass}>{errors.birthDate}</p>}
      </div>

      {/* 이메일 */}
      <div className={`${COMPACT_MODAL_CONFIG.FIELD_SPANS.email} ${COMPACT_MODAL_CONFIG.FORM.fieldSpacing}`}>
        <label htmlFor="email" className={labelClass}>
          이메일
        </label>
        {isViewMode ? (
          <div className={`${inputClass('email')} bg-gray-50 flex items-center`}>
            {formData.email || '-'}
          </div>
        ) : (
          <>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email || ''}
              onChange={handleChange}
              placeholder="example@example.com"
              className={inputClass('email')}
              disabled={isSubmitting}
              autoComplete="email"
            />
            <p className={helpTextClass}>선택사항 - 유효한 이메일 주소</p>
          </>
        )}
        {errors.email && <p className={errorClass}>{errors.email}</p>}
      </div>
    </div>
  );
};

export default MemberBasicInfoForm;
