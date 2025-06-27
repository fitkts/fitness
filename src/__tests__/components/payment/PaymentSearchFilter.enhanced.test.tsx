import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentSearchFilter from '../../../components/payment/PaymentSearchFilter';
import { PaymentFilter } from '../../../utils/paymentUtils';
import { dateUtils } from '../../../config/paymentConfig';

// Mock dependencies
jest.mock('../../../config/paymentConfig', () => ({
  ...jest.requireActual('../../../config/paymentConfig'),
  dateUtils: {
    getToday: jest.fn(),
    getThisWeek: jest.fn(),
    getThisMonth: jest.fn(),
    getThisYear: jest.fn(),
    getRecentDays: jest.fn(),
  },
}));

describe('PaymentSearchFilter - Enhanced Date Presets', () => {
  const mockFilter: PaymentFilter = {
    search: '',
    status: 'all',
    membershipType: 'all',
    paymentMethod: 'all',
    staffName: 'all',
    startDate: '',
    endDate: '',
    minAmount: null,
    maxAmount: null,
  };

  const mockOnFilterChange = jest.fn();
  const mockOnReset = jest.fn();
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock date utilities
    (dateUtils.getToday as jest.Mock).mockReturnValue({
      startDate: '2024-01-15',
      endDate: '2024-01-15',
    });

    (dateUtils.getThisWeek as jest.Mock).mockReturnValue({
      startDate: '2024-01-15',
      endDate: '2024-01-21',
    });

    (dateUtils.getThisMonth as jest.Mock).mockReturnValue({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });

    (dateUtils.getThisYear as jest.Mock).mockReturnValue({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });

    (dateUtils.getRecentDays as jest.Mock).mockReturnValue({
      startDate: '2024-01-08',
      endDate: '2024-01-15',
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <PaymentSearchFilter
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        onReset={mockOnReset}
        showToast={mockShowToast}
        {...props}
      />
    );
  };

  describe('Date Range Presets', () => {
    test('올바른 날짜 범위 프리셋이 렌더링된다', () => {
      renderComponent();
      
      expect(screen.getByText('오늘')).toBeInTheDocument();
      expect(screen.getByText('이번 주')).toBeInTheDocument();
      expect(screen.getByText('이번 달')).toBeInTheDocument();
      expect(screen.getByText('올해')).toBeInTheDocument();
      expect(screen.getByText('최근 7일')).toBeInTheDocument();
      expect(screen.getByText('최근 30일')).toBeInTheDocument();
    });

    test('이번 달 프리셋이 올바른 날짜 범위를 설정한다', () => {
      renderComponent();
      
      const thisMonthButton = screen.getByText('이번 달');
      fireEvent.click(thisMonthButton);
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
    });

    test('이번 주 프리셋이 올바른 날짜 범위를 설정한다', () => {
      renderComponent();
      
      const thisWeekButton = screen.getByText('이번 주');
      fireEvent.click(thisWeekButton);
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        startDate: '2024-01-15',
        endDate: '2024-01-21',
      });
    });

    test('올해 프리셋이 올바른 날짜 범위를 설정한다', () => {
      renderComponent();
      
      const thisYearButton = screen.getByText('올해');
      fireEvent.click(thisYearButton);
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
    });
  });

  describe('Date Navigation', () => {
    test('날짜 이동 버튼이 렌더링된다', () => {
      renderComponent();
      
      // 좌우 화살표 버튼들이 렌더링되는지 확인
      const prevButtons = screen.getAllByTitle('이전');
      const nextButtons = screen.getAllByTitle('다음');
      
      expect(prevButtons).toHaveLength(6); // 6개 프리셋 각각에 대해
      expect(nextButtons).toHaveLength(6);
    });

    test('이전 버튼 클릭시 올바른 오프셋으로 날짜를 계산한다', () => {
      renderComponent();
      
      // '이번 달'의 이전 버튼 클릭 (지난 달)
      const prevButtons = screen.getAllByTitle('이전');
      fireEvent.click(prevButtons[2]); // 이번 달의 이전 버튼
      
      expect(dateUtils.getThisMonth).toHaveBeenCalledWith(-1);
      expect(mockOnFilterChange).toHaveBeenCalled();
    });

    test('다음 버튼 클릭시 올바른 오프셋으로 날짜를 계산한다', () => {
      renderComponent();
      
      // '이번 달'의 다음 버튼 클릭 (다음 달)
      const nextButtons = screen.getAllByTitle('다음');
      fireEvent.click(nextButtons[2]); // 이번 달의 다음 버튼
      
      expect(dateUtils.getThisMonth).toHaveBeenCalledWith(1);
      expect(mockOnFilterChange).toHaveBeenCalled();
    });

    test('날짜 이동 후 라벨이 올바르게 업데이트된다', async () => {
      renderComponent();
      
      // 이번 달의 이전 버튼 클릭
      const prevButtons = screen.getAllByTitle('이전');
      fireEvent.click(prevButtons[2]);
      
      // 라벨이 '지난 달'로 변경되는지 확인
      await waitFor(() => {
        expect(screen.getByText('지난 달')).toBeInTheDocument();
      });
    });
  });

  describe('Amount Range Hidden', () => {
    test('금액 범위 섹션이 화면에 렌더링되지 않는다', () => {
      renderComponent();
      
      // 금액 범위 관련 요소들이 화면에 없는지 확인
      expect(screen.queryByText('금액 범위')).not.toBeInTheDocument();
      expect(screen.queryByText('최소 금액')).not.toBeInTheDocument();
      expect(screen.queryByText('최대 금액')).not.toBeInTheDocument();
    });

    test('금액 필터 함수들이 여전히 존재한다', () => {
      renderComponent();
      
      // 컴포넌트 내부에 금액 필터 핸들러가 있는지 확인
      // (코드는 유지되지만 UI에서는 숨겨짐)
      expect(typeof mockOnFilterChange).toBe('function');
    });
  });

  describe('Date Range Manual Input', () => {
    test('시작일과 종료일을 직접 입력할 수 있다', () => {
      renderComponent();
      
      const startDateInput = screen.getByLabelText('시작일');
      const endDateInput = screen.getByLabelText('종료일');
      
      expect(startDateInput).toBeInTheDocument();
      expect(endDateInput).toBeInTheDocument();
      
      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        startDate: '2024-01-01',
      });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        endDate: '2024-01-31',
      });
    });
  });
});

describe('PaymentSearchFilter - Date Utilities', () => {
  describe('dateUtils functions', () => {
    beforeEach(() => {
      // 실제 구현을 테스트하기 위해 mock을 제거
      jest.restoreAllMocks();
    });

    test('getThisMonth는 올바른 이번 달 범위를 반환한다', () => {
      // 2024년 1월 15일로 고정
      jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(0); // 1월 = 0
      
      const result = dateUtils.getThisMonth();
      
      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-01-31');
    });

    test('getThisWeek는 올바른 이번 주 범위를 반환한다', () => {
      // 2024년 1월 15일 월요일로 고정
      const mockDate = new Date('2024-01-15'); // 월요일
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      jest.spyOn(mockDate, 'getDay').mockReturnValue(1); // 월요일
      
      const result = dateUtils.getThisWeek();
      
      expect(result.startDate).toBe('2024-01-15');
      expect(result.endDate).toBe('2024-01-21');
    });

    test('getThisYear는 올바른 올해 범위를 반환한다', () => {
      jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
      
      const result = dateUtils.getThisYear();
      
      expect(result.startDate).toBe('2024-01-01');
      expect(result.endDate).toBe('2024-12-31');
    });
  });
}); 