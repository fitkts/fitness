import React from 'react';
import { render, screen } from '@testing-library/react';
import MembershipTypeModal from '../../components/MembershipTypeModal';
import { ToastProvider } from '../../contexts/ToastContext';

// createPortal 모킹
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('MembershipTypeModal', () => {
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

  test('모달이 열렸을 때 제목과 저장 버튼이 보여야 한다', () => {
    render(
      <ToastProvider>
        <MembershipTypeModal
          isOpen={true}
          onClose={() => {}}
          onSave={async () => true}
          membershipType={null}
          isViewMode={false}
        />
      </ToastProvider>,
    );

    // 제목과 버튼이 있는지 확인
    expect(screen.getByText('신규 이용권 등록')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });
});
