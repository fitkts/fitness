import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  Heart,
  Target,
  FileText,
  AlertTriangle,
  CheckCircle,
  Star,
  UserCheck,
  Clock,
  MapPin
} from 'lucide-react';
import Modal from '../common/Modal';
import { 
  ConsultationDetailModalProps, 
  ConsultationMember,
  MemberEditFormData
} from '../../types/consultation';
import { 
  GENDER_OPTIONS,
  CONSULTATION_STATUS_OPTIONS,
  FITNESS_GOALS_OPTIONS,
  STATUS_BADGE_STYLES
} from '../../config/consultationConfig';
import { 
  validateMemberEdit,
  convertToUpdateData,
  convertToFormData,
  formatPhoneNumber as formatPhoneInput
} from '../../utils/consultationValidation';
import { formatDate, formatRelativeTime, formatPhoneNumber } from '../../utils/consultationFormatters';

const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({
  isOpen,
  onClose,
  consultationMemberId,
  onUpdate,
  onPromote
}) => {
  const [member, setMember] = useState<ConsultationMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<MemberEditFormData>({
    name: '',
    phone: '',
    email: '',
    gender: '',
    birth_date: '',
    consultation_status: '',
    health_conditions: '',
    fitness_goals: [],
    notes: '',
    staff_id: undefined,
    staff_name: ''
  });
  const [staffOptions, setStaffOptions] = useState<Array<{id: number, name: string, position: string}>>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // 회원 정보 조회
  useEffect(() => {
    if (isOpen && consultationMemberId) {
      loadMemberDetail();
      loadStaffOptions();
    }
  }, [isOpen, consultationMemberId]);

  const loadMemberDetail = async () => {
    if (!consultationMemberId) return;

    setIsLoading(true);
    try {
      const response = await window.api.getConsultationMemberById(consultationMemberId);
      if (response.success) {
        setMember(response.data);
        setEditFormData(convertToFormData(response.data));
      } else {
        console.error('API 에러:', response.error);
      }
    } catch (error) {
      console.error('회원 정보 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaffOptions = async () => {
    try {
      const response = await window.api.getAllStaff();
      if (response.success) {
        setStaffOptions(response.data || []);
      }
    } catch (error) {
      console.error('직원 데이터 로드 실패:', error);
    }
  };

  // 수정 모드 토글
  const toggleEditMode = () => {
    if (isEditing) {
      // 취소 시 원래 데이터로 복원
      if (member) {
        setEditFormData(convertToFormData(member));
      }
      setErrors([]);
    }
    setIsEditing(!isEditing);
  };

  // 직원 선택 핸들러 (staff_id와 staff_name을 함께 업데이트)
  const handleStaffChange = (staffId: string) => {
    const selectedStaff = staffOptions.find(staff => staff.id.toString() === staffId);
    
    setEditFormData(prev => ({
      ...prev,
      staff_id: staffId ? parseInt(staffId) : undefined,
      staff_name: selectedStaff ? selectedStaff.name : ''
    }));
    
    // 에러 초기화
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // 폼 데이터 변경 핸들러
  const handleFormChange = (field: keyof MemberEditFormData, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 초기화
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // 운동 목표 토글
  const toggleFitnessGoal = (goal: string) => {
    const currentGoals = editFormData.fitness_goals;
    const isSelected = currentGoals.includes(goal);
    
    if (isSelected) {
      handleFormChange('fitness_goals', currentGoals.filter(g => g !== goal));
    } else {
      handleFormChange('fitness_goals', [...currentGoals, goal]);
    }
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!member) return;

    // 유효성 검사
    const validationErrors = validateMemberEdit(editFormData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    try {
      const updateData = convertToUpdateData(member.id!, editFormData);
      // @ts-ignore
      const response = await window.api.updateConsultationMember(member.id!, updateData);
      
      if (response.success) {
        // 업데이트 후 다시 회원 정보를 로드
        await loadMemberDetail();
        setIsEditing(false);
        setErrors([]);
        onUpdate();
      } else {
        setErrors([response.error || '저장에 실패했습니다.']);
      }
    } catch (error) {
      console.error('저장 실패:', error);
      setErrors(['저장 중 오류가 발생했습니다.']);
    } finally {
      setIsSaving(false);
    }
  };

  // 승격 핸들러
  const handlePromote = () => {
    if (member && onPromote) {
      onPromote(member);
    }
  };

  // 상담 상태 배지 렌더링
  const renderStatusBadge = (status?: string) => {
    if (!status) return <span className="text-gray-400">-</span>;
    
    const config = CONSULTATION_STATUS_OPTIONS.find(opt => opt.value === status);
    const badgeStyle = STATUS_BADGE_STYLES[status as keyof typeof STATUS_BADGE_STYLES];
    
    return (
      <span 
        className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
        style={badgeStyle}
      >
        <CheckCircle className="w-4 h-4" />
        {config?.label || status}
      </span>
    );
  };

  // 전화번호 입력 포맷팅
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneInput(value);
    handleFormChange('phone', formatted);
  };

  if (!isOpen || !consultationMemberId) return null;

  const title = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <User className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditing ? '회원 정보 수정' : '상담 회원 상세 정보'}
          </h3>
          {member && (
            <p className="text-sm text-gray-500">
              {member.name} • ID: {member.id}
            </p>
          )}
        </div>
      </div>
      {!isEditing && member && (
        <div className="flex items-center gap-2">
          {renderStatusBadge(member.consultation_status)}
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="flex justify-between w-full">
      <div className="flex gap-2">
        {/* 승격 버튼 */}
        {!isEditing && member && !member.is_promoted && onPromote && (
          <button
            data-testid="promote-button"
            onClick={handlePromote}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Star className="w-4 h-4" />
            정식 회원으로 승격
          </button>
        )}
      </div>
      
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <button
              onClick={toggleEditMode}
              disabled={isSaving}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              data-testid="save-button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </>
        ) : (
          <>
            <button
              data-testid="edit-button"
              onClick={toggleEditMode}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit className="w-4 h-4" />
              수정
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div data-testid="consultation-detail-modal">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size="xl"
        footer={footer}
      >
        <div className="space-y-6">
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

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : member ? (
            <div className="space-y-6">
              {/* 기본 정보 섹션 */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  기본 정보
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 이름 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이름 {isEditing && <span className="text-red-500">*</span>}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{member.name}</p>
                    )}
                  </div>

                  {/* 전화번호 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="inline w-4 h-4 mr-1" />
                      전화번호 {isEditing && <span className="text-red-500">*</span>}
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{formatPhoneNumber(member.phone)}</p>
                    )}
                  </div>

                  {/* 이메일 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="inline w-4 h-4 mr-1" />
                      이메일
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{member.email || '-'}</p>
                    )}
                  </div>

                  {/* 성별 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">성별</label>
                    {isEditing ? (
                      <select
                        value={editFormData.gender}
                        onChange={(e) => handleFormChange('gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">선택하세요</option>
                        {GENDER_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{member.gender || '-'}</p>
                    )}
                  </div>

                  {/* 생년월일 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      생년월일
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editFormData.birth_date}
                        onChange={(e) => handleFormChange('birth_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {member.birth_date ? formatDate(member.birth_date) : '-'}
                      </p>
                    )}
                  </div>

                  {/* 상담 상태 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      상담 상태
                    </label>
                    {isEditing ? (
                      <select
                        value={editFormData.consultation_status}
                        onChange={(e) => handleFormChange('consultation_status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">선택하세요</option>
                        {CONSULTATION_STATUS_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      renderStatusBadge(member.consultation_status)
                    )}
                  </div>
                </div>
              </div>

              {/* 상담 관리 정보 */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  상담 관리 정보
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 담당자 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                    {isEditing ? (
                      <select
                        value={editFormData.staff_id || ''}
                        onChange={(e) => handleStaffChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">담당자를 선택하세요</option>
                        {staffOptions.map(staff => (
                          <option key={staff.id} value={staff.id}>
                            {staff.name} ({staff.position})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900">{member.staff_name || '-'}</p>
                    )}
                  </div>

                  {/* 가입일 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Clock className="inline w-4 h-4 mr-1" />
                      상담 등록일
                    </label>
                    <p className="text-gray-900">
                      {member.join_date ? formatDate(member.join_date) : '-'}
                    </p>
                  </div>

                  {/* 최초 방문일 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      최초 방문일
                    </label>
                    <p className="text-gray-900">
                      {member.first_visit ? formatDate(member.first_visit) : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 건강 및 운동 정보 */}
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-yellow-600" />
                  건강 및 운동 정보
                </h4>
                
                {/* 건강 상태 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    건강 상태 및 주의사항
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editFormData.health_conditions}
                      onChange={(e) => handleFormChange('health_conditions', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="건강 상태, 알레르기, 운동 제한사항 등을 입력하세요"
                    />
                  ) : (
                    <div className="bg-white p-3 rounded border">
                      {member.health_conditions || '특이사항 없음'}
                    </div>
                  )}
                </div>

                {/* 운동 목표 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="inline w-4 h-4 mr-1" />
                    운동 목표
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {FITNESS_GOALS_OPTIONS.map(goal => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => toggleFitnessGoal(goal)}
                          className={`p-2 text-sm rounded-lg border transition-colors text-left ${
                            editFormData.fitness_goals.includes(goal)
                              ? 'bg-green-100 border-green-300 text-green-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {member.fitness_goals && Array.isArray(member.fitness_goals) && member.fitness_goals.length > 0 ? (
                        member.fitness_goals.map((goal, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                          >
                            {goal}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">설정된 목표가 없습니다.</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 메모 */}
              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  메모 및 특이사항
                </h4>
                
                {isEditing ? (
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="기타 특이사항이나 상담 내용을 입력하세요"
                  />
                ) : (
                  <div className="bg-white p-4 rounded border min-h-[100px]">
                    {member.notes || '메모가 없습니다.'}
                  </div>
                )}
              </div>

              {/* 승격 정보 (승격된 경우) */}
              {member.is_promoted && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-indigo-600" />
                    회원 승격 완료
                  </h4>
                  <div className="text-sm text-indigo-700">
                    <p>이 상담 회원은 이미 정식 회원으로 승격되었습니다.</p>
                    {member.promoted_at && (
                      <p className="mt-1">
                        승격일: {formatDate(member.promoted_at)}
                      </p>
                    )}
                    {member.promoted_member_id && (
                      <p className="mt-1">
                        정식 회원 ID: {member.promoted_member_id}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">회원 정보를 찾을 수 없습니다.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ConsultationDetailModal; 