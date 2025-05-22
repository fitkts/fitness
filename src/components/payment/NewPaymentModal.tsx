import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal'; // 기존 Modal 컴포넌트 재활용
import { CreditCard } from 'lucide-react';
import NewPaymentForm from './NewPaymentForm'; // 새로 만든 폼 임포트
import { MemberOption } from './NewMemberSearchInput'; // MemberOption 타입 임포트
import { Payment, MembershipType, Staff } from '../../models/types'; // Payment, MembershipType, Staff 타입 임포트

interface NewPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void; // onSave에서 onSaveSuccess로 변경하고, 반환 타입 void로 변경
  payment: Payment | null; // 수정/상세보기를 위한 payment 데이터
  isViewMode: boolean;     // 상세보기 모드 여부
  members: MemberOption[]; // NewPaymentForm에서 사용할 회원 목록
  membershipTypes: MembershipType[]; // NewPaymentForm에서 사용할 이용권 목록
  staffList: Staff[]; // NewPaymentForm에서 사용할 직원 목록
}

// 임시 회원 데이터
const dummyMembers: MemberOption[] = [
  { id: 1, name: '김철수' },
  { id: 2, name: '이영희' },
  { id: 3, name: '박지성' },
  { id: 4, name: '김연아' },
  { id: 5, name: '손흥민' },
];

const NewPaymentModal: React.FC<NewPaymentModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess, // prop 이름 변경
  payment,
  isViewMode,
  members, // dummyMembers 대신 props 사용
  membershipTypes,
  staffList,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 임시 데이터 및 핸들러
  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log('새 결제 저장 시도 - handleSubmit');
    // TODO: 폼 데이터 가져오기 및 저장 로직
    // 현재 NewPaymentForm 내부에서 formData를 관리하므로, 이를 NewPaymentModal로 끌어올리거나
    // NewPaymentForm에 onSave 콜백을 전달하여 데이터를 받아오는 방식이 필요합니다.
    setIsSubmitting(false);
  };

  const renderHeader = () => (
    <div className="flex items-center">
      <CreditCard className="mr-2 h-5 w-5 text-gray-500" />
      <h2>{isViewMode ? '결제 상세 정보' : (payment ? '결제 수정' : '새 결제 등록')}</h2>
    </div>
  );

  const renderFooter = () => (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
        disabled={isSubmitting}
      >
        {isViewMode ? '닫기' : '취소'}
      </button>
      {!isViewMode && (
        <button
          type="submit" // NewPaymentForm의 submit을 트리거하기 위해 type="submit"
          form="payment-form" // NewPaymentForm 내부 form의 id와 연결
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? '저장 중...' : (payment ? '수정' : '등록')}
        </button>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={renderHeader()}
      footer={renderFooter()}
      size="lg" // 폼 크기를 고려하여 lg로 변경
    >
      <NewPaymentForm
        // formId를 전달하여 footer의 버튼과 연결
        formId="payment-form" 
        initialPayment={payment}
        isViewMode={isViewMode}
        members={members}
        membershipTypes={membershipTypes}
        staffList={staffList}
        // onSave는 NewPaymentForm에서 정의되어야 하며, Promise<boolean>을 반환하거나
        // 저장 성공/실패에 따라 onSaveSuccess() 또는 onError() 등을 호출해야 함.
        // 지금은 onSaveSuccess를 NewPaymentForm에서 직접 호출하도록 설계 변경.
      
        onSubmitSuccess={onSaveSuccess} // NewPaymentForm에 onSaveSuccess 콜백 전달
        setSubmitLoading={setIsSubmitting} // NewPaymentForm에서 로딩 상태를 제어할 수 있도록 전달
      />
    </Modal>
  );
};

export default NewPaymentModal; 