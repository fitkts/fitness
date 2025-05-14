import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Member, memberSchema, Staff } from '../models/types';
import { z } from 'zod';
import Modal from './common/Modal';
import { useToast, ToastType } from '../contexts/ToastContext';
import { getAllStaff } from '../database/ipcService';
import MemberBasicInfoForm from './member/MemberBasicInfoForm';
import MembershipInfoForm from './member/MembershipInfoForm';
import MemberNotesForm from './member/MemberNotesForm';
import MemberViewDetails from './member/MemberViewDetails';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Member) => Promise<boolean>;
  onEdit?: () => void; // 상세 보기에서 수정 모드로 전환 콜백
  member?: Member | null; // 수정 모드일 때 제공
  isViewMode?: boolean; // 상세 보기 모드인지 여부
  onSwitchToEdit?: () => void; // 상세 보기 -> 수정 전환 콜백 추가 가정
}

const defaultMember: Member = {
  name: '',
  phone: '',
  email: '',
  gender: '남성',
  birthDate: '',
  joinDate: new Date().toISOString().split('T')[0],
  membershipType: '1개월권',
  membershipStart: new Date().toISOString().split('T')[0],
  membershipEnd: '',
  notes: '',
};

const MemberModal: React.FC<MemberModalProps> = ({ isOpen, onClose, onSave, onEdit, member, isViewMode = false, onSwitchToEdit }) => {
  const [formData, setFormData] = useState<Member>(defaultMember);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentIsViewMode, setCurrentIsViewMode] = useState(isViewMode);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  
  let showToast: (type: ToastType, message: string) => void;
  try {
    const toastContext = useToast();
    showToast = toastContext?.showToast || ((type, message) => console.log(`Fallback Toast (${type}): ${message}`));
  } catch (error) {
    console.error("MemberModal: Toast 컨텍스트를 사용할 수 없습니다:", error);
    showToast = (type, message) => console.log(`Error Toast (${type}): ${message}`);
  }

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
        birthDate: member.birthDate || '',
        joinDate: member.joinDate || new Date().toISOString().split('T')[0],
        membershipStart: member.membershipStart || '',
        membershipEnd: member.membershipEnd || '',
        notes: member.notes || '',
      });
      setIsEditMode(true);
    } else {
      setFormData(defaultMember);
      setIsEditMode(false);
    }
    setErrors({});
    setCurrentIsViewMode(isViewMode);
  }, [member, isOpen, isViewMode]);

  // 직원 목록 로드
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const response = await getAllStaff();
        if (response.success && response.data) {
          setStaffList(response.data);
        }
      } catch (error) {
        console.error('직원 목록 로드 오류:', error);
      }
    };
    loadStaff();
  }, []);

  // 날짜 계산 헬퍼 함수
  const calculateEndDate = (startDate: string, type: string): string => {
    if (!startDate) return '';
    
    const date = new Date(startDate);
    let months = 0;
    
    switch (type) {
      case '1개월권':
        months = 1;
        break;
      case '3개월권':
        months = 3;
        break;
      case '6개월권':
        months = 6;
        break;
      case '12개월권':
        months = 12;
        break;
      default:
        return '';
    }
    
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 기본적인 유효성 검사만 수행
      // 이메일은 비워도 되고, 전화번호는 형식만 맞으면 됨
      if (!formData.name) {
        setErrors({ name: '이름은 필수입니다' });
        return;
      }
      
      // 이메일이 있는 경우에만 유효성 검사
      if (formData.email && !formData.email.includes('@')) {
        setErrors({ email: '유효한 이메일을 입력하세요' });
        return;
      }
      
      // 저장 상태로 변경
      setIsSubmitting(true);
      
      // 저장 요청
      const success = await onSave(formData);
      
      // 결과에 따라 토스트 알림 표시
      if (success) {
        showToast('success', isEditMode ? '회원 정보가 수정되었습니다.' : '새 회원이 등록되었습니다.');
        onClose();
      } else {
        showToast('error', '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('폼 제출 오류:', error);
      showToast('error', '처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 전화번호 형식 변환 함수
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 길이 제한
    const limitedNumbers = numbers.slice(0, 11);
    
    // 형식에 맞게 변환
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  // 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 전화번호 형식 자동 변환
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, phone: formattedPhone }));
    } else if (name === 'staffId') {
      // 담당자 선택 시 staffName도 동기화
      const staffId = value ? Number(value) : undefined;
      const staffName = staffId ? staffList.find(s => s.id === staffId)?.name : undefined;
      setFormData(prev => ({ ...prev, staffId, staffName }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // 회원권 시작일 또는 타입이 변경되면 종료일 자동 계산
    if (name === 'membershipStart' || name === 'membershipType') {
      if (formData.membershipType && formData.membershipStart) {
        const endDate = calculateEndDate(
          name === 'membershipStart' ? value : formData.membershipStart,
          name === 'membershipType' ? value : formData.membershipType
        );
        setFormData(prev => ({ ...prev, membershipEnd: endDate }));
      }
    }
    
    // 오류 메시지 지우기
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  // 회원권 상태 확인 함수
  const getMembershipStatus = (endDate: string | undefined) => {
    if (!endDate) return 'expired';
    
    const now = new Date();
    const expiryDate = new Date(endDate);
    
    return expiryDate >= now ? 'active' : 'expired';
  };

  // 날짜 포맷팅 함수 추가
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const membershipStatus = getMembershipStatus(formData.membershipEnd);
  const daysLeft = formData.membershipEnd ? 
    Math.max(0, Math.floor((new Date(formData.membershipEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

  const getModalTitle = () => {
    if (currentIsViewMode) return '회원 상세 정보';
    return isEditMode ? '회원 정보 수정' : '신규 회원 등록';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-blue-800">
              {currentIsViewMode ? '회원 상세 정보' : (isEditMode ? '회원 정보 수정' : '신규 회원 등록')}
            </h3>
          </div>
          
          {currentIsViewMode ? (
            <MemberViewDetails 
              formData={formData}
              membershipStatus={membershipStatus}
              daysLeft={daysLeft}
              formatDate={formatDate}
            />
          ) : (
            <div className="p-4">
              <MemberBasicInfoForm
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                isViewMode={false}
                isSubmitting={isSubmitting}
              />
              <MembershipInfoForm
                formData={formData}
                staffList={staffList}
                handleChange={handleChange}
                errors={errors}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </div>
        
        <MemberNotesForm 
          notes={formData.notes}
          handleChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>)}
          isViewMode={currentIsViewMode}
          isSubmitting={isSubmitting}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            {currentIsViewMode ? '닫기' : '취소'}
          </button>
          
          {!currentIsViewMode && (
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  저장 중...
                </span>
              ) : '저장'}
            </button>
          )}
          
          {currentIsViewMode && onSwitchToEdit && (
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={onSwitchToEdit}
            >
              수정하기
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default MemberModal;

