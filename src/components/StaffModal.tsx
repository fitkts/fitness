import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { Staff, StaffStatus } from '../models/types';
import { useToast } from '../contexts/ToastContext';
import StaffForm from './staff/StaffForm';
import {
  defaultStaff,
  defaultPermissions,
  formatPhoneNumber,
  validateStaffForm,
  adminPermissions,
  frontDeskPermissions,
  trainerPermissions,
  partTimePermissions,
} from './staff/StaffUtils';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Staff) => Promise<boolean>;
  staff?: Staff | null;
  isViewMode?: boolean;
}

const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  staff,
  isViewMode = false,
}) => {
  const [formData, setFormData] = useState<Staff>(() => {
    const initialHireDate = new Date().toISOString().split('T')[0];
    const baseStaff = staff
      ? {
          ...defaultStaff,
          ...staff,
          hireDate: staff.hireDate
            ? new Date(staff.hireDate).toISOString().split('T')[0]
            : initialHireDate,
          permissions: staff.permissions ?? defaultPermissions,
          notes: staff.notes || '',
          status: staff.status
            ? Object.values(StaffStatus).includes(staff.status as StaffStatus)
              ? staff.status
              : StaffStatus.ACTIVE
            : defaultStaff.status,
        }
      : { ...defaultStaff, hireDate: initialHireDate };
    return baseStaff as Staff;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentIsViewMode, setCurrentIsViewMode] = useState(!!isViewMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const initialHireDate = new Date().toISOString().split('T')[0];
      if (staff) {
        setFormData({
          ...defaultStaff,
          ...staff,
          hireDate: staff.hireDate
            ? new Date(staff.hireDate).toISOString().split('T')[0]
            : initialHireDate,
          permissions: staff.permissions ?? defaultPermissions,
          notes: staff.notes || '',
          status: staff.status
            ? Object.values(StaffStatus).includes(staff.status as StaffStatus)
              ? staff.status
              : StaffStatus.ACTIVE
            : defaultStaff.status,
        } as Staff);
        setCurrentIsViewMode(!!isViewMode);
      } else {
        setFormData({ ...defaultStaff, hireDate: initialHireDate } as Staff);
        setCurrentIsViewMode(false);
      }
      setErrors({});
    }
  }, [isOpen, staff, isViewMode]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const validationErrors = validateStaffForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setIsSubmitting(true);
    try {
      const dataToSave = { ...formData };
      if (
        !Object.values(StaffStatus).includes(dataToSave.status as StaffStatus)
      ) {
        dataToSave.status = StaffStatus.ACTIVE;
      }

      // 디버깅: 저장할 데이터 로그
      console.log('🔍 [StaffModal] 저장할 데이터:', {
        name: dataToSave.name,
        birthDate: dataToSave.birthDate,
        birthDateType: typeof dataToSave.birthDate,
        id: dataToSave.id,
        isEdit: !!dataToSave.id,
      });

      const success = await onSave(dataToSave as Staff);

      if (success) {
        showToast(
          'success',
          formData.id
            ? '직원 정보가 수정되었습니다.'
            : '새 직원이 등록되었습니다.',
        );
        onClose();
      } else {
        showToast('error', '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('직원 저장 오류:', error);
      showToast('error', '처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (currentIsViewMode) return;

    let processedValue: string | StaffStatus = value;
    if (name === 'phone') {
      processedValue = formatPhoneNumber(value);
    } else if (name === 'status') {
      processedValue = Object.values(StaffStatus).includes(value as StaffStatus)
        ? (value as StaffStatus)
        : StaffStatus.ACTIVE;
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentIsViewMode) return;

    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...(prev.permissions ?? defaultPermissions),
        [name]: checked,
      },
    }));
  };

  const setPermissionPreset = (presetName: string) => {
    if (currentIsViewMode) return;

    let newPermissions = { ...defaultPermissions };
    if (presetName === 'admin') newPermissions = adminPermissions;
    else if (presetName === 'frontDesk') newPermissions = frontDeskPermissions;
    else if (presetName === 'trainer') newPermissions = trainerPermissions;
    else if (presetName === 'partTime') newPermissions = partTimePermissions;

    setFormData((prev) => ({
      ...prev,
      permissions: newPermissions,
    }));
  };

  const modalTitle = currentIsViewMode
    ? '직원 정보 보기'
    : formData.id
      ? '직원 정보 수정'
      : '새 직원 등록';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <StaffForm
        formData={formData}
        errors={errors}
        isViewMode={currentIsViewMode}
        isSubmitting={isSubmitting}
        handleChange={handleChange}
        handlePermissionChange={handlePermissionChange}
        setPermissionPreset={setPermissionPreset}
      />
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          disabled={isSubmitting}
        >
          취소
        </button>
        {!currentIsViewMode && (
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? '저장 중...'
              : formData.id
                ? '수정 완료'
                : '등록 완료'}
          </button>
        )}
        {currentIsViewMode && (
          <button
            type="button"
            onClick={() => {
              setCurrentIsViewMode(false);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            수정하기
          </button>
        )}
      </div>
    </Modal>
  );
};

export default StaffModal;
