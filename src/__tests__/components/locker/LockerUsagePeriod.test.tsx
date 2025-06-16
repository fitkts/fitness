import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LockerUsagePeriod from '../../../components/locker/LockerUsagePeriod';

describe('LockerUsagePeriod 컴포넌트', () => {
  const mockFormData = {
    startDate: '2024-01-01',
    endDate: '2024-02-01'
  };

  const mockOnChange = jest.fn();
  const mockOnPeriodSelect = jest.fn();
  const mockErrors = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('사용 기간 필드들이 올바르게 렌더링되어야 한다', () => {
    render(
      <LockerUsagePeriod
        formData={mockFormData}
        onChange={mockOnChange}
        onPeriodSelect={mockOnPeriodSelect}
        errors={mockErrors}
        isViewMode={false}
      />
    );

    expect(screen.getByText('사용 기간')).toBeInTheDocument();
    expect(screen.getByText('1개월')).toBeInTheDocument();
    expect(screen.getByText('3개월')).toBeInTheDocument();
    expect(screen.getByText('6개월')).toBeInTheDocument();
    expect(screen.getByText('12개월')).toBeInTheDocument();
    expect(screen.getByLabelText('시작일')).toBeInTheDocument();
    expect(screen.getByLabelText('종료일')).toBeInTheDocument();
  });

  it('기간 프리셋 버튼 클릭 시 onPeriodSelect가 호출되어야 한다', () => {
    render(
      <LockerUsagePeriod
        formData={mockFormData}
        onChange={mockOnChange}
        onPeriodSelect={mockOnPeriodSelect}
        errors={mockErrors}
        isViewMode={false}
      />
    );

    const threeMonthButton = screen.getByText('3개월');
    fireEvent.click(threeMonthButton);

    expect(mockOnPeriodSelect).toHaveBeenCalledWith(3);
  });

  it('날짜 입력 변경 시 onChange가 호출되어야 한다', () => {
    render(
      <LockerUsagePeriod
        formData={mockFormData}
        onChange={mockOnChange}
        onPeriodSelect={mockOnPeriodSelect}
        errors={mockErrors}
        isViewMode={false}
      />
    );

    const startDateInput = screen.getByDisplayValue('2024-01-01');
    fireEvent.change(startDateInput, { target: { value: '2024-02-01' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'startDate',
          value: '2024-02-01'
        })
      })
    );
  });

  it('View 모드에서는 모든 입력이 비활성화되어야 한다', () => {
    render(
      <LockerUsagePeriod
        formData={mockFormData}
        onChange={mockOnChange}
        onPeriodSelect={mockOnPeriodSelect}
        errors={mockErrors}
        isViewMode={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    const inputs = screen.getAllByRole('textbox');
    
    [...buttons, ...inputs].forEach(element => {
      expect(element).toBeDisabled();
    });
  });

  it('에러 메시지가 올바르게 표시되어야 한다', () => {
    const errorsWithMessage = { 
      startDate: '시작일이 필요합니다',
      endDate: '종료일이 필요합니다'
    };
    
    render(
      <LockerUsagePeriod
        formData={mockFormData}
        onChange={mockOnChange}
        onPeriodSelect={mockOnPeriodSelect}
        errors={errorsWithMessage}
        isViewMode={false}
      />
    );

    expect(screen.getByText('시작일이 필요합니다')).toBeInTheDocument();
    expect(screen.getByText('종료일이 필요합니다')).toBeInTheDocument();
  });
}); 