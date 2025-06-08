import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffPermissionsForm from '../../../components/staff/StaffPermissionsForm';
import { StaffPermissions } from '../../../types/staff';

const mockPermissions: StaffPermissions = {
  dashboard: true,
  members: true,
  attendance: false,
  payment: false,
  lockers: false,
  staff: false,
  excel: false,
  backup: false,
  settings: false,
};

const defaultProps = {
  permissions: mockPermissions,
  isViewMode: false,
  isSubmitting: false,
  handlePermissionChange: jest.fn(),
  setPermissionPreset: jest.fn(),
};

describe('StaffPermissionsForm 컴포넌트', () => {
  test('권한설정 폼이 숨김 처리되어야 함', () => {
    render(<StaffPermissionsForm {...defaultProps} />);
    
    // 컴포넌트 자체는 렌더링되지만 숨김 처리됨
    const permissionsContainer = screen.getByTestId('permissions-container');
    expect(permissionsContainer).toBeInTheDocument();
    expect(permissionsContainer).toHaveStyle('display: none');
  });

  test('권한설정 기능은 유지되어야 함 (코드만 남겨둠)', () => {
    render(<StaffPermissionsForm {...defaultProps} />);
    
    // 권한 체크박스들이 여전히 존재하지만 숨겨짐
    const dashboardCheckbox = screen.getByRole('checkbox', { name: /대시보드/i, hidden: true });
    expect(dashboardCheckbox).toBeInTheDocument();
    expect(dashboardCheckbox).toBeChecked();
  });
}); 