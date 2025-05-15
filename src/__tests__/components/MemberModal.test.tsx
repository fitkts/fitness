import React from 'react';
import { render, screen, act } from '@testing-library/react';
import MemberModal from '../../components/MemberModal';
import { ToastProvider } from '../../contexts/ToastContext';
// import * as api from '../../api'; // 이전 mock 대상

// API 모킹 수정: ../../database/ipcService의 getAllStaff를 mock합니다.
jest.mock('../../database/ipcService', () => ({
  __esModule: true, // ES Module 모킹 시 필요
  getAllStaff: jest.fn().mockResolvedValue({
    success: true,
    data: [],
  }),
}));

// createPortal 모킹
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('MemberModal', () => {
  beforeEach(() => {
    // root 요소 추가
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);
  });

  afterEach(() => {
    // root 요소 제거
    const root = document.getElementById('root');
    if (root) {
      document.body.removeChild(root);
    }
  });

  test('모달이 열렸을 때 제목과 저장 버튼이 보여야 한다', async () => {
    await act(async () => {
      render(
        <ToastProvider>
          <MemberModal
            isOpen={true}
            onClose={() => {}}
            onSave={async () => true}
            member={null}
            isViewMode={false}
          />
        </ToastProvider>,
      );
    });

    // 제목과 버튼이 있는지 확인
    const titles = screen.getAllByText('신규 회원 등록');
    expect(titles[0]).toBeInTheDocument(); // 첫 번째 요소를 확인
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });
});
