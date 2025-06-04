import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Plus, 
  Edit3, 
  FileText,
  Target,
  Heart,
  MessageCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Modal from '../common/Modal';
import { 
  ConsultationMember,
  ConsultationRecord,
  ConsultationFormData
} from '../../types/consultation';
import { 
  CONSULTATION_TYPE_OPTIONS,
  STATUS_BADGE_STYLES
} from '../../config/consultationConfig';
import { 
  formatDate, 
  formatPhoneNumber, 
  formatAge, 
  formatConsultationStatus,
  formatRelativeTime,
  formatGoals
} from '../../utils/consultationFormatters';

interface ConsultationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: ConsultationMember | null;
  consultationRecords: ConsultationRecord[];
  onAddConsultation: () => Promise<void> | void;
  onEditConsultation: (id: number, data: ConsultationFormData) => Promise<void>;
  loading?: boolean;
}

const ConsultationDetailModal: React.FC<ConsultationDetailModalProps> = ({
  isOpen,
  onClose,
  member,
  consultationRecords,
  onAddConsultation,
  onEditConsultation,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'records'>('info');
  const [isAddingConsultation, setIsAddingConsultation] = useState(false);

  if (!member) return null;

  // 상담 상태별 배지 렌더링
  const renderStatusBadge = (status?: string) => {
    if (!status) return <span className="text-gray-400">-</span>;
    
    const badgeStyle = STATUS_BADGE_STYLES[status as keyof typeof STATUS_BADGE_STYLES];
    
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={badgeStyle}
      >
        {formatConsultationStatus(status)}
      </span>
    );
  };

  // 상담 기록 상태별 아이콘
  const getRecordStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'no_show':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  // 최근 상담 기록 (최대 5개)
  const recentRecords = [...consultationRecords]
    .sort((a, b) => b.consultation_date - a.consultation_date)
    .slice(0, 5);

  const modalFooter = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        닫기
      </button>
      <button
        type="button"
        onClick={() => setIsAddingConsultation(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
      >
        <Plus size={16} />
        상담 기록 추가
      </button>
    </>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-blue-600">
                {member.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-500">상담 상세 정보</p>
            </div>
          </div>
        }
        size="xl"
        footer={modalFooter}
      >
        {/* 탭 메뉴 */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <User size={16} />
              회원 정보
            </div>
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'records'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              상담 기록 ({consultationRecords.length})
            </div>
          </button>
        </div>

        {/* 회원 정보 탭 */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* 기본 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">연락처</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{formatPhoneNumber(member.phone)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">이메일</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-900">{member.email || '-'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">성별/나이</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-900">
                      {member.gender || '-'} / {formatAge(member.birth_date)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">가입일</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{formatDate(member.join_date)}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">회원권</label>
                  <span className="text-sm text-gray-900">{member.membership_type || '-'}</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">상담 상태</label>
                  <div className="mt-1">
                    {renderStatusBadge(member.consultation_status)}
                  </div>
                </div>
              </div>
            </div>

            {/* 건강 정보 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">건강 정보</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-red-500" />
                      건강 상태 및 주의사항
                    </div>
                  </label>
                  <div className="bg-white p-3 rounded border text-sm text-gray-900">
                    {member.health_conditions || '특이사항 없음'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-blue-500" />
                      운동 목표
                    </div>
                  </label>
                  <div className="bg-white p-3 rounded border text-sm text-gray-900">
                    {formatGoals(member.fitness_goals)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">비상 연락처</label>
                  <div className="bg-white p-3 rounded border text-sm text-gray-900">
                    {formatPhoneNumber(member.emergency_contact || '') || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* 메모 */}
            {member.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">메모</h4>
                <div className="bg-white p-3 rounded border text-sm text-gray-900">
                  {member.notes}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 상담 기록 탭 */}
        {activeTab === 'records' && (
          <div className="space-y-4">
            {recentRecords.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">상담 기록이 없습니다</h3>
                <p className="text-gray-500 mb-4">첫 번째 상담 기록을 작성해보세요.</p>
                <button
                  onClick={() => setIsAddingConsultation(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  상담 기록 추가
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getRecordStatusIcon(record.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {CONSULTATION_TYPE_OPTIONS.find(opt => opt.value === record.consultation_type)?.label}
                            </span>
                            <span className="text-sm text-gray-500">
                              • {record.consultant_name}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(record.consultation_date, 'time')}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // TODO: 편집 기능 구현
                          console.log('Edit record:', record.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-700">상담 내용:</span>
                        <p className="text-sm text-gray-900 mt-1">{record.content}</p>
                      </div>
                      
                      {record.goals_discussed.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">논의된 목표:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {record.goals_discussed.map((goal, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {record.recommendations && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">권장사항:</span>
                          <p className="text-sm text-gray-900 mt-1">{record.recommendations}</p>
                        </div>
                      )}
                      
                      {record.next_appointment && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">다음 상담 예정:</span>
                          <p className="text-sm text-gray-900 mt-1">
                            {formatDate(record.next_appointment, 'long')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {consultationRecords.length > 5 && (
                  <div className="text-center py-4">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      전체 기록 보기 ({consultationRecords.length}개)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 상담 기록 추가 모달은 별도 컴포넌트로 분리 예정 */}
    </>
  );
};

export default ConsultationDetailModal; 