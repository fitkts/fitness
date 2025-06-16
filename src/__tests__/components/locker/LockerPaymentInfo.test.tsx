import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LockerPaymentInfo from '../../../components/locker/LockerPaymentInfo';

describe('LockerPaymentInfo 컴포넌트', () => {
  const mockProps = {
    startDate: '2024-01-01',
    endDate: '2024-04-01', // 3개월
    monthlyFee: 50000,
    paymentMethod: '현금',
    onPaymentMethodChange: jest.fn(),
    isVisible: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('결제 정보가 올바르게 렌더링되어야 한다', () => {
    render(<LockerPaymentInfo {...mockProps} />);

    expect(screen.getByText('💳 결제 정보')).toBeInTheDocument();
    expect(screen.getByText('3개월')).toBeInTheDocument();
    expect(screen.getByText('50,000원')).toBeInTheDocument();
    expect(screen.getByText('150,000원')).toBeInTheDocument(); // 3개월 * 50,000원
  });

  it('결제 방법 버튼들이 올바르게 렌더링되어야 한다', () => {
    render(<LockerPaymentInfo {...mockProps} />);

    expect(screen.getByText('현금')).toBeInTheDocument();
    expect(screen.getByText('카드')).toBeInTheDocument();
    expect(screen.getByText('계좌이체')).toBeInTheDocument();
    expect(screen.getByText('기타')).toBeInTheDocument();
  });

  it('결제 방법 선택 시 onPaymentMethodChange가 호출되어야 한다', () => {
    render(<LockerPaymentInfo {...mockProps} />);

    const cardButton = screen.getByText('카드');
    fireEvent.click(cardButton);

    expect(mockProps.onPaymentMethodChange).toHaveBeenCalledWith('카드');
  });

  it('선택된 결제 방법이 하이라이트되어야 한다', () => {
    render(<LockerPaymentInfo {...mockProps} />);

    const cashButton = screen.getByText('현금');
    expect(cashButton).toHaveClass('bg-blue-600', 'text-white');
  });

  it('isVisible이 false일 때 렌더링되지 않아야 한다', () => {
    render(<LockerPaymentInfo {...mockProps} isVisible={false} />);

    expect(screen.queryByText('💳 결제 정보')).not.toBeInTheDocument();
  });

  it('날짜가 없을 때 기간 계산이 0개월로 표시되어야 한다', () => {
    render(
      <LockerPaymentInfo 
        {...mockProps} 
        startDate={undefined}
        endDate={undefined}
      />
    );

    expect(screen.getByText('0개월')).toBeInTheDocument();
    expect(screen.getByText('0원')).toBeInTheDocument(); // 총 결제 금액
  });
}); 