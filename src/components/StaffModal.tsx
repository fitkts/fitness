import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import { Staff } from '../models/types';
import { useToast } from '../contexts/ToastContext';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Staff) => Promise<boolean>;
  staff?: Staff | null;
  isViewMode?: boolean;
}

const defaultPermissions = {
  dashboard: true,
  members: false,
  attendance: false,
  payment: false,
  lockers: false,
  staff: false,
  excel: false,
  backup: false,
  settings: false,
};

const defaultStaff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  position: '일반 직원',
  phone: '',
  email: '',
  hireDate: new Date().toISOString().split('T')[0],
  status: 'active',
  permissions: defaultPermissions,
  notes: '',
};

const StaffModal: React.FC<StaffModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  staff, 
  isViewMode = false 
}) => {
  const [formData, setFormData] = useState<Staff>(defaultStaff as Staff);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentIsViewMode, setCurrentIsViewMode] = useState(!!isViewMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (staff) {
      setFormData({
        ...staff,
        permissions: staff.permissions ?? defaultPermissions,
        notes: staff.notes || '',
      });
      setCurrentIsViewMode(!!isViewMode);
    } else {
      setFormData(defaultStaff as Staff);
      setCurrentIsViewMode(false);
    }
    setErrors({});
  }, [staff, isOpen, isViewMode]);

  // 전화번호 형식 변환 함수
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '');
    const limitedNumbers = numbers.slice(0, 11);
    
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 기본적인 유효성 검사
      const newErrors: Record<string, string> = {};
      
      if (!formData.name.trim()) {
        newErrors.name = '이름은 필수입니다';
      }
      
      if (!formData.position.trim()) {
        newErrors.position = '직책은 필수입니다';
      }
      
      if (formData.email && !formData.email.includes('@')) {
        newErrors.email = '유효한 이메일을 입력하세요';
      }
      
      if (formData.phone && !/^[\d-]{9,13}$/.test(formData.phone)) {
        newErrors.phone = '유효한 전화번호를 입력하세요';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsSubmitting(true);
      // status가 없으면 'active'로 강제
      const submitData = { ...formData, status: formData.status || 'active' };
      const success = await onSave(submitData);
      
      if (success) {
        showToast('success', currentIsViewMode ? '직원 정보가 수정되었습니다.' : '새 직원이 등록되었습니다.');
        onClose();
      } else {
        showToast('error', '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('직원 저장 오류:', error);
      showToast('error', '처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
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
    
    // 오류 메시지 지우기
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 권한 변경 핸들러
  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked
      }
    }));
  };

  // 권한 프리셋 설정
  const setPermissionPreset = (preset: string) => {
    if (preset === 'admin') {
      setFormData(prev => ({
        ...prev,
        permissions: {
          dashboard: true,
          members: true,
          attendance: true,
          payment: true,
          lockers: true,
          staff: true,
          excel: true,
          backup: true,
          settings: true,
        }
      }));
    } else if (preset === 'manager') {
      setFormData(prev => ({
        ...prev,
        permissions: {
          dashboard: true,
          members: true,
          attendance: true,
          payment: true,
          lockers: true,
          staff: false,
          excel: true,
          backup: false,
          settings: false,
        }
      }));
    } else if (preset === 'trainer') {
      setFormData(prev => ({
        ...prev,
        permissions: {
          dashboard: true,
          members: true,
          attendance: true,
          payment: false,
          lockers: true,
          staff: false,
          excel: false,
          backup: false,
          settings: false,
        }
      }));
    } else if (preset === 'staff') {
      setFormData(prev => ({
        ...prev,
        permissions: {
          dashboard: true,
          members: false,
          attendance: false,
          payment: false,
          lockers: false,
          staff: false,
          excel: false,
          backup: false,
          settings: false,
        }
      }));
    }
  };

  // 모달 제목 결정
  const getModalTitle = () => {
    if (currentIsViewMode) return '직원 상세 정보';
    return currentIsViewMode ? '직원 정보 수정' : '신규 직원 등록';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 기본 정보 섹션 */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">기본 정보</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                  disabled={!!currentIsViewMode}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  직급
                </label>
                <select
                  name="position"
                  value={formData.position || ''}
                  onChange={handleChange}
                  className="input w-full"
                  disabled={!!currentIsViewMode}
                >
                  <option value="원장">원장</option>
                  <option value="팀장">팀장</option>
                  <option value="트레이너">트레이너</option>
                  <option value="일반 직원">일반 직원</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="000-0000-0000"
                  disabled={!!currentIsViewMode}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
                  disabled={!!currentIsViewMode}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  입사일
                </label>
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate || ''}
                  onChange={handleChange}
                  className="input w-full"
                  disabled={!!currentIsViewMode}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  className="input w-full"
                  disabled={!!currentIsViewMode}
                >
                  <option value="active">재직 중</option>
                  <option value="inactive">퇴사</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* 권한 관리 섹션 */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-semibold">권한 설정</h3>
              
              {!currentIsViewMode && (
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => setPermissionPreset('admin')}
                    className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
                  >
                    관리자
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPermissionPreset('manager')}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    매니저
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPermissionPreset('trainer')}
                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    트레이너
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPermissionPreset('staff')}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  >
                    기본
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dashboard"
                  name="dashboard"
                  checked={formData.permissions.dashboard}
                  onChange={handlePermissionChange}
                  disabled={!!currentIsViewMode}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="dashboard" className="ml-2 text-sm text-gray-700">
                  대시보드
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="members"
                  name="members"
                  checked={formData.permissions.members}
                  onChange={handlePermissionChange}
                  disabled={!!currentIsViewMode}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="members" className="ml-2 text-sm text-gray-700">
                  회원 관리
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="attendance"
                  name="attendance"
                  checked={formData.permissions.attendance}
                  onChange={handlePermissionChange}
                  disabled={!!currentIsViewMode}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="attendance" className="ml-2 text-sm text-gray-700">
                  출석 관리
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="payment"
                  name="payment"
                  checked={formData.permissions.payment}
                  onChange={handlePermissionChange}
                  disabled={!!currentIsViewMode}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="payment" className="ml-2 text-sm text-gray-700">
                  결제 관리
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lockers"
                  name="lockers"
                  checked={formData.permissions.lockers}
                  onChange={handlePermissionChange}
                  disabled={!!currentIsViewMode}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="lockers" className="ml-2 text-sm text-gray-700">
                  락커 관리
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="staff"
                  name="staff"
                  checked={formData.permissions.staff}
                  onChange={handlePermissionChange}
                  disabled={!!currentIsViewMode}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="staff" className="ml-2 text-sm text-gray-700">
                  직원 관리
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="excel"
                  name="excel"
                  checked={formData.permissions.excel}
                  onChange={handlePermissionChange}
                  disabled={!!currentIsViewMode}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="excel" className="ml-2 text-sm text-gray-700">
                  엑셀 가져오기
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="backup"
                  name="backup"
                  checked={formData.permissions.backup}
                  onChange={handlePermissionChange}
                  disabled={!!currentIsViewMode}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="backup" className="ml-2 text-sm text-gray-700">
                  백업 관리
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="settings"
                  name="settings"
                  checked={formData.permissions.settings}
                  onChange={handlePermissionChange}
                  disabled={!!currentIsViewMode}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="settings" className="ml-2 text-sm text-gray-700">
                  설정
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                특이사항
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                className="input w-full h-24"
                disabled={!!currentIsViewMode}
              ></textarea>
            </div>
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
        </div>
      </form>
    </Modal>
  );
};

export default StaffModal; 