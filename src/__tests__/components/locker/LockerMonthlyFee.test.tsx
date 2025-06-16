import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LockerMonthlyFee from '../../../components/locker/LockerMonthlyFee';

describe('LockerMonthlyFee 컴포넌트', () => {
  const mockOnFeeChange = jest.fn();
  const mockOnPresetSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('월 사용료 필드가 올바르게 렌더링되어야 한다', () => {
    render(
      <LockerMonthlyFee
        monthlyFee={50000}
        feeError=""
        onFeeChange={mockOnFeeChange}
        onPresetSelect={mockOnPresetSelect}
        isViewMode={false}
      />
    );

    expect(screen.getByText('💰 월 사용료')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50,000')).toBeInTheDocument();
  });

  it('프리셋 버튼들이 올바르게 렌더링되어야 한다', () => {
    render(
      <LockerMonthlyFee
        monthlyFee={50000}
        feeError=""
        onFeeChange={mockOnFeeChange}
        onPresetSelect={mockOnPresetSelect}
        isViewMode={false}
      />
    );

    expect(screen.getByText('30,000원')).toBeInTheDocument();
    expect(screen.getByText('50,000원')).toBeInTheDocument();
    expect(screen.getByText('70,000원')).toBeInTheDocument();
    expect(screen.getByText('100,000원')).toBeInTheDocument();
    expect(screen.getByText('150,000원')).toBeInTheDocument();
  });

  it('프리셋 버튼 클릭 시 onPresetSelect가 호출되어야 한다', () => {
    render(
      <LockerMonthlyFee
        monthlyFee={50000}
        feeError=""
        onFeeChange={mockOnFeeChange}
        onPresetSelect={mockOnPresetSelect}
        isViewMode={false}
      />
    );

    const presetButton = screen.getByText('70,000원');
    fireEvent.click(presetButton);

    expect(mockOnPresetSelect).toHaveBeenCalledWith(70000);
  });

  it('월 사용료 입력 변경 시 onFeeChange가 호출되어야 한다', () => {
    render(
      <LockerMonthlyFee
        monthlyFee={50000}
        feeError=""
        onFeeChange={mockOnFeeChange}
        onPresetSelect={mockOnPresetSelect}
        isViewMode={false}
      />
    );

    const input = screen.getByDisplayValue('50,000');
    fireEvent.change(input, { target: { value: '60,000' } });

    expect(mockOnFeeChange).toHaveBeenCalled();
  });

  it('에러 메시지가 올바르게 표시되어야 한다', () => {
    render(
      <LockerMonthlyFee
        monthlyFee={50000}
        feeError="요금이 너무 낮습니다"
        onFeeChange={mockOnFeeChange}
        onPresetSelect={mockOnPresetSelect}
        isViewMode={false}
      />
    );

    expect(screen.getByText('요금이 너무 낮습니다')).toBeInTheDocument();
  });

  it('View 모드에서는 모든 입력이 비활성화되어야 한다', () => {
    render(
      <LockerMonthlyFee
        monthlyFee={50000}
        feeError=""
        onFeeChange={mockOnFeeChange}
        onPresetSelect={mockOnPresetSelect}
        isViewMode={true}
      />
    );

    const input = screen.getByDisplayValue('50,000');
    const buttons = screen.getAllByRole('button');
    
    expect(input).toBeDisabled();
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('선택된 프리셋이 하이라이트되어야 한다', () => {
    render(
      <LockerMonthlyFee
        monthlyFee={50000}
        feeError=""
        onFeeChange={mockOnFeeChange}
        onPresetSelect={mockOnPresetSelect}
        isViewMode={false}
      />
    );

    const selectedButton = screen.getByText('50,000원');
    expect(selectedButton).toHaveClass('bg-blue-600', 'text-white');
  });
}); 