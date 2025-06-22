import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FilterPanel from '../../components/FilterPanel';
import { ViewType, PaymentStatusFilter } from '../../types/statistics';

describe('FilterPanel', () => {
  const defaultProps = {
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    viewType: 'daily' as ViewType,
    statusFilter: '전체' as PaymentStatusFilter,
    onStartDateChange: jest.fn(),
    onEndDateChange: jest.fn(),
    onViewTypeChange: jest.fn(),
    onStatusFilterChange: jest.fn(),
    onQuickDateRange: jest.fn(),
    onReset: jest.fn(),
    onCardEdit: jest.fn(),
    onRefresh: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('레이아웃 일관성', () => {
    test('회원관리와 동일한 컨테이너 스타일을 가져야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      const container = screen.getByTestId('filter-panel-container');
      expect(container).toHaveClass('mb-4', 'bg-white', 'rounded-lg', 'shadow-sm', 'border', 'border-gray-200');
    });

    test('헤더 섹션이 회원관리와 동일한 스타일을 가져야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      const header = screen.getByTestId('filter-panel-header');
      expect(header).toHaveClass('px-3', 'py-2', 'bg-gray-50', 'border-b', 'border-gray-200');
    });

    test('필터 아이콘과 제목이 표시되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      expect(screen.getByText('통계 필터')).toBeInTheDocument();
      expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
    });
  });

  describe('필터 기능', () => {
    test('기간 선택 필드가 표시되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      expect(screen.getByTestId('start-date-input')).toBeInTheDocument();
      expect(screen.getByTestId('end-date-input')).toBeInTheDocument();
      expect(screen.getByText('기간 선택')).toBeInTheDocument();
    });

    test('차트 표시 단위 선택이 표시되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      expect(screen.getByText('차트 표시 단위')).toBeInTheDocument();
      expect(screen.getByTestId('view-type-select')).toBeInTheDocument();
    });

    test('결제 상태 필터가 표시되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      expect(screen.getByText('결제 상태')).toBeInTheDocument();
      expect(screen.getByTestId('status-filter-select')).toBeInTheDocument();
    });

    test('빠른 날짜 선택 버튼들이 표시되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      expect(screen.getByText('오늘')).toBeInTheDocument();
      expect(screen.getByText('이번 주')).toBeInTheDocument();
      expect(screen.getByText('이번 달')).toBeInTheDocument();
      expect(screen.getByText('올해')).toBeInTheDocument();
    });
  });

  describe('헤더 액션 버튼', () => {
    test('카드 편집 버튼이 표시되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      expect(screen.getByTestId('card-edit-button')).toBeInTheDocument();
      expect(screen.getByText('카드 편집')).toBeInTheDocument();
    });

    test('새로고침 버튼이 표시되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
      expect(screen.getByText('새로고침')).toBeInTheDocument();
    });

    test('카드 편집 버튼 클릭이 올바르게 처리되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      const editButton = screen.getByTestId('card-edit-button');
      fireEvent.click(editButton);
      
      expect(defaultProps.onCardEdit).toHaveBeenCalled();
    });

    test('새로고침 버튼 클릭이 올바르게 처리되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);
      
      expect(defaultProps.onRefresh).toHaveBeenCalled();
    });

    test('로딩 중일 때 새로고침 버튼이 비활성화되어야 한다', () => {
      render(<FilterPanel {...defaultProps} isLoading={true} />);
      
      const refreshButton = screen.getByTestId('refresh-button');
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('필터 카운터 및 초기화', () => {
    test('활성 필터가 있을 때 카운터가 표시되어야 한다', () => {
      render(<FilterPanel {...defaultProps} viewType="weekly" statusFilter="완료" />);
      
      expect(screen.getByText('3개 필터 적용됨')).toBeInTheDocument();
    });

    test('활성 필터가 있을 때 초기화 버튼이 표시되어야 한다', () => {
      render(<FilterPanel {...defaultProps} viewType="weekly" />);
      
      expect(screen.getByTestId('reset-filter-button')).toBeInTheDocument();
      expect(screen.getByText('초기화')).toBeInTheDocument();
    });

    test('초기화 버튼 클릭이 올바르게 처리되어야 한다', () => {
      render(<FilterPanel {...defaultProps} viewType="weekly" />);
      
      const resetButton = screen.getByTestId('reset-filter-button');
      fireEvent.click(resetButton);
      
      expect(defaultProps.onReset).toHaveBeenCalled();
    });
  });

  describe('이벤트 처리', () => {
    test('시작일 변경이 올바르게 처리되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      const startDateInput = screen.getByTestId('start-date-input');
      fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });
      
      expect(defaultProps.onStartDateChange).toHaveBeenCalledWith('2024-02-01');
    });

    test('종료일 변경이 올바르게 처리되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      const endDateInput = screen.getByTestId('end-date-input');
      fireEvent.change(endDateInput, { target: { value: '2024-02-28' } });
      
      expect(defaultProps.onEndDateChange).toHaveBeenCalledWith('2024-02-28');
    });

    test('차트 표시 단위 변경이 올바르게 처리되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      const viewTypeSelect = screen.getByTestId('view-type-select');
      fireEvent.change(viewTypeSelect, { target: { value: 'monthly' } });
      
      expect(defaultProps.onViewTypeChange).toHaveBeenCalledWith('monthly');
    });

    test('결제 상태 필터 변경이 올바르게 처리되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      const statusFilterSelect = screen.getByTestId('status-filter-select');
      fireEvent.change(statusFilterSelect, { target: { value: '완료' } });
      
      expect(defaultProps.onStatusFilterChange).toHaveBeenCalledWith('완료');
    });

    test('빠른 날짜 버튼 클릭이 올바르게 처리되어야 한다', () => {
      render(<FilterPanel {...defaultProps} />);
      
      const todayButton = screen.getByText('오늘');
      fireEvent.click(todayButton);
      
      expect(defaultProps.onQuickDateRange).toHaveBeenCalled();
    });
  });

  describe('반응형 레이아웃', () => {
    test('그리드 레이아웃이 올바르게 적용되어야 한다', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);
      
      const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
      expect(gridContainer).toBeInTheDocument();
    });

    test('컴팩트한 패딩과 간격이 적용되어야 한다', () => {
      const { container } = render(<FilterPanel {...defaultProps} />);
      
      const contentContainer = container.querySelector('.p-3');
      expect(contentContainer).toBeInTheDocument();
      
      const gridContainer = container.querySelector('.gap-3');
      expect(gridContainer).toBeInTheDocument();
    });
  });
}); 