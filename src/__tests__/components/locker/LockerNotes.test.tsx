import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LockerNotes from '../../../components/locker/LockerNotes';

describe('LockerNotes 컴포넌트', () => {
  const mockOnChange = jest.fn();
  const mockErrors = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('비고 필드가 올바르게 렌더링되어야 한다', () => {
    render(
      <LockerNotes
        notes="테스트 메모"
        onChange={mockOnChange}
        errors={mockErrors}
        isViewMode={false}
      />
    );

    expect(screen.getByLabelText('비고')).toBeInTheDocument();
    expect(screen.getByDisplayValue('테스트 메모')).toBeInTheDocument();
  });

  it('텍스트 변경 시 onChange가 호출되어야 한다', () => {
    render(
      <LockerNotes
        notes=""
        onChange={mockOnChange}
        errors={mockErrors}
        isViewMode={false}
      />
    );

    const textarea = screen.getByLabelText('비고');
    fireEvent.change(textarea, { target: { value: '새로운 메모' } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'notes',
          value: '새로운 메모'
        })
      })
    );
  });

  it('View 모드에서는 textarea가 비활성화되어야 한다', () => {
    render(
      <LockerNotes
        notes="테스트 메모"
        onChange={mockOnChange}
        errors={mockErrors}
        isViewMode={true}
      />
    );

    const textarea = screen.getByLabelText('비고');
    expect(textarea).toBeDisabled();
  });

  it('에러 메시지가 올바르게 표시되어야 한다', () => {
    const errorsWithMessage = { notes: '비고는 500자 이내로 입력해주세요' };
    
    render(
      <LockerNotes
        notes=""
        onChange={mockOnChange}
        errors={errorsWithMessage}
        isViewMode={false}
      />
    );

    expect(screen.getByText('비고는 500자 이내로 입력해주세요')).toBeInTheDocument();
  });

  it('placeholder가 올바르게 표시되어야 한다', () => {
    render(
      <LockerNotes
        notes=""
        onChange={mockOnChange}
        errors={mockErrors}
        isViewMode={false}
      />
    );

    const textarea = screen.getByLabelText('비고');
    expect(textarea).toHaveAttribute('placeholder', '추가 메모가 있으면 입력해주세요...');
  });

  it('notes가 undefined일 때도 올바르게 처리되어야 한다', () => {
    render(
      <LockerNotes
        notes={undefined}
        onChange={mockOnChange}
        errors={mockErrors}
        isViewMode={false}
      />
    );

    const textarea = screen.getByLabelText('비고');
    expect(textarea).toHaveValue('');
  });
}); 