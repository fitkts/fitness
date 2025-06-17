import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentSearchFilter from '../../../components/payment/PaymentSearchFilter';
import { PaymentFilter } from '../../../utils/paymentUtils';

const mockFilter: PaymentFilter = {
  search: '',
  status: 'all',
  membershipType: 'all',
  paymentMethod: 'all',
  staffName: 'all',
  startDate: '',
  endDate: '',
  minAmount: undefined,
  maxAmount: undefined,
};

const mockOnFilterChange = jest.fn();
const mockOnReset = jest.fn();

const mockMembershipTypes = ['1개월권', '3개월권', '6개월권'];
const mockStaffList = [
  { id: 1, name: '김직원', position: '트레이너' },
  { id: 2, name: '이매니저', position: '매니저' },
];

describe('PaymentSearchFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('검색 필터가 올바르게 렌더링되어야 한다', () => {
    render(
      <PaymentSearchFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
        membershipTypes={mockMembershipTypes}
        staffList={mockStaffList}
      />
    );

    // 검색 입력창이 있는지 확인
    expect(screen.getByPlaceholderText(/회원명 또는 영수증 번호로 검색/)).toBeInTheDocument();
    
    // 상태 선택박스가 있는지 확인
    expect(screen.getByLabelText('결제 상태')).toBeInTheDocument();
    
    // 이용권 종류 선택박스가 있는지 확인
    expect(screen.getByLabelText('이용권 종류')).toBeInTheDocument();
  });

  it('검색어 입력 시 onFilterChange가 호출되어야 한다', () => {
    render(
      <PaymentSearchFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
        membershipTypes={mockMembershipTypes}
        staffList={mockStaffList}
      />
    );

    const searchInput = screen.getByPlaceholderText(/회원명 또는 영수증 번호로 검색/);
    fireEvent.change(searchInput, { target: { value: '홍길동' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      search: '홍길동',
    });
  });

  it('결제 상태 변경 시 onFilterChange가 호출되어야 한다', () => {
    render(
      <PaymentSearchFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
        membershipTypes={mockMembershipTypes}
        staffList={mockStaffList}
      />
    );

    const statusSelect = screen.getByLabelText('결제 상태');
    fireEvent.change(statusSelect, { target: { value: '완료' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      status: '완료',
    });
  });

  it('금액 범위 설정 시 onFilterChange가 호출되어야 한다', () => {
    render(
      <PaymentSearchFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
        membershipTypes={mockMembershipTypes}
        staffList={mockStaffList}
      />
    );

    const minAmountInput = screen.getByLabelText('최소 금액');
    fireEvent.change(minAmountInput, { target: { value: '50000' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilter,
      minAmount: 50000,
    });
  });

  it('필터 초기화 버튼이 동작해야 한다', async () => {
    const user = userEvent.setup();
    const filterWithValues = {
      ...mockFilter,
      search: '홍길동',
      status: '완료' as const,
    };

    render(
      <PaymentSearchFilter
        filter={filterWithValues}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
        membershipTypes={mockMembershipTypes}
        staffList={mockStaffList}
      />
    );

    // 활성 필터가 있을 때 초기화 버튼이 표시되는지 확인
    const resetButton = screen.getByText('초기화');
    expect(resetButton).toBeInTheDocument();

    await user.click(resetButton);
    expect(mockOnReset).toHaveBeenCalled();
  });

  it('활성 필터 개수가 올바르게 표시되어야 한다', () => {
    const filterWithValues = {
      ...mockFilter,
      search: '홍길동',
      status: '완료' as const,
      membershipType: '3개월권',
    };

    render(
      <PaymentSearchFilter
        filter={filterWithValues}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
        membershipTypes={mockMembershipTypes}
        staffList={mockStaffList}
      />
    );

    // 3개의 필터가 적용되었다는 표시가 있는지 확인
    expect(screen.getByText('3개 필터 적용됨')).toBeInTheDocument();
  });
}); 