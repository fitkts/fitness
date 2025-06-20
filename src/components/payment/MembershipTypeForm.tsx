import React, { useState, useEffect } from 'react';
import { MembershipType, MembershipCategory, PTType, MembershipTypeFormData } from '../../models/types';
import { useToast } from '../../contexts/ToastContext';
import { addMembershipType, updateMembershipType } from '../../database/ipcService';

interface MembershipTypeFormData_UI extends Partial<Omit<MembershipType, 'id' | 'createdAt' | 'updatedAt'>> {
  // 향상된 필드들
  membershipCategory: MembershipCategory;
  ptType?: PTType | null;
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
  const [formData, setFormData] = useState<MembershipTypeFormData_UI>({
    name: '',
    price: 0,
    membershipCategory: MembershipCategory.MONTHLY,
    ptType: null,
    durationMonths: 1,
    description: '',
    maxUses: null,
    isActive: true,
  });

  useEffect(() => {
    if (initialMembershipType) {
      setFormData({
        name: initialMembershipType.name || '',
        price: initialMembershipType.price || 0,
        membershipCategory: initialMembershipType.membershipCategory || MembershipCategory.MONTHLY,
        ptType: initialMembershipType.ptType || null,
        durationMonths: initialMembershipType.durationMonths || 1,
        description: initialMembershipType.description || '',
        maxUses: initialMembershipType.maxUses === undefined ? null : initialMembershipType.maxUses,
        isActive: initialMembershipType.isActive === undefined ? true : initialMembershipType.isActive,
      });
    } else {
      setFormData({
        name: '',
        price: 0,
        membershipCategory: MembershipCategory.MONTHLY,
        ptType: null,
        durationMonths: 1,
        description: '',
        maxUses: null,
        isActive: true,
      });
    }
  }, [initialMembershipType]);

  const handleCategoryChange = (category: MembershipCategory) => {
    setFormData(prev => ({
      ...prev,
      membershipCategory: category,
      ptType: category === MembershipCategory.PT ? PTType.SESSION_BASED : null,
      durationMonths: category === MembershipCategory.MONTHLY ? 1 : undefined,
      maxUses: category === MembershipCategory.PT ? 10 : null,
    }));
  };

  const handlePTTypeChange = (ptType: PTType) => {
    setFormData(prev => ({
      ...prev,
      ptType,
      durationMonths: ptType === PTType.TERM_BASED ? 1 : prev.durationMonths,
      maxUses: ptType === PTType.SESSION_BASED ? (prev.maxUses || 10) : null,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | null = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = value === '' ? null : parseFloat(value);
      if (name === 'durationMonths' && processedValue !== null && processedValue < 1) processedValue = 1;
      if (name === 'price' && processedValue !== null && processedValue < 0) processedValue = 0;
      if (name === 'maxUses' && processedValue !== null && processedValue < 0) processedValue = null;
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

    // 카테고리별 검증
    if (formData.membershipCategory === MembershipCategory.MONTHLY) {
      if (formData.durationMonths == null || formData.durationMonths < 1) {
        showToast('error', '기간은 최소 1개월 이상이어야 합니다.');
        setSubmitLoading(false);
        return;
      }
    }

    if (formData.membershipCategory === MembershipCategory.PT) {
      if (!formData.ptType) {
        showToast('error', 'PT 유형을 선택해주세요.');
        setSubmitLoading(false);
        return;
      }
      
      if (formData.ptType === PTType.SESSION_BASED && (!formData.maxUses || formData.maxUses < 1)) {
        showToast('error', 'PT 세션 수를 입력해주세요.');
        setSubmitLoading(false);
        return;
      }
      
      if (formData.ptType === PTType.TERM_BASED && (!formData.durationMonths || formData.durationMonths < 1)) {
        showToast('error', '기간은 최소 1개월 이상이어야 합니다.');
        setSubmitLoading(false);
        return;
      }
    }

    const typeDataToSave: Omit<MembershipType, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      price: formData.price,
      membershipCategory: formData.membershipCategory,
      ptType: formData.ptType,
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
      {/* 이용권 카테고리 선택 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          이용권 카테고리 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
            formData.membershipCategory === MembershipCategory.MONTHLY
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          } ${inputDisabled ? 'cursor-not-allowed opacity-50' : ''}`}>
            <input
              type="radio"
              name="membershipCategory"
              value={MembershipCategory.MONTHLY}
              checked={formData.membershipCategory === MembershipCategory.MONTHLY}
              onChange={(e) => handleCategoryChange(e.target.value as MembershipCategory)}
              disabled={inputDisabled}
              className="sr-only"
            />
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <div className="font-medium text-gray-900">월간 회원권</div>
                <div className="text-sm text-gray-500">정기적인 헬스장 이용</div>
              </div>
            </div>
          </label>

          <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
            formData.membershipCategory === MembershipCategory.PT
              ? 'border-violet-500 bg-violet-50'
              : 'border-gray-200 hover:border-gray-300'
          } ${inputDisabled ? 'cursor-not-allowed opacity-50' : ''}`}>
            <input
              type="radio"
              name="membershipCategory"
              value={MembershipCategory.PT}
              checked={formData.membershipCategory === MembershipCategory.PT}
              onChange={(e) => handleCategoryChange(e.target.value as MembershipCategory)}
              disabled={inputDisabled}
              className="sr-only"
            />
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💪</span>
              <div>
                <div className="font-medium text-gray-900">PT 회원권</div>
                <div className="text-sm text-gray-500">개인 트레이닝 전용</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* PT 유형 선택 (PT 회원권인 경우만 표시) */}
      {formData.membershipCategory === MembershipCategory.PT && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            PT 유형 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className={`relative flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
              formData.ptType === PTType.SESSION_BASED
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${inputDisabled ? 'cursor-not-allowed opacity-50' : ''}`}>
              <input
                type="radio"
                name="ptType"
                value={PTType.SESSION_BASED}
                checked={formData.ptType === PTType.SESSION_BASED}
                onChange={(e) => handlePTTypeChange(e.target.value as PTType)}
                disabled={inputDisabled}
                className="sr-only"
              />
              <div>
                <div className="font-medium text-gray-900">횟수제</div>
                <div className="text-sm text-gray-500 mt-1">정해진 횟수만큼 PT 이용</div>
                <div className="text-xs text-gray-400 mt-1">예: PT 10회권, PT 20회권</div>
              </div>
            </label>

            <label className={`relative flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
              formData.ptType === PTType.TERM_BASED
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${inputDisabled ? 'cursor-not-allowed opacity-50' : ''}`}>
              <input
                type="radio"
                name="ptType"
                value={PTType.TERM_BASED}
                checked={formData.ptType === PTType.TERM_BASED}
                onChange={(e) => handlePTTypeChange(e.target.value as PTType)}
                disabled={inputDisabled}
                className="sr-only"
              />
              <div>
                <div className="font-medium text-gray-900">기간제</div>
                <div className="text-sm text-gray-500 mt-1">정해진 기간 동안 PT 무제한</div>
                <div className="text-xs text-gray-400 mt-1">예: PT 1개월 무제한</div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* 이용권 이름 */}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          이용권 이름 <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="예: 헬스 3개월, PT 10회권"
          className={commonInputClass}
          value={formData.name || ''}
          onChange={handleChange}
          disabled={inputDisabled}
          maxLength={100}
        />
      </div>

      {/* 가격 */}
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
          value={formData.price ?? ''}
          onChange={handleChange}
          disabled={inputDisabled}
          min={0}
        />
      </div>

      {/* 기간 입력 (월간 회원권 또는 기간제 PT) */}
      {(formData.membershipCategory === MembershipCategory.MONTHLY || 
        (formData.membershipCategory === MembershipCategory.PT && formData.ptType === PTType.TERM_BASED)) && (
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
      )}

      {/* 세션 수 입력 (횟수제 PT) */}
      {formData.membershipCategory === MembershipCategory.PT && formData.ptType === PTType.SESSION_BASED && (
        <div className="space-y-1">
          <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700">
            PT 세션 수 <span className="text-red-500">*</span>
          </label>
          <input
            id="maxUses"
            type="number"
            name="maxUses"
            placeholder="10"
            className={commonInputClass}
            value={formData.maxUses === null ? '' : formData.maxUses}
            onChange={handleChange}
            disabled={inputDisabled}
            min={1}
          />
        </div>
      )}

      {/* 설명 */}
      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          설명
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="이용권에 대한 간단한 설명"
          className={commonInputClass}
          value={formData.description || ''}
          onChange={handleChange}
          disabled={inputDisabled}
          maxLength={255}
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