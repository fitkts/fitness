import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { Locker, Member, LockerSize, LockerFeeOption } from '../models/types';
import { useToast } from '../contexts/ToastContext';
import { Search, X, PlusCircle, Trash2 } from 'lucide-react';
import { validateLocker, validateDates, validateLockerStatus } from '../utils/validation';

interface LockerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (locker: Locker) => Promise<boolean>;
  locker?: Locker | null;
  isViewMode?: boolean;
}

const defaultLocker: Locker = {
  number: '',
  status: 'available',
  size: LockerSize.SMALL,
  location: '',
  feeOptions: [{ durationDays: 30, price: 0 }],
  memberId: undefined,
  memberName: undefined,
  startDate: undefined,
  endDate: undefined,
  notes: '',
};

const LockerModal: React.FC<LockerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  locker,
  isViewMode = false,
}) => {
  const [formData, setFormData] = useState<Locker>(() => locker ? { ...defaultLocker, ...locker } : { ...defaultLocker });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentIsViewMode, setCurrentIsViewMode] = useState(isViewMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { showToast } = useToast();

  // 신규 추가 모드인지 확인
  const isAddMode = !locker;

  useEffect(() => {
    const initialData = locker ? { ...defaultLocker, ...locker, feeOptions: locker.feeOptions && locker.feeOptions.length > 0 ? locker.feeOptions : [{ durationDays: 30, price: 0 }] } : { ...defaultLocker };
    setFormData(initialData);
    setCurrentIsViewMode(!!locker && isViewMode);

    if (locker && locker.memberId && locker.memberName) {
      setSelectedMember({ id: locker.memberId, name: locker.memberName, joinDate: '' });
    } else {
    setSelectedMember(null);
    }

    setSearchTerm('');
    setSearchResults([]);
    setErrors({});
  }, [locker, isOpen, isViewMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    index?: number,
    field?: keyof LockerFeeOption
  ) => {
    const { name, value } = e.target;

    if (typeof index === 'number' && field && formData.feeOptions) {
      const updatedFeeOptions = [...formData.feeOptions];
      const numValue = parseInt(value, 10);
      updatedFeeOptions[index] = {
        ...updatedFeeOptions[index],
        [field]: isNaN(numValue) ? 0 : numValue,
      };
      setFormData((prev) => ({ ...prev, feeOptions: updatedFeeOptions }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === 'notes' && value.length > 500) {
      setErrors(prev => ({ ...prev, notes: '비고는 500자 이내로 입력해주세요' }));
    } else if (name === 'notes') {
      setErrors(prev => { const { notes, ...rest } = prev; return rest; });
    }
  };

  const addFeeOption = () => {
    setFormData((prev) => ({
      ...prev,
      feeOptions: [...(prev.feeOptions || []), { durationDays: 0, price: 0 }],
    }));
  };

  const removeFeeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      feeOptions: prev.feeOptions?.filter((_, i) => i !== index),
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationResult = validateLocker(formData);
    if (!validationResult.isValid && validationResult.errors) {
      setErrors(validationResult.errors);
      return;
    }

    if (formData.status === 'occupied') {
      const dateValidation = validateDates(formData.startDate, formData.endDate);
      if (!dateValidation.isValid) {
        setErrors(prev => ({ ...prev, startDate: dateValidation.error, endDate: dateValidation.error }));
        return;
      }
    }

    const statusValidation = validateLockerStatus(
      formData.status,
      formData.memberId,
      formData.startDate,
      formData.endDate
    );
    if (!statusValidation.isValid) {
      setErrors(prev => ({ ...prev, status: statusValidation.error }));
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('락커 저장 오류:', error);
      showToast('error', '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    try {
      setIsSearching(true);
      if (window.api && window.api.searchMembers) {
        const response = await window.api.searchMembers(term);
        if (response.success && response.data) {
          setSearchResults(response.data);
        } else {
          setSearchResults([]);
          if (response.error) { showToast('error', `회원 검색 실패: ${response.error}`); }
        }
      } else {
        showToast('error', '회원 검색 API를 사용할 수 없습니다.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('회원 검색 오류:', error);
      showToast('error', '회원 검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setFormData((prev) => ({ ...prev, memberId: member.id, memberName: member.name }));
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    setFormData((prev) => ({ ...prev, memberId: undefined, memberName: undefined }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentIsViewMode ? '락커 상세 정보' : formData?.id ? '락커 정보 수정' : '신규 락커 등록'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
              락커 번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="number"
              id="number"
              value={formData.number || ''}
              onChange={handleChange}
              disabled={currentIsViewMode}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
              required
            />
            {errors.number && <p className="text-xs text-red-500 mt-1">{errors.number}</p>}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              상태 <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              disabled={currentIsViewMode}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
            >
              <option value="available">사용 가능</option>
              <option value="occupied">사용 중</option>
              <option value="maintenance">수리 중</option>
            </select>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
          </div>

          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
              크기
            </label>
            <select
              name="size"
              id="size"
              value={formData.size || ''}
              onChange={handleChange}
              disabled={currentIsViewMode}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
            >
              <option value="">크기 선택</option>
              {Object.values(LockerSize).map((sizeValue) => (
                <option key={sizeValue} value={sizeValue}>
                  {sizeValue === LockerSize.SMALL ? '소형' : sizeValue === LockerSize.MEDIUM ? '중형' : '대형'}
                </option>
              ))}
            </select>
            {errors.size && <p className="text-xs text-red-500 mt-1">{errors.size}</p>}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              위치
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location || ''}
              onChange={handleChange}
              disabled={currentIsViewMode}
              placeholder="예: 1층 A구역, 2층 창가쪽"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
            />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>
        </div>

        {/* 회원 정보 (사용 중 상태이거나 기존 락커 수정 시에만 표시) */}
        {(formData.status === 'occupied' || (!isAddMode && !currentIsViewMode)) && (
          <>
            {/* 회원 검색 (View 모드가 아닐 때만) */}
            {!currentIsViewMode && formData.status === 'occupied' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회원 검색
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="회원명 또는 전화번호로 검색..."
                    className="input w-full pl-10"
                  />
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 border rounded-md shadow-sm max-h-48 overflow-y-auto">
                    {searchResults.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => handleSelectMember(member)}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.phone}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedMember && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-md flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedMember.name}</p>
                      <p className="text-sm text-gray-500">
                        {selectedMember.phone}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearMember}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 사용 기간 (사용 중 상태일 때만) */}
            {formData.status === 'occupied' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시작일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`input w-full ${errors.startDate ? 'border-red-500' : ''}`}
                    disabled={currentIsViewMode}
                    required
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    종료일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`input w-full ${errors.endDate ? 'border-red-500' : ''}`}
                    disabled={currentIsViewMode}
                    required
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* 요금 설정 (신규 추가 모드가 아니고 View 모드도 아닐 때만 표시) */}
        {!isAddMode && !currentIsViewMode && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">요금 설정</h3>
            {formData.feeOptions && formData.feeOptions.map((option, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-center mb-2 p-2 border rounded-md">
                <div className="col-span-5">
                  <label htmlFor={`durationDays-${index}`} className="block text-xs font-medium text-gray-600">기간 (일)</label>
                  <input
                    type="number"
                    name={`feeOptions[${index}].durationDays`}
                    id={`durationDays-${index}`}
                    value={option.durationDays || 0}
                    onChange={(e) => handleChange(e, index, 'durationDays')}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    min="1"
                  />
                </div>
                <div className="col-span-5">
                  <label htmlFor={`price-${index}`} className="block text-xs font-medium text-gray-600">가격 (원)</label>
                  <input
                    type="number"
                    name={`feeOptions[${index}].price`}
                    id={`price-${index}`}
                    value={option.price || 0}
                    onChange={(e) => handleChange(e, index, 'price')}
                    className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                    min="0"
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  {(formData.feeOptions && formData.feeOptions.length > 1) ? (
                    <button
                      type="button"
                      onClick={() => removeFeeOption(index)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="이 옵션 삭제"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeeOption}
              className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            >
              <PlusCircle size={20} className="mr-1" />
              요금 옵션 추가
            </button>
            {errors.feeOptions && <p className="text-xs text-red-500 mt-1">{errors.feeOptions}</p>}
          </div>
        )}

        {/* 비고 */}
        <div className="pt-4 border-t border-gray-200">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              비고
            </label>
            <textarea
              name="notes"
            value={formData.notes || ''}
              onChange={handleChange}
              className="input w-full"
              rows={3}
              disabled={currentIsViewMode}
            />
          {errors.notes && <p className="text-xs text-red-500 mt-1">{errors.notes}</p>}
        </div>

        {/* 버튼 영역 */}
        <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              취소
            </button>
          {!currentIsViewMode && (
            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {isSubmitting ? '저장 중...' : (formData?.id ? '수정 완료' : '락커 등록')}
            </button>
          )}
          </div>
      </form>
    </Modal>
  );
};

export default LockerModal;
