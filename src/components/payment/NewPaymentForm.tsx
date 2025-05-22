import React, { useState, useEffect } from 'react';
import NewMemberSearchInput, { MemberOption } from './NewMemberSearchInput';
import { Payment, MembershipType, Staff } from '../../models/types'; // 상대 경로 수정
import { useToast } from '../../contexts/ToastContext'; // useToast 추가
import { addPayment, updatePayment } from '../../database/ipcService'; // ipcService 추가

// PaymentForm 데이터 타입 (Payment 타입의 일부 + UI용 필드)
interface PaymentFormData extends Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'memberId' | 'staffId' | 'paymentType' | 'membershipType'>> {
  memberOption: MemberOption | null; // 회원 선택 UI용
  membershipTypeId: number | null;   // 이용권 ID (선택/관리를 위함)
  membershipType: string | null; // 이용권 이름 (표시 및 데이터 전달용)
  paymentMethod: 'card' | 'cash' | 'transfer'; // UI 선택용 영문 paymentMethod
  staffId: number | null;            // 직원 ID
  status: '완료' | '취소' | '환불'; // status 한글 값으로 변경
  // id, createdAt, updatedAt 등은 DB에서 자동 생성되거나 서버에서 처리
}

interface NewPaymentFormProps {
  formId: string; // 모달의 submit 버튼과 연결하기 위함
  initialPayment: Payment | null;
  isViewMode: boolean;
  members: MemberOption[]; // NewMemberSearchInput용
  membershipTypes: MembershipType[];
  staffList: Staff[];
  onSubmitSuccess: () => void;
  setSubmitLoading: (isLoading: boolean) => void;
}

const NewPaymentForm: React.FC<NewPaymentFormProps> = ({
  formId,
  initialPayment,
  isViewMode,
  members,
  membershipTypes,
  staffList,
  onSubmitSuccess,
  setSubmitLoading,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<PaymentFormData>({
    memberOption: null,
    membershipTypeId: null,
    membershipType: null,
    paymentDate: new Date().toISOString().split('T')[0], // 오늘 날짜 기본값
    amount: 0,
    paymentMethod: 'card', // 기본값 카드 (영문)
    status: '완료',   // 기본값 완료 (한글)
    staffId: null,
    notes: '',
  });

  useEffect(() => {
    if (initialPayment) {
      const memberOpt = initialPayment.memberId && initialPayment.memberName
        ? { id: initialPayment.memberId, name: initialPayment.memberName, memberId: String(initialPayment.memberId) }
        : null;

      // initialPayment.paymentMethod (영문)를 직접 사용하고, 
      // initialPayment.paymentType (한글)을 기준으로 UI의 paymentMethod (영문)를 설정할 수도 있지만,
      // DB의 payment_method 컬럼에 영문 값을 저장하고 있으므로 initialPayment.paymentMethod를 직접 사용합니다.
      const formPaymentMethod = (initialPayment.paymentMethod as 'card' | 'cash' | 'transfer') || 'card';

      setFormData({
        memberOption: memberOpt,
        membershipType: initialPayment.membershipType || null,
        membershipTypeId: membershipTypes.find(mt => mt.name === initialPayment.membershipType)?.id || null,
        paymentDate: initialPayment.paymentDate ? new Date(initialPayment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        amount: initialPayment.amount || 0,
        paymentMethod: formPaymentMethod, // initialPayment.paymentMethod (영문) 직접 사용
        status: initialPayment.status || '완료',
        staffId: initialPayment.staffId || null,
        receiptNumber: initialPayment.receiptNumber || '',
        notes: initialPayment.notes || '',
      });
    } else {
      // 새 결제 시 폼 초기화 (기본값 설정)
      setFormData({
        memberOption: null,
        membershipTypeId: null,
        membershipType: null,
        paymentDate: new Date().toISOString().split('T')[0],
        amount: 0,
        paymentMethod: 'card',
        status: '완료', // 한글 status 사용
        staffId: null,
        receiptNumber: '',
        notes: '',
      });
    }
  }, [initialPayment, membershipTypes]);

  const handleMemberSelected = (member: MemberOption | null) => {
    setFormData(prev => ({ ...prev, memberOption: member }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | null = value;
    if (type === 'number') {
      processedValue = value === '' ? null : parseFloat(value);
    } else if (name === 'membershipTypeId' || name === 'staffId') {
      processedValue = value === '' ? null : parseInt(value, 10);
    }
    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };
  
  const handleMembershipTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeId = e.target.value ? parseInt(e.target.value, 10) : null;
    const selectedType = membershipTypes.find(mt => mt.id === typeId);
    setFormData(prev => ({
      ...prev,
      membershipTypeId: typeId,
      membershipType: selectedType ? selectedType.name : null, // membershipType (이름)도 업데이트
      amount: selectedType ? selectedType.price : (prev.amount || 0),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitLoading(true);

    if (!formData.memberOption?.id) {
      showToast('error', '회원을 선택해주세요.');
      setSubmitLoading(false);
      return;
    }
    if (!formData.membershipTypeId) {
      showToast('error', '이용권을 선택해주세요.');
      setSubmitLoading(false);
      return;
    }
    if (formData.amount == null || formData.amount <= 0) {
        showToast('error', '결제 금액을 올바르게 입력해주세요.');
        setSubmitLoading(false);
        return;
    }

    const selectedMembershipType = formData.membershipTypeId 
      ? membershipTypes.find(mt => mt.id === formData.membershipTypeId)
      : null;

    if (!selectedMembershipType && formData.membershipTypeId) {
      // 만약 ID는 있는데 이름을 못찾은 경우 (데이터 불일치 등)
      showToast('error', '선택된 이용권 정보를 찾을 수 없습니다. 이용권 설정을 확인해주세요.');
      setSubmitLoading(false);
      return;
    }

    // paymentMethod (영문)을 paymentType (한글)로 변환
    let paymentTypeForSave: '현금' | '카드' | '계좌이체' | '기타' = '카드';
    if (formData.paymentMethod === 'cash') paymentTypeForSave = '현금';
    else if (formData.paymentMethod === 'transfer') paymentTypeForSave = '계좌이체';
    else if (formData.paymentMethod === 'card') paymentTypeForSave = '카드'; // 명시적으로 카드 추가

    const paymentDataToSave = {
      memberId: formData.memberOption.id,
      membershipTypeId: formData.membershipTypeId,
      membershipType: formData.membershipType,
      paymentDate: formData.paymentDate,
      amount: formData.amount,
      paymentType: paymentTypeForSave, 
      paymentMethod: formData.paymentMethod, 
      status: formData.status, 
      staffId: formData.staffId,
      receiptNumber: formData.receiptNumber,
      notes: formData.notes,
      // startDate, endDate, description 등 Payment 모델에 있는 다른 필드들도 필요시 여기서 채워야 합니다.
      // ipcService.AddPaymentData 에 정의된 필드들을 기준으로 맞춥니다.
      startDate: null, // 예시: 실제 값으로 채워야 함
      endDate: null,   // 예시: 실제 값으로 채워야 함
      description: null, // 예시: 실제 값으로 채워야 함
    };

    try {
      let response;
      if (initialPayment?.id) {
        const updateData = {
          ...paymentDataToSave, // 기본 필드 복사
          id: initialPayment.id, // id 추가
          // UpdatePaymentData 타입에 맞게 memberId, membershipTypeId는 여기서 제외할 수 있으나,
          // paymentRepository에서 Partial<Omit<PaymentCreationInput, 'memberId' | 'membershipTypeId'>> 이므로 괜찮음
        };
        response = await updatePayment(initialPayment.id, updateData);
      } else {
        response = await addPayment(paymentDataToSave);
      }

      if (response.success) {
        showToast('success', initialPayment?.id ? '결제 정보가 수정되었습니다.' : '새 결제가 등록되었습니다.');
        onSubmitSuccess(); // 부모(Modal -> Page)에게 성공 알림
      } else {
        showToast('error', `저장 실패: ${response.error || '알 수 없는 오류'}`);
      }
    } catch (err: any) {
      console.error('Payment form submission error:', err);
      showToast('error', `저장 중 오류 발생: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const inputDisabled = isViewMode;
  const commonInputClass = "w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500";

  return (
    <form id={formId} className="space-y-4" onSubmit={handleSubmit}>
      {/* 회원 선택 */}
      <div className="space-y-1">
        <label htmlFor="memberSearch" className="block text-sm font-medium text-gray-700">
          회원 <span className="text-red-500">*</span>
        </label>
        <NewMemberSearchInput 
          options={members}
          onMemberSelect={handleMemberSelected}
          initialSearchTerm={formData.memberOption?.name || ''}
          placeholder="회원 검색..."
          disabled={inputDisabled}
        />
        {formData.memberOption && !isViewMode && (
          <p className="mt-1 text-sm text-green-600">
            선택된 회원: {formData.memberOption.name} (ID: {formData.memberOption.id})
          </p>
        )}
        {isViewMode && initialPayment?.memberName && (
            <p className="mt-1 text-sm text-gray-700">
                {initialPayment.memberName} (ID: {initialPayment.memberId})
            </p>
        )}
      </div>

      {/* 이용권 종류 선택 */}
      <div className="space-y-1">
        <label htmlFor="membershipTypeId" className="block text-sm font-medium text-gray-700">
          이용권 종류 <span className="text-red-500">*</span>
        </label>
        <select
          id="membershipTypeId"
          name="membershipTypeId"
          className={commonInputClass}
          value={formData.membershipTypeId || ''}
          onChange={handleMembershipTypeChange} // 금액 자동 변경을 위해 별도 핸들러 사용
          disabled={inputDisabled}
        >
          <option value="">이용권을 선택하세요</option>
          {membershipTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name} ({type.price.toLocaleString()}원, {type.durationMonths}개월)
            </option>
          ))}
        </select>
      </div>

      {/* 결제 금액 */}
      <div className="space-y-1">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          결제 금액 <span className="text-red-500">*</span>
        </label>
        <input
          id="amount"
          type="number"
          name="amount"
          placeholder="0"
          className={commonInputClass}
          value={formData.amount ?? ''} // null 또는 undefined일 경우 빈 문자열로
          onChange={handleChange}
          disabled={inputDisabled}
        />
      </div>
      
      {/* 결제일 */}
      <div className="space-y-1">
        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
          결제일 <span className="text-red-500">*</span>
        </label>
        <input
          id="paymentDate"
          type="date"
          name="paymentDate"
          className={commonInputClass}
          value={formData.paymentDate || ''}
          onChange={handleChange}
          disabled={inputDisabled}
        />
      </div>

      {/* 결제 방법 */}
      <div className="space-y-1">
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
          결제 방법 <span className="text-red-500">*</span>
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          className={commonInputClass}
          value={formData.paymentMethod || 'card'}
          onChange={handleChange}
          disabled={inputDisabled}
        >
          <option value="card">카드</option>
          <option value="cash">현금</option>
          <option value="transfer">계좌이체</option>
        </select>
      </div>

      {/* 담당 직원 선택 (결제 방법 다음) */}
      <div className="space-y-1">
        <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">
          담당 직원
        </label>
        <select
          id="staffId"
          name="staffId"
          className={commonInputClass}
          value={formData.staffId || ''} 
          onChange={handleChange}
          disabled={inputDisabled}
        >
          <option value="">담당 직원을 선택하세요 (선택 사항)</option>
          {staffList.map((staff) => (
            <option key={staff.id} value={String(staff.id)}>
              {staff.name} ({staff.position})
            </option>
          ))}
        </select>
      </div>

      {/* 상태 (담당 직원 다음) */}
      <div className="space-y-1">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          상태 <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          className={commonInputClass}
          value={formData.status}
          onChange={handleChange}
          disabled={inputDisabled}
        >
          <option value="완료">완료</option>
          <option value="취소">취소</option>
          <option value="환불">환불</option>
        </select>
      </div>

      {/* 영수증 번호 (상태 다음) */}
      <div className="space-y-1">
        <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700">
          영수증 번호
        </label>
        <input
          id="receiptNumber"
          type="text"
          name="receiptNumber"
          placeholder="영수증 번호 입력 (선택)"
          className={commonInputClass}
          value={formData.receiptNumber || ''}
          onChange={handleChange}
          disabled={inputDisabled}
        />
      </div>

      {/* 메모 */}
      <div className="space-y-1">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          메모
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="특이사항 입력 (선택)"
          className={commonInputClass}
          value={formData.notes || ''}
          onChange={handleChange}
          disabled={inputDisabled}
        />
      </div>

      {/* isViewMode일 때는 submit 버튼이 없으므로, form 태그 바깥에 두거나 여기서는 아무것도 안함 */}
      {/* 실제 submit은 Modal의 footer 버튼을 통해 이루어짐 */}
    </form>
  );
};

export default NewPaymentForm; 