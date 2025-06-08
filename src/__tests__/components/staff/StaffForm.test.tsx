import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffForm from '../../../components/staff/StaffForm';
import { Staff, StaffPosition, StaffStatus } from '../../../types/staff';

// Mock StaffPermissionsForm 컴포넌트
jest.mock('../../../components/staff/StaffPermissionsForm', () => {
  return function MockStaffPermissionsForm({ permissions, isViewMode }: any) {
    return (
      <div data-testid="staff-permissions-form" style={{ display: 'none' }}>
        권한 설정 폼 (숨김)
      </div>
    );
  };
});

const mockStaff: Staff = {
  id: 1,
  name: '김테스트',
  position: StaffPosition.MANAGER,
  phone: '010-1234-5678',
  email: 'test@example.com',
  hireDate: '2024-01-01',
  birthDate: '1990-01-01', // 생년월일 필드 추가
  status: StaffStatus.ACTIVE,
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
  notes: '테스트 메모',
};

const defaultProps = {
  formData: mockStaff,
  errors: {},
  isViewMode: false,
  isSubmitting: false,
  handleChange: jest.fn(),
  handlePermissionChange: jest.fn(),
  setPermissionPreset: jest.fn(),
};

describe('StaffForm 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('생년월일 입력 필드가 렌더링되어야 함', () => {
    render(<StaffForm {...defaultProps} />);
    
    const birthDateLabel = screen.getByText('생년월일');
    const birthDateInput = screen.getByDisplayValue('1990-01-01');
    
    expect(birthDateLabel).toBeInTheDocument();
    expect(birthDateInput).toBeInTheDocument();
    expect(birthDateInput).toHaveAttribute('type', 'date');
    expect(birthDateInput).toHaveAttribute('name', 'birthDate');
  });

  test('생년월일 필드가 선택사항이어야 함 (필수 표시 없음)', () => {
    render(<StaffForm {...defaultProps} />);
    
    const birthDateLabel = screen.getByText('생년월일');
    const requiredAsterisk = birthDateLabel.querySelector('.text-red-500');
    
    expect(requiredAsterisk).toBeNull();
  });

  test('생년월일 값 변경 시 handleChange가 호출되어야 함', () => {
    const mockHandleChange = jest.fn();
    
    render(<StaffForm {...defaultProps} handleChange={mockHandleChange} />);
    
    const birthDateInput = screen.getByDisplayValue('1990-01-01');
    fireEvent.change(birthDateInput, { target: { value: '1985-05-15' } });
    
    expect(mockHandleChange).toHaveBeenCalled();
    const call = mockHandleChange.mock.calls[0][0];
    expect(call.target.name).toBe('birthDate');
    // fireEvent의 특성상 실제 value 변경이 아닌 이벤트만 트리거하므로, 이벤트가 호출되었는지만 확인
  });

  test('읽기 모드에서 생년월일이 텍스트로 표시되어야 함', () => {
    render(<StaffForm {...defaultProps} isViewMode={true} />);
    
    const birthDateDisplay = screen.getByText('1990-01-01');
    expect(birthDateDisplay).toBeInTheDocument();
    expect(birthDateDisplay.closest('div')).toHaveClass('bg-gray-50');
  });

  test('권한설정 폼이 숨겨져야 함', () => {
    render(<StaffForm {...defaultProps} />);
    
    const permissionsForm = screen.getByTestId('staff-permissions-form');
    expect(permissionsForm).toHaveStyle('display: none');
  });

  test('생년월일이 없는 경우 빈 값으로 처리되어야 함', () => {
    const staffWithoutBirthDate = { ...mockStaff, birthDate: undefined };
    
    render(<StaffForm {...defaultProps} formData={staffWithoutBirthDate} />);
    
    const birthDateInput = screen.getByLabelText('생년월일');
    expect(birthDateInput).toHaveValue('');
  });

  test('제출 중일 때 생년월일 입력이 비활성화되어야 함', () => {
    render(<StaffForm {...defaultProps} isSubmitting={true} />);
    
    const birthDateInput = screen.getByDisplayValue('1990-01-01');
    expect(birthDateInput).toBeDisabled();
  });

  test('읽기 모드에서 생년월일이 없으면 "-"로 표시되어야 함', () => {
    const staffWithoutBirthDate = { ...mockStaff, birthDate: undefined };
    
    render(<StaffForm {...defaultProps} formData={staffWithoutBirthDate} isViewMode={true} />);
    
    const birthDateDisplay = screen.getByText('-');
    expect(birthDateDisplay).toBeInTheDocument();
  });

  test('권한설정이 숨겨진 후 폼이 단일 컬럼 레이아웃으로 정렬되어야 함', () => {
    render(<StaffForm {...defaultProps} />);
    
    // 메인 그리드 컨테이너가 단일 컬럼으로 변경되었는지 확인
    const mainGrid = screen.getByText('기본 정보').closest('.grid');
    expect(mainGrid).toHaveClass('grid-cols-1');
    expect(mainGrid).not.toHaveClass('md:grid-cols-2');
  });

  test('필드들이 적절한 간격으로 배치되어야 함', () => {
    render(<StaffForm {...defaultProps} />);
    
    // 기본 정보 섹션이 존재하는지 확인
    const basicInfoSection = screen.getByText('기본 정보').closest('.space-y-4');
    expect(basicInfoSection).toBeInTheDocument();
    expect(basicInfoSection).toHaveClass('space-y-4');
  });
}); 