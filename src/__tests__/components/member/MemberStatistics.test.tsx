import React from 'react';
import { render, screen } from '@testing-library/react';
import MemberStatistics from '../../../components/member/MemberStatistics';
import { MemberStatistics as StatisticsType } from '../../../types/member';

describe('MemberStatistics', () => {
  const mockStatistics: StatisticsType = {
    total: 100,
    active: 75,
    expired: 25,
    expiringIn30Days: 10,
    topMembershipTypes: [
      ['3개월', 40],
      ['6개월', 35],
      ['1년', 25]
    ]
  };

  it('총 회원수가 정확히 표시되어야 한다', () => {
    render(<MemberStatistics statistics={mockStatistics} />);
    expect(screen.getByText('100명')).toBeInTheDocument();
  });

  it('활성 회원수와 비율이 표시되어야 한다', () => {
    render(<MemberStatistics statistics={mockStatistics} />);
    expect(screen.getByText('75명')).toBeInTheDocument();
    expect(screen.getByText('(75.0%)')).toBeInTheDocument();
  });

  it('만료 회원수와 비율이 표시되어야 한다', () => {
    render(<MemberStatistics statistics={mockStatistics} />);
    expect(screen.getByText('25명')).toBeInTheDocument();
    expect(screen.getByText('(25.0%)')).toBeInTheDocument();
  });

  it('30일 내 만료 예정 회원수가 표시되어야 한다', () => {
    render(<MemberStatistics statistics={mockStatistics} />);
    expect(screen.getByText('10명')).toBeInTheDocument();
  });

  it('각 통계 카드가 올바른 색상으로 표시되어야 한다', () => {
    render(<MemberStatistics statistics={mockStatistics} />);
    
    // 총 회원수 - 파란색
    const totalCard = screen.getByText('총 회원수').closest('div');
    expect(totalCard).toHaveClass('bg-blue-50');

    // 활성 회원 - 초록색
    const activeCard = screen.getByText('활성 회원').closest('div');
    expect(activeCard).toHaveClass('bg-green-50');

    // 만료 회원 - 빨간색
    const expiredCard = screen.getByText('만료 회원').closest('div');
    expect(expiredCard).toHaveClass('bg-red-50');

    // 30일 내 만료 - 노란색
    const expiringCard = screen.getByText('30일 내 만료 예정').closest('div');
    expect(expiringCard).toHaveClass('bg-yellow-50');
  });

  it('로딩 상태에서는 스켈레톤이 표시되어야 한다', () => {
    render(<MemberStatistics isLoading={true} />);
    const skeletons = screen.getAllByTestId('skeleton');
    expect(skeletons).toHaveLength(4);
  });

  describe('컴팩트 레이아웃', () => {
    it('컨테이너가 작은 마진을 가져야 한다', () => {
      render(<MemberStatistics statistics={mockStatistics} />);
      
      const container = screen.getByText('총 회원수').closest('.bg-white');
      expect(container).toHaveClass('mb-4'); // 기존 mb-6에서 변경
    });

    it('통계 카드들이 작은 패딩을 가져야 한다', () => {
      render(<MemberStatistics statistics={mockStatistics} />);
      
      const statCard = screen.getByText('총 회원수').closest('.bg-blue-50');
      expect(statCard).toHaveClass('p-3'); // 기존 p-4에서 변경
    });

    it('컨테이너 패딩이 작아야 한다', () => {
      render(<MemberStatistics statistics={mockStatistics} />);
      
      const container = screen.getByText('총 회원수').closest('.bg-white');
      const gridContainer = container?.querySelector('.grid');
      expect(gridContainer).toHaveClass('p-3'); // 기존 p-5에서 변경
    });

    it('그리드 간격이 작아야 한다', () => {
      render(<MemberStatistics statistics={mockStatistics} />);
      
      const container = screen.getByText('총 회원수').closest('.bg-white');
      const gridContainer = container?.querySelector('.grid');
      expect(gridContainer).toHaveClass('gap-3'); // 기존 gap-4에서 변경
    });

    it('숫자 텍스트가 작은 크기를 가져야 한다', () => {
      render(<MemberStatistics statistics={mockStatistics} />);
      
      const numberElement = screen.getByText('100명');
      expect(numberElement).toHaveClass('text-xl'); // 기존 text-2xl에서 변경
      expect(numberElement).toHaveClass('font-bold');
    });

    it('라벨 텍스트가 작은 크기를 가져야 한다', () => {
      render(<MemberStatistics statistics={mockStatistics} />);
      
      const labelElement = screen.getByText('총 회원수');
      expect(labelElement).toHaveClass('text-xs'); // 기존 text-sm에서 변경
      expect(labelElement).toHaveClass('font-medium');
    });
  });
}); 