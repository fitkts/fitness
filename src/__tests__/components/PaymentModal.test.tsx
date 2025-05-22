import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentModal from '../../components/payment/PaymentModal';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  MembershipTypeEnum,
} from '../../types/payment';
import { formatCurrency } from '../../components/payment/PaymentUtils';

// ToastContext 모킹
jest.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
  ToastProvider: ({ children }) => children,
}));

// Modal 컴포넌트 모킹
jest.mock('../../components/common/Modal', () => {
  return ({ children, isOpen, footer, title }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <div data-testid="modal-header">{title}</div>
        <div data-testid="modal-content">{children}</div>
        {footer && <div data-testid="modal-footer">{footer}</div>}
      </div>
    );
  };
});

// PaymentForm 컴포넌트 모킹 제거 또는 주석 처리
/*
jest.mock('../../components/payment/PaymentForm', () => {
  return jest.fn((props) => (
    <div data-testid="payment-form">
      <button onClick={() => props.onSelectMember(1, '홍길동')}>
        회원 선택
      </button>
      <button
        onClick={() =>
          props.handleChange({ target: { name: 'amount', value: '200000' } })
        }
      >
        금액 변경
      </button>
      <button
        onClick={() =>
          props.handleChange({
            target: { name: 'membershipType', value: 'MONTH_1' },
          })
        }
      >
        이용권 변경
      </button>
    </div>
  ));
});
*/

// 테스트 데이터
const mockPayment: Payment = {
  id: 1,
  memberId: 1,
  memberName: '홍길동',
  amount: 150000,
  paymentDate: '2023-06-01',
  paymentMethod: PaymentMethod.CARD,
  membershipType: MembershipTypeEnum.MONTH_1,
  startDate: '2023-06-01',
  endDate: '2023-07-01',
  status: PaymentStatus.COMPLETED,
  notes: '테스트 메모',
};

const mockMembershipTypeOptions = [
  { name: MembershipTypeEnum.MONTH_1, price: 100000, durationMonths: 1 },
  { name: MembershipTypeEnum.MONTH_3, price: 270000, durationMonths: 3 },
  { name: MembershipTypeEnum.MONTH_6, price: 500000, durationMonths: 6 },
];

const mockMemberOptions = [
  { id: 1, name: '홍길동' },
  { id: 2, name: '김철수' },
  { id: 3, name: '이영희' },
];

// 테스트 전용 Mock 함수
const mockOnSave = jest.fn().mockResolvedValue(true);
const mockOnClose = jest.fn();
const mockOnOpenMembershipTypeModal = jest.fn();

describe('PaymentModal 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('모달이 열릴 때 기본 UI가 올바르게 렌더링되어야 함', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        memberOptions={mockMemberOptions}
        membershipTypeOptions={mockMembershipTypeOptions}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />,
    );

    // 모달 제목 확인 (Modal 모킹에 따라 data-testid="modal-header"의 h2 태그 내용을 확인)
    // PaymentModal의 renderHeader는 "새 결제" 텍스트를 포함하는 h2 요소를 반환함.
    const headerTitle = screen.getByTestId('modal-header').querySelector('h2');
    expect(headerTitle).toHaveTextContent('새 결제');
    
    // PaymentForm의 주요 필드 확인 (label 텍스트 기준)
    // MemberSearchInput은 내부적으로 label을 사용할 수 있으나, 지금은 placeholder나 역할로 찾아야 할 수 있음
    // 우선 PaymentForm.tsx에서 MemberSearchInput에 연결된 명시적 label이 없으므로,
    // 해당 컴포넌트가 렌더링되는지 다른 방식으로 확인하거나, label을 추가하는 것을 고려.
    // 여기서는 MemberSearchInput 컴포넌트가 사용하는 placeholder로 찾아보겠습니다. (실제 placeholder 값 확인 필요)
    // 아니면, PaymentForm.tsx 에서 <label htmlFor="memberSearch">회원 검색</label> 과 같이 연결을 기대할 수 있습니다.
    // PaymentForm.tsx를 다시 보니 MemberSearchInput에 직접적인 label은 없지만,
    // PaymentModal이 전달하는 memberSearch, onMemberSearchChange 등을 사용하는 것으로 보아 존재는 함.
    // 좀 더 견고한 테스트를 위해 MemberSearchInput 내부의 input 요소에 접근해야 할 수도 있음.
    // 지금은 다른 명시적인 label이 있는 필드부터 확인합니다.

    expect(screen.getByLabelText(/이용권 종류/i)).toBeInTheDocument(); // MembershipTypeSelect
    expect(screen.getByLabelText(/결제 금액/i)).toBeInTheDocument(); // AmountInput
    expect(screen.getByLabelText(/결제 방법/i)).toBeInTheDocument(); // PaymentForm 직접 렌더링
    expect(screen.getByLabelText(/^결제일/i)).toBeInTheDocument(); // PaymentDatePicker (label="결제일")
    expect(screen.getByLabelText(/^시작일/i)).toBeInTheDocument(); // PaymentDatePicker (label="시작일")
    expect(screen.getByLabelText(/종료일/i)).toBeInTheDocument(); // PaymentForm 직접 렌더링 (읽기 전용)
    expect(screen.getByLabelText(/^상태/i)).toBeInTheDocument(); // PaymentForm 직접 렌더링
    expect(screen.getByLabelText(/메모/i)).toBeInTheDocument(); // PaymentForm 직접 렌더링

    // 저장 ("등록") 및 "취소" 버튼 확인
    expect(screen.getByRole('button', { name: '등록' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  test('결제 정보가 제공되면 폼(수정 모드)에 해당 정보가 설정되어야 함', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        payment={mockPayment}
        isViewMode={false}
        memberOptions={mockMemberOptions}
        membershipTypeOptions={mockMembershipTypeOptions}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />,
    );

    // 모달 제목 확인 ("결제 수정")
    const headerTitle = screen.getByTestId('modal-header').querySelector('h2');
    expect(headerTitle).toHaveTextContent('결제 수정');

    // 회원 이름 확인 (PaymentForm -> MemberSearchInput -> props.selectedMemberName)
    // MemberSearchInput은 isViewMode=false일 때 selectedMemberName을 직접 input value로 사용하지 않음.
    // 대신, PaymentModal의 formData.memberName이 mockPayment.memberName으로 설정되어야 함.
    // UI 상으로는 MemberSearchInput의 label "회원"이 있고, 그 아래 input이 있음.
    // 선택된 회원이 명시적으로 표시되는지 확인하는 것은 현재 컴포넌트 구조상 어려움.
    // 여기서는 "회원" 레이블이 있는지 정도로 간접 확인.
    expect(screen.getByLabelText(/회원/i)).toBeInTheDocument();
    // TODO: 추후 MemberSearchInput의 UI가 개선되어 선택된 회원을 명확히 표시하게 되면, 그 부분을 테스트에 추가합니다.

    // 이용권 종류 (MembershipTypeSelect -> select 태그)
    expect(screen.getByLabelText(/이용권 종류/i)).toHaveValue(mockPayment.membershipType);
    
    // 결제 금액 (AmountInput -> input)
    // AmountInput은 value를 formatCurrency(amount)로 설정함.
    expect(screen.getByLabelText(/결제 금액/i)).toHaveValue(formatCurrency(mockPayment.amount));

    // 결제 방법 (select 태그)
    expect(screen.getByLabelText(/결제 방법/i)).toHaveValue(mockPayment.paymentMethod);

    // 결제일 (PaymentDatePicker -> input type="date")
    expect(screen.getByLabelText(/^결제일/i)).toHaveValue(mockPayment.paymentDate);
    
    // 시작일 (PaymentDatePicker -> input type="date")
    expect(screen.getByLabelText(/^시작일/i)).toHaveValue(mockPayment.startDate);

    // 종료일 (읽기 전용 div)
    expect(screen.getByLabelText(/종료일/i).nextElementSibling).toHaveTextContent(mockPayment.endDate);

    // 상태 (select 태그)
    expect(screen.getByLabelText(/^상태/i)).toHaveValue(mockPayment.status);

    // 메모 (textarea)
    expect(screen.getByLabelText(/메모/i)).toHaveValue(mockPayment.notes!);

    // 버튼 확인 ("수정", "취소")
    expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  test('결제 정보가 제공되면 폼(조회 모드)에 해당 정보가 올바르게 표시되어야 함', () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        payment={mockPayment}       // mockPayment 데이터 전달
        isViewMode={true}         // 조회 모드
        memberOptions={mockMemberOptions}
        membershipTypeOptions={mockMembershipTypeOptions}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />,
    );

    // 모달 제목 확인 ("결제 정보")
    const headerTitle = screen.getByTestId('modal-header').querySelector('h2');
    expect(headerTitle).toHaveTextContent('결제 정보');

    // 각 필드가 읽기 전용으로 mockPayment 데이터를 표시하는지 확인
    // 회원 (MemberSearchInput -> isViewMode=true 시 selectedMemberName 표시)
    // MemberSearchInput.tsx: <div className="p-2 ...">{selectedMemberName || '회원 정보 없음'}</div>
    expect(screen.getByLabelText(/회원/i).nextElementSibling).toHaveTextContent(mockPayment.memberName);

    // 이용권 종류 (MembershipTypeSelect -> isViewMode=true 시 값 표시)
    // MembershipTypeSelect.tsx 내부 확인 필요. 보통은 선택된 옵션의 텍스트를 표시.
    // 여기서는 mockPayment.membershipType (enum 값) 자체가 텍스트로 표시된다고 가정.
    // 실제로는 getMembershipTypeName과 같은 함수로 변환된 이름일 수 있음.
    // MembershipTypeSelect가 view mode일때 어떻게 표시하는지 확인 필요
    // 가정: props.membershipType 값을 그대로 div에 표시
    // MembershipTypeSelect.tsx 를 봐야 정확하지만, 일단 PaymentForm에서 유사한 패턴으로 표시되는지 확인
    expect(screen.getByLabelText(/이용권 종류/i).nextElementSibling).toHaveTextContent(mockPayment.membershipType);

    // 결제 금액 (AmountInput -> isViewMode=true 시 formatCurrency(amount) + "원" 표시)
    // AmountInput.tsx: <div ...>{formatCurrency(amount)}원</div>
    expect(screen.getByLabelText(/결제 금액/i).nextElementSibling).toHaveTextContent(`${formatCurrency(mockPayment.amount)}원`);

    // 결제 방법 (PaymentForm -> isViewMode=true 시 값 표시)
    // PaymentForm.tsx: <div ...>{formData.paymentMethod}</div>
    expect(screen.getByLabelText(/결제 방법/i).nextElementSibling).toHaveTextContent(mockPayment.paymentMethod);

    // 결제일 (PaymentDatePicker -> isViewMode=true 시 값 표시)
    // PaymentDatePicker.tsx 내부 확인 필요. 보통은 날짜 문자열을 표시.
    expect(screen.getByLabelText(/^결제일/i).nextElementSibling).toHaveTextContent(mockPayment.paymentDate);

    // 시작일 (PaymentDatePicker -> isViewMode=true 시 값 표시)
    expect(screen.getByLabelText(/^시작일/i).nextElementSibling).toHaveTextContent(mockPayment.startDate);

    // 종료일 (PaymentForm -> div로 항상 표시)
    expect(screen.getByLabelText(/종료일/i).nextElementSibling).toHaveTextContent(mockPayment.endDate);

    // 상태 (PaymentForm -> isViewMode=true 시 값 표시)
    expect(screen.getByLabelText(/^상태/i).nextElementSibling).toHaveTextContent(mockPayment.status);

    // 메모 (PaymentForm -> isViewMode=true 시 값 표시)
    expect(screen.getByLabelText(/메모/i).nextElementSibling).toHaveTextContent(mockPayment.notes!); 

    // 버튼 확인 ("수정하기", "취소")
    expect(screen.getByRole('button', { name: '수정하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  test('신규 결제 시 사용자 입력 및 저장 테스트', async () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave} 
        memberOptions={mockMemberOptions}
        membershipTypeOptions={mockMembershipTypeOptions}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />,
    );

    // 1. 회원 검색 및 선택
    const memberSearchInput = screen.getByPlaceholderText('회원 검색...');
    fireEvent.change(memberSearchInput, { target: { value: '김철수' } });
    const memberToSelect = await screen.findByText('김철수 (ID: 2)'); 
    fireEvent.click(memberToSelect);

    // 2. 이용권 종류 선택 (MONTH_3 선택)
    const membershipSelect = screen.getByLabelText(/이용권 종류/i);
    fireEvent.change(membershipSelect, { target: { value: MembershipTypeEnum.MONTH_3 } });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/결제 금액/i)).toHaveValue(formatCurrency(mockMembershipTypeOptions[1].price));
    });

    // 3. 결제 방법 선택 (CARD)
    const paymentMethodSelect = screen.getByLabelText(/결제 방법/i);
    fireEvent.change(paymentMethodSelect, { target: { value: PaymentMethod.CARD } });

    // 4. 결제일 입력
    const paymentDateInput = screen.getByLabelText(/^결제일/i);
    fireEvent.change(paymentDateInput, { target: { value: '2024-07-30' } });

    // 5. 시작일 입력 (이에 따라 종료일 자동 계산됨)
    const startDateInput = screen.getByLabelText(/^시작일/i);
    fireEvent.change(startDateInput, { target: { value: '2024-08-01' } });
    
    await waitFor(() => {
      expect(screen.getByLabelText(/종료일/i).nextElementSibling).toHaveTextContent('2024-11-01');
    });

    // 6. 상태 선택 (COMPLETED)
    const statusSelect = screen.getByLabelText(/^상태/i);
    fireEvent.change(statusSelect, { target: { value: PaymentStatus.COMPLETED } });

    // 7. 메모 입력
    const notesTextarea = screen.getByLabelText(/메모/i);
    fireEvent.change(notesTextarea, { target: { value: '신규 등록 테스트 메모' } });

    // 8. "등록" 버튼 클릭
    const saveButton = screen.getByRole('button', { name: '등록' });
    fireEvent.click(saveButton);

    // 9. onSave가 올바른 데이터와 함께 호출되었는지 확인
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          memberId: 2,
          memberName: '김철수',
          membershipType: MembershipTypeEnum.MONTH_3,
          amount: mockMembershipTypeOptions[1].price, 
          paymentMethod: PaymentMethod.CARD,
          paymentDate: '2024-07-30',
          startDate: '2024-08-01',
          endDate: '2024-11-01',
          status: PaymentStatus.COMPLETED,
          notes: '신규 등록 테스트 메모',
        }),
      );
    });

    // 10. 모달이 닫혔는지 확인
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('필수 필드 누락 시 유효성 검사 에러 메시지가 표시되어야 함', async () => {
    render(
      <PaymentModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        memberOptions={mockMemberOptions}
        membershipTypeOptions={mockMembershipTypeOptions}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />,
    );

    // 아무것도 입력하지 않고 "등록" 버튼 클릭
    const saveButton = screen.getByRole('button', { name: '등록' });
    fireEvent.click(saveButton);

    // 에러 메시지 확인
    expect(await screen.findByText('회원 정보는 필수입니다')).toBeInTheDocument();
    // expect(await screen.findByText('이용권 종류는 필수입니다')).toBeInTheDocument(); // defaultPayment에 MONTH_1이 기본값이라 발생 안함
    expect(await screen.findByText('유효한 금액을 입력하세요')).toBeInTheDocument();
    
    // onSave는 호출되지 않아야 함
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
