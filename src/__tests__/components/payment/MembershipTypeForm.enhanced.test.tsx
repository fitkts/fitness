import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider } from '../../../contexts/ToastContext';
import MembershipTypeForm from '../../../components/payment/MembershipTypeForm';
import { MembershipType } from '../../../models/types';

// 테스트용 Mock 함수들
const mockAddMembershipType = jest.fn();
const mockUpdateMembershipType = jest.fn();

jest.mock('../../../database/ipcService', () => ({
  addMembershipType: mockAddMembershipType,
  updateMembershipType: mockUpdateMembershipType,
}));

// 테스트용 컴포넌트 래퍼
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('향상된 MembershipTypeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('이용권 타입 선택', () => {
    it('초기 로드 시 월간 회원권이 기본 선택되어야 한다', () => {
      render(
        <TestWrapper>
          <MembershipTypeForm
            formId="test-form"
            initialMembershipType={null}
            isViewMode={false}
            onSubmitSuccess={() => {}}
            setSubmitLoading={() => {}}
          />
        </TestWrapper>
      );

      const monthlyOption = screen.getByLabelText('월간 회원권');
      expect(monthlyOption).toBeChecked();
    });

    it('PT 회원권 선택 시 PT 관련 옵션들이 표시되어야 한다', () => {
      render(
        <TestWrapper>
          <MembershipTypeForm
            formId="test-form"
            initialMembershipType={null}
            isViewMode={false}
            onSubmitSuccess={() => {}}
            setSubmitLoading={() => {}}
          />
        </TestWrapper>
      );

      const ptOption = screen.getByLabelText('PT 회원권');
      fireEvent.click(ptOption);

      expect(screen.getByLabelText('PT 유형')).toBeInTheDocument();
      expect(screen.getByText('횟수제')).toBeInTheDocument();
      expect(screen.getByText('기간제')).toBeInTheDocument();
    });

    it('횟수제 PT 선택 시 세션 수 입력 필드가 나타나야 한다', () => {
      render(
        <TestWrapper>
          <MembershipTypeForm
            formId="test-form"
            initialMembershipType={null}
            isViewMode={false}
            onSubmitSuccess={() => {}}
            setSubmitLoading={() => {}}
          />
        </TestWrapper>
      );

      const ptOption = screen.getByLabelText('PT 회원권');
      fireEvent.click(ptOption);

      const sessionBasedOption = screen.getByLabelText('횟수제');
      fireEvent.click(sessionBasedOption);

      expect(screen.getByLabelText('PT 세션 수')).toBeInTheDocument();
      expect(screen.queryByLabelText('기간 (개월)')).not.toBeInTheDocument();
    });

    it('기간제 PT 선택 시 기간 입력 필드가 나타나야 한다', () => {
      render(
        <TestWrapper>
          <MembershipTypeForm
            formId="test-form"
            initialMembershipType={null}
            isViewMode={false}
            onSubmitSuccess={() => {}}
            setSubmitLoading={() => {}}
          />
        </TestWrapper>
      );

      const ptOption = screen.getByLabelText('PT 회원권');
      fireEvent.click(ptOption);

      const termBasedOption = screen.getByLabelText('기간제');
      fireEvent.click(termBasedOption);

      expect(screen.getByLabelText('기간 (개월)')).toBeInTheDocument();
      expect(screen.queryByLabelText('PT 세션 수')).not.toBeInTheDocument();
    });
  });

  describe('데이터 저장', () => {
    it('월간 회원권 저장 시 올바른 데이터가 전송되어야 한다', async () => {
      mockAddMembershipType.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <MembershipTypeForm
            formId="test-form"
            initialMembershipType={null}
            isViewMode={false}
            onSubmitSuccess={() => {}}
            setSubmitLoading={() => {}}
          />
        </TestWrapper>
      );

      // 월간 회원권이 기본 선택됨
      fireEvent.change(screen.getByLabelText('이용권 이름'), {
        target: { value: '헬스 3개월' }
      });
      fireEvent.change(screen.getByLabelText('가격 (원)'), {
        target: { value: '150000' }
      });
      fireEvent.change(screen.getByLabelText('기간 (개월)'), {
        target: { value: '3' }
      });

      const form = screen.getByRole('form') || document.getElementById('test-form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockAddMembershipType).toHaveBeenCalledWith({
          name: '헬스 3개월',
          price: 150000,
          durationMonths: 3,
          membershipCategory: 'monthly',
          ptType: null,
          maxUses: null,
          description: '',
          isActive: true
        });
      });
    });

    it('횟수제 PT 회원권 저장 시 올바른 데이터가 전송되어야 한다', async () => {
      mockAddMembershipType.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <MembershipTypeForm
            formId="test-form"
            initialMembershipType={null}
            isViewMode={false}
            onSubmitSuccess={() => {}}
            setSubmitLoading={() => {}}
          />
        </TestWrapper>
      );

      // PT 회원권 선택
      fireEvent.click(screen.getByLabelText('PT 회원권'));
      
      // 횟수제 선택
      fireEvent.click(screen.getByLabelText('횟수제'));

      fireEvent.change(screen.getByLabelText('이용권 이름'), {
        target: { value: 'PT 10회권' }
      });
      fireEvent.change(screen.getByLabelText('가격 (원)'), {
        target: { value: '500000' }
      });
      fireEvent.change(screen.getByLabelText('PT 세션 수'), {
        target: { value: '10' }
      });

      const form = screen.getByRole('form') || document.getElementById('test-form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockAddMembershipType).toHaveBeenCalledWith({
          name: 'PT 10회권',
          price: 500000,
          durationMonths: 1, // 기본값
          membershipCategory: 'pt',
          ptType: 'session_based',
          maxUses: 10,
          description: '',
          isActive: true
        });
      });
    });

    it('기간제 PT 회원권 저장 시 올바른 데이터가 전송되어야 한다', async () => {
      mockAddMembershipType.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <MembershipTypeForm
            formId="test-form"
            initialMembershipType={null}
            isViewMode={false}
            onSubmitSuccess={() => {}}
            setSubmitLoading={() => {}}
          />
        </TestWrapper>
      );

      // PT 회원권 선택
      fireEvent.click(screen.getByLabelText('PT 회원권'));
      
      // 기간제 선택
      fireEvent.click(screen.getByLabelText('기간제'));

      fireEvent.change(screen.getByLabelText('이용권 이름'), {
        target: { value: 'PT 1개월 무제한' }
      });
      fireEvent.change(screen.getByLabelText('가격 (원)'), {
        target: { value: '800000' }
      });
      fireEvent.change(screen.getByLabelText('기간 (개월)'), {
        target: { value: '1' }
      });

      const form = screen.getByRole('form') || document.getElementById('test-form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockAddMembershipType).toHaveBeenCalledWith({
          name: 'PT 1개월 무제한',
          price: 800000,
          durationMonths: 1,
          membershipCategory: 'pt',
          ptType: 'term_based',
          maxUses: null,
          description: '',
          isActive: true
        });
      });
    });
  });

  describe('유효성 검사', () => {
    it('횟수제 PT에서 세션 수가 없으면 에러가 표시되어야 한다', async () => {
      render(
        <TestWrapper>
          <MembershipTypeForm
            formId="test-form"
            initialMembershipType={null}
            isViewMode={false}
            onSubmitSuccess={() => {}}
            setSubmitLoading={() => {}}
          />
        </TestWrapper>
      );

      // PT 회원권 선택
      fireEvent.click(screen.getByLabelText('PT 회원권'));
      
      // 횟수제 선택
      fireEvent.click(screen.getByLabelText('횟수제'));

      fireEvent.change(screen.getByLabelText('이용권 이름'), {
        target: { value: 'PT 회원권' }
      });
      fireEvent.change(screen.getByLabelText('가격 (원)'), {
        target: { value: '500000' }
      });
      // PT 세션 수를 입력하지 않음

      const form = screen.getByRole('form') || document.getElementById('test-form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('PT 세션 수를 입력해주세요.')).toBeInTheDocument();
      });
    });

    it('기간제 PT에서 기간이 없으면 에러가 표시되어야 한다', async () => {
      render(
        <TestWrapper>
          <MembershipTypeForm
            formId="test-form"
            initialMembershipType={null}
            isViewMode={false}
            onSubmitSuccess={() => {}}
            setSubmitLoading={() => {}}
          />
        </TestWrapper>
      );

      // PT 회원권 선택
      fireEvent.click(screen.getByLabelText('PT 회원권'));
      
      // 기간제 선택
      fireEvent.click(screen.getByLabelText('기간제'));

      fireEvent.change(screen.getByLabelText('이용권 이름'), {
        target: { value: 'PT 회원권' }
      });
      fireEvent.change(screen.getByLabelText('가격 (원)'), {
        target: { value: '500000' }
      });
      // 기간을 입력하지 않음

      const form = screen.getByRole('form') || document.getElementById('test-form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('기간은 최소 1개월 이상이어야 합니다.')).toBeInTheDocument();
      });
    });
  });
}); 