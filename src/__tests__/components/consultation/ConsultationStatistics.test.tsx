import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsultationStatistics from '../../../components/consultation/ConsultationStatistics';
import { ConsultationStatistics as StatisticsType } from '../../../types/consultation';

const mockStatistics: StatisticsType = {
  total: 100,
  pending: 20,
  inProgress: 30,
  completed: 45,
  followUp: 5
};

describe('ConsultationStatistics', () => {
  test('로딩 중일 때 스켈레톤이 표시된다', () => {
    render(<ConsultationStatistics isLoading={true} />);
    
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(5); // 5개의 통계 카드
  });

  test('통계 데이터가 없을 때 null을 반환한다', () => {
    const { container } = render(<ConsultationStatistics statistics={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  test('통계 데이터가 올바르게 표시된다', () => {
    render(<ConsultationStatistics statistics={mockStatistics} />);
    
    expect(screen.getByText('총 상담회원')).toBeInTheDocument();
    expect(screen.getByText('100명')).toBeInTheDocument();
    
    expect(screen.getByText('대기 중')).toBeInTheDocument();
    expect(screen.getByText('20명')).toBeInTheDocument();
    
    expect(screen.getByText('진행 중')).toBeInTheDocument();
    expect(screen.getByText('30명')).toBeInTheDocument();
    
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('45명')).toBeInTheDocument();
    
    expect(screen.getByText('추가 상담 필요')).toBeInTheDocument();
    expect(screen.getByText('5명')).toBeInTheDocument();
  });

  test('백분율이 올바르게 계산되어 표시된다', () => {
    render(<ConsultationStatistics statistics={mockStatistics} />);
    
    // 대기 중: 20/100 = 20%
    expect(screen.getByText('(20.0%)')).toBeInTheDocument();
    
    // 진행 중: 30/100 = 30%
    expect(screen.getByText('(30.0%)')).toBeInTheDocument();
    
    // 완료: 45/100 = 45%
    expect(screen.getByText('(45.0%)')).toBeInTheDocument();
    
    // 추가 상담 필요: 5/100 = 5%
    expect(screen.getByText('(5.0%)')).toBeInTheDocument();
  });

  test('총 인원이 0일 때 백분율이 0%로 표시된다', () => {
    const zeroStatistics: StatisticsType = {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      followUp: 0
    };
    
    render(<ConsultationStatistics statistics={zeroStatistics} />);
    
    const percentages = screen.getAllByText('(0.0%)');
    expect(percentages).toHaveLength(4); // 총 회원 제외한 4개 카드
  });
}); 