import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentForm from '../../../components/payment/PaymentForm';
import { Payment, PaymentMethod, PaymentStatus, MembershipTypeEnum } from '../../../types/payment';

// 기본 테스트 데이터 설정
const mockPayment: Payment = {
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

const mockMembers = [
  { id: 1, name: '홍길동' },
  { id: 2, name: '김철수' },
  { id: 3, name: '이영희' },
];

// 테스트 전용 Mock 함수
const mockHandleChange = jest.fn();
const mockOnMemberSearchChange = jest.fn();
const mockOnSelectMember = jest.fn();
const mockOnOpenMembershipTypeModal = jest.fn();

describe('PaymentForm 컴포넌트', () => {
  // 각 테스트 전에 Mock 함수 초기화
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('기본 폼이 올바르게 렌더링되어야 함', () => {
    render(
      <PaymentForm
        formData={mockPayment}
        errors={{}}
        memberSearch=""
        filteredMembers={[]}
        membershipTypeOptions={mockMembershipTypeOptions}
        isViewMode={false}
        isSubmitting={false}
        onMemberSearchChange={mockOnMemberSearchChange}
        onSelectMember={mockOnSelectMember}
        handleChange={mockHandleChange}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />
    );

    // 모든 필수 필드가 존재하는지 확인
    expect(screen.getByText(/회원/i)).toBeInTheDocument();
    expect(screen.getByText(/이용권 종류/i)).toBeInTheDocument();
    expect(screen.getByText(/금액/i)).toBeInTheDocument();
    expect(screen.getByText(/결제 방법/i)).toBeInTheDocument();
    expect(screen.getByText(/결제일/i)).toBeInTheDocument();
    expect(screen.getByText(/시작일/i)).toBeInTheDocument();
    expect(screen.getByText(/종료일/i)).toBeInTheDocument();
    expect(screen.getByText(/상태/i)).toBeInTheDocument();
    // 메모 라벨은 중복되므로 다른 방식으로 확인
    expect(screen.getAllByText(/메모/i).length).toBeGreaterThan(0);
  });

  test('뷰 모드에서는 입력 필드가 비활성화되어야 함', () => {
    render(
      <PaymentForm
        formData={mockPayment}
        errors={{}}
        memberSearch=""
        filteredMembers={[]}
        membershipTypeOptions={mockMembershipTypeOptions}
        isViewMode={true}
        isSubmitting={false}
        onMemberSearchChange={mockOnMemberSearchChange}
        onSelectMember={mockOnSelectMember}
        handleChange={mockHandleChange}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />
    );

    // 뷰 모드에서는 모든 입력 필드가 div로 렌더링 되므로 입력 필드가 없어야 함
    expect(screen.queryByPlaceholderText(/회원 검색/i)).not.toBeInTheDocument();
    
    // 대신 정보가 표시되어야 함
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText(MembershipTypeEnum.MONTH_1)).toBeInTheDocument();
    expect(screen.getByText('150,000원')).toBeInTheDocument();
    expect(screen.getByText(PaymentMethod.CARD)).toBeInTheDocument();
    
    // 날짜가 여러 번 나타날 수 있으므로 수정
    const dateElements = screen.getAllByText('2023-06-01');
    expect(dateElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('2023-07-01')).toBeInTheDocument(); // 종료일
    expect(screen.getByText(PaymentStatus.COMPLETED)).toBeInTheDocument();
    expect(screen.getByText('테스트 메모')).toBeInTheDocument();
  });

  test('회원 검색 기능이 올바르게 작동해야 함', () => {
    render(
      <PaymentForm
        formData={mockPayment}
        errors={{}}
        memberSearch="김"
        filteredMembers={[{ id: 2, name: '김철수' }]}
        membershipTypeOptions={mockMembershipTypeOptions}
        isViewMode={false}
        isSubmitting={false}
        onMemberSearchChange={mockOnMemberSearchChange}
        onSelectMember={mockOnSelectMember}
        handleChange={mockHandleChange}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />
    );

    // 회원 검색 입력 필드가 있어야 함
    const searchInput = screen.getByPlaceholderText(/회원 검색/i);
    expect(searchInput).toBeInTheDocument();
    
    // 필터링된 회원 목록이 표시되어야 함
    expect(screen.getByText('김철수')).toBeInTheDocument();
    
    // 회원 선택 시 onSelectMember 호출되어야 함
    fireEvent.click(screen.getByText('김철수'));
    expect(mockOnSelectMember).toHaveBeenCalledWith(2, '김철수');
  });

  test('이용권 관리 버튼 클릭 시 해당 핸들러가 호출되어야 함', () => {
    render(
      <PaymentForm
        formData={mockPayment}
        errors={{}}
        memberSearch=""
        filteredMembers={[]}
        membershipTypeOptions={mockMembershipTypeOptions}
        isViewMode={false}
        isSubmitting={false}
        onMemberSearchChange={mockOnMemberSearchChange}
        onSelectMember={mockOnSelectMember}
        handleChange={mockHandleChange}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />
    );

    // 이용권 관리 버튼이 있어야 함
    const manageButton = screen.getByText(/\+ 이용권 관리/i);
    expect(manageButton).toBeInTheDocument();
    
    // 버튼 클릭 시 onOpenMembershipTypeModal 호출되어야 함
    fireEvent.click(manageButton);
    expect(mockOnOpenMembershipTypeModal).toHaveBeenCalled();
  });

  test('필드 변경 시 handleChange 함수가 호출되어야 함', () => {
    render(
      <PaymentForm
        formData={mockPayment}
        errors={{}}
        memberSearch=""
        filteredMembers={[]}
        membershipTypeOptions={mockMembershipTypeOptions}
        isViewMode={false}
        isSubmitting={false}
        onMemberSearchChange={mockOnMemberSearchChange}
        onSelectMember={mockOnSelectMember}
        handleChange={mockHandleChange}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />
    );

    // 금액 입력 필드가 있어야 함
    const amountInput = screen.getByDisplayValue('150,000');
    expect(amountInput).toBeInTheDocument();
    
    // 입력 값 변경 시 handleChange 호출되어야 함
    fireEvent.change(amountInput, { target: { value: '200,000' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('에러 메시지가 있을 경우 표시되어야 함', () => {
    render(
      <PaymentForm
        formData={mockPayment}
        errors={{
          member: '회원 정보는 필수입니다',
          amount: '유효한 금액을 입력하세요',
        }}
        memberSearch=""
        filteredMembers={[]}
        membershipTypeOptions={mockMembershipTypeOptions}
        isViewMode={false}
        isSubmitting={false}
        onMemberSearchChange={mockOnMemberSearchChange}
        onSelectMember={mockOnSelectMember}
        handleChange={mockHandleChange}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />
    );

    // 에러 메시지가 표시되어야 함
    expect(screen.getByText('회원 정보는 필수입니다')).toBeInTheDocument();
    expect(screen.getByText('유효한 금액을 입력하세요')).toBeInTheDocument();
  });

  test('제출 중일 때 입력 필드가 비활성화되어야 함', () => {
    render(
      <PaymentForm
        formData={mockPayment}
        errors={{}}
        memberSearch=""
        filteredMembers={[]}
        membershipTypeOptions={mockMembershipTypeOptions}
        isViewMode={false}
        isSubmitting={true}
        onMemberSearchChange={mockOnMemberSearchChange}
        onSelectMember={mockOnSelectMember}
        handleChange={mockHandleChange}
        onOpenMembershipTypeModal={mockOnOpenMembershipTypeModal}
      />
    );

    // 회원 검색 입력 필드가 비활성화되어야 함
    const searchInput = screen.getByPlaceholderText(/회원 검색/i);
    expect(searchInput).toBeDisabled();
    
    // 이용권 관리 버튼이 비활성화되어야 함
    const manageButton = screen.getByText(/\+ 이용권 관리/i);
    expect(manageButton).toBeDisabled();
  });
}); 