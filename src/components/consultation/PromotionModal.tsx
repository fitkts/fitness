import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, CreditCard, FileText } from 'lucide-react';
import Modal from '../common/Modal';
import { ConsultationMember } from '../../types/consultation';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultationMember: ConsultationMember | null;
  onSuccess: () => void;
}

interface MembershipType {
  id: number;
  name: string;
  price: number;
  duration_months: number;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  consultationMember,
  onSuccess
}) => {
  const [membershipTypes, setMembershipTypes] = useState<MembershipType[]>([]);
  const [selectedMembershipType, setSelectedMembershipType] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'transfer'>('card');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMembershipTypes();
    }
  }, [isOpen]);

  const loadMembershipTypes = async () => {
    try {
      const response = await window.api.getAllMembershipTypes();
      if (response.success) {
        setMembershipTypes(response.data);
      }
    } catch (error) {
      console.error('회원권 타입 로드 실패:', error);
    }
  };

  const calculateEndDate = (startDate: string, durationMonths: number): string => {
    if (!startDate || !durationMonths || isNaN(durationMonths) || durationMonths <= 0) {
      return '';
    }

    try {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return '';
      }

      const endDate = new Date(start);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      if (isNaN(endDate.getTime())) {
        return '';
      }

      return endDate.toISOString().split('T')[0];
    } catch (error) {
      console.error('종료일 계산 오류:', error);
      return '';
    }
  };

  // 안전한 월 단가 계산 함수
  const calculateMonthlyPrice = (price: number, durationMonths: number): string => {
    if (!price || !durationMonths || durationMonths <= 0) {
      return '계산 불가';
    }
    return Math.round(price / durationMonths).toLocaleString();
  };

  // 선택된 회원권 정보
  const selectedMembership = membershipTypes.find(type => type.id === selectedMembershipType);
  const endDate = selectedMembership 
    ? calculateEndDate(startDate, selectedMembership.duration_months)
    : '';

  // 시작일이나 회원권 변경 시 종료일 재계산
  useEffect(() => {
    // 컴포넌트가 마운트되거나 시작일/회원권이 변경될 때 자동으로 종료일이 계산됨
    // calculateEndDate 함수가 실시간으로 endDate를 계산하므로 별도 처리 불필요
  }, [startDate, selectedMembership]);

  // 승격 처리
  const handlePromotion = async () => {
    if (!consultationMember || !selectedMembership || !consultationMember.id) {
      alert('필수 정보가 누락되었습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const promotionData = {
        consultationMemberId: consultationMember.id,
        membershipTypeId: selectedMembership.id,
        membershipType: selectedMembership.name,
        startDate,
        endDate,
        paymentAmount: selectedMembership.price,
        paymentMethod,
        notes
      };

      const response = await window.api.promoteConsultationMember(promotionData);
      
      if (response.success) {
        alert(`${consultationMember.name}님이 정식 회원으로 승격되었습니다!`);
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
        <p className="text-sm text-gray-500">상담회원을 정식회원으로 등록합니다</p>
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
        disabled={!selectedMembershipType || !startDate || isLoading}
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
      size="xl"
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

        {/* 회원권 선택 - 컴팩트 디자인 */}
        <div>
          <label className="block text-lg font-semibold text-gray-900 mb-3">
            회원권 선택 *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {membershipTypes.map((type) => (
              <div
                key={type.id}
                role="button"
                tabIndex={0}
                className={`relative border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                  selectedMembershipType === type.id
                    ? 'border-green-500 bg-green-50 shadow-md ring-2 ring-green-200'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedMembershipType(type.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedMembershipType(type.id);
                  }
                }}
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedMembershipType === type.id
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedMembershipType === type.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {type.duration_months}개월
                    </span>
                  </div>
                  <div className="text-center">
                    <h4 className="font-bold text-gray-900 text-base mb-1">{type.name}</h4>
                    <div className="text-xl font-bold text-green-600 mb-1">
                      {type.price.toLocaleString()}원
                    </div>
                    <div className="text-sm text-gray-500">
                      월 {calculateMonthlyPrice(type.price, type.duration_months)}원
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {membershipTypes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              회원권 정보를 불러오는 중...
            </div>
          )}
        </div>

        {/* 이용 기간 및 결제 방법 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 이용 기간 설정 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">이용 기간</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  시작일 *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  종료일
                </label>
                <input
                  type="date"
                  value={endDate}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* 결제 방법 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">결제 방법</h3>
            <div className="space-y-3">
              {[
                { value: 'card', label: '카드 결제', icon: '💳' },
                { value: 'cash', label: '현금 결제', icon: '💵' },
                { value: 'transfer', label: '계좌이체', icon: '🏦' }
              ].map((method) => (
                <label 
                  key={method.value} 
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === method.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="sr-only"
                  />
                  <span className="text-lg mr-3">{method.icon}</span>
                  <span className="font-medium">{method.label}</span>
                  {paymentMethod === method.value && (
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            메모 (선택사항)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="승격 관련 추가 메모를 입력하세요..."
          />
        </div>

        {/* 결제 정보 요약 */}
        {selectedMembership && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 bg-green-100 rounded">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-800">결제 정보 요약</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">회원권:</span>
                  <span className="font-semibold text-green-800">{selectedMembership.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">결제 금액:</span>
                  <span className="font-bold text-green-800 text-lg">{selectedMembership.price.toLocaleString()}원</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">결제 방법:</span>
                  <span className="font-semibold text-green-800">
                    {paymentMethod === 'card' ? '💳 카드' :
                     paymentMethod === 'cash' ? '💵 현금' : '🏦 계좌이체'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">이용 기간:</span>
                  <span className="font-semibold text-green-800">{startDate} ~ {endDate}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PromotionModal; 