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

  describe('Sticky 기능', () => {
    it('필터 컨테이너에 sticky 클래스가 적용되어야 한다', () => {
      render(
        <PaymentSearchFilter
          filter={mockFilter}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          membershipTypes={mockMembershipTypes}
          staffList={mockStaffList}
        />
      );
      
      const filterContainer = screen.getByTestId('payment-search-filter-container');
      expect(filterContainer).toHaveClass('sticky');
      expect(filterContainer).toHaveClass('top-4');
    });

    it('적절한 z-index가 설정되어야 한다', () => {
      render(
        <PaymentSearchFilter
          filter={mockFilter}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          membershipTypes={mockMembershipTypes}
          staffList={mockStaffList}
        />
      );
      
      const filterContainer = screen.getByTestId('payment-search-filter-container');
      expect(filterContainer).toHaveClass('z-20');
    });

    it('스크롤 시에도 배경색이 유지되어야 한다', () => {
      render(
        <PaymentSearchFilter
          filter={mockFilter}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          membershipTypes={mockMembershipTypes}
          staffList={mockStaffList}
        />
      );
      
      const filterContainer = screen.getByTestId('payment-search-filter-container');
      expect(filterContainer).toHaveClass('bg-white');
    });

    it('그림자 효과가 적용되어야 한다', () => {
      render(
        <PaymentSearchFilter
          filter={mockFilter}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          membershipTypes={mockMembershipTypes}
          staffList={mockStaffList}
        />
      );
      
      const filterContainer = screen.getByTestId('payment-search-filter-container');
      expect(filterContainer).toHaveClass('shadow-sm');
    });
  });

  describe('기존 기능 유지', () => {
    it('검색 입력 시 onFilterChange가 호출되어야 한다', () => {
      render(
        <PaymentSearchFilter
          filter={mockFilter}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          membershipTypes={mockMembershipTypes}
          staffList={mockStaffList}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('회원명 또는 영수증 번호로 검색...');
      fireEvent.change(searchInput, { target: { value: '홍길동' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        search: '홍길동',
      });
    });

    it('필터 초기화 버튼이 정상 작동해야 한다', () => {
      render(
        <PaymentSearchFilter
          filter={mockFilter}
          onFilterChange={mockOnFilterChange}
          onReset={mockOnReset}
          membershipTypes={mockMembershipTypes}
          staffList={mockStaffList}
        />
      );
      
      const resetButton = screen.getByText('초기화');
      fireEvent.click(resetButton);
      
      expect(mockOnReset).toHaveBeenCalled();
    });
  });
}); 