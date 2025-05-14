import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    status: 'active' as Staff['status'], // 타입 단언 사용
    permissions: { dashboard: true, members: true, attendance: true, payment: true, lockers: true, staff: true, excel: true, backup: true, settings: true },
  },
  {
    id: 2,
    name: '박매니저',
    position: '매니저',
    email: 'manager@example.com',
    phone: '010-3333-4444',
    hireDate: '2022-05-01',
    status: 'active' as Staff['status'], // 타입 단언 사용
    permissions: { dashboard: true, members: true, attendance: true, payment: true, lockers: true, staff: true, excel: true, backup: true, settings: true },
  },
];

const defaultProps = {
  formData: {
    joinDate: '2024-01-15',
    membershipType: '3개월권' as Member['membershipType'],
    membershipStart: '2024-01-20',
    staffId: 1,
  },
  staffList: mockStaffList,
  handleChange: mockHandleChange,
  errors: {},
  isSubmitting: false,
};

describe('<MembershipInfoForm />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('회원권 정보가 올바르게 렌더링된다', () => {
    render(<MembershipInfoForm {...defaultProps} />);

    expect(screen.getByLabelText(/가입일/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();

    expect(screen.getByLabelText(/회원권 종류/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('3개월권')).toBeInTheDocument();

    expect(screen.getByLabelText(/회원권 시작일/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-20')).toBeInTheDocument();

    expect(screen.getByLabelText(/담당자/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('김코치')).toBeInTheDocument(); // staffId: 1 corresponds to 김코치
  });

  test('입력 필드 변경 시 handleChange가 호출된다', async () => {
    const user = userEvent.setup();
    render(<MembershipInfoForm {...defaultProps} />);

    // 가입일
    const joinDateInput = screen.getByLabelText(/가입일/);
    // userEvent.type on date input might be tricky. Consider direct change or parent component testing.
    // For this unit, we assume the parent's handleChange handles the formatting/logic.
    await user.clear(joinDateInput);
    await user.type(joinDateInput, '2024-02-01'); // Typing YYYY-MM-DD
    expect(mockHandleChange).toHaveBeenCalled();

    // 회원권 종류
    const membershipTypeSelect = screen.getByLabelText(/회원권 종류/);
    await user.selectOptions(membershipTypeSelect, '6개월권');
    expect(mockHandleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'membershipType', value: '6개월권' }),
      })
    );

    // 회원권 시작일
    const membershipStartInput = screen.getByLabelText(/회원권 시작일/);
    await user.clear(membershipStartInput);
    await user.type(membershipStartInput, '2024-03-10');
    expect(mockHandleChange).toHaveBeenCalled();

    // 담당자
    const staffSelect = screen.getByLabelText(/담당자/);
    await user.selectOptions(staffSelect, '2'); // staffId: 2 (박매니저)
    expect(mockHandleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({ name: 'staffId', value: '2' }),
      })
    );
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

    expect(screen.getByLabelText(/가입일/)).toBeDisabled();
    expect(screen.getByLabelText(/회원권 종류/)).toBeDisabled();
    expect(screen.getByLabelText(/회원권 시작일/)).toBeDisabled();
    expect(screen.getByLabelText(/담당자/)).toBeDisabled();
  });
}); 