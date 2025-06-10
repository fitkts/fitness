import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsultationDetailModal from '../../../components/consultation/ConsultationDetailModal';
import { ConsultationMember } from '../../../types/consultation';

// Modal 컴포넌트 모킹
jest.mock('../../../components/common/Modal', () => {
  return function MockModal({ isOpen, children, title, footer }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-content">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    );
  };
});

// Mock window.api
const mockApi = {
  getConsultationMemberById: jest.fn(),
  getAllStaff: jest.fn(),
  updateConsultationMember: jest.fn(),
};

// Window API 모킹을 전역으로 설정
Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true
});

// Mock 데이터
const mockMember: ConsultationMember = {
  id: 1,
  name: '김철수',
  phone: '010-1234-5678',
  email: 'kim@example.com',
  gender: '남',
  birth_date: 946684800, // 2000-01-01
  join_date: 1640995200, // 2022-01-01
  consultation_status: 'in_progress',
  health_conditions: '무릎 통증',
  fitness_goals: ['체중감량', '근력증가'],
  notes: '주 3회 운동 희망',
  staff_id: 1,
  staff_name: '박트레이너'
};

const mockStaff = [
  { id: 1, name: '박트레이너', position: '헬스 트레이너' },
  { id: 2, name: '이코치', position: '필라테스 강사' }
];

describe('ConsultationDetailModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    consultationMemberId: 1,
    onUpdate: jest.fn(),
    onPromote: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getConsultationMemberById.mockResolvedValue({
      success: true,
      data: mockMember
    });
    mockApi.getAllStaff.mockResolvedValue({
      success: true,
      data: mockStaff
    });
  });

  test('회원 정보를 올바르게 표시해야 한다', async () => {
    await act(async () => {
      render(<ConsultationDetailModal {...defaultProps} />);
    });

    // API가 호출되었는지 확인
    expect(mockApi.getConsultationMemberById).toHaveBeenCalledWith(1);

    // 데이터가 로드될 때까지 기다림
    await waitFor(() => {
      expect(screen.getByText('김철수')).toBeInTheDocument();
    });

    expect(screen.getByText('010-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('kim@example.com')).toBeInTheDocument();
  });

  test('수정 모드로 전환할 수 있어야 한다', async () => {
    await act(async () => {
      render(<ConsultationDetailModal {...defaultProps} />);
    });

    // 데이터 로딩 완료 대기
    await waitFor(() => {
      expect(screen.getByText('김철수')).toBeInTheDocument();
    });

    // 수정 버튼 클릭
    const editButton = screen.getByTestId('edit-button');
    await act(async () => {
      fireEvent.click(editButton);
    });

    // 수정 모드에서는 입력 필드가 나타나야 함
    await waitFor(() => {
      expect(screen.getByDisplayValue('김철수')).toBeInTheDocument();
      expect(screen.getByDisplayValue('010-1234-5678')).toBeInTheDocument();
    });
  });

  test('회원 정보를 수정할 수 있어야 한다', async () => {
    mockApi.updateConsultationMember.mockResolvedValue({
      success: true,
      data: { ...mockMember, name: '김철수수정' }
    });

    await act(async () => {
      render(<ConsultationDetailModal {...defaultProps} />);
    });

    // 데이터 로딩 완료 대기
    await waitFor(() => {
      expect(screen.getByText('김철수')).toBeInTheDocument();
    });

    // 수정 모드로 전환
    const editButton = screen.getByTestId('edit-button');
    await act(async () => {
      fireEvent.click(editButton);
    });

    // 입력 필드가 나타날 때까지 기다림
    await waitFor(() => {
      expect(screen.getByDisplayValue('김철수')).toBeInTheDocument();
    });

    // 이름 수정
    const nameInput = screen.getByDisplayValue('김철수');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: '김철수수정' } });
    });

    // 저장
    const saveButton = screen.getByTestId('save-button');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(mockApi.updateConsultationMember).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          name: '김철수수정',
          phone: '010-1234-5678',
          email: 'kim@example.com',
          gender: '남',
          birth_date: '2000-01-01',
          consultation_status: 'in_progress',
          health_conditions: '무릎 통증',
          fitness_goals: ['체중감량', '근력증가'],
          notes: '주 3회 운동 희망',
          staff_id: 1
        })
      );
    });
  });

  test('회원을 승격할 수 있어야 한다', async () => {
    await act(async () => {
      render(<ConsultationDetailModal {...defaultProps} />);
    });

    // 데이터 로딩 완료 대기
    await waitFor(() => {
      expect(screen.getByText('김철수')).toBeInTheDocument();
    });

    const promoteButton = screen.getByTestId('promote-button');
    await act(async () => {
      fireEvent.click(promoteButton);
    });

    expect(defaultProps.onPromote).toHaveBeenCalledWith(mockMember);
  });

  test('유효성 검사 오류를 표시해야 한다', async () => {
    await act(async () => {
      render(<ConsultationDetailModal {...defaultProps} />);
    });

    // 데이터 로딩 완료 대기
    await waitFor(() => {
      expect(screen.getByText('김철수')).toBeInTheDocument();
    });

    // 수정 모드로 전환
    const editButton = screen.getByTestId('edit-button');
    await act(async () => {
      fireEvent.click(editButton);
    });

    // 입력 필드가 나타날 때까지 기다림
    await waitFor(() => {
      expect(screen.getByDisplayValue('김철수')).toBeInTheDocument();
    });

    // 이름을 빈 값으로 변경
    const nameInput = screen.getByDisplayValue('김철수');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: '' } });
    });

    // 저장 시도
    const saveButton = screen.getByTestId('save-button');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('이름은 필수 입력 항목입니다.')).toBeInTheDocument();
    });
  });

  test('로딩 상태를 표시해야 한다', async () => {
    // API 응답을 지연시킴
    mockApi.getConsultationMemberById.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ success: true, data: mockMember }), 100)
      )
    );

    await act(async () => {
      render(<ConsultationDetailModal {...defaultProps} />);
    });

    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  test('API 오류를 처리해야 한다', async () => {
    mockApi.updateConsultationMember.mockResolvedValue({
      success: false,
      error: '서버 오류가 발생했습니다.'
    });

    await act(async () => {
      render(<ConsultationDetailModal {...defaultProps} />);
    });

    // 데이터 로딩 완료 대기
    await waitFor(() => {
      expect(screen.getByText('김철수')).toBeInTheDocument();
    });

    // 수정 모드로 전환
    const editButton = screen.getByTestId('edit-button');
    await act(async () => {
      fireEvent.click(editButton);
    });

    // 저장 시도
    const saveButton = screen.getByTestId('save-button');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('서버 오류가 발생했습니다.')).toBeInTheDocument();
    });
  });
}); 