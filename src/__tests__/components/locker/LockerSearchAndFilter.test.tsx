import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LockerSearchAndFilter from '../../../components/locker/LockerSearchAndFilter';
import '@testing-library/jest-dom';

// Mock 설정: Jest 환경에서 config import 문제 해결
jest.mock('../../../config/lockerConfig', () => ({
  FILTER_OPTIONS: [
    { value: 'all', label: '전체' },
    { value: 'available', label: '사용 가능' },
    { value: 'occupied', label: '사용 중' },
    { value: 'maintenance', label: '점검 중' }
  ],
  SEARCH_CONFIG: {
    PLACEHOLDER: '락커 번호 또는 회원명으로 검색...',
    MIN_SEARCH_LENGTH: 1,
    DEBOUNCE_MS: 300
  },
  SORT_OPTIONS: [
    { value: 'number_asc', label: '번호 오름차순 (1, 2, 3...)' },
    { value: 'number_desc', label: '번호 내림차순 (999, 998, 997...)' },
    { value: 'status', label: '상태별 (사용가능 → 사용중 → 점검중)' },
    { value: 'member_name', label: '사용자명 순' },
    { value: 'expiry_date', label: '만료일 임박순' }
  ],
  ACTION_BUTTON_CONFIG: {
    base: 'inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
    primary: 'text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500',
  },
  COMPACT_LAYOUT_CONFIG: {
    FILTER_CONTAINER: {
      padding: '',
      headerPadding: 'px-3 py-2',
      contentPadding: 'p-3',
    },
    INPUT_FIELD: {
      padding: 'py-1.5',
      textSize: 'text-sm',
      labelSize: 'text-xs',
      labelMargin: 'mb-1',
    },
    GRID: {
      gap: 'gap-3',
      responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    },
    HEADER: {
      title: 'text-xl font-bold text-gray-900',
      subtitle: 'text-sm text-gray-600',
      badge: 'text-xs',
      icon: 16,
    },
  }
}));

const mockProps = {
  searchTerm: '',
  onSearchChange: jest.fn(),
  filter: 'all',
  onFilterChange: jest.fn(),
  sortBy: 'number_asc',
  onSortChange: jest.fn(),
  layoutDirection: 'row' as const,
  onLayoutChange: jest.fn(),
  onReset: jest.fn(),
  onAddLocker: jest.fn(),
  showActionButtons: false,
};

describe('LockerSearchAndFilter - 컴팩트 레이아웃', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('컴팩트 필터 컨테이너가 렌더링되어야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const container = screen.getByTestId('locker-search-filter-container');
      expect(container).toHaveClass('mb-4'); // 컴팩트 마진
      expect(container).toHaveClass('sticky', 'top-4', 'z-20');
    });

    it('컴팩트 헤더 제목이 표시되어야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const title = screen.getByText('락커 검색 및 필터');
      expect(title).toHaveClass('text-xl', 'font-bold'); // 컴팩트 제목 크기
    });

    it('필터 영역이 컴팩트 패딩을 사용해야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const filterContainer = screen.getByTestId('locker-search-filter-container');
      expect(filterContainer).toHaveClass('bg-white', 'rounded-lg');
    });
  });

  describe('컴팩트 스타일 적용', () => {
    it('헤더가 컴팩트 패딩을 사용해야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const filterTitle = screen.getByText('락커 검색 및 필터');
      const titleContainer = filterTitle.closest('.px-3');
      expect(titleContainer).toHaveClass('px-3', 'py-2'); // 컴팩트 헤더 패딩
    });

    it('컨텐츠 영역이 컴팩트 패딩을 사용해야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const gridContainer = screen.getByText('락커 번호 검색').closest('.p-3');
      expect(gridContainer).toHaveClass('p-3'); // 컴팩트 컨텐츠 패딩
    });

    it('입력 필드가 컴팩트 크기를 가져야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveClass('py-1.5', 'text-sm'); // 컴팩트 입력 필드
    });

    it('라벨이 컴팩트 크기를 가져야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const labels = document.querySelectorAll('label');
      labels.forEach(label => {
        expect(label).toHaveClass('text-xs', 'mb-1'); // 컴팩트 라벨
      });
    });
  });

  describe('컴팩트 그리드 레이아웃', () => {
    it('그리드가 컴팩트 간격을 사용해야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('gap-3'); // 컴팩트 그리드 간격
    });

    it('반응형 그리드 클래스가 적용되어야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass(
        'grid-cols-1',
        'md:grid-cols-2', 
        'lg:grid-cols-4'
      );
    });
  });

  describe('활성 필터 상태', () => {
    it('활성 필터가 없을 때 배지가 표시되지 않아야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      expect(screen.queryByText(/개 필터 적용됨/)).not.toBeInTheDocument();
    });

    it('활성 필터가 있을 때 컴팩트 배지가 표시되어야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} searchTerm="123" filter="occupied" />);
      
      const badge = screen.getByText('2개 필터 적용됨');
      expect(badge).toHaveClass('text-xs', 'px-2', 'py-0.5'); // 컴팩트 배지
    });

    it('초기화 버튼이 활성 필터가 있을 때만 표시되어야 한다', () => {
      const { rerender } = render(<LockerSearchAndFilter {...mockProps} />);
      expect(screen.queryByText('초기화')).not.toBeInTheDocument();
      
      rerender(<LockerSearchAndFilter {...mockProps} searchTerm="test" />);
      expect(screen.getByText('초기화')).toBeInTheDocument();
    });
  });

  describe('필터 기능', () => {
    it('검색어 변경이 작동해야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const searchInput = screen.getByRole('textbox');
      fireEvent.change(searchInput, { target: { value: '123' } });
      
      expect(mockProps.onSearchChange).toHaveBeenCalledWith('123');
    });

    it('상태 필터 변경이 작동해야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const statusSelect = screen.getByDisplayValue('전체');
      fireEvent.change(statusSelect, { target: { value: 'occupied' } });
      
      expect(mockProps.onFilterChange).toHaveBeenCalledWith('occupied');
    });

    it('정렬 방식 변경이 작동해야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const sortSelect = screen.getByDisplayValue('번호 오름차순 (1, 2, 3...)');
      fireEvent.change(sortSelect, { target: { value: 'number_desc' } });
      
      expect(mockProps.onSortChange).toHaveBeenCalledWith('number_desc');
    });

    it('초기화 기능이 작동해야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} searchTerm="test" />);
      
      const resetButton = screen.getByText('초기화');
      fireEvent.click(resetButton);
      
      expect(mockProps.onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('레이아웃 설정', () => {
    it('레이아웃 선택이 작동해야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const layoutSelect = screen.getByDisplayValue('가로 배치');
      fireEvent.change(layoutSelect, { target: { value: 'column' } });
      
      expect(mockProps.onLayoutChange).toHaveBeenCalledWith('column');
    });
  });

  describe('반응형 레이아웃', () => {
    it('모바일에서 단일 컬럼 그리드를 사용해야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
    });

    it('데스크톱에서 4컬럼 그리드를 사용해야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('액션 버튼 기능', () => {
    it('showActionButtons가 false일 때 락커 추가 버튼이 렌더링되지 않아야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} showActionButtons={false} />);
      
      expect(screen.queryByText('락커 추가')).not.toBeInTheDocument();
    });

    it('showActionButtons가 true일 때 락커 추가 버튼이 렌더링되어야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} showActionButtons={true} />);
      
      const addButton = screen.getByText('락커 추가');
      expect(addButton).toBeInTheDocument();
    });

    it('락커 추가 버튼 클릭 시 핸들러가 호출되어야 한다', () => {
      render(<LockerSearchAndFilter {...mockProps} showActionButtons={true} />);
      
      const addButton = screen.getByText('락커 추가');
      fireEvent.click(addButton);
      
      expect(mockProps.onAddLocker).toHaveBeenCalledTimes(1);
    });

    it('onAddLocker가 없을 때 락커 추가 버튼이 렌더링되지 않아야 한다', () => {
      const propsWithoutAddLocker = { ...mockProps, onAddLocker: undefined, showActionButtons: true };
      render(<LockerSearchAndFilter {...propsWithoutAddLocker} />);
      
      expect(screen.queryByText('락커 추가')).not.toBeInTheDocument();
    });
  });
}); 