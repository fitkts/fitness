import React, { useState } from 'react';
import { Star, User } from 'lucide-react';
import Modal from '../common/Modal';
import { ConsultationMember } from '../../types/consultation';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationMember: ConsultationMember | null;
  onSuccess: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  consultationMember,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState('');

  // 승격 처리 (최소한의 정보만 사용)
  const handlePromotion = async () => {
    if (!consultationMember || !consultationMember.id) {
      alert('상담 회원 정보가 없습니다.');
      return;
    }

    setIsLoading(true);
    try {
      // 기본 회원 정보로 승격 처리 (날짜는 오늘로 자동 설정)
      const promotionData = {
        consultationMemberId: consultationMember.id,
        notes: notes || '상담회원에서 정식회원으로 승격'
      };

      const response = await window.api.promoteConsultationMember(promotionData);
      
      if (response.success) {
        alert(`${consultationMember.name}님이 정식 회원으로 승격되었습니다!\n\n회원권 및 결제 정보는 회원 관리 또는 결제 관리에서 설정해주세요.`);
        onSuccess();
        onClose();
      } else {
        alert(`승격 실패: ${response.error}`);
      }
    } catch (error) {
      console.error('승격 처리 실패:', error);
      alert('승격 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !consultationMember) return null;

  const modalTitle = (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-green-100 rounded-lg">
        <Star className="h-6 w-6 text-green-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">정식 회원 승격</h2>
        <p className="text-sm text-gray-500">상담회원을 정식회원으로 승격합니다</p>
      </div>
    </div>
  );

  const modalFooter = (
    <>
      <button
        onClick={onClose}
        className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        disabled={isLoading}
      >
        취소
      </button>
      <button
        onClick={handlePromotion}
        disabled={isLoading}
        className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            승격 처리 중...
          </div>
        ) : (
          '✨ 정식 회원으로 승격'
        )}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg"
      footer={modalFooter}
    >
      <div className="space-y-6">
        {/* 상담 회원 정보 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">상담 회원 정보</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-blue-600 font-medium">이름</span>
              <span className="text-lg font-bold text-blue-900">{consultationMember.name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-blue-600 font-medium">전화번호</span>
              <span className="text-gray-700">{consultationMember.phone || '미등록'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-blue-600 font-medium">이메일</span>
              <span className="text-gray-700">{consultationMember.email || '미등록'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-blue-600 font-medium">담당 직원</span>
              <span className="text-gray-700">{consultationMember.staff_name || '미지정'}</span>
            </div>
            <div className="flex flex-col md:col-span-2">
              <span className="text-sm text-blue-600 font-medium">건강 상태</span>
              <span className="text-gray-700">{consultationMember.health_conditions || '정보 없음'}</span>
            </div>
            <div className="flex flex-col md:col-span-2">
              <span className="text-sm text-blue-600 font-medium">운동 목표</span>
              <span className="text-gray-700">
                {consultationMember.fitness_goals 
                  ? (Array.isArray(consultationMember.fitness_goals) 
                      ? consultationMember.fitness_goals.join(', ')
                      : typeof consultationMember.fitness_goals === 'string'
                        ? JSON.parse(consultationMember.fitness_goals || '[]').join(', ')
                        : '정보 없음'
                    )
                  : '정보 없음'
                }
              </span>
            </div>
          </div>
        </div>

        {/* 승격 메모만 남김 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">승격 메모</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모 (선택사항)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="승격 관련 메모사항을 입력하세요..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">💡</span>
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">승격 후 안내</h4>
              <div className="mt-1 text-sm text-yellow-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>기본 정보로 정식 회원 등록됩니다 (가입일: 오늘)</li>
                  <li>회원권 및 결제 정보는 결제 관리에서 별도로 등록해주세요</li>
                  <li>승격된 회원은 상담 목록에서 제거됩니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PromotionModal; 