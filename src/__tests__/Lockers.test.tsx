import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Lockers from '../pages/Lockers';
import { Locker } from '../models/types';

// 테스트용 락커 데이터
const mockLockers: Locker[] = [
  {
    id: 1,
    number: '101',
    status: 'available',
    createdAt: '2024-03-20',
    updatedAt: '2024-03-20',
  },
  {
    id: 2,
    number: '102',
    status: 'occupied',
    memberId: 1,
    memberName: '홍길동',
    startDate: '2024-03-01',
    endDate: '2024-04-01',
    createdAt: '2024-03-20',
    updatedAt: '2024-03-20',
  },
];

describe('Lockers 컴포넌트', () => {
  beforeEach(() => {
    // API 모의 응답 설정
    (window.api.getAllLockers as jest.Mock).mockResolvedValue({
      success: true,
      data: mockLockers,
    });
  });

  test('락커 목록이 정상적으로 로드되어야 함', async () => {
    render(<Lockers />);
    
    // 로딩 상태 확인
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // 락커 목록이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('락커 101')).toBeInTheDocument();
      expect(screen.getByText('락커 102')).toBeInTheDocument();
    });
  });

  test('검색 기능이 정상적으로 작동해야 함', async () => {
    render(<Lockers />);
    
    // 검색어 입력
    const searchInput = screen.getByPlaceholderText('락커 번호 또는 회원명으로 검색...');
    fireEvent.change(searchInput, { target: { value: '101' } });
    
    // 검색 결과 확인
    await waitFor(() => {
      expect(screen.getByText('락커 101')).toBeInTheDocument();
      expect(screen.queryByText('락커 102')).not.toBeInTheDocument();
    });
  });

  test('필터링이 정상적으로 작동해야 함', async () => {
    render(<Lockers />);
    
    // 필터 선택
    const filterSelect = screen.getByRole('combobox');
    fireEvent.change(filterSelect, { target: { value: 'occupied' } });
    
    // 필터링 결과 확인
    await waitFor(() => {
      expect(screen.getByText('락커 102')).toBeInTheDocument();
      expect(screen.queryByText('락커 101')).not.toBeInTheDocument();
    });
  });

  test('락커 추가 버튼이 정상적으로 작동해야 함', async () => {
    render(<Lockers />);
    
    // 락커 추가 버튼 클릭
    const addButton = screen.getByText('락커 추가');
    fireEvent.click(addButton);
    
    // 모달이 열리는지 확인
    await waitFor(() => {
      expect(screen.getByText('신규 락커 등록')).toBeInTheDocument();
    });
  });

  test('락커 삭제가 정상적으로 작동해야 함', async () => {
    // 삭제 API 모의 응답 설정
    (window.api.deleteLocker as jest.Mock).mockResolvedValue({
      success: true,
    });

    render(<Lockers />);
    
    // 삭제 버튼 클릭
    const deleteButtons = await screen.findAllByRole('button', { name: /삭제/i });
    fireEvent.click(deleteButtons[0]);
    
    // 확인 대화상자 모의
    window.confirm = jest.fn(() => true);
    
    // 삭제 후 목록 새로고침 확인
    await waitFor(() => {
      expect(window.api.deleteLocker).toHaveBeenCalled();
    });
  });
}); 