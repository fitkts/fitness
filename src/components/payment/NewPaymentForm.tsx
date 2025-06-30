import React, { useState, useEffect } from 'react';
import NewMemberSearchInput, { MemberOption } from './NewMemberSearchInput';
import { Payment, MembershipType, Staff } from '../../models/types'; // 상대 경로 수정
import { useToast } from '../../contexts/ToastContext'; // useToast 추가
import { addPayment, updatePayment } from '../../database/ipcService'; // ipcService 추가
import { COMMON_MODAL_CONFIG } from '../../config/commonFilterConfig';

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

  // members 배열이 변경되고 한 명만 있다면 자동으로 선택
  useEffect(() => {
    if (!initialPayment && members.length === 1 && !formData.memberOption) {
      setFormData(prev => ({ ...prev, memberOption: members[0] }));
    }
  }, [members, initialPayment, formData.memberOption]);

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
  
  // 공통 스타일 클래스 생성 함수
  const createInputClass = (fieldName: string, errors: Record<string, string> = {}) => {
    const hasError = errors[fieldName];
    return `${COMMON_MODAL_CONFIG.INPUT.baseInput} ${
      hasError ? COMMON_MODAL_CONFIG.INPUT.errorBorder : COMMON_MODAL_CONFIG.INPUT.normalBorder
    }`;
  };

  const labelClass = `block ${COMMON_MODAL_CONFIG.INPUT.labelSize} text-gray-700 ${COMMON_MODAL_CONFIG.INPUT.labelMargin}`;
  const helpTextClass = `${COMMON_MODAL_CONFIG.INPUT.helpTextSize} text-gray-500 ${COMMON_MODAL_CONFIG.INPUT.helpTextMargin}`;

  return (
    <div className={COMMON_MODAL_CONFIG.MODAL.spacing}>
      {/* 결제 기본 정보 섹션 */}
      <div className={`${COMMON_MODAL_CONFIG.SECTION.background} ${COMMON_MODAL_CONFIG.SECTION.borderRadius} ${COMMON_MODAL_CONFIG.SECTION.border} ${COMMON_MODAL_CONFIG.SECTION.shadow} overflow-hidden`}>
        <div className={`${COMMON_MODAL_CONFIG.SECTION.headerPadding} bg-gray-50 border-b border-gray-200`}>
          <h3 className={`${COMMON_MODAL_CONFIG.SECTION.titleSize} text-gray-800`}>
            기본 정보
          </h3>
        </div>
        <div className={COMMON_MODAL_CONFIG.SECTION.contentPadding}>
          <form id={formId} onSubmit={handleSubmit}>
            <div className={`grid ${COMMON_MODAL_CONFIG.FORM.grid2Col} ${COMMON_MODAL_CONFIG.FORM.gridGap}`}>
              
              {/* 회원 선택 - 전체 너비 */}
              <div className={`col-span-1 md:col-span-2 ${COMMON_MODAL_CONFIG.FORM.fieldSpacing}`}>
                <label htmlFor="memberSearch" className={labelClass}>
                  회원 <span className="text-red-500">*</span>
                </label>
                {isViewMode ? (
                  <div className={`${createInputClass('memberSearch')} bg-gray-50 flex items-center`}>
                    {initialPayment?.memberName ? `${initialPayment.memberName} (ID: ${initialPayment.memberId})` : '-'}
                  </div>
                ) : (
                  <>
                    <NewMemberSearchInput 
                      options={members}
                      onMemberSelect={handleMemberSelected}
                      initialSearchTerm={formData.memberOption?.name || ''}
                      placeholder="회원 검색..."
                      disabled={inputDisabled}
                    />
                    {formData.memberOption && (
                      <p className="mt-1 text-xs text-green-600">
                        선택된 회원: {formData.memberOption.name} (ID: {formData.memberOption.id})
                      </p>
                    )}
                    <p className={helpTextClass}>결제할 회원을 검색하여 선택</p>
                  </>
                )}
              </div>

              {/* 이용권 종류 */}
              <div className={`col-span-1 ${COMMON_MODAL_CONFIG.FORM.fieldSpacing}`}>
                <label htmlFor="membershipTypeId" className={labelClass}>
                  이용권 <span className="text-red-500">*</span>
                </label>
                {isViewMode ? (
                  <div className={`${createInputClass('membershipTypeId')} bg-gray-50 flex items-center`}>
                    {formData.membershipType || '-'}
                  </div>
                ) : (
                  <>
                    <select
                      id="membershipTypeId"
                      name="membershipTypeId"
                      className={createInputClass('membershipTypeId')}
                      value={formData.membershipTypeId || ''}
                      onChange={handleMembershipTypeChange}
                      disabled={inputDisabled}
                    >
                      <option value="">선택하세요</option>
                      {membershipTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({type.price.toLocaleString()}원)
                        </option>
                      ))}
                    </select>
                    <p className={helpTextClass}>금액 자동 설정</p>
                  </>
                )}
              </div>

              {/* 결제 금액 */}
              <div className={`col-span-1 ${COMMON_MODAL_CONFIG.FORM.fieldSpacing}`}>
                <label htmlFor="amount" className={labelClass}>
                  결제 금액 <span className="text-red-500">*</span>
                </label>
                {isViewMode ? (
                  <div className={`${createInputClass('amount')} bg-gray-50 flex items-center`}>
                    {formData.amount ? `${formData.amount.toLocaleString()}원` : '-'}
                  </div>
                ) : (
                  <>
                    <input
                      id="amount"
                      type="number"
                      name="amount"
                      placeholder="0"
                      className={createInputClass('amount')}
                      value={formData.amount ?? ''}
                      onChange={handleChange}
                      disabled={inputDisabled}
                    />
                    <p className={helpTextClass}>원(₩) 단위로 입력</p>
                  </>
                )}
              </div>
              
              {/* 결제일 */}
              <div className={`col-span-1 ${COMMON_MODAL_CONFIG.FORM.fieldSpacing}`}>
                <label htmlFor="paymentDate" className={labelClass}>
                  결제일 <span className="text-red-500">*</span>
                </label>
                {isViewMode ? (
                  <div className={`${createInputClass('paymentDate')} bg-gray-50 flex items-center`}>
                    {formData.paymentDate || '-'}
                  </div>
                ) : (
                  <>
                    <input
                      id="paymentDate"
                      type="date"
                      name="paymentDate"
                      className={createInputClass('paymentDate')}
                      value={formData.paymentDate || ''}
                      onChange={handleChange}
                      disabled={inputDisabled}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <p className={helpTextClass}>오늘 이전 날짜 선택</p>
                  </>
                )}
              </div>

              {/* 결제 방법 */}
              <div className={`col-span-1 ${COMMON_MODAL_CONFIG.FORM.fieldSpacing}`}>
                <label htmlFor="paymentMethod" className={labelClass}>
                  결제 방법 <span className="text-red-500">*</span>
                </label>
                {isViewMode ? (
                  <div className={`${createInputClass('paymentMethod')} bg-gray-50 flex items-center`}>
                    {formData.paymentMethod === 'card' ? '카드' : 
                     formData.paymentMethod === 'cash' ? '현금' : 
                     formData.paymentMethod === 'transfer' ? '계좌이체' : '-'}
                  </div>
                ) : (
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    className={createInputClass('paymentMethod')}
                    value={formData.paymentMethod || 'card'}
                    onChange={handleChange}
                    disabled={inputDisabled}
                  >
                    <option value="card">카드</option>
                    <option value="cash">현금</option>
                    <option value="transfer">계좌이체</option>
                  </select>
                )}
              </div>

              {/* 담당 직원 */}
              <div className={`col-span-1 ${COMMON_MODAL_CONFIG.FORM.fieldSpacing}`}>
                <label htmlFor="staffId" className={labelClass}>
                  담당 직원
                </label>
                {isViewMode ? (
                  <div className={`${createInputClass('staffId')} bg-gray-50 flex items-center`}>
                    {staffList.find(s => s.id === formData.staffId)?.name || '-'}
                  </div>
                ) : (
                  <>
                    <select
                      id="staffId"
                      name="staffId"
                      className={createInputClass('staffId')}
                      value={formData.staffId || ''} 
                      onChange={handleChange}
                      disabled={inputDisabled}
                    >
                      <option value="">선택하세요</option>
                      {staffList.map((staff) => (
                        <option key={staff.id} value={String(staff.id)}>
                          {staff.name} ({staff.position})
                        </option>
                      ))}
                    </select>
                    <p className={helpTextClass}>선택사항</p>
                  </>
                )}
              </div>

              {/* 결제 상태 */}
              <div className={`col-span-1 ${COMMON_MODAL_CONFIG.FORM.fieldSpacing}`}>
                <label htmlFor="status" className={labelClass}>
                  상태 <span className="text-red-500">*</span>
                </label>
                {isViewMode ? (
                  <div className={`${createInputClass('status')} bg-gray-50 flex items-center`}>
                    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                      formData.status === '완료' ? 'bg-green-100 text-green-800' :
                      formData.status === '취소' ? 'bg-red-100 text-red-800' :
                      formData.status === '환불' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.status}
                    </span>
                  </div>
                ) : (
                  <select
                    id="status"
                    name="status"
                    className={createInputClass('status')}
                    value={formData.status}
                    onChange={handleChange}
                    disabled={inputDisabled}
                  >
                    <option value="완료">완료</option>
                    <option value="취소">취소</option>
                    <option value="환불">환불</option>
                  </select>
                )}
              </div>

              {/* 영수증 번호 */}
              <div className={`col-span-1 ${COMMON_MODAL_CONFIG.FORM.fieldSpacing}`}>
                <label htmlFor="receiptNumber" className={labelClass}>
                  영수증 번호
                </label>
                {isViewMode ? (
                  <div className={`${createInputClass('receiptNumber')} bg-gray-50 flex items-center`}>
                    {formData.receiptNumber || '-'}
                  </div>
                ) : (
                  <>
                    <input
                      id="receiptNumber"
                      type="text"
                      name="receiptNumber"
                      placeholder="영수증 번호"
                      className={createInputClass('receiptNumber')}
                      value={formData.receiptNumber || ''}
                      onChange={handleChange}
                      disabled={inputDisabled}
                    />
                    <p className={helpTextClass}>선택사항</p>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 추가 정보 섹션 */}
      <div className={`${COMMON_MODAL_CONFIG.SECTION.background} ${COMMON_MODAL_CONFIG.SECTION.borderRadius} ${COMMON_MODAL_CONFIG.SECTION.border} ${COMMON_MODAL_CONFIG.SECTION.shadow} overflow-hidden`}>
        <div className={`${COMMON_MODAL_CONFIG.SECTION.headerPadding} bg-gray-50 border-b border-gray-200`}>
          <h3 className={`${COMMON_MODAL_CONFIG.SECTION.titleSize} text-gray-800`}>
            추가 정보
          </h3>
        </div>
        <div className={COMMON_MODAL_CONFIG.SECTION.contentPadding}>
          {/* 메모 */}
          <div className={COMMON_MODAL_CONFIG.FORM.fieldSpacing}>
            <label htmlFor="notes" className={labelClass}>
              메모
            </label>
            {isViewMode ? (
              <div className={`bg-gray-50 px-3 py-2 ${COMMON_MODAL_CONFIG.INPUT.borderRadius} min-h-[60px] ${COMMON_MODAL_CONFIG.INPUT.textSize}`}>
                {formData.notes ? (
                  <p className="whitespace-pre-wrap">{formData.notes}</p>
                ) : (
                  <p className="text-gray-500">등록된 메모가 없습니다.</p>
                )}
              </div>
            ) : (
              <>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="특이사항이나 메모를 입력하세요"
                  className={`w-full ${COMMON_MODAL_CONFIG.INPUT.padding} border border-gray-300 ${COMMON_MODAL_CONFIG.INPUT.borderRadius} ${COMMON_MODAL_CONFIG.INPUT.textSize} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors`}
                  value={formData.notes || ''}
                  onChange={handleChange}
                  disabled={inputDisabled}
                />
                <p className={helpTextClass}>선택사항 - 결제 관련 특이사항</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPaymentForm; 