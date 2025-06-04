import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Target, 
  MessageSquare, 
  Lightbulb,
  AlertTriangle,
  Clock
} from 'lucide-react';
import Modal from '../common/Modal';
import { 
  ConsultationFormData,
  ConsultationMember
} from '../../types/consultation';
import { 
  CONSULTATION_TYPE_OPTIONS,
  FITNESS_GOALS_OPTIONS
} from '../../config/consultationConfig';

interface AddConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: ConsultationMember | null;
  onSubmit: (data: ConsultationFormData) => Promise<void>;
  loading?: boolean;
}

const AddConsultationModal: React.FC<AddConsultationModalProps> = ({
  isOpen,
  onClose,
  member,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<ConsultationFormData>({
    consultation_type: 'initial',
    consultation_date: '',
    content: '',
    goals_discussed: [],
    recommendations: '',
    next_appointment: ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        consultation_type: 'initial',
        consultation_date: today,
        content: '',
        goals_discussed: [],
        recommendations: '',
        next_appointment: ''
      });
      setErrors([]);
    }
  }, [isOpen]);

  // 입력값 변경 핸들러
  const handleInputChange = (
    field: keyof ConsultationFormData,
    value: string | string[]
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

  // 목표 토글
  const toggleGoal = (goal: string) => {
    const currentGoals = formData.goals_discussed || [];
    const isSelected = currentGoals.includes(goal);
    
    if (isSelected) {
      handleInputChange('goals_discussed', currentGoals.filter(g => g !== goal));
    } else {
      handleInputChange('goals_discussed', [...currentGoals, goal]);
    }
  };

  // 폼 유효성 검증
  const validateForm = (): string[] => {
    const validationErrors: string[] = [];
    
    if (!formData.consultation_date) {
      validationErrors.push('상담 날짜는 필수 입력 항목입니다.');
    }
    
    if (!formData.content.trim()) {
      validationErrors.push('상담 내용은 필수 입력 항목입니다.');
    }
    
    if (formData.content.trim().length < 10) {
      validationErrors.push('상담 내용은 최소 10자 이상 입력해주세요.');
    }
    
    // 다음 상담 날짜 검증
    if (formData.next_appointment) {
      const nextDate = new Date(formData.next_appointment);
      const consultationDate = new Date(formData.consultation_date);
      
      if (nextDate <= consultationDate) {
        validationErrors.push('다음 상담 날짜는 현재 상담 날짜보다 뒤여야 합니다.');
      }
    }
    
    return validationErrors;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검증
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setErrors(['상담 기록 저장에 실패했습니다. 다시 시도해주세요.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!member) return null;

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
        form="add-consultation-form"
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '저장 중...' : '상담 기록 저장'}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">상담 기록 추가</h3>
            <p className="text-sm text-gray-500">{member.name} 회원</p>
          </div>
        </div>
      }
      size="lg"
      footer={modalFooter}
    >
      <form id="add-consultation-form" onSubmit={handleSubmit} className="space-y-6">
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
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">상담 정보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 상담 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상담 유형 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.consultation_type}
                onChange={(e) => handleInputChange('consultation_type', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {CONSULTATION_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 상담 날짜 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상담 날짜 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={formData.consultation_date}
                  onChange={(e) => handleInputChange('consultation_date', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* 상담 내용 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">상담 내용</h3>
          
          {/* 상담 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-500" />
                상담 내용 <span className="text-red-500">*</span>
              </div>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="상담 중 논의된 내용, 회원의 요청사항, 현재 상태 등을 자세히 기록해주세요..."
              required
            />
            <div className="mt-1 text-xs text-gray-500">
              {formData.content.length}/500자 (최소 10자 이상)
            </div>
          </div>

          {/* 논의된 목표 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-green-500" />
                논의된 운동 목표 (복수 선택 가능)
              </div>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {FITNESS_GOALS_OPTIONS.map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`p-3 text-sm rounded-lg border transition-colors text-left ${
                    formData.goals_discussed.includes(goal)
                      ? 'bg-green-50 border-green-300 text-green-700'
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
            {formData.goals_discussed.length > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">
                  선택된 목표 ({formData.goals_discussed.length}개)
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.goals_discussed.map(goal => (
                    <span
                      key={goal}
                      className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 권장사항 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-500" />
                권장사항 및 조언
              </div>
            </label>
            <textarea
              value={formData.recommendations}
              onChange={(e) => handleInputChange('recommendations', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="회원에게 권장할 운동 방법, 주의사항, 생활 습관 개선 방안 등을 기록해주세요..."
            />
          </div>
        </div>

        {/* 다음 일정 섹션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">다음 일정</h3>
          
          {/* 다음 상담 예약 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-purple-500" />
                다음 상담 예약일 (선택사항)
              </div>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={formData.next_appointment}
                onChange={(e) => handleInputChange('next_appointment', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={formData.consultation_date}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              다음 상담이 필요한 경우 날짜를 선택해주세요.
            </p>
          </div>
        </div>

        {/* 회원 정보 요약 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">회원 정보 요약</span>
          </div>
          <div className="text-sm text-blue-700">
            <p><strong>이름:</strong> {member.name}</p>
            <p><strong>회원권:</strong> {member.membership_type || '-'}</p>
            <p><strong>운동 목표:</strong> {member.fitness_goals?.join(', ') || '-'}</p>
            {member.health_conditions && (
              <p><strong>주의사항:</strong> {member.health_conditions}</p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddConsultationModal; 