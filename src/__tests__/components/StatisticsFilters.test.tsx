import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StatisticsFilters from '../../components/StatisticsFilters';
import { ViewType, PaymentStatusFilter } from '../../types/statistics';

const mockProps = {
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  viewType: 'monthly' as ViewType,
  statusFilter: '전체' as PaymentStatusFilter,
  onStartDateChange: jest.fn(),
  onEndDateChange: jest.fn(),
  onViewTypeChange: jest.fn(),
  onStatusFilterChange: jest.fn(),
  onQuickDateRange: jest.fn(),
};

describe('StatisticsFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sticky 기능', () => {
    it('필터 컨테이너에 sticky 클래스가 적용되어야 한다', () => {
      render(<StatisticsFilters {...mockProps} />);
      
      const filterContainer = screen.getByTestId('statistics-filter-container');
      expect(filterContainer).toHaveClass('sticky');
      expect(filterContainer).toHaveClass('top-4');
    });

    it('적절한 z-index가 설정되어야 한다', () => {
      render(<StatisticsFilters {...mockProps} />);
      
      const filterContainer = screen.getByTestId('statistics-filter-container');
      expect(filterContainer).toHaveClass('z-20');
    });

    it('스크롤 시에도 배경색이 유지되어야 한다', () => {
      render(<StatisticsFilters {...mockProps} />);
      
      const filterContainer = screen.getByTestId('statistics-filter-container');
      expect(filterContainer).toHaveClass('bg-white');
    });

    it('그림자 효과가 적용되어야 한다', () => {
      render(<StatisticsFilters {...mockProps} />);
      
      const filterContainer = screen.getByTestId('statistics-filter-container');
      expect(filterContainer).toHaveClass('shadow-sm');
    });
  });

  describe('기존 기능 유지', () => {
    it('필터 설정 제목이 표시되어야 한다', () => {
      render(<StatisticsFilters {...mockProps} />);
      
      expect(screen.getByText('필터 설정')).toBeInTheDocument();
    });

    it('시작일 변경 시 onStartDateChange가 호출되어야 한다', () => {
      render(<StatisticsFilters {...mockProps} />);
      
      const startDateInput = screen.getByDisplayValue('2024-01-01');
      fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });
      
      expect(mockProps.onStartDateChange).toHaveBeenCalledWith('2024-02-01');
    });

    it('차트 표시 단위 변경 시 onViewTypeChange가 호출되어야 한다', () => {
      render(<StatisticsFilters {...mockProps} />);
      
      const viewTypeSelect = screen.getByLabelText('차트 표시 단위');
      fireEvent.change(viewTypeSelect, { target: { value: 'daily' } });
      
      expect(mockProps.onViewTypeChange).toHaveBeenCalledWith('daily');
    });

    it('결제 상태 변경 시 onStatusFilterChange가 호출되어야 한다', () => {
      render(<StatisticsFilters {...mockProps} />);
      
      const statusSelect = screen.getByLabelText('결제 상태');
      fireEvent.change(statusSelect, { target: { value: '완료' } });
      
      expect(mockProps.onStatusFilterChange).toHaveBeenCalledWith('완료');
    });
  });
}); 