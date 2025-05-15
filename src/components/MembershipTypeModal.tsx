import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { useToast } from '../contexts/ToastContext';
import { MembershipType } from '../models/types';

// interface MembershipType {
//   id?: number;
//   name: string;
//   durationMonths: number;
//   price: number;
//   isActive: boolean;
//   description?: string;
//   maxUses?: number;
//   availableFacilities?: string[];
// }

interface MembershipTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (membershipType: MembershipType) => Promise<boolean>;
  membershipType?: MembershipType | null;
  isViewMode?: boolean;
  availableFacilities?: string[]; // 센터에서 제공하는 시설 목록
}

const defaultMembershipType: MembershipType = {
  name: '',
  durationMonths: 1,
  price: 0,
  isActive: true,
  description: '',
  availableFacilities: [],
};

const MembershipTypeModal: React.FC<MembershipTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  membershipType,
  isViewMode = false,
  availableFacilities = [
    '헬스장',
    '요가실',
    '필라테스',
    '샤워실',
    '사우나',
    '락커룸',
    '주차장',
  ],
}) => {
  const [formData, setFormData] = useState<MembershipType>(
    defaultMembershipType,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  let showToast: (type: string, message: string) => void;
  try {
    const toastContext = useToast();
    showToast = toastContext.showToast;
  } catch (error) {
    console.error(
      'MembershipTypeModal: Toast 컨텍스트를 사용할 수 없습니다:',
      error,
    );
    showToast = (type, message) => console.log(`Toast (${type}): ${message}`);
  }

  useEffect(() => {
    if (membershipType) {
      setFormData({
        ...membershipType,
        description: membershipType.description || '',
        availableFacilities: membershipType.availableFacilities || [],
      });
      setIsEditMode(true);
    } else {
      setFormData(defaultMembershipType);
      setIsEditMode(false);
    }
    setErrors({});
  }, [membershipType, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 금액 포맷팅 함수
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ko-KR', { style: 'decimal' }).format(value);
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 유효성 검사
      const newErrors: Record<string, string> = {};

      if (!formData.name) {
        newErrors.name = '이용권 이름은 필수입니다';
      }

      if (!formData.durationMonths || formData.durationMonths <= 0) {
        newErrors.durationMonths = '유효한 기간을 입력하세요';
      }

      if (!formData.price && formData.price !== 0) {
        newErrors.price = '가격을 입력하세요';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // 저장 상태로 변경
      setIsSubmitting(true);

      // 저장 요청
      const success = await onSave(formData);

      // 결과에 따라 토스트 알림 표시
      if (success) {
        if (showToast) {
          showToast(
            'success',
            isEditMode
              ? '이용권 정보가 수정되었습니다.'
              : '새 이용권이 등록되었습니다.',
          );
        }
        onClose();
      } else {
        if (showToast) {
          showToast('error', '저장 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('폼 제출 오류:', error);
      if (showToast) {
        showToast('error', '처리 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 입력 핸들러
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    if (name === 'price') {
      // 숫자만 허용
      const numericValue = value.replace(/[^\d]/g, '');
      setFormData((prev) => ({ ...prev, [name]: parseInt(numericValue) || 0 }));
    } else if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: isChecked }));
    } else if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // 오류 메시지 지우기
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 시설 선택 변경 핸들러
  const handleFacilityChange = (facility: string) => {
    setFormData((prev) => {
      const currentFacilities = prev.availableFacilities || [];
      if (currentFacilities.includes(facility)) {
        return {
          ...prev,
          availableFacilities: currentFacilities.filter((f) => f !== facility),
        };
      } else {
        return {
          ...prev,
          availableFacilities: [...currentFacilities, facility],
        };
      }
    });
  };

  // 모달 제목 결정
  const getModalTitle = () => {
    if (isViewMode) return '이용권 상세 정보';
    return isEditMode ? '이용권 정보 수정' : '신규 이용권 등록';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 기본 정보 섹션 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이용권 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                placeholder="예: 1개월권, 3개월권, PT 10회 등"
                disabled={isViewMode}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이용 기간 (개월) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="durationMonths"
                value={formData.durationMonths}
                onChange={handleChange}
                className={`input w-full ${errors.durationMonths ? 'border-red-500' : ''}`}
                min="1"
                max="36"
                disabled={isViewMode}
                required
              />
              {errors.durationMonths && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.durationMonths}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                가격 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="price"
                  value={formData.price ? formatCurrency(formData.price) : ''}
                  onChange={handleChange}
                  className={`input w-full pl-8 ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0"
                  disabled={isViewMode}
                  required
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₩
                </span>
              </div>
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  disabled={isViewMode}
                />
                <span className="ml-2 text-sm text-gray-700">활성화 상태</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                비활성화된 이용권은 신규 결제에 표시되지 않습니다
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이용 횟수 (선택 사항)
              </label>
              <input
                type="number"
                name="maxUses"
                value={formData.maxUses || ''}
                onChange={handleChange}
                className="input w-full"
                min="1"
                placeholder="PT 회수 등을 입력"
                disabled={isViewMode}
              />
              <p className="text-xs text-gray-500 mt-1">
                PT 상품 등 횟수제 이용권의 경우 입력
              </p>
            </div>
          </div>

          {/* 상세 정보 섹션 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이용권 설명
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="input w-full"
                rows={3}
                placeholder="이용권에 대한 상세 설명을 입력하세요"
                disabled={isViewMode}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이용 가능 시설/서비스
              </label>
              <div className="mt-2 space-y-2">
                {availableFacilities.map((facility) => (
                  <div key={facility} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`facility-${facility}`}
                      checked={
                        formData.availableFacilities?.includes(facility) ||
                        false
                      }
                      onChange={() => handleFacilityChange(facility)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      disabled={isViewMode}
                    />
                    <label
                      htmlFor={`facility-${facility}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {facility}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 이용권 요약 (뷰 모드) */}
        {isViewMode && (
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h4 className="font-semibold mb-3">이용권 요약</h4>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">기본 가격</p>
                <p className="text-lg font-bold text-indigo-600">
                  ₩ {formatCurrency(formData.price)}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">이용 기간</p>
                <p className="text-lg font-bold">
                  {formData.durationMonths}개월
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">상태</p>
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    formData.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {formData.isActive ? '활성화' : '비활성화'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            {isViewMode ? '닫기' : '취소'}
          </button>

          {!isViewMode && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  저장 중...
                </span>
              ) : (
                '저장'
              )}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default MembershipTypeModal;
