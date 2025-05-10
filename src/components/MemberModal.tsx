import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Member, memberSchema } from '../models/types';
import { z } from 'zod';
import Modal from './common/Modal';
import { useToast, ToastType } from '../contexts/ToastContext';

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
        {/* 회원 상세 정보 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-blue-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-blue-800">회원 상세 정보</h3>
          </div>
          
          {currentIsViewMode ? (
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-6">
                {/* 회원 기본 정보 - 왼쪽 */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl font-bold border border-gray-300">
                      {formData.name?.charAt(0) || '?'}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold">{formData.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                          {formData.gender || '성별 미지정'}
                        </span>
                        {formData.birthDate && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                            {formatDate(formData.birthDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">연락처</p>
                      <p className="font-medium">{formData.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">이메일</p>
                      <p className="font-medium">{formData.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">가입일</p>
                      <p className="font-medium">{formatDate(formData.joinDate)}</p>
                    </div>
                  </div>
                  
                  {formData.notes && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                      <p className="text-sm text-gray-500 mb-1">메모</p>
                      <p className="text-sm">{formData.notes}</p>
                    </div>
                  )}
                </div>

                {/* 현재 이용권 정보 (상세 보기 모드에서만 표시) */}
                <div className="flex-1 mt-6 md:mt-0">
                  <div className="bg-white rounded-lg border p-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold">현재 이용권</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        membershipStatus === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {membershipStatus === 'active' ? '사용중' : '만료'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">이용권 종류</p>
                        <p className="font-semibold text-lg">{formData.membershipType || '-'}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">시작일</p>
                        <p className="font-semibold">{formatDate(formData.membershipStart)}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">종료일</p>
                        <p className="font-semibold">{formatDate(formData.membershipEnd)}</p>
                      </div>
                    </div>
                    
                    {membershipStatus === 'active' && (
                      <div className="mt-4 text-center">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ 
                              width: `${Math.max(0, Math.min(100, daysLeft / 30 * 100))}%` 
                            }}
                          ></div>
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-700">
                          {daysLeft}일 남음
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    전화번호
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="000-0000-0000"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    성별
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    생년월일
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가입일
                  </label>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    회원권 종류
                  </label>
                  <select
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="1개월권">1개월권</option>
                    <option value="3개월권">3개월권</option>
                    <option value="6개월권">6개월권</option>
                    <option value="12개월권">12개월권</option>
                    <option value="PT 10회">PT 10회</option>
                    <option value="PT 20회">PT 20회</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    회원권 시작일
                  </label>
                  <input
                    type="date"
                    name="membershipStart"
                    value={formData.membershipStart}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    회원권 종료일
                  </label>
                  <input
                    type="date"
                    name="membershipEnd"
                    value={formData.membershipEnd}
                    onChange={handleChange}
                    className={`input ${errors.membershipEnd ? 'border-red-500' : ''}`}
                    readOnly // 자동 계산되므로 읽기 전용
                  />
                  {errors.membershipEnd && (
                    <p className="text-red-500 text-xs mt-1">{errors.membershipEnd}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 메모 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">메모</h3>
          </div>
          
          <div className="p-4">
            {currentIsViewMode ? (
              <div className="bg-gray-50 p-3 rounded">
                {formData.notes ? (
                  <p>{formData.notes}</p>
                ) : (
                  <p className="text-gray-500">등록된 메모가 없습니다.</p>
                )}
              </div>
            ) : (
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input w-full h-24"
                placeholder="회원에 대한 특이사항이나 메모를 입력하세요."
              ></textarea>
            )}
          </div>
        </div>
        
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

