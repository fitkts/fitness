import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PromotionModal from '../../../components/consultation/PromotionModal';
import { ConsultationMember } from '../../../types/consultation';
import { ToastProvider } from '../../../contexts/ToastContext';

// Mock window.api
const mockApi = {
  getAllMembershipTypes: jest.fn(),
  promoteConsultationMember: jest.fn(),
};

// window 객체 모킹
Object.defineProperty(window, 'api', {
  value: mockApi,
  writable: true
});

// 테스트 래퍼 컴포넌트
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('PromotionModal - 공통 모달 스타일 및 컴팩트 디자인', () => {
  const mockConsultationMember: ConsultationMember = {
    id: 1,
    name: '김테스트',
    phone: '010-1234-5678',
    gender: '남',
    birth_date: 946684800,
    join_date: 1672531200,
    health_conditions: '무릎 부상 이력',
    fitness_goals: ['체중감량', '근력증가'],
    consultation_status: 'in_progress',
    notes: '테스트 상담 회원',
    staff_name: '김트레이너'
  };

  const mockMembershipTypes = [
    { id: 1, name: '1개월권', price: 100000, duration_months: 1 },
    { id: 2, name: '3개월권', price: 270000, duration_months: 3 },
    { id: 3, name: '6개월권', price: 500000, duration_months: 6 },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    consultationMember: mockConsultationMember,
    onSuccess: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getAllMembershipTypes.mockResolvedValue({
      success: true,
      data: mockMembershipTypes
    });
    mockApi.promoteConsultationMember.mockResolvedValue({
      success: true,
      data: {}
    });
  });

  it('모달이 닫혀있을 때는 렌더링되지 않아야 한다', () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} isOpen={false} />
      </TestWrapper>
    );

    // 모달이 렌더링되지 않음
    expect(screen.queryByText('정식 회원 승격')).not.toBeInTheDocument();
  });

  it('consultationMember가 null일 때는 렌더링되지 않아야 한다', () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} consultationMember={null} />
      </TestWrapper>
    );

    // 모달이 렌더링되지 않음
    expect(screen.queryByText('정식 회원 승격')).not.toBeInTheDocument();
  });

  it('공통 Modal 컴포넌트를 사용하여 기본 요소들이 렌더링되어야 한다', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PromotionModal {...defaultProps} />
        </TestWrapper>
      );
    });

    // 모달 제목과 설명
    expect(screen.getByText('정식 회원 승격')).toBeInTheDocument();
    expect(screen.getByText('상담회원을 정식회원으로 등록합니다')).toBeInTheDocument();
    
    // 상담 회원 정보
    expect(screen.getByText('상담 회원 정보')).toBeInTheDocument();
    expect(screen.getByText('김테스트')).toBeInTheDocument();
    expect(screen.getByText('010-1234-5678')).toBeInTheDocument();
    
    // 기본 버튼들
    expect(screen.getByText('취소')).toBeInTheDocument();
    expect(screen.getByText('✨ 정식 회원으로 승격')).toBeInTheDocument();
  });

  it('회원권 목록이 컴팩트한 3열 그리드로 표시되어야 한다', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PromotionModal {...defaultProps} />
        </TestWrapper>
      );
    });

    // API 호출 확인
    expect(mockApi.getAllMembershipTypes).toHaveBeenCalled();

    // 회원권 목록 표시 대기
    await waitFor(() => {
      expect(screen.getByText('1개월권')).toBeInTheDocument();
      expect(screen.getByText('3개월권')).toBeInTheDocument();
      expect(screen.getByText('6개월권')).toBeInTheDocument();
    });

    // 가격 정보 확인
    expect(screen.getByText('100,000원')).toBeInTheDocument();
    expect(screen.getByText('270,000원')).toBeInTheDocument();
    expect(screen.getByText('500,000원')).toBeInTheDocument();

    // 그리드 레이아웃 확인 (3열 그리드)
    const membershipContainer = screen.getByText('회원권 선택 *').nextElementSibling;
    expect(membershipContainer).toHaveClass('grid', 'lg:grid-cols-3');
  });

  it('월 단가가 정확히 계산되어야 한다', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PromotionModal {...defaultProps} />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('1개월권')).toBeInTheDocument();
    });

    // 월 단가 계산 확인
    expect(screen.getByText('월 100,000원')).toBeInTheDocument(); // 1개월권
    expect(screen.getByText('월 90,000원')).toBeInTheDocument();  // 3개월권
    expect(screen.getByText('월 83,333원')).toBeInTheDocument();  // 6개월권
  });

  it('회원권 카드가 컴팩트한 세로 레이아웃으로 표시되어야 한다', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PromotionModal {...defaultProps} />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('1개월권')).toBeInTheDocument();
    });

    // 회원권 카드의 role 속성 확인
    const membershipCards = screen.getAllByRole('button').filter(button => 
      button.textContent?.includes('개월권')
    );
    expect(membershipCards.length).toBe(3);

    // 각 카드가 컴팩트한 구조를 가지는지 확인
    const firstCard = membershipCards[0];
    expect(firstCard).toHaveClass('cursor-pointer');
    expect(firstCard.textContent).toContain('1개월');
    expect(firstCard.textContent).toContain('100,000원');
  });

  it('회원권 선택이 키보드 접근성과 함께 동작해야 한다', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PromotionModal {...defaultProps} />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('1개월권')).toBeInTheDocument();
    });

    // 키보드로 회원권 선택
    const membershipCard = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('1개월권')
    );
    
    expect(membershipCard).toBeInTheDocument();
    expect(membershipCard).toHaveAttribute('tabIndex', '0');

    // Enter 키로 선택
    await act(async () => {
      fireEvent.keyDown(membershipCard!, { key: 'Enter' });
    });

    // 선택된 상태 확인
    await waitFor(() => {
      expect(membershipCard).toHaveClass('border-green-500', 'bg-green-50');
    });
  });

  it('회원권 선택 시 종료일이 자동 계산되어야 한다', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PromotionModal {...defaultProps} />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('1개월권')).toBeInTheDocument();
    });

    // 시작일 설정
    const startDateInput = screen.getByDisplayValue(new Date().toISOString().split('T')[0]);
    await act(async () => {
      fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });
    });

    // 1개월권 선택
    const membershipCard = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('1개월권')
    );
    
    await act(async () => {
      fireEvent.click(membershipCard!);
    });

    // 종료일이 자동 계산되는지 확인 (1개월 후: 2024-02-15)
    await waitFor(() => {
      const endDateInputs = screen.getAllByDisplayValue('2024-02-15');
      expect(endDateInputs.length).toBeGreaterThan(0);
    });
  });

  it('승격 버튼은 회원권이 선택되어야 활성화된다', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PromotionModal {...defaultProps} />
        </TestWrapper>
      );
    });

    const promotionButton = screen.getByText('✨ 정식 회원으로 승격');
    
    // 초기 상태: 비활성화
    expect(promotionButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('1개월권')).toBeInTheDocument();
    });

    // 회원권 선택
    const membershipCard = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('1개월권')
    );
    
    await act(async () => {
      fireEvent.click(membershipCard!);
    });

    // 회원권 선택 후: 활성화
    await waitFor(() => {
      expect(promotionButton).not.toBeDisabled();
    });
  });

  it('결제 방법이 이모지 아이콘과 함께 표시되어야 한다', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PromotionModal {...defaultProps} />
        </TestWrapper>
      );
    });

    expect(screen.getByText('결제 방법')).toBeInTheDocument();
    
    // 결제 방법 옵션들
    expect(screen.getByText('💳')).toBeInTheDocument();
    expect(screen.getByText('카드 결제')).toBeInTheDocument();
    expect(screen.getByText('💵')).toBeInTheDocument();
    expect(screen.getByText('현금 결제')).toBeInTheDocument();
    expect(screen.getByText('🏦')).toBeInTheDocument();
    expect(screen.getByText('계좌이체')).toBeInTheDocument();
  });

  it('회원권 선택 시 결제 정보 요약이 표시되어야 한다', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <PromotionModal {...defaultProps} />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('1개월권')).toBeInTheDocument();
    });

    // 회원권 선택
    const membershipCard = screen.getAllByRole('button').find(button => 
      button.textContent?.includes('1개월권')
    );
    
    await act(async () => {
      fireEvent.click(membershipCard!);
    });

    // 결제 정보 요약 확인
    await waitFor(() => {
      expect(screen.getByText('결제 정보 요약')).toBeInTheDocument();
      const paymentAmount = screen.getAllByText('100,000원');
      expect(paymentAmount.length).toBeGreaterThan(1); // 카드와 요약에서 모두 표시
    });
  });
});

// 종료일 계산 기능을 별도 테스트로 분리
describe('PromotionModal - 종료일 계산', () => {
  const mockConsultationMember: ConsultationMember = {
    id: 1,
    name: '김테스트',
    phone: '010-1234-5678',
    gender: '남',
    birth_date: 946684800,
    join_date: 1672531200,
    health_conditions: '무릎 부상 이력',
    fitness_goals: ['체중감량'],
    consultation_status: 'in_progress',
    notes: '테스트',
    staff_name: '김트레이너'
  };

  const mockMembershipTypes = [
    { id: 1, name: '1개월권', price: 100000, duration_months: 1 },
    { id: 2, name: '3개월권', price: 270000, duration_months: 3 },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    consultationMember: mockConsultationMember,
    onSuccess: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.getAllMembershipTypes.mockResolvedValue({
      success: true,
      data: mockMembershipTypes
    });
  });

  const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ToastProvider>{children}</ToastProvider>
  );

  it('회원권 선택 시 종료일이 계산되어야 한다', async () => {
    render(
      <TestWrapper>
        <PromotionModal {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('1개월권')).toBeInTheDocument();
    });

    // 시작일 설정 (오늘 날짜로 기본 설정됨)
    const today = new Date().toISOString().split('T')[0];
    
    // 1개월권 선택
    const membershipCard = screen.getByText('1개월권').closest('div[role="button"]');
    fireEvent.click(membershipCard!);

    // 종료일이 계산되어 표시되는지 확인
    await waitFor(() => {
      // 1개월 후 날짜 계산
      const startDate = new Date(today);
      const expectedEndDate = new Date(startDate);
      expectedEndDate.setMonth(expectedEndDate.getMonth() + 1);
      const expectedEndDateStr = expectedEndDate.toISOString().split('T')[0];
      
      const endDateInput = screen.getAllByDisplayValue(expectedEndDateStr);
      expect(endDateInput.length).toBeGreaterThan(0);
    });
  });
}); 