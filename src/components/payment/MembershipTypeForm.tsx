import React, { useState, useEffect } from 'react';
import { MembershipType } from '../../models/types';
import { useToast } from '../../contexts/ToastContext';
import { addMembershipType, updateMembershipType } from '../../database/ipcService';

interface MembershipTypeFormData extends Partial<Omit<MembershipType, 'id' | 'createdAt' | 'updatedAt'>> {
  // id, createdAt, updatedAt 등은 DB에서 자동 생성되거나 서버에서 처리
  // maxUses 필드는 MembershipType에 이미 optional number로 존재
}

interface MembershipTypeFormProps {
  formId: string;
  initialMembershipType: MembershipType | null;
  isViewMode: boolean;
  onSubmitSuccess: () => void;
  setSubmitLoading: (isLoading: boolean) => void;
}

const MembershipTypeForm: React.FC<MembershipTypeFormProps> = ({
  formId,
  initialMembershipType,
  isViewMode,
  onSubmitSuccess,
  setSubmitLoading,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<MembershipTypeFormData>({
    name: '',
    price: 0,
    durationMonths: 1,
    description: '',
    maxUses: null, // maxSessions에서 maxUses로 변경
    isActive: true,
  });

  useEffect(() => {
    if (initialMembershipType) {
      setFormData({
        name: initialMembershipType.name || '',
        price: initialMembershipType.price || 0,
        durationMonths: initialMembershipType.durationMonths || 1,
        description: initialMembershipType.description || '',
        maxUses: initialMembershipType.maxUses === undefined ? null : initialMembershipType.maxUses, // maxSessions에서 maxUses로 변경, undefined 처리
        isActive: initialMembershipType.isActive === undefined ? true : initialMembershipType.isActive,
      });
    } else {
      // 새 이용권 시 폼 초기화 (기본값 설정)
      setFormData({
        name: '',
        price: 0,
        durationMonths: 1,
        description: '',
        maxUses: null, // maxSessions에서 maxUses로 변경
        isActive: true,
      });
    }
  }, [initialMembershipType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | null = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = value === '' ? null : parseFloat(value);
      if (name === 'durationMonths' && processedValue !== null && processedValue < 1) processedValue = 1; // 최소 1개월
      if (name === 'price' && processedValue !== null && processedValue < 0) processedValue = 0; // 최소 0원
      if (name === 'maxUses' && processedValue !== null && processedValue < 0) processedValue = null; // maxSessions에서 maxUses로 변경
    }   
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitLoading(true);

    if (!formData.name?.trim()) {
      showToast('error', '이용권 이름을 입력해주세요.');
      setSubmitLoading(false);
      return;
    }
    if (formData.price == null || formData.price < 0) {
      showToast('error', '유효한 가격을 입력해주세요.');
      setSubmitLoading(false);
      return;
    }
    if (formData.durationMonths == null || formData.durationMonths < 1) {
      showToast('error', '기간은 최소 1개월 이상이어야 합니다.');
      setSubmitLoading(false);
      return;
    }

    const typeDataToSave: Omit<MembershipType, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      price: formData.price,
      durationMonths: formData.durationMonths,
      description: formData.description,
      maxUses: formData.maxUses,
      isActive: formData.isActive === undefined ? true : formData.isActive,
    };

    try {
      let response;
      if (initialMembershipType?.id) {
        const updateData = { ...typeDataToSave, id: initialMembershipType.id } as MembershipType;
        response = await updateMembershipType(updateData);
      } else {
        response = await addMembershipType(typeDataToSave);
      }

      if (response.success) {
        showToast('success', initialMembershipType?.id ? '이용권 정보가 수정되었습니다.' : '새 이용권이 추가되었습니다.');
        onSubmitSuccess();
      } else {
        showToast('error', `저장 실패: ${response.error || '알 수 없는 오류'}`);
      }
    } catch (err: any) {
      console.error('MembershipType form submission error:', err);
      showToast('error', `저장 중 오류 발생: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const inputDisabled = isViewMode;
  const commonInputClass = "w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500";
  const commonCheckboxLabelClass = "flex items-center space-x-2 text-sm font-medium text-gray-700";
  const commonCheckboxClass = "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50";

  return (
    <form id={formId} className="space-y-4" onSubmit={handleSubmit}>
      {/* 이용권 이름 */}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          이용권 이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="예: 헬스 3개월"
          className={commonInputClass}
          value={formData.name || ''}
          onChange={handleChange}
          disabled={inputDisabled}
          maxLength={100}
        />
      </div>

      {/* 가격 및 기간 (가로 배치) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            가격 (원) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            type="number"
            name="price"
            placeholder="0"
            className={commonInputClass}
            value={formData.price ?? ''} // null 또는 undefined 시 빈 문자열
            onChange={handleChange}
            disabled={inputDisabled}
            min={0}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="durationMonths" className="block text-sm font-medium text-gray-700">
            기간 (개월) <span className="text-red-500">*</span>
          </label>
          <input
            id="durationMonths"
            type="number"
            name="durationMonths"
            placeholder="1"
            className={commonInputClass}
            value={formData.durationMonths ?? ''}
            onChange={handleChange}
            disabled={inputDisabled}
            min={1}
          />
        </div>
      </div>

      {/* 설명 */}
      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          설명
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="이용권에 대한 간단한 설명 (예: PT 10회 포함)"
          className={commonInputClass}
          value={formData.description || ''}
          onChange={handleChange}
          disabled={inputDisabled}
          maxLength={255}
        />
      </div>

      {/* 최대 이용 횟수 */}
      <div className="space-y-1">
        <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700">
          최대 이용 횟수 (0 또는 빈칸: 무제한)
        </label>
        <input
          id="maxUses"
          type="number"
          name="maxUses"
          placeholder="0"
          className={commonInputClass}
          value={formData.maxUses === null ? '' : formData.maxUses}
          onChange={handleChange}
          disabled={inputDisabled}
          min={0}
        />
      </div>

      {/* 활성화 여부 */}
      <div className="space-y-1 pt-2">
        <label htmlFor="isActive" className={commonCheckboxLabelClass}>
          <input
            id="isActive"
            type="checkbox"
            name="isActive"
            className={commonCheckboxClass}
            checked={formData.isActive === undefined ? true : formData.isActive}
            onChange={handleChange}
            disabled={inputDisabled}
          />
          <span>이용권 활성화</span>
        </label>
        {isViewMode && (
            <p className={`mt-1 text-sm ${initialMembershipType?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {initialMembershipType?.isActive ? '활성화됨' : '비활성화됨'}
            </p>
        )}
      </div>

    </form>
  );
};

export default MembershipTypeForm; 