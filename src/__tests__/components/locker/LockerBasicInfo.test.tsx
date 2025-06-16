import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LockerBasicInfo from '../../../components/locker/LockerBasicInfo';
import { LockerSize } from '../../../models/types';

describe('LockerBasicInfo 컴포넌트', () => {
  const mockFormData = {
    number: 'A-001',
    status: 'available' as const,
    size: LockerSize.MEDIUM,
    location: 'A구역'
  };

  const mockOnChange = jest.fn();
  const mockErrors = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('기본 정보 필드들이 올바르게 렌더링되어야 한다', () => {
    render(
      <LockerBasicInfo
        formData={mockFormData}
        onChange={mockOnChange}
        errors={mockErrors}
        isViewMode={false}
      />
    );

    expect(screen.getByLabelText(/락커 번호/)).toBeInTheDocument();
    expect(screen.getByLabelText(/상태/)).toBeInTheDocument();
    expect(screen.getByLabelText(/크기/)).toBeInTheDocument();
    expect(screen.getByLabelText(/위치/)).toBeInTheDocument();
  });

  it('View 모드에서는 모든 입력 필드가 비활성화되어야 한다', () => {
    render(
      <LockerBasicInfo
        formData={mockFormData}
        onChange={mockOnChange}
        errors={mockErrors}
        isViewMode={true}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    const selects = screen.getAllByRole('combobox');
    
    [...inputs, ...selects].forEach(element => {
      expect(element).toBeDisabled();
    });
  });

  it('락커 번호 변경 시 onChange가 호출되어야 한다', () => {
    render(
      <LockerBasicInfo
        formData={mockFormData}
        onChange={mockOnChange}
        errors={mockErrors}
        isViewMode={false}
      />
    );

    const numberInput = screen.getByDisplayValue('A-001');
    fireEvent.change(numberInput, { target: { value: 'B-002' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'number',
          value: 'B-002'
        })
      })
    );
  });

  it('에러 메시지가 올바르게 표시되어야 한다', () => {
    const errorsWithMessage = { number: '락커 번호가 필요합니다' };
    
    render(
      <LockerBasicInfo
        formData={mockFormData}
        onChange={mockOnChange}
        errors={errorsWithMessage}
        isViewMode={false}
      />
    );

    expect(screen.getByText('락커 번호가 필요합니다')).toBeInTheDocument();
  });
}); 