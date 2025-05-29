import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import DragDropNumberInput from './forms/DragDropNumberInput';
import { useToast } from '../contexts/ToastContext';
import { Locker } from '../models/types';
import { 
  BulkAddFormData, 
  BulkAddResult, 
  BulkAddMode 
} from '../types/lockerBulkAdd';
import {
  BULK_ADD_MODES,
  LOCKER_SIZE_OPTIONS,
  LOCATION_OPTIONS,
  DEFAULT_BULK_ADD_DATA,
  BULK_ADD_LIMITS
} from '../config/lockerBulkConfig';
import {
  generateRangeNumbers,
  validateLockerNumbers,
  generateLockersFromBulkData,
  calculateEstimatedCount
} from '../utils/lockerBulkUtils';
import { Plus, Hash, List, AlertTriangle, CheckCircle } from 'lucide-react';

interface LockerBulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lockers: Locker[]) => Promise<boolean>;
  existingLockers: Locker[];
}

const LockerBulkAddModal: React.FC<LockerBulkAddModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingLockers
}) => {
  const [formData, setFormData] = useState<BulkAddFormData>({ ...DEFAULT_BULK_ADD_DATA });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedCount, setEstimatedCount] = useState(0);
  const [validationResult, setValidationResult] = useState<any>(null);

  const { showToast } = useToast();

  // 모달이 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...DEFAULT_BULK_ADD_DATA });
      setErrors({});
      setValidationResult(null);
      setEstimatedCount(0);
    }
  }, [isOpen]);

  // 예상 생성 개수 계산
  useEffect(() => {
    const count = calculateEstimatedCount(formData);
    setEstimatedCount(count);
  }, [formData]);

  // 모드 변경 핸들러
  const handleModeChange = (mode: BulkAddMode) => {
    setFormData(prev => ({ ...prev, mode }));
    setErrors({});
    setValidationResult(null);
  };

  // 공통 필드 변경 핸들러
  const handleCommonFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [prev.mode]: {
        ...prev[prev.mode],
        [field]: value
      }
    }));
  };

  // 범위 입력 핸들러
  const handleRangeChange = (field: 'startNumber' | 'endNumber', value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setFormData(prev => ({
      ...prev,
      range: {
        ...prev.range,
        [field]: numValue
      }
    }));
  };

  // 다중 번호 변경 핸들러
  const handleMultipleNumbersChange = (numbers: string[]) => {
    setFormData(prev => ({
      ...prev,
      multiple: {
        ...prev.multiple,
        numbers
      }
    }));
  };

  // 유효성 검증
  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
    
    switch (formData.mode) {
      case 'single':
        if (!formData.single.number.trim()) {
          newErrors.singleNumber = '락커 번호를 입력해주세요.';
        }
        break;
        
      case 'range':
        if (formData.range.startNumber <= 0) {
          newErrors.startNumber = '시작 번호는 1 이상이어야 합니다.';
        }
        if (formData.range.endNumber <= 0) {
          newErrors.endNumber = '종료 번호는 1 이상이어야 합니다.';
        }
        if (formData.range.startNumber > formData.range.endNumber) {
          newErrors.rangeOrder = '시작 번호는 종료 번호보다 작거나 같아야 합니다.';
        }
        if (formData.range.endNumber - formData.range.startNumber + 1 > BULK_ADD_LIMITS.MAX_RANGE_SIZE) {
          newErrors.rangeSize = `한번에 최대 ${BULK_ADD_LIMITS.MAX_RANGE_SIZE}개까지만 생성할 수 있습니다.`;
        }
        break;
        
      case 'multiple':
        if (formData.multiple.numbers.length === 0) {
          newErrors.multipleNumbers = '최소 하나 이상의 락커 번호를 입력해주세요.';
        }
        break;
    }

    // 락커 번호 중복 검증
    let numbersToValidate: string[] = [];
    switch (formData.mode) {
      case 'single':
        numbersToValidate = [formData.single.number];
        break;
      case 'range':
        numbersToValidate = generateRangeNumbers(formData.range);
        break;
      case 'multiple':
        numbersToValidate = formData.multiple.numbers;
        break;
    }

    if (numbersToValidate.length > 0) {
      const validation = await validateLockerNumbers(numbersToValidate, existingLockers);
      setValidationResult(validation);
      
      if (!validation.isValid) {
        newErrors.validation = validation.errors.join(', ');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      
      const lockersToCreate = generateLockersFromBulkData(formData);
      const success = await onSave(lockersToCreate);
      
      if (success) {
        showToast('success', `${lockersToCreate.length}개의 락커가 추가되었습니다.`);
        onClose();
      }
    } catch (error) {
      console.error('락커 벌크 추가 오류:', error);
      showToast('error', '락커 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="락커 추가"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 추가 모드 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            추가 방식 선택
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {BULK_ADD_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() => handleModeChange(mode.value)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.mode === mode.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center mb-2">
                  {mode.value === 'single' && <Plus size={20} />}
                  {mode.value === 'range' && <Hash size={20} />}
                  {mode.value === 'multiple' && <List size={20} />}
                  <span className="ml-2 font-medium">{mode.label}</span>
                </div>
                <p className="text-xs text-gray-600">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 모드별 입력 필드 */}
        <div className="border-t border-gray-200 pt-6">
          {formData.mode === 'single' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  락커 번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.single.number}
                  onChange={(e) => handleCommonFieldChange('number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="예: 101"
                />
                {errors.singleNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.singleNumber}</p>
                )}
              </div>
            </div>
          )}

          {formData.mode === 'range' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작 번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.range.startNumber}
                    onChange={(e) => handleRangeChange('startNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    min={BULK_ADD_LIMITS.MIN_LOCKER_NUMBER}
                    max={BULK_ADD_LIMITS.MAX_LOCKER_NUMBER}
                  />
                  {errors.startNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.startNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료 번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.range.endNumber}
                    onChange={(e) => handleRangeChange('endNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    min={BULK_ADD_LIMITS.MIN_LOCKER_NUMBER}
                    max={BULK_ADD_LIMITS.MAX_LOCKER_NUMBER}
                  />
                  {errors.endNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.endNumber}</p>
                  )}
                </div>
              </div>
              {(errors.rangeOrder || errors.rangeSize) && (
                <p className="text-red-500 text-xs">{errors.rangeOrder || errors.rangeSize}</p>
              )}
            </div>
          )}

          {formData.mode === 'multiple' && (
            <div>
              <DragDropNumberInput
                value={formData.multiple.numbers}
                onChange={handleMultipleNumbersChange}
                maxCount={BULK_ADD_LIMITS.MAX_MULTIPLE_COUNT}
              />
              {errors.multipleNumbers && (
                <p className="text-red-500 text-xs mt-1">{errors.multipleNumbers}</p>
              )}
            </div>
          )}
        </div>

        {/* 공통 설정 */}
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">공통 설정</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                락커 크기
              </label>
              <select
                value={formData[formData.mode].size}
                onChange={(e) => handleCommonFieldChange('size', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {LOCKER_SIZE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                위치
              </label>
              <select
                value={formData[formData.mode].location}
                onChange={(e) => handleCommonFieldChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">위치 선택</option>
                {LOCATION_OPTIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비고
            </label>
            <textarea
              value={formData[formData.mode].notes || ''}
              onChange={(e) => handleCommonFieldChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="필요한 경우 추가 정보를 입력하세요"
            />
          </div>
        </div>

        {/* 예상 결과 표시 */}
        {estimatedCount > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-blue-900">
                  예상 생성 락커: {estimatedCount}개
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 유효성 검증 결과 */}
        {validationResult && !validationResult.isValid && (
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-900">
                  다음 문제를 해결해주세요:
                </span>
              </div>
              <ul className="text-sm text-red-700 ml-7 space-y-1">
                {validationResult.errors.map((error: string, index: number) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="border-t border-gray-200 pt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || estimatedCount === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? '추가 중...' : `${estimatedCount}개 락커 추가`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LockerBulkAddModal; 