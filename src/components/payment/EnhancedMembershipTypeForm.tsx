import React, { useState, useEffect } from 'react';
import { MembershipCategory, PTType, MembershipType, MembershipTypeFormData } from '../../models/types';
import { useToast } from '../../contexts/ToastContext';
import { addMembershipType, updateMembershipType } from '../../database/ipcService';
import { MEMBERSHIP_CATEGORY_OPTIONS, PT_TYPE_OPTIONS, MEMBERSHIP_TEMPLATES, DEFAULT_FORM_VALUES } from '../../config/enhancedMembershipConfig';
import { validateMembershipForm, convertFormDataToMembershipType, convertMembershipTypeToFormData, formatMembershipPrice } from '../../utils/enhancedMembershipUtils';

interface EnhancedMembershipTypeFormProps {
  formId: string;
  initialMembershipType: MembershipType | null;
  isViewMode: boolean;
  onSubmitSuccess: () => void;
  setSubmitLoading: (isLoading: boolean) => void;
}

const EnhancedMembershipTypeForm: React.FC<EnhancedMembershipTypeFormProps> = ({
  formId,
  initialMembershipType,
  isViewMode,
  onSubmitSuccess,
  setSubmitLoading,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<MembershipTypeFormData>(DEFAULT_FORM_VALUES);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialMembershipType) {
      setFormData(convertMembershipTypeToFormData(initialMembershipType));
    } else {
      setFormData(DEFAULT_FORM_VALUES);
    }
  }, [initialMembershipType]);

  const handleCategoryChange = (category: MembershipCategory) => {
    setFormData(prev => ({
      ...prev,
      membershipCategory: category,
      ptType: category === MembershipCategory.PT ? PTType.SESSION_BASED : null,
      durationMonths: category === MembershipCategory.MONTHLY ? 1 : undefined,
      maxUses: category === MembershipCategory.PT ? 10 : null,
      name: '', // 카테고리 변경 시 이름 초기화
      price: 0
    }));
    setValidationErrors({}); // 검증 오류 초기화
  };

  const handlePTTypeChange = (ptType: PTType) => {
    setFormData(prev => ({
      ...prev,
      ptType,
      durationMonths: ptType === PTType.TERM_BASED ? 1 : undefined,
      maxUses: ptType === PTType.SESSION_BASED ? 10 : null,
      name: '', // PT 유형 변경 시 이름 초기화
      price: 0
    }));
    setValidationErrors({});
  };

  const handleTemplateSelect = (template: any) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      price: template.price,
      durationMonths: template.durationMonths,
      maxUses: template.maxUses,
      description: template.description || ''
    }));
  };

  const handleInputChange = (field: keyof MembershipTypeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 해당 필드의 검증 오류 제거
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 유효성 검사
    const validation = validateMembershipForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      showToast('error', '입력 정보를 확인해주세요.');
      return;
    }

    setSubmitLoading(true);

    try {
      const membershipData = convertFormDataToMembershipType(formData);
      let response;

      if (initialMembershipType?.id) {
        const updateData = { ...membershipData, id: initialMembershipType.id } as MembershipType;
        response = await updateMembershipType(updateData);
      } else {
        response = await addMembershipType(membershipData);
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
  const commonInputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 transition-colors";
  const errorInputClass = "border-red-500 focus:ring-red-500 focus:border-red-500";

  // 템플릿 목록 가져오기
  const getTemplates = () => {
    if (formData.membershipCategory === MembershipCategory.MONTHLY) {
      return MEMBERSHIP_TEMPLATES[MembershipCategory.MONTHLY];
    }
    if (formData.membershipCategory === MembershipCategory.PT) {
      if (formData.ptType === PTType.SESSION_BASED) {
        return MEMBERSHIP_TEMPLATES[PTType.SESSION_BASED];
      }
      if (formData.ptType === PTType.TERM_BASED) {
        return MEMBERSHIP_TEMPLATES[PTType.TERM_BASED];
      }
    }
    return [];
  };

  return (
    <form id={formId} className="space-y-6" onSubmit={handleSubmit}>
      {/* 이용권 카테고리 선택 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          이용권 카테고리 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MEMBERSHIP_CATEGORY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.membershipCategory === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${inputDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              <input
                type="radio"
                name="membershipCategory"
                value={option.value}
                checked={formData.membershipCategory === option.value}
                onChange={(e) => handleCategoryChange(e.target.value as MembershipCategory)}
                disabled={inputDisabled}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* PT 유형 선택 (PT 회원권인 경우만 표시) */}
      {formData.membershipCategory === MembershipCategory.PT && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            PT 유형 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PT_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.ptType === option.value
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${inputDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <input
                  type="radio"
                  name="ptType"
                  value={option.value}
                  checked={formData.ptType === option.value}
                  onChange={(e) => handlePTTypeChange(e.target.value as PTType)}
                  disabled={inputDisabled}
                  className="sr-only"
                />
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{option.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{option.example}</div>
                </div>
              </label>
            ))}
          </div>
          {validationErrors.ptType && (
            <p className="text-sm text-red-600">{validationErrors.ptType}</p>
          )}
        </div>
      )}

      {/* 템플릿 선택 */}
      {!isViewMode && getTemplates().length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            빠른 템플릿 선택 (선택사항)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {getTemplates().map((template, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{template.name}</div>
                <div className="text-sm text-gray-500">{formatMembershipPrice(template.price)}</div>
              </button>
            ))}
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
          placeholder="예: 헬스 3개월, PT 10회권"
          className={`${commonInputClass} ${validationErrors.name ? errorInputClass : ''}`}
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={inputDisabled}
          maxLength={50}
        />
        {validationErrors.name && (
          <p className="text-sm text-red-600">{validationErrors.name}</p>
        )}
      </div>

      {/* 가격 */}
      <div className="space-y-1">
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          가격 (원) <span className="text-red-500">*</span>
        </label>
        <input
          id="price"
          type="number"
          placeholder="0"
          className={`${commonInputClass} ${validationErrors.price ? errorInputClass : ''}`}
          value={formData.price || ''}
          onChange={(e) => handleInputChange('price', e.target.value ? parseInt(e.target.value) : 0)}
          disabled={inputDisabled}
          min={0}
          step={1000}
        />
        {validationErrors.price && (
          <p className="text-sm text-red-600">{validationErrors.price}</p>
        )}
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
            placeholder="1"
            className={`${commonInputClass} ${validationErrors.durationMonths ? errorInputClass : ''}`}
            value={formData.durationMonths || ''}
            onChange={(e) => handleInputChange('durationMonths', e.target.value ? parseInt(e.target.value) : 1)}
            disabled={inputDisabled}
            min={1}
            max={24}
          />
          {validationErrors.durationMonths && (
            <p className="text-sm text-red-600">{validationErrors.durationMonths}</p>
          )}
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
            placeholder="10"
            className={`${commonInputClass} ${validationErrors.maxUses ? errorInputClass : ''}`}
            value={formData.maxUses || ''}
            onChange={(e) => handleInputChange('maxUses', e.target.value ? parseInt(e.target.value) : null)}
            disabled={inputDisabled}
            min={1}
            max={100}
          />
          {validationErrors.maxUses && (
            <p className="text-sm text-red-600">{validationErrors.maxUses}</p>
          )}
        </div>
      )}

      {/* 설명 */}
      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          설명 (선택사항)
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="이용권에 대한 상세 설명을 입력하세요"
          className={commonInputClass}
          value={formData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          disabled={inputDisabled}
          maxLength={500}
        />
      </div>

      {/* 활성화 여부 */}
      <div className="space-y-2">
        <label htmlFor="isActive" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <input
            id="isActive"
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            disabled={inputDisabled}
          />
          <span>이용권 활성화</span>
        </label>
        {isViewMode && (
          <p className={`text-sm ${formData.isActive ? 'text-green-600' : 'text-red-600'}`}>
            {formData.isActive ? '활성화됨' : '비활성화됨'}
          </p>
        )}
      </div>
    </form>
  );
};

export default EnhancedMembershipTypeForm; 