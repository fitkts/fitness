import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffStatistics from '../../../components/staff/StaffStatistics';
import { StaffStatisticsData } from '../../../types/staff';

const sampleStatistics: StaffStatisticsData = {
  total: 10,
  active: 8,
  inactive: 2,
  byPosition: {
    '관리자': 2,
    '일반 직원': 6,
    '트레이너': 2,
  },
};

const defaultProps = {
  statistics: sampleStatistics,
  isLoading: false,
};

describe('StaffStatistics', () => {
  it('컴포넌트가 정상적으로 렌더링된다', () => {
    render(<StaffStatistics {...defaultProps} />);
    
    expect(screen.getByText('총 직원수')).toBeInTheDocument();
    expect(screen.getByText('10명')).toBeInTheDocument();
  });

  it('활성/비활성 직원 통계가 정확하게 표시된다', () => {
    render(<StaffStatistics {...defaultProps} />);
    
    expect(screen.getByText('재직 중')).toBeInTheDocument();
    expect(screen.getByText('8명')).toBeInTheDocument();
    expect(screen.getByText('퇴사')).toBeInTheDocument();
    expect(screen.getByText('2명')).toBeInTheDocument();
  });

  it('직책별 통계가 정확하게 표시된다', () => {
    render(<StaffStatistics {...defaultProps} />);
    
    expect(screen.getByText('직책별 현황')).toBeInTheDocument();
    expect(screen.getByText('관리자: 2명')).toBeInTheDocument();
    expect(screen.getByText('일반 직원: 6명')).toBeInTheDocument();
    expect(screen.getByText('트레이너: 2명')).toBeInTheDocument();
  });

  it('로딩 상태가 정확하게 표시된다', () => {
    render(<StaffStatistics {...defaultProps} isLoading={true} />);
    
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
  });

  it('통계 데이터가 없을 때 아무것도 렌더링하지 않는다', () => {
    const { container } = render(<StaffStatistics statistics={undefined} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('백분율이 정확하게 계산되어 표시된다', () => {
    render(<StaffStatistics {...defaultProps} />);
    
    // 80% (8/10)
    expect(screen.getByText('(80.0%)')).toBeInTheDocument();
    // 20% (2/10)
    expect(screen.getByText('(20.0%)')).toBeInTheDocument();
  });
}); 