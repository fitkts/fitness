import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Staff from '../../pages/Staff';

// DB 함수 mock 처리
global.window = Object.create(window);
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
});

jest.mock('../../database/ipcService', () => ({
  getAllStaff: jest.fn().mockResolvedValue({ success: true, data: [] }),
  addStaff: jest.fn(),
  updateStaff: jest.fn(),
  deleteStaff: jest.fn(),
}));

jest.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({ showToast: jest.fn() }),
}));

jest.mock('../../components/StaffModal', () => () => (
  <div data-testid="staff-modal">StaffModal</div>
));

describe('직원 관리 페이지', () => {
  test('제목과 직원 추가 버튼이 화면에 보여야 한다', async () => {
    render(<Staff />);
    // 제목
    expect(await screen.findByText('직원 관리')).toBeInTheDocument();
    // 직원 추가 버튼
    expect(screen.getByText('직원 추가')).toBeInTheDocument();
    // 직원 목록 안내 문구
    expect(
      await screen.findByText('직원 정보가 없습니다.'),
    ).toBeInTheDocument();
  });
});
