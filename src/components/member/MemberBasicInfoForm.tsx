import React from 'react';
import { Member } from '../../models/types';

interface MemberBasicInfoFormProps {
  formData: Partial<Member>; // Member 타입의 일부를 받을 수 있도록 Partial 사용
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {/* 이름 */}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          이름 <span className="text-red-500">*</span>
        </label>
        {isViewMode ? (
          <p className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 min-h-[40px]">{formData.name || '-'}</p>
        ) : (
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name || ''}
            onChange={handleChange}
            className={`mt-1 block w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            disabled={isSubmitting}
            required
          />
        )}
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* 전화번호 */}
      <div className="space-y-1">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          전화번호
        </label>
        {isViewMode ? (
          <p className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 min-h-[40px]">{formData.phone || '-'}</p>
        ) : (
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => {
              handleChange(e);
            }}
            placeholder="010-1234-5678"
            className={`mt-1 block w-full p-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            disabled={isSubmitting}
          />
        )}
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      {/* 이메일 */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          이메일
        </label>
        {isViewMode ? (
          <p className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 min-h-[40px]">{formData.email || '-'}</p>
        ) : (
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email || ''}
            onChange={handleChange}
            placeholder="example@example.com"
            className={`mt-1 block w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            disabled={isSubmitting}
          />
        )}
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* 성별 */}
      <div className="space-y-1">
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          성별
        </label>
        {isViewMode ? (
          <p className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 min-h-[40px]">{formData.gender || '-'}</p>
        ) : (
          <select
            name="gender"
            id="gender"
            value={formData.gender || '남성'} // 기본값 설정
            onChange={handleChange}
            className={`mt-1 block w-full p-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            disabled={isSubmitting}
          >
            <option value="남성">남성</option>
            <option value="여성">여성</option>
            <option value="기타">기타</option>
          </select>
        )}
        {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
      </div>

      {/* 생년월일 */}
      <div className="space-y-1">
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
          생년월일
        </label>
        {isViewMode ? (
          <p className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 min-h-[40px]">{formData.birthDate || '-'}</p>
        ) : (
          <input
            type="date"
            name="birthDate"
            id="birthDate"
            value={formData.birthDate || ''}
            onChange={handleChange}
            className={`mt-1 block w-full p-2 border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            disabled={isSubmitting}
          />
        )}
        {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
      </div>
    </div>
  );
};

export default MemberBasicInfoForm; 