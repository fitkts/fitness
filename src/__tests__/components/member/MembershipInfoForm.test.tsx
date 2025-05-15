import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MembershipInfoForm from '../../../components/member/MembershipInfoForm';
import { Member, Staff } from '../../../models/types';

const mockHandleChange = jest.fn();
const mockStaffList: Staff[] = [
  {
    id: 1,
    name: '김코치',
    position: '트레이너',
    email: 'coach@example.com',
    phone: '010-1111-2222',
    hireDate: '2023-01-01',
    status: 'active' as Staff['status'],
    permissions: {
      dashboard: true,
      members: true,
      attendance: true,
      payment: true,
      lockers: true,
      staff: true,
      excel: true,
      backup: true,
      settings: true,
    },
  },
  {
    id: 2,
    name: '박매니저',
    position: '매니저',
    email: 'manager@example.com',
    phone: '010-3333-4444',
    hireDate: '2022-05-01',
    status: 'active' as Staff['status'],
    permissions: {
      dashboard: true,
      members: true,
      attendance: true,
      payment: true,
      lockers: true,
      staff: true,
      excel: true,
      backup: true,
      settings: true,
    },
  },
];

const defaultProps = {
  formData: {
    joinDate: '',
    membershipType: '',
    membershipStart: '',
    staffId: 0,
  },
  errors: {},
  handleChange: mockHandleChange,
  isViewMode: false,
  isSubmitting: false,
  staffList: mockStaffList,
  staffOptions: [
    { id: 1, name: '김코치' },
    { id: 2, name: '박매니저' },
  ],
};

describe('<MembershipInfoForm />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('회원권 정보가 올바르게 렌더링된다', () => {
    render(<MembershipInfoForm {...defaultProps} />);
    expect(screen.getByLabelText(/가입일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/회원권 종류/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/회원권 시작일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/담당자/i)).toBeInTheDocument();
  });

  test('가입일 필드 변경 시 handleChange가 호출된다', () => {
    render(<MembershipInfoForm {...defaultProps} />);
    const joinDateInput = screen.getByLabelText(/가입일/i);
    fireEvent.change(joinDateInput, { target: { value: '2024-02-01' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('회원권 종류 필드 변경 시 handleChange가 호출된다', () => {
    render(<MembershipInfoForm {...defaultProps} />);
    const membershipTypeSelect = screen.getByLabelText(/회원권 종류/i);
    fireEvent.change(membershipTypeSelect, { target: { value: '6개월권' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('회원권 시작일 필드 변경 시 handleChange가 호출된다', () => {
    render(<MembershipInfoForm {...defaultProps} />);
    const membershipStartInput = screen.getByLabelText(/회원권 시작일/i);
    fireEvent.change(membershipStartInput, { target: { value: '2024-03-10' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('담당자 필드 변경 시 handleChange가 호출된다', () => {
    render(<MembershipInfoForm {...defaultProps} />);
    const staffSelect = screen.getByLabelText(/담당자/i);
    fireEvent.change(staffSelect, { target: { value: '2' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  test('errors prop에 따라 에러 메시지가 표시된다', () => {
    const errors = {
      joinDate: '가입일을 입력해주세요.',
      membershipType: '회원권 종류를 선택해주세요.',
    };
    render(<MembershipInfoForm {...defaultProps} errors={errors} />);
    expect(screen.getByText('가입일을 입력해주세요.')).toBeInTheDocument();
    expect(screen.getByText('회원권 종류를 선택해주세요.')).toBeInTheDocument();
  });

  test('isSubmitting이 true일 때 입력 필드가 비활성화된다', () => {
    render(<MembershipInfoForm {...defaultProps} isSubmitting={true} />);
    expect(screen.getByLabelText(/가입일/i)).toBeDisabled();
    expect(screen.getByLabelText(/회원권 종류/i)).toBeDisabled();
    expect(screen.getByLabelText(/회원권 시작일/i)).toBeDisabled();
    expect(screen.getByLabelText(/담당자/i)).toBeDisabled();
  });
});
