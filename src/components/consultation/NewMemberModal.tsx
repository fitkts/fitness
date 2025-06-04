import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, Heart, Target, AlertTriangle } from 'lucide-react';
import Modal from '../common/Modal';
import { 
  NewMemberModalProps, 
  NewMemberFormData 
} from '../../types/consultation';
import { 
  GENDER_OPTIONS, 
  FITNESS_GOALS_OPTIONS,
  FORM_CONFIG,
  MESSAGES 
} from '../../config/consultationConfig';
import { validateMemberData } from '../../utils/consultationUtils';

const NewMemberModal: React.FC<NewMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<NewMemberFormData>({
    name: '',
    phone: '',
    email: '',
    gender: undefined,
    birth_date: '',
    emergency_contact: '',
    health_conditions: '',
    fitness_goals: [],
    membership_type: '',
    staff_id: undefined,
    notes: ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        email: '',
        gender: undefined,
        birth_date: '',
        emergency_contact: '',
        health_conditions: '',
        fitness_goals: [],
        membership_type: '',
        staff_id: undefined,
        notes: ''
      });
      setErrors([]);
    }
  }, [isOpen]);

  // 입력값 변경 핸들러
  const handleInputChange = (
    field: keyof NewMemberFormData,
    value: string | string[] | number | undefined
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러가 있다면 해당 필드 에러 제거
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // 운동 목표 토글
  const toggleFitnessGoal = (goal: string) => {
    const currentGoals = formData.fitness_goals || [];
    const isSelected = currentGoals.includes(goal);
    
    if (isSelected) {
      handleInputChange('fitness_goals', currentGoals.filter(g => g !== goal));
    } else {
      handleInputChange('fitness_goals', [...currentGoals, goal]);
    }
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검증
    const validationErrors = validateMemberData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setErrors(['회원 등록에 실패했습니다. 다시 시도해주세요.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 전화번호 포맷팅
  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
      >
        취소
      </button>
      <button
        type="submit"
        form="new-member-form"
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '등록 중...' : '회원 등록'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          신규 회원 등록
        </div>
      }
      size="lg"
      footer={modalFooter}
    >
      <form id="new-member-form" onSubmit={handleSubmit} className="space-y-6">
        {/* 에러 메시지 */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800">입력 오류</h4>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 기본 정보 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">기본 정보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 회원명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                회원명 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="회원 이름을 입력하세요"
                  required
                />
              </div>
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                연락처 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', formatPhoneInput(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="010-0000-0000"
                  required
                />
              </div>
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성별
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value as '남' | '여' || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">선택하세요</option>
                {GENDER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                생년월일
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 비상 연락처 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비상 연락처
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  value={formData.emergency_contact || ''}
                  onChange={(e) => handleInputChange('emergency_contact', formatPhoneInput(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="010-0000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 건강 정보 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">건강 정보</h3>
          
          {/* 건강 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              건강 상태 및 주의사항
            </label>
            <div className="relative">
              <Heart className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
              <textarea
                value={formData.health_conditions || ''}
                onChange={(e) => handleInputChange('health_conditions', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="알레르기, 기존 질환, 운동 제한사항 등을 입력하세요"
              />
            </div>
          </div>

          {/* 운동 목표 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              운동 목표 (복수 선택 가능)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {FITNESS_GOALS_OPTIONS.map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleFitnessGoal(goal)}
                  className={`p-3 text-sm rounded-lg border transition-colors text-left ${
                    formData.fitness_goals?.includes(goal)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {goal}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">추가 정보</h3>
          
          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="기타 특이사항이나 요청사항을 입력하세요"
            />
          </div>
        </div>

        {/* 선택된 운동 목표 표시 */}
        {formData.fitness_goals && formData.fitness_goals.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              선택된 운동 목표 ({formData.fitness_goals.length}개)
            </h4>
            <div className="flex flex-wrap gap-2">
              {formData.fitness_goals.map(goal => (
                <span
                  key={goal}
                  className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default NewMemberModal; 