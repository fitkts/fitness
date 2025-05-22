import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LockerModal from '../components/LockerModal';
import { Locker } from '../models/types';

// 테스트용 락커 데이터
const mockLocker: Locker = {
  id: 1,
  number: '101',
  status: 'available',
  createdAt: '2024-03-20',
  updatedAt: '2024-03-20',
};

// 테스트용 회원 데이터
const mockMembers = [
  {
    id: 1,
    name: '홍길동',
    phone: '010-1234-5678',
  },
];

describe('LockerModal 컴포넌트', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    // API 모의 응답 설정
    (window.api.searchMembers as jest.Mock).mockResolvedValue({
      success: true,
      data: mockMembers,
    });
  });

  test('신규 락커 등록 모달이 정상적으로 표시되어야 함', () => {
    render(
      <LockerModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isViewMode={false}
      />
    );

    expect(screen.getByText('신규 락커 등록')).toBeInTheDocument();
    expect(screen.getByLabelText(/락커 번호/)).toBeInTheDocument();
    expect(screen.getByLabelText(/상태/)).toBeInTheDocument();
  });

  test('기존 락커 수정 모달이 정상적으로 표시되어야 함', () => {
    render(
      <LockerModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        locker={mockLocker}
        isViewMode={false}
      />
    );

    expect(screen.getByText('락커 정보 수정')).toBeInTheDocument();
    expect(screen.getByDisplayValue('101')).toBeInTheDocument();
  });

  test('회원 검색이 정상적으로 작동해야 함', async () => {
    render(
      <LockerModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isViewMode={false}
      />
    );

    // 상태를 '사용 중'으로 변경
    const statusSelect = screen.getByLabelText(/상태/);
    fireEvent.change(statusSelect, { target: { value: 'occupied' } });

    // 회원 검색
    const searchInput = screen.getByPlaceholderText('회원명 또는 전화번호로 검색...');
    fireEvent.change(searchInput, { target: { value: '홍길동' } });

    // 검색 결과 확인
    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });
  });

  test('유효성 검사가 정상적으로 작동해야 함', async () => {
    render(
      <LockerModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isViewMode={false}
      />
    );

    // 저장 버튼 클릭
    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);

    // 에러 메시지 확인
    expect(screen.getByText('락커 번호는 필수입니다')).toBeInTheDocument();
  });

  test('사용 중 상태일 때 날짜 입력이 필수여야 함', async () => {
    render(
      <LockerModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        isViewMode={false}
      />
    );

    // 상태를 '사용 중'으로 변경
    const statusSelect = screen.getByLabelText(/상태/);
    fireEvent.change(statusSelect, { target: { value: 'occupied' } });

    // 락커 번호 입력
    const numberInput = screen.getByLabelText(/락커 번호/);
    fireEvent.change(numberInput, { target: { value: '101' } });

    // 저장 버튼 클릭
    const saveButton = screen.getByText('저장');
    fireEvent.click(saveButton);

    // 에러 메시지 확인
    expect(screen.getByText('시작일은 필수입니다')).toBeInTheDocument();
    expect(screen.getByText('종료일은 필수입니다')).toBeInTheDocument();
  });
}); 