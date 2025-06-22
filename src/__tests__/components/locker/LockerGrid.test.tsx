import React from 'react';
import { render, screen } from '@testing-library/react';
import LockerGrid from '../../../components/locker/LockerGrid';
import { Locker, LockerSize } from '../../../models/types';

const mockLockers: Locker[] = [
  {
    id: 1,
    number: '001',
    status: 'available',
    size: LockerSize.MEDIUM,
    location: '1층 A구역',
    memberName: null,
    startDate: null,
    endDate: null,
    monthlyFee: 50000,
    notes: ''
  },
  {
    id: 2,
    number: '002',
    status: 'occupied',
    size: LockerSize.LARGE,
    location: '2층 B구역',
    memberName: '홍길동',
    memberId: 1,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    monthlyFee: 60000,
    notes: ''
  },
  {
    id: 3,
    number: '003',
    status: 'maintenance',
    size: LockerSize.SMALL,
    location: '1층 C구역',
    memberName: null,
    startDate: null,
    endDate: null,
    monthlyFee: 45000,
    notes: '점검 중'
  }
];

const mockProps = {
  lockers: mockLockers,
  onAction: jest.fn(),
  isLoading: false,
  layoutDirection: 'row' as const,
};

describe('LockerGrid - 컴팩트 레이아웃', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴팩트 그리드 컨테이너가 렌더링되어야 한다', () => {
      render(<LockerGrid {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('gap-2'); // 컴팩트 그리드 간격
    });

    it('반응형 그리드 클래스가 적용되어야 한다', () => {
      render(<LockerGrid {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass(
        'grid',
        'grid-cols-2',
        'md:grid-cols-4',
        'lg:grid-cols-6',
        'xl:grid-cols-8'
      );
    });

    it('모든 락커 카드가 렌더링되어야 한다', () => {
      render(<LockerGrid {...mockProps} />);
      
      expect(screen.getByText('#001')).toBeInTheDocument();
      expect(screen.getByText('#002')).toBeInTheDocument();
      expect(screen.getByText('#003')).toBeInTheDocument();
    });
  });

  describe('컴팩트 스타일 적용', () => {
    it('그리드가 컴팩트 간격을 사용해야 한다', () => {
      render(<LockerGrid {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('gap-2'); // 기존 gap-3에서 줄임
    });

    it('로딩 상태에서 컴팩트 스피너가 표시되어야 한다', () => {
      render(<LockerGrid {...mockProps} isLoading={true} />);
      
      const loadingContainer = screen.getByText('락커 목록을 불러오는 중...').closest('.py-8');
      expect(loadingContainer).toHaveClass('py-8'); // 컴팩트 로딩 패딩
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toHaveClass('h-6', 'w-6'); // 컴팩트 스피너 크기
    });

    it('빈 상태에서 컴팩트 메시지가 표시되어야 한다', () => {
      render(<LockerGrid {...mockProps} lockers={[]} />);
      
      const emptyContainer = screen.getByText('락커가 없습니다').closest('.py-8');
      expect(emptyContainer).toHaveClass('py-8'); // 컴팩트 빈 상태 패딩
      
      const iconContainer = document.querySelector('.w-20');
      expect(iconContainer).toHaveClass('w-20', 'h-20'); // 컴팩트 아이콘 컨테이너
      
      const title = screen.getByText('락커가 없습니다');
      expect(title).toHaveClass('text-base'); // 컴팩트 제목 크기
      
      const subtitle = screen.getByText('새 락커를 추가하여 시작해보세요.');
      expect(subtitle).toHaveClass('text-sm'); // 컴팩트 서브타이틀 크기
    });
  });

  describe('레이아웃 방향', () => {
    it('행 우선 레이아웃이 올바르게 적용되어야 한다', () => {
      render(<LockerGrid {...mockProps} layoutDirection="row" />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid'); // 기본 CSS Grid 클래스
    });

    it('열 우선 레이아웃이 올바르게 적용되어야 한다', () => {
      render(<LockerGrid {...mockProps} layoutDirection="column" />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid'); // 기본 CSS Grid 클래스
      // 열 우선은 CSS에서 grid-auto-flow로 처리됨
    });
  });

  describe('반응형 레이아웃', () => {
    it('모바일에서 2컬럼 그리드를 사용해야 한다', () => {
      render(<LockerGrid {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-2');
    });

    it('태블릿에서 4컬럼 그리드를 사용해야 한다', () => {
      render(<LockerGrid {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('md:grid-cols-4');
    });

    it('데스크톱에서 6컬럼 그리드를 사용해야 한다', () => {
      render(<LockerGrid {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('lg:grid-cols-6');
    });

    it('큰 화면에서 8컬럼 그리드를 사용해야 한다', () => {
      render(<LockerGrid {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('xl:grid-cols-8');
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중에 스피너와 메시지가 표시되어야 한다', () => {
      render(<LockerGrid {...mockProps} isLoading={true} />);
      
      expect(screen.getByText('락커 목록을 불러오는 중...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('로딩 중에는 락커 카드가 표시되지 않아야 한다', () => {
      render(<LockerGrid {...mockProps} isLoading={true} />);
      
      expect(screen.queryByText('#001')).not.toBeInTheDocument();
      expect(screen.queryByText('#002')).not.toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('락커가 없을 때 빈 상태 메시지가 표시되어야 한다', () => {
      render(<LockerGrid {...mockProps} lockers={[]} />);
      
      expect(screen.getByText('락커가 없습니다')).toBeInTheDocument();
      expect(screen.getByText('새 락커를 추가하여 시작해보세요.')).toBeInTheDocument();
    });

    it('빈 상태에서 아이콘이 컴팩트 크기로 표시되어야 한다', () => {
      render(<LockerGrid {...mockProps} lockers={[]} />);
      
      const icon = document.querySelector('svg');
      expect(icon).toHaveClass('w-10', 'h-10'); // 컴팩트 아이콘 크기
    });
  });

  describe('그리드 스타일링', () => {
    it('그리드 컨테이너가 올바른 스타일을 가져야 한다', () => {
      render(<LockerGrid {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass(
        'gap-2',        // 컴팩트 간격
        'grid-cols-2',  // 모바일 2컬럼
        'md:grid-cols-4', // 태블릿 4컬럼
        'lg:grid-cols-6', // 데스크톱 6컬럼
        'xl:grid-cols-8'  // 큰 화면 8컬럼
      );
    });

    it('각 락커 카드가 그리드 아이템으로 렌더링되어야 한다', () => {
      render(<LockerGrid {...mockProps} />);
      
      const cards = document.querySelectorAll('.grid > div');
      expect(cards).toHaveLength(3); // 3개 락커 카드
    });
  });

  describe('성능 최적화', () => {
    it('큰 데이터셋에서도 올바르게 렌더링되어야 한다', () => {
      const manyLockers = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        number: String(i + 1).padStart(3, '0'),
        status: 'available' as const,
        size: 'medium' as const,
        location: `1층 A구역`,
        memberName: null,
        startDate: null,
        endDate: null,
        monthlyFee: 50000,
        notes: ''
      }));

      render(<LockerGrid {...mockProps} lockers={manyLockers} />);
      
      expect(screen.getByText('#001')).toBeInTheDocument();
      expect(screen.getByText('#100')).toBeInTheDocument();
    });
  });
}); 