import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { Locker, Member, LockerSize } from '../models/types';
import { useToast } from '../contexts/ToastContext';
import { validateLocker, validateDates, validateLockerStatus } from '../utils/validation';
import { getCurrentDate, addMonthsToDate, calculateMonthsDifference } from '../utils/lockerPaymentUtils';
import { validateMonthlyFee, formatCurrency, parseNumberFromString, getRecommendedFeeBySize } from '../utils/lockerUtils';
import { MONTHLY_FEE_CONFIG } from '../config/lockerConfig';

// 리팩토링된 컴포넌트들 import
import LockerBasicInfo from './locker/LockerBasicInfo';
import LockerMemberInfo from './locker/LockerMemberInfo';
import LockerUsagePeriod from './locker/LockerUsagePeriod';
import LockerPaymentInfo from './locker/LockerPaymentInfo';
import LockerMonthlyFee from './locker/LockerMonthlyFee';
import LockerNotes from './locker/LockerNotes';

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
  const [formData, setFormData] = useState<Locker>(() => 
    locker ? { ...defaultLocker, ...locker } : { ...defaultLocker }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentIsViewMode, setCurrentIsViewMode] = useState(isViewMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 회원 검색 관련 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // 결제 관련 상태
  const [paymentMethod, setPaymentMethod] = useState('현금');
  const [monthlyFee, setMonthlyFee] = useState<number>(MONTHLY_FEE_CONFIG.DEFAULT);
  const [feeError, setFeeError] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    const initialData = locker ? 
      { ...defaultLocker, ...locker, feeOptions: locker.feeOptions && locker.feeOptions.length > 0 ? locker.feeOptions : [{ durationDays: 30, price: 0 }] } : 
      { ...defaultLocker };
    
    setFormData(initialData);
    setCurrentIsViewMode(!!locker && isViewMode);

    // 월 사용료 초기화
    const initialFee = (locker as any)?.monthlyFee || 
      (initialData.size ? getRecommendedFeeBySize(initialData.size) : MONTHLY_FEE_CONFIG.DEFAULT);
    setMonthlyFee(initialFee);

    // 선택된 회원 초기화
    if (locker && locker.memberId && locker.memberName) {
      setSelectedMember({ id: locker.memberId, name: locker.memberName, joinDate: '' } as Member);
    } else {
      setSelectedMember(null);
    }

    // 상태 초기화
    setSearchTerm('');
    setSearchResults([]);
    setErrors({});
    setFeeError('');
  }, [locker, isOpen, isViewMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 락커 크기 변경 시 추천 요금 자동 적용
    if (name === 'size' && value) {
      const recommendedFee = getRecommendedFeeBySize(value as LockerSize);
      setMonthlyFee(recommendedFee);
    }

    // 비고 길이 체크
    if (name === 'notes' && value.length > 500) {
      setErrors(prev => ({ ...prev, notes: '비고는 500자 이내로 입력해주세요' }));
    } else if (name === 'notes') {
      setErrors(prev => { const { notes, ...rest } = prev; return rest; });
    }
  };

  // 월 사용료 변경 핸들러
  const handleMonthlyFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseNumberFromString(e.target.value);
    setMonthlyFee(value);

    // 유효성 검증
    const validation = validateMonthlyFee(value);
    if (!validation.isValid) {
      setFeeError(validation.error || '');
    } else {
      setFeeError('');
    }
  };

  // 요금 프리셋 선택 핸들러
  const handleFeePresetSelect = (fee: number) => {
    setMonthlyFee(fee);
    setFeeError('');
  };

  // 기간 선택 핸들러
  const handlePeriodSelect = (months: number) => {
    const startDate = formData.startDate || getCurrentDate();
    const endDate = addMonthsToDate(startDate, months);
    setFormData(prev => ({ ...prev, startDate, endDate }));
  };

  // 크기 변경 핸들러
  const handleSizeChange = (size: LockerSize) => {
    const recommendedFee = getRecommendedFeeBySize(size);
    setMonthlyFee(recommendedFee);
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
      const dataToSave = { ...formData, monthlyFee };
      const success = await onSave(dataToSave);
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
        {/* 1. 기본 정보 섹션 */}
        <LockerBasicInfo
          formData={{
            number: formData.number,
            status: formData.status,
            size: formData.size,
            location: formData.location
          }}
          onChange={handleChange}
          onSizeChange={handleSizeChange}
          errors={errors}
          isViewMode={currentIsViewMode}
        />

        {/* 2. 회원 정보 섹션 (사용 중 상태일 때만 표시) */}
        {formData.status === 'occupied' && (
          <LockerMemberInfo
            selectedMember={selectedMember}
            searchTerm={searchTerm}
            searchResults={searchResults}
            isSearching={isSearching}
            onSearch={handleSearch}
            onSelectMember={handleSelectMember}
            onClearMember={handleClearMember}
            isViewMode={currentIsViewMode}
            errors={errors}
          />
        )}

        {/* 3. 사용 기간 섹션 (사용 중 상태이고 편집 모드일 때만) */}
        {formData.status === 'occupied' && !currentIsViewMode && (
          <LockerUsagePeriod
            formData={{
              startDate: formData.startDate,
              endDate: formData.endDate
            }}
            onChange={handleChange}
            onPeriodSelect={handlePeriodSelect}
            errors={errors}
            isViewMode={currentIsViewMode}
          />
        )}

        {/* 4. 월 사용료 섹션 (사용 중 상태일 때만) */}
        {formData.status === 'occupied' && (
          <LockerMonthlyFee
            monthlyFee={monthlyFee}
            feeError={feeError}
            onFeeChange={handleMonthlyFeeChange}
            onPresetSelect={handleFeePresetSelect}
            isViewMode={currentIsViewMode}
          />
        )}

        {/* 5. 결제 정보 (사용 중 상태이고 편집 모드이며 날짜가 설정된 경우만) */}
        {formData.status === 'occupied' && !currentIsViewMode && (
          <LockerPaymentInfo
            startDate={formData.startDate}
            endDate={formData.endDate}
            monthlyFee={monthlyFee}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            isVisible={!!(formData.startDate && formData.endDate)}
          />
        )}

        {/* 6. 비고 */}
        <LockerNotes
          notes={formData.notes}
          onChange={handleChange}
          errors={errors}
          isViewMode={currentIsViewMode}
        />

        {/* 7. 버튼 영역 */}
        <div className="pt-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            취소
          </button>
          {!currentIsViewMode && (
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : (formData?.id ? '수정 완료' : '락커 등록')}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default LockerModal;
