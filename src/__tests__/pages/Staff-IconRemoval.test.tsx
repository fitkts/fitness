import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Staff from '../../pages/Staff';
import { ToastProvider } from '../../contexts/ToastContext';

// Mock 모듈들
jest.mock('../../models/api', () => ({
  getAllStaff: jest.fn().mockResolvedValue({
    success: true,
    data: [
      {
        id: 1,
        name: '김테스트',
        position: '트레이너',
        phone: '010-1234-5678',
        email: 'test@example.com',
        hireDate: '2024-01-01',
        birthDate: '1990-05-15',
        status: 'active',
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
    ],
  }),
  addStaff: jest.fn().mockResolvedValue({ success: true }),
  updateStaff: jest.fn().mockResolvedValue({ success: true }),
  deleteStaff: jest.fn().mockResolvedValue({ success: true }),
}));

describe('Staff 테이블 아이콘 제거', () => {
  const renderWithToast = (component: React.ReactElement) => {
    return render(<ToastProvider>{component}</ToastProvider>);
  };

  test('직원 테이블에서 이름 앞의 User 아이콘이 제거되어야 함', async () => {
    renderWithToast(<Staff />);

    // 직원 데이터가 로드될 때까지 대기
    await waitFor(() => {
      expect(screen.getByText('김테스트')).toBeInTheDocument();
    });

    // User 아이콘이 테이블 행에 없는지 확인
    const tableRow = screen.getByText('김테스트').closest('tr');
    expect(tableRow).toBeInTheDocument();

    // User 아이콘 컴포넌트가 테이블 행에 없는지 확인
    // User 아이콘은 빈 상태일 때만 있어야 함 (size={48})
    const userIconInRow = tableRow?.querySelector('svg[data-lucide="user"]');
    expect(userIconInRow).toBeNull();
  });

  test('직원 이름과 이메일이 아이콘 없이 정상 표시되어야 함', async () => {
    renderWithToast(<Staff />);

    await waitFor(() => {
      expect(screen.getByText('김테스트')).toBeInTheDocument();
    });

    // 이름과 이메일이 표시되는지 확인
    expect(screen.getByText('김테스트')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();

    // 이름이 있는 셀에서 User 아이콘이 없는지 확인
    const nameCell = screen.getByText('김테스트').closest('td');
    expect(nameCell).toBeInTheDocument();
    
    // User 아이콘 관련 클래스가 없는지 확인
    const userIconWrapper = nameCell?.querySelector('.h-10.w-10');
    expect(userIconWrapper).toBeNull();
  });

  test('빈 상태일 때의 User 아이콘은 유지되어야 함', async () => {
    // 빈 데이터로 모킹
    const mockGetAllStaff = require('../../models/api').getAllStaff;
    mockGetAllStaff.mockResolvedValueOnce({
      success: true,
      data: [],
    });

    renderWithToast(<Staff />);

    await waitFor(() => {
      expect(screen.getByText('직원 정보가 없습니다.')).toBeInTheDocument();
    });

    // 빈 상태의 User 아이콘(size={48})은 있어야 함
    const emptyStateIcon = document.querySelector('svg[data-lucide="user"]');
    expect(emptyStateIcon).toBeInTheDocument();
  });

  test('테이블 레이아웃이 깔끔하게 정렬되어야 함', async () => {
    renderWithToast(<Staff />);

    await waitFor(() => {
      expect(screen.getByText('김테스트')).toBeInTheDocument();
    });

    // 이름이 있는 셀의 구조 확인
    const nameCell = screen.getByText('김테스트').closest('td');
    expect(nameCell).toHaveClass('py-2', 'px-2');
    
    // flex items-center가 여전히 있는지 확인 (레이아웃 유지)
    const flexContainer = nameCell?.querySelector('.flex.items-center');
    expect(flexContainer).toBeInTheDocument();
  });
}); 