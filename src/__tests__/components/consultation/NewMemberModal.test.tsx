import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewMemberModal from '../../../components/consultation/NewMemberModal';
import { NewMemberFormData } from '../../../types/consultation';

// Mock API 설정
const mockApi = {
  getAllStaff: jest.fn(),
  addConsultationMember: jest.fn(), // 기존 addMember 대신 addConsultationMember 사용
  getAllConsultationMembers: jest.fn(),
};

// window.api 모킹
Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true,
});

describe('NewMemberModal - 상담 회원 등록', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 기본 직원 데이터 모킹
    mockApi.getAllStaff.mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: '김트레이너', position: '트레이너' },
        { id: 2, name: '박상담사', position: '상담사' }
      ]
    });
  });

  describe('1. 상담 회원 전용 필드 표시', () => {
    test('건강 상태 필드가 표시되어야 한다', async () => {
      render(
        <NewMemberModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/건강 상태 및 주의사항/)).toBeInTheDocument();
      });
    });

    test('운동 목표 필드가 표시되어야 한다', async () => {
      render(
        <NewMemberModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/운동 목표 \(복수 선택 가능\)/)).toBeInTheDocument();
      });
    });

    test('회원권 관련 필드는 표시되지 않아야 한다', async () => {
      render(
        <NewMemberModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

      await waitFor(() => {
        // 회원권 타입 필드가 없어야 함
        expect(screen.queryByLabelText(/회원권/)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/가입일/)).not.toBeInTheDocument();
      });
    });
  });

  describe('2. 상담 회원 등록 프로세스', () => {
    test('상담 회원 정보 입력 후 등록이 성공적으로 처리되어야 한다', async () => {
      mockOnSubmit.mockResolvedValueOnce(undefined);

      render(
        <NewMemberModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

             // 기본 필수 정보 입력
       await waitFor(() => {
         fireEvent.change(screen.getByLabelText(/회원명/), {
           target: { value: '홍길동' }
         });
       });

      fireEvent.change(screen.getByLabelText(/연락처/), {
        target: { value: '010-1234-5678' }
      });

       // 상담 회원 전용 정보 입력
       fireEvent.change(screen.getByLabelText(/건강 상태 및 주의사항/), {
         target: { value: '무릎 부상 이력 있음' }
       });

      // 최초 방문일 입력
      fireEvent.change(screen.getByLabelText(/최초 방문일/), {
        target: { value: '2024-12-01' }
      });

      // 담당자 선택
      await waitFor(() => {
        const staffSelect = screen.getByLabelText(/담당자/);
        fireEvent.change(staffSelect, { target: { value: '1' } });
      });

      // 상담 상태 선택
      const statusSelect = screen.getByLabelText(/상담 상태/);
      fireEvent.change(statusSelect, { target: { value: 'pending' } });

      // 등록 버튼 클릭
      const submitButton = screen.getByText(/상담 등록/);
      fireEvent.click(submitButton);

      // 제출 함수가 올바른 데이터로 호출되었는지 확인
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '홍길동',
            phone: '010-1234-5678',
            health_conditions: '무릎 부상 이력 있음',
            first_visit: '2024-12-01',
            staff_id: 1,
            staff_name: '김트레이너',
            consultation_status: 'pending'
          })
        );
      });
    });

    test('필수 필드 누락 시 적절한 에러 메시지가 표시되어야 한다', async () => {
      render(
        <NewMemberModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

             // 이름 없이 등록 시도
       const submitButton = screen.getByText(/상담 등록/);
       fireEvent.click(submitButton);

       await waitFor(() => {
         expect(screen.getByText(/회원명은 필수 입력 항목입니다|입력 오류/)).toBeInTheDocument();
       });
    });

    test('상담 회원 등록 실패 시 에러 처리가 되어야 한다', async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error('서버 오류'));

      render(
        <NewMemberModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

             // 필수 정보 입력
       fireEvent.change(screen.getByLabelText(/회원명/), {
         target: { value: '홍길동' }
       });
       fireEvent.change(screen.getByLabelText(/연락처/), {
         target: { value: '010-1234-5678' }
       });

       // 등록 시도
       const submitButton = screen.getByText(/상담 등록/);
       fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/서버 오류/)).toBeInTheDocument();
      });
    });
  });

  describe('3. 운동 목표 다중 선택 기능', () => {
    test('운동 목표를 여러 개 선택할 수 있어야 한다', async () => {
      render(
        <NewMemberModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

             await waitFor(() => {
         // 체중 감량 버튼 선택
         const weightLossButton = screen.getByText('체중 감량');
         fireEvent.click(weightLossButton);
         expect(weightLossButton).toHaveClass('bg-blue-50');

         // 근육량 증가 버튼 선택
         const strengthButton = screen.getByText('근육량 증가');
         fireEvent.click(strengthButton);
         expect(strengthButton).toHaveClass('bg-blue-50');
       });
    });
  });

  describe('4. 상담 상태 관리', () => {
    test('상담 상태 옵션이 올바르게 표시되어야 한다', async () => {
      render(
        <NewMemberModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );

             await waitFor(() => {
         const statusSelect = screen.getByLabelText(/상담 상태/);
         
         // 기본값은 빈 값이어야 함
         expect(statusSelect).toHaveValue('');
         
         // 모든 상담 상태 옵션이 있어야 함
         expect(screen.getByText('대기 중')).toBeInTheDocument();
         expect(screen.getByText('진행 중')).toBeInTheDocument();
         expect(screen.getByText('완료')).toBeInTheDocument();
         expect(screen.getByText('추가 상담 필요')).toBeInTheDocument();
       });
    });
  });
}); 