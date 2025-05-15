import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { Locker, Member } from '../types';
import { useToast } from '../contexts/ToastContext';
import { Search, X } from 'lucide-react';

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
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  notes: '',
};

const LockerModal: React.FC<LockerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  locker,
  isViewMode = false,
}) => {
  const [formData, setFormData] = useState<Locker>(defaultLocker);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentIsViewMode, setCurrentIsViewMode] = useState(isViewMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { showToast } = useToast();

  useEffect(() => {
    if (locker) {
      setFormData({
        ...locker,
        startDate: locker.startDate || '',
        endDate: locker.endDate || '',
        notes: locker.notes || '',
      });
      setCurrentIsViewMode(isViewMode);
    } else {
      setFormData(defaultLocker);
      setCurrentIsViewMode(false);
    }
    setErrors({});
    setSelectedMember(null);
  }, [locker, isOpen, isViewMode]);

  // 회원 검색 핸들러
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
          if (response.error) {
            showToast('error', `회원 검색 실패: ${response.error}`);
          }
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

  // 회원 선택 핸들러
  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setFormData((prev) => ({
      ...prev,
      memberId: member.id,
      memberName: member.name,
    }));
    setSearchResults([]);
    setSearchTerm('');
  };

  // 회원 선택 해제 핸들러
  const handleClearMember = () => {
    setSelectedMember(null);
    setFormData((prev) => ({
      ...prev,
      memberId: undefined,
      memberName: undefined,
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors: Record<string, string> = {};

    if (!formData.number) {
      newErrors.number = '락커 번호는 필수입니다';
    }

    if (formData.status === 'occupied') {
      if (!formData.memberId) {
        newErrors.memberId = '사용 중인 락커는 회원을 선택해야 합니다';
      }
      if (!formData.startDate) {
        newErrors.startDate = '시작일은 필수입니다';
      }
      if (!formData.endDate) {
        newErrors.endDate = '종료일은 필수입니다';
      }
      if (
        formData.startDate &&
        formData.endDate &&
        formData.startDate > formData.endDate
      ) {
        newErrors.endDate = '종료일은 시작일보다 이후여야 합니다';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await onSave(formData);

      if (success) {
        showToast(
          'success',
          formData.id
            ? '락커 정보가 수정되었습니다.'
            : '락커가 배정되었습니다.',
        );
        onClose();
      }
    } catch (error) {
      console.error('락커 저장 오류:', error);
      showToast('error', '저장 중 오류가 발생했습니다.');
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        currentIsViewMode
          ? '락커 상세 정보'
          : formData.id
            ? '락커 정보 수정'
            : '신규 락커 등록'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          {/* 락커 번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              락커 번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className={`input w-full ${errors.number ? 'border-red-500' : ''}`}
              disabled={currentIsViewMode}
              required
            />
            {errors.number && (
              <p className="text-red-500 text-xs mt-1">{errors.number}</p>
            )}
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input w-full"
              disabled={currentIsViewMode}
            >
              <option value="available">사용 가능</option>
              <option value="occupied">사용 중</option>
              <option value="maintenance">점검 중</option>
            </select>
          </div>

          {/* 회원 검색 및 선택 (사용 중 상태일 때만) */}
          {formData.status === 'occupied' && !currentIsViewMode && (
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

              {/* 검색 결과 */}
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

              {/* 선택된 회원 */}
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

          {/* 비고 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비고
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input w-full"
              rows={3}
              disabled={currentIsViewMode}
            />
          </div>
        </div>

        {/* 버튼 */}
        {!currentIsViewMode && (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default LockerModal;
