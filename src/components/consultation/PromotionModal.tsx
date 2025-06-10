import React, { useState, useEffect } from 'react';
import { X, User, CreditCard, Calendar, FileText, Star } from 'lucide-react';
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
  const [startDate, setStartDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'transfer'>('card');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 회원권 목록 조회
  useEffect(() => {
    if (isOpen) {
      loadMembershipTypes();
      // 기본값 설정
      setStartDate(new Date().toISOString().split('T')[0]);
      setSelectedMembershipType(null);
      setPaymentMethod('card');
      setNotes('');
    }
  }, [isOpen]);

  const loadMembershipTypes = async () => {
    try {
      const response = await window.api.getAllMembershipTypes();
      if (response.success) {
        setMembershipTypes(response.data);
      }
    } catch (error) {
      console.error('회원권 목록 조회 실패:', error);
    }
  };

  // 종료일 계산
  const calculateEndDate = (startDate: string, durationMonths: number): string => {
    if (!startDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + durationMonths);
    
    return end.toISOString().split('T')[0];
  };

  // 선택된 회원권 정보
  const selectedMembership = membershipTypes.find(type => type.id === selectedMembershipType);
  const endDate = selectedMembership 
    ? calculateEndDate(startDate, selectedMembership.duration_months)
    : '';

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold">정식 회원 승격</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 상담 회원 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium">상담 회원 정보</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">이름:</span>
              <span className="ml-2 font-medium">{consultationMember.name}</span>
            </div>
            <div>
              <span className="text-gray-500">전화번호:</span>
              <span className="ml-2">{consultationMember.phone || '-'}</span>
            </div>
            <div className="col-span-full">
              <span className="text-gray-500">건강 상태:</span>
              <span className="ml-2">{consultationMember.health_conditions || '-'}</span>
            </div>
            <div className="col-span-full">
              <span className="text-gray-500">운동 목표:</span>
              <span className="ml-2">
                {consultationMember.fitness_goals 
                  ? (Array.isArray(consultationMember.fitness_goals) 
                      ? consultationMember.fitness_goals.join(', ')
                      : typeof consultationMember.fitness_goals === 'string'
                        ? JSON.parse(consultationMember.fitness_goals).join(', ')
                        : '-'
                    )
                  : '-'
                }
              </span>
            </div>
          </div>
        </div>

        {/* 회원권 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            회원권 선택 *
          </label>
          <div className="grid gap-3">
            {membershipTypes.map((type) => (
              <div
                key={type.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedMembershipType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMembershipType(type.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{type.name}</h4>
                    <p className="text-sm text-gray-500">
                      {type.duration_months}개월 이용권
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {type.price.toLocaleString()}원
                    </div>
                    <div className="text-sm text-gray-500">
                      월 {Math.round(type.price / type.duration_months).toLocaleString()}원
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 이용 기간 설정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              시작일 *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-600"
            />
          </div>
        </div>

        {/* 결제 방법 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <CreditCard className="inline h-4 w-4 mr-1" />
            결제 방법 *
          </label>
          <div className="flex gap-4">
            {[
              { value: 'card', label: '카드' },
              { value: 'cash', label: '현금' },
              { value: 'transfer', label: '계좌이체' }
            ].map((method) => (
              <label key={method.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={paymentMethod === method.value}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="mr-2"
                />
                <span>{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 메모 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            메모 (선택사항)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="승격 관련 추가 메모를 입력하세요..."
          />
        </div>

        {/* 결제 정보 요약 */}
        {selectedMembership && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-green-800 mb-2">결제 정보 요약</h4>
            <div className="text-sm text-green-700">
              <div>회원권: {selectedMembership.name}</div>
              <div>결제 금액: {selectedMembership.price.toLocaleString()}원</div>
              <div>결제 방법: {
                paymentMethod === 'card' ? '카드' :
                paymentMethod === 'cash' ? '현금' : '계좌이체'
              }</div>
              <div>이용 기간: {startDate} ~ {endDate}</div>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            onClick={handlePromotion}
            disabled={!selectedMembershipType || !startDate || isLoading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '승격 처리 중...' : '정식 회원으로 승격'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal; 