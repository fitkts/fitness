import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
// 타입 정의들을 직접 작성
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

interface LockerPaymentFormData {
  months: number;
  paymentMethod: PaymentMethod;
  startDate: string;
  notes?: string;
}

interface LockerPaymentCalculation {
  originalAmount: number;
  discountRate: number;
  discountAmount: number;
  finalAmount: number;
  startDate: string;
  endDate: string;
}

interface LockerPaymentData {
  lockerId: string;
  memberId: string;
  memberName: string;
  lockerNumber: string;
  months: number;
  startDate: string;
  endDate: string;
  amount: number;
  originalAmount: number;
  discountRate: number;
  discountAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  monthlyFee?: number;
}

interface LockerPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentData: LockerPaymentData) => Promise<boolean>;
  locker: {
    id?: number;
    number: string;
    monthlyFee?: number;
    memberId?: string;
    memberName?: string;
    endDate?: string;
  };
  isExtension?: boolean;
}
import { 
  MONTH_OPTIONS, 
  PAYMENT_METHOD_OPTIONS, 
  PAYMENT_FORM_CONFIG,
  VALIDATION_MESSAGES,
  MESSAGES,
  STYLE_CLASSES 
} from '../../config/lockerPaymentConfig';
import { 
  calculateFullPayment, 
  formatCurrency, 
  formatNumber,
  formatDateKorean,
  getCurrentDate,
  validatePaymentData,
  generatePaymentHistoryNote,
  getDiscountDescription 
} from '../../utils/lockerPaymentUtils';
import { useToast } from '../../contexts/ToastContext';

// 임시 아이콘 컴포넌트들
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CreditCardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const CalculatorIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const LockerPaymentForm: React.FC<LockerPaymentFormProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  locker,
  isExtension = false
}) => {
  const [formData, setFormData] = useState<LockerPaymentFormData>({
    months: 3, // 기본 3개월
    paymentMethod: 'cash',
    startDate: getCurrentDate(),
    notes: ''
  });

  const [calculation, setCalculation] = useState<LockerPaymentCalculation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 월 사용료 수정 관련 상태
  const [monthlyFee, setMonthlyFee] = useState<number>(locker.monthlyFee || 50000);
  const [isEditingFee, setIsEditingFee] = useState(false);
  const [tempFee, setTempFee] = useState<string>('');

  const { showToast } = useToast();

  // 결제 금액 계산
  const updateCalculation = useCallback(() => {
    if (formData.months && formData.startDate) {
      const calc = calculateFullPayment(
        formData.months,
        monthlyFee, // 수정 가능한 월 사용료 사용
        formData.startDate,
        isExtension,
        locker.endDate
      );
      setCalculation(calc);
    }
  }, [formData.months, formData.startDate, monthlyFee, locker.endDate, isExtension]);

  // 폼 데이터 변경 시 계산 업데이트
  useEffect(() => {
    updateCalculation();
  }, [updateCalculation]);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({
        months: 3,
        paymentMethod: 'cash',
        startDate: getCurrentDate(),
        notes: ''
      });
      setErrors({});
      setIsSubmitting(false);
      setMonthlyFee(locker.monthlyFee || 50000);
      setIsEditingFee(false);
      setTempFee('');
    }
  }, [isOpen, locker.monthlyFee]);

  // 폼 데이터 변경 핸들러
  const handleChange = (field: keyof LockerPaymentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 에러 메시지 제거
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  // 월 사용료 수정 시작
  const startEditingFee = () => {
    setIsEditingFee(true);
    setTempFee(monthlyFee.toString());
  };

  // 월 사용료 수정 취소
  const cancelEditingFee = () => {
    setIsEditingFee(false);
    setTempFee('');
  };

  // 월 사용료 수정 완료
  const saveMonthlyFee = () => {
    const newFee = parseInt(tempFee.replace(/[^0-9]/g, ''));
    if (isNaN(newFee) || newFee < 1000) {
      showToast('error', '월 사용료는 1,000원 이상이어야 합니다.');
      return;
    }
    if (newFee > 1000000) {
      showToast('error', '월 사용료는 1,000,000원 이하여야 합니다.');
      return;
    }
    
    setMonthlyFee(newFee);
    setIsEditingFee(false);
    setTempFee('');
    showToast('success', '월 사용료가 변경되었습니다.');
  };

  // 백엔드 결제 처리
  const processPaymentInBackend = async (paymentData: any) => {
    try {
      if (!window.api?.processLockerPayment) {
        throw new Error('결제 API를 사용할 수 없습니다');
      }

      const result = await window.api.processLockerPayment(paymentData);
      return result;
    } catch (error) {
      console.error('백엔드 결제 처리 오류:', error);
      return {
        success: false,
        error: '결제 처리 중 오류가 발생했습니다'
      };
    }
  };

  // 결제 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!calculation) {
      showToast('error', '결제 금액을 계산할 수 없습니다.');
      return;
    }

    // 유효성 검증
    const validation = validatePaymentData({
      months: formData.months,
      paymentMethod: formData.paymentMethod,
      startDate: formData.startDate,
      amount: calculation.finalAmount
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast('error', MESSAGES.VALIDATION_ERROR);
      return;
    }

    try {
      setIsSubmitting(true);

      // 결제 데이터 구성
      const paymentData = {
        lockerId: String(locker.id!),
        memberId: String(locker.memberId!),
        memberName: locker.memberName!,
        lockerNumber: locker.number,
        months: formData.months,
        startDate: calculation.startDate,
        endDate: calculation.endDate,
        amount: calculation.finalAmount,
        originalAmount: calculation.originalAmount,
        discountRate: calculation.discountRate,
        discountAmount: calculation.discountAmount,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || '',
        monthlyFee: monthlyFee // 수정된 월 사용료 포함
      };

      // 백엔드 결제 처리
      const backendResult = await processPaymentInBackend(paymentData);
      
      if (!backendResult.success) {
        showToast('error', backendResult.error || MESSAGES.PAYMENT_ERROR);
        return;
      }

      // 프론트엔드 콜백 처리
      const frontendSuccess = await onPaymentComplete(paymentData);
      
      if (frontendSuccess) {
        showToast('success', isExtension ? MESSAGES.EXTENSION_SUCCESS : MESSAGES.PAYMENT_SUCCESS);
        onClose();
      } else {
        showToast('error', '결제는 완료되었지만 화면 업데이트에 실패했습니다.');
      }

    } catch (error) {
      console.error('결제 처리 오류:', error);
      showToast('error', MESSAGES.PAYMENT_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  const discountDescription = calculation ? getDiscountDescription(formData.months) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isExtension ? PAYMENT_FORM_CONFIG.EXTENSION_TITLE : PAYMENT_FORM_CONFIG.TITLE}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 락커 정보 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">락커 정보</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">락커 번호:</span>
              <span className="ml-2 font-medium">#{locker.number}</span>
            </div>
            <div>
              <span className="text-gray-600">월 사용료:</span>
              {isEditingFee ? (
                <div className="ml-2 flex items-center space-x-2">
                  <input
                    type="text"
                    value={tempFee}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setTempFee(value ? parseInt(value).toLocaleString() : '');
                    }}
                    className="w-24 px-2 py-1 text-xs border border-gray-300 rounded"
                    placeholder="금액"
                    autoFocus
                  />
                  <span className="text-xs">원</span>
                  <button
                    type="button"
                    onClick={saveMonthlyFee}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditingFee}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="ml-2 flex items-center space-x-2">
                  <span className="font-medium">{formatCurrency(monthlyFee)}</span>
                  <button
                    type="button"
                    onClick={startEditingFee}
                    className="text-gray-400 hover:text-gray-600"
                    title="월 사용료 수정"
                  >
                    <EditIcon className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            {locker.memberName && (
              <div>
                <span className="text-gray-600">사용자:</span>
                <span className="ml-2 font-medium">{locker.memberName}</span>
              </div>
            )}
            {isExtension && locker.endDate && (
              <div>
                <span className="text-gray-600">현재 종료일:</span>
                <span className="ml-2 font-medium">{formatDateKorean(locker.endDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 사용 기간 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="inline h-4 w-4 mr-1" />
            {PAYMENT_FORM_CONFIG.MONTHS_LABEL} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {MONTH_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('months', option.value)}
                className={`relative p-3 text-sm border rounded-lg transition-colors ${
                  formData.months === option.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.label}
                {option.popular && (
                  <span className={`absolute -top-1 -right-1 ${STYLE_CLASSES.POPULAR_BADGE}`}>
                    인기
                  </span>
                )}
              </button>
            ))}
          </div>
          {errors.months && (
            <p className="text-red-500 text-xs mt-1">{errors.months}</p>
          )}
        </div>

        {/* 시작일 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {PAYMENT_FORM_CONFIG.START_DATE_LABEL} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.startDate ? 'border-red-500' : ''}`}
            min={getCurrentDate()}
          />
          {errors.startDate && (
            <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
          )}
        </div>

        {/* 결제 방법 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCardIcon className="inline h-4 w-4 mr-1" />
            {PAYMENT_FORM_CONFIG.PAYMENT_METHOD_LABEL} <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('paymentMethod', option.value)}
                className={`p-3 text-sm border rounded-lg transition-colors flex items-center justify-center ${
                  formData.paymentMethod === option.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
          {errors.paymentMethod && (
            <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>
          )}
        </div>

        {/* 결제 금액 표시 */}
        {calculation && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <CalculatorIcon className="h-5 w-5 mr-2" />
              결제 정보
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">기본 금액:</span>
                <span className={calculation.discountAmount > 0 ? STYLE_CLASSES.ORIGINAL_AMOUNT : 'font-medium'}>
                  {formatCurrency(calculation.originalAmount)}
                </span>
              </div>
              
              {calculation.discountAmount > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">할인 금액:</span>
                    <span className={STYLE_CLASSES.DISCOUNT_AMOUNT}>
                      -{formatCurrency(calculation.discountAmount)}
                    </span>
                  </div>
                  {discountDescription && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                      🎉 {discountDescription}
                    </div>
                  )}
                </>
              )}
              
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-lg font-semibold">최종 결제 금액:</span>
                <span className={STYLE_CLASSES.AMOUNT_HIGHLIGHT}>
                  {formatCurrency(calculation.finalAmount)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 mt-3 pt-3 border-t">
                <div className="flex justify-between">
                  <span>사용 기간:</span>
                  <span>{formatDateKorean(calculation.startDate)} ~ {formatDateKorean(calculation.endDate)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 비고 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {PAYMENT_FORM_CONFIG.NOTES_LABEL}
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            rows={3}
            placeholder="추가 메모가 있으면 입력해주세요..."
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {(formData.notes || '').length}/500자
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            {PAYMENT_FORM_CONFIG.CANCEL_BUTTON}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !calculation}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? PAYMENT_FORM_CONFIG.LOADING_TEXT : PAYMENT_FORM_CONFIG.SUBMIT_BUTTON}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default LockerPaymentForm; 