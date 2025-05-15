import React from 'react';
import {
  Staff,
  StaffPosition,
  StaffStatus,
  StaffPermissions,
} from '../../models/types';
import StaffPermissionsForm from './StaffPermissionsForm';

interface StaffFormProps {
  formData: Staff;
  errors: Record<string, string>;
  isViewMode: boolean;
  isSubmitting: boolean;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  handlePermissionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPermissionPreset: (preset: string) => void;
}

const StaffForm: React.FC<StaffFormProps> = ({
  formData,
  errors,
  isViewMode,
  isSubmitting,
  handleChange,
  handlePermissionChange,
  setPermissionPreset,
}) => {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 직원 기본 정보 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
            기본 정보
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              이름 <span className="text-red-500">*</span>
            </label>
            {isViewMode ? (
              <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">
                {formData.name}
              </div>
            ) : (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isSubmitting}
                required
              />
            )}
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              직책 <span className="text-red-500">*</span>
            </label>
            {isViewMode ? (
              <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">
                {formData.position}
              </div>
            ) : (
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.position ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isSubmitting}
                required
              >
                {Object.values(StaffPosition).map((positionValue) => (
                  <option key={positionValue} value={positionValue}>
                    {positionValue}
                  </option>
                ))}
              </select>
            )}
            {errors.position && (
              <p className="mt-1 text-sm text-red-600">{errors.position}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              전화번호
            </label>
            {isViewMode ? (
              <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">
                {formData.phone || '-'}
              </div>
            ) : (
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="010-0000-0000"
                className={`w-full p-2 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isSubmitting}
              />
            )}
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            {isViewMode ? (
              <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">
                {formData.email || '-'}
              </div>
            ) : (
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="example@email.com"
                className={`w-full p-2 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isSubmitting}
              />
            )}
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              입사일 <span className="text-red-500">*</span>
            </label>
            {isViewMode ? (
              <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">
                {formData.hireDate}
              </div>
            ) : (
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${errors.hireDate ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isSubmitting}
                required
              />
            )}
            {errors.hireDate && (
              <p className="mt-1 text-sm text-red-600">{errors.hireDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              상태 <span className="text-red-500">*</span>
            </label>
            {isViewMode ? (
              <div className="p-2 border rounded bg-gray-50 min-h-[40px] flex items-center">
                {formData.status === StaffStatus.ACTIVE ? '재직중' : '퇴사'}
              </div>
            ) : (
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border rounded border-gray-300"
                disabled={isSubmitting}
                required
              >
                <option value={StaffStatus.ACTIVE}>재직중</option>
                <option value={StaffStatus.INACTIVE}>퇴사</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              메모
            </label>
            {isViewMode ? (
              <div className="p-2 border rounded bg-gray-50 min-h-[100px] whitespace-pre-wrap">
                {formData.notes || '-'}
              </div>
            ) : (
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded border-gray-300 min-h-[100px]"
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>

        {/* 권한 설정은 StaffPermissionsForm 컴포넌트로 대체 */}
        <StaffPermissionsForm
          permissions={formData.permissions as StaffPermissions}
          isViewMode={isViewMode}
          isSubmitting={isSubmitting}
          handlePermissionChange={handlePermissionChange}
          setPermissionPreset={setPermissionPreset}
        />
      </div>
    </form>
  );
};

export default StaffForm;
