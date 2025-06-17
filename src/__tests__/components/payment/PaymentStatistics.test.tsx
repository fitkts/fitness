import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentStatistics from '../../../components/payment/PaymentStatistics';
import { PaymentStatistics as StatisticsType } from '../../../types/payment';

// Mock 데이터
const mockStatistics: StatisticsType = {
  totalPayments: 100,
  totalAmount: 5000000,
  completedPayments: 80,
  completedAmount: 4000000,
  canceledPayments: 15,
  canceledAmount: 750000,
  refundedPayments: 5,
  refundedAmount: 250000,
  averageAmount: 50000,
  topMembershipTypes: [
    { name: '3개월권', count: 30, amount: 1500000 },
    { name: '1개월권', count: 25, amount: 1000000 },
  ],
  monthlyTrend: [
    { month: '2024-01', count: 20, amount: 1000000 },
    { month: '2024-02', count: 25, amount: 1250000 },
  ],
};

describe('PaymentStatistics', () => {
  it('결제 통계가 올바르게 렌더링되어야 한다', () => {
    render(<PaymentStatistics statistics={mockStatistics} />);
    
    // 총 결제 건수가 표시되는지 확인
    expect(screen.getByText('총 결제 건수')).toBeInTheDocument();
    expect(screen.getByText('100건')).toBeInTheDocument();
    
    // 총 결제 금액이 표시되는지 확인 (₩ 형식으로 수정)
    expect(screen.getByText('총 결제 금액')).toBeInTheDocument();
    expect(screen.getByText('₩5,000,000')).toBeInTheDocument();
  });

  it('로딩 상태가 올바르게 표시되어야 한다', () => {
    render(<PaymentStatistics isLoading={true} />);
    
    // 로딩 스켈레톤이 표시되는지 확인
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
  });

  it('통계 데이터가 없을 때 null을 반환해야 한다', () => {
    const { container } = render(<PaymentStatistics />);
    expect(container.firstChild).toBeNull();
  });

  it('완료된 결제 비율이 올바르게 계산되어야 한다', () => {
    render(<PaymentStatistics statistics={mockStatistics} />);
    
    // 완료된 결제 비율이 올바르게 표시되는지 확인 (80/100 = 80%)
    expect(screen.getByText('(80.0%)')).toBeInTheDocument();
  });

  it('평균 결제 금액이 올바르게 표시되어야 한다', () => {
    render(<PaymentStatistics statistics={mockStatistics} />);
    
    expect(screen.getByText('평균 결제 금액')).toBeInTheDocument();
    expect(screen.getByText('₩50,000')).toBeInTheDocument(); // ₩ 형식으로 수정
  });
}); 