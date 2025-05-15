import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberBasicInfoForm from '../../../components/member/MemberBasicInfoForm';
import { Member } from '../../../models/types';

const mockHandleChange = jest.fn();

const defaultProps = {
  formData: {
    name: '',
    phone: '',
    email: '',
    gender: '' as Member['gender'],
    birthDate: '',
  },
  handleChange: mockHandleChange,
  errors: {},
  isViewMode: false,
  isSubmitting: false,
};

describe('<MemberBasicInfoForm />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('기본 정보가 올바르게 렌더링된다', () => {
    render(<MemberBasicInfoForm {...defaultProps} />);
    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/전화번호/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/성별/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/생년월일/i)).toBeInTheDocument();
  });

  test('isViewMode가 true일 때 읽기 전용으로 표시된다', () => {
    render(<MemberBasicInfoForm {...defaultProps} isViewMode={true} />);
    expect(screen.getByText('이름')).toBeInTheDocument();
    expect(screen.getByText('전화번호')).toBeInTheDocument();
    expect(screen.getByText('이메일')).toBeInTheDocument();
    expect(screen.getByText('성별')).toBeInTheDocument();
    expect(screen.getByText('생년월일')).toBeInTheDocument();

    expect(screen.queryByLabelText(/이름/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/전화번호/i)).not.toBeInTheDocument();
  });

  test('이름 필드 변경 시 handleChange가 호출된다', () => {
    render(<MemberBasicInfoForm {...defaultProps} />);
    const nameInput = screen.getByLabelText(/이름/i);
    fireEvent.change(nameInput, { target: { value: '홍길동' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('전화번호 필드 변경 시 handleChange가 호출된다', () => {
    render(<MemberBasicInfoForm {...defaultProps} />);
    const phoneInput = screen.getByLabelText(/전화번호/i);
    fireEvent.change(phoneInput, { target: { value: '010-1234-5678' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('이메일 필드 변경 시 handleChange가 호출된다', () => {
    render(<MemberBasicInfoForm {...defaultProps} />);
    const emailInput = screen.getByLabelText(/이메일/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('성별 필드 변경 시 handleChange가 호출된다', () => {
    render(<MemberBasicInfoForm {...defaultProps} />);
    const genderSelect = screen.getByLabelText(/성별/i);
    fireEvent.change(genderSelect, { target: { value: '남성' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('생년월일 필드 변경 시 handleChange가 호출된다', () => {
    render(<MemberBasicInfoForm {...defaultProps} />);
    const birthDateInput = screen.getByLabelText(/생년월일/i);
    fireEvent.change(birthDateInput, { target: { value: '1990-01-01' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('errors prop에 따라 에러 메시지가 표시된다', () => {
    const errors = {
      name: '이름은 필수입니다.',
      email: '유효한 이메일이 아닙니다.',
    };
    render(<MemberBasicInfoForm {...defaultProps} errors={errors} />);
    expect(screen.getByText('이름은 필수입니다.')).toBeInTheDocument();
    expect(screen.getByText('유효한 이메일이 아닙니다.')).toBeInTheDocument();
  });

  test('isSubmitting이 true일 때 입력 필드가 비활성화된다', () => {
    render(<MemberBasicInfoForm {...defaultProps} isSubmitting={true} />);
    expect(screen.getByLabelText(/이름/i)).toBeDisabled();
    expect(screen.getByLabelText(/전화번호/i)).toBeDisabled();
    expect(screen.getByLabelText(/이메일/i)).toBeDisabled();
    expect(screen.getByLabelText(/성별/i)).toBeDisabled();
    expect(screen.getByLabelText(/생년월일/i)).toBeDisabled();
  });
});
