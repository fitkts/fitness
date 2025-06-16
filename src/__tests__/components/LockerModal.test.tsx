import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LockerModal from '../../components/LockerModal';
import { Locker, LockerSize } from '../../models/types';
import { useToast } from '../../contexts/ToastContext';

// Mock the toast context
jest.mock('../../contexts/ToastContext', () => ({
  useToast: jest.fn()
}));

// Mock 데이터
const mockLocker: Locker = {
  id: 1,
  number: '001',
  status: 'occupied',
  size: LockerSize.SMALL,
  location: '1층 A구역',
  memberId: 1,
  memberName: '김철수',
  startDate: '2025-01-01',
  endDate: '2025-04-01',
  notes: '테스트 락커'
};

const mockToast = {
  showToast: jest.fn(),
  hideToast: jest.fn()
};

beforeEach(() => {
  (useToast as jest.Mock).mockReturnValue(mockToast);
});

describe('LockerModal', () => {
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
      <LockerModal
        isOpen={true}
        onClose={() => {}}
        onSave={async () => true}
        locker={null}
        isViewMode={false}
      />
    );

    // 제목과 버튼이 있는지 확인
    expect(screen.getByText('신규 락커 등록')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });
});

describe('LockerModal - 월 사용료 변경 기능', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('월 사용료 기본값 50,000원이 표시되어야 한다', () => {
    render(
      <LockerModal
        isOpen={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        locker={mockLocker}
      />
    );

    const monthlyFeeInput = screen.getByDisplayValue('50,000');
    expect(monthlyFeeInput).toBeInTheDocument();
  });

  test('월 사용료를 변경할 수 있어야 한다', async () => {
    render(
      <LockerModal
        isOpen={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        locker={mockLocker}
      />
    );

    const monthlyFeeInput = screen.getByDisplayValue('50,000');
    
    // 월 사용료를 70,000원으로 변경
    fireEvent.change(monthlyFeeInput, { target: { value: '70000' } });
    
    await waitFor(() => {
      expect(monthlyFeeInput).toHaveValue('70,000');
    });
  });

  test('월 사용료 변경 시 총 결제 금액이 자동으로 계산되어야 한다', async () => {
    render(
      <LockerModal
        isOpen={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        locker={mockLocker}
      />
    );

    const monthlyFeeInput = screen.getByDisplayValue('50,000');
    
    // 월 사용료를 80,000원으로 변경
    fireEvent.change(monthlyFeeInput, { target: { value: '80000' } });
    
    // 3개월 사용 기간 기준 총 금액 확인
    await waitFor(() => {
      const totalAmount = screen.getByText(/240,000원/);
      expect(totalAmount).toBeInTheDocument();
    });
  });

  test('월 사용료에 유효하지 않은 값 입력 시 에러 메시지가 표시되어야 한다', () => {
    render(
      <LockerModal
        isOpen={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        locker={mockLocker}
      />
    );

    const monthlyFeeInput = screen.getByDisplayValue('50,000');
    
    // 음수 값 입력
    fireEvent.change(monthlyFeeInput, { target: { value: '-10000' } });
    fireEvent.blur(monthlyFeeInput);
    
    expect(screen.getByText(/월 사용료는 0원 이상이어야 합니다/i)).toBeInTheDocument();
  });
});
