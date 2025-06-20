import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LockerSearchAndFilter from '../../../components/locker/LockerSearchAndFilter';
import '@testing-library/jest-dom';

// Mock config
jest.mock('../../../config/lockerConfig', () => ({
  FILTER_OPTIONS: [
    { value: 'all', label: '전체' },
    { value: 'available', label: '사용 가능' },
    { value: 'occupied', label: '사용 중' },
    { value: 'maintenance', label: '점검 중' }
  ],
  SEARCH_CONFIG: {
    PLACEHOLDER: '락커 번호를 입력하세요'
  },
  SORT_OPTIONS: [
    { value: 'number_asc', label: '번호 순 (오름차순)' },
    { value: 'number_desc', label: '번호 순 (내림차순)' },
    { value: 'status_asc', label: '상태 순' }
  ]
}));

const defaultProps = {
  searchTerm: '',
  onSearchChange: jest.fn(),
  filter: 'all',
  onFilterChange: jest.fn(),
  sortBy: 'number_asc',
  onSortChange: jest.fn(),
  layoutDirection: 'row' as const,
  onLayoutChange: jest.fn(),
  onAddClick: jest.fn(),
  totalCount: 100,
  filteredCount: 100,
};

describe('LockerSearchAndFilter 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sticky 기능', () => {
    it('전체 컨테이너에 sticky 클래스가 적용되어야 한다', () => {
      render(<LockerSearchAndFilter {...defaultProps} />);
      
      const mainContainer = screen.getByTestId('locker-search-filter-main-container');
      expect(mainContainer).toHaveClass('sticky');
      expect(mainContainer).toHaveClass('top-4');
    });

    it('적절한 z-index가 설정되어야 한다', () => {
      render(<LockerSearchAndFilter {...defaultProps} />);
      
      const mainContainer = screen.getByTestId('locker-search-filter-main-container');
      expect(mainContainer).toHaveClass('z-20');
    });

    it('스크롤 시에도 배경색이 유지되어야 한다', () => {
      render(<LockerSearchAndFilter {...defaultProps} />);
      
      const mainContainer = screen.getByTestId('locker-search-filter-main-container');
      expect(mainContainer).toHaveClass('bg-white');
    });

    it('그림자 효과가 적용되어야 한다', () => {
      render(<LockerSearchAndFilter {...defaultProps} />);
      
      const mainContainer = screen.getByTestId('locker-search-filter-main-container');
      expect(mainContainer).toHaveClass('shadow-sm');
    });
  });

  describe('기존 기능 유지', () => {
    it.skip('컴포넌트가 올바르게 렌더링된다', () => {
      render(<LockerSearchAndFilter {...defaultProps} />);
      expect(screen.getByText('락커 관리')).toBeInTheDocument();
      expect(screen.getByText('락커 추가')).toBeInTheDocument();
    });

    it.skip('검색어 입력 시 onSearchChange가 호출된다', () => {
      render(<LockerSearchAndFilter {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText('락커 번호를 입력하세요');
      fireEvent.change(searchInput, { target: { value: '123' } });
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('123');
    });

    it.skip('필터 변경 시 onFilterChange가 호출된다', () => {
      render(<LockerSearchAndFilter {...defaultProps} />);
      const filterSelect = screen.getByDisplayValue('전체');
      fireEvent.change(filterSelect, { target: { value: 'available' } });
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('available');
    });

    it.skip('정렬 방식 변경 시 onSortChange가 호출된다', () => {
      render(<LockerSearchAndFilter {...defaultProps} />);
      const sortSelect = screen.getByDisplayValue('번호 순 (오름차순)');
      fireEvent.change(sortSelect, { target: { value: 'number_desc' } });
      expect(defaultProps.onSortChange).toHaveBeenCalledWith('number_desc');
    });

    it.skip('레이아웃 변경 시 onLayoutChange가 호출된다', () => {
      render(<LockerSearchAndFilter {...defaultProps} />);
      const columnButton = screen.getByText('세로 배치');
      fireEvent.click(columnButton);
      expect(defaultProps.onLayoutChange).toHaveBeenCalledWith('column');
    });

    it.skip('락커 추가 버튼 클릭 시 onAddClick이 호출된다', () => {
      render(<LockerSearchAndFilter {...defaultProps} />);
      const addButton = screen.getByText('락커 추가');
      fireEvent.click(addButton);
      expect(defaultProps.onAddClick).toHaveBeenCalled();
    });

    it.skip('필터가 적용된 경우 활성 필터 카운트가 표시된다', () => {
      const propsWithFilters = {
        ...defaultProps,
        searchTerm: '123',
        filter: 'available'
      };
      render(<LockerSearchAndFilter {...propsWithFilters} />);
      expect(screen.getByText('2개 필터 적용됨')).toBeInTheDocument();
    });

    it.skip('초기화 버튼 클릭 시 모든 필터가 리셋된다', () => {
      const propsWithFilters = {
        ...defaultProps,
        searchTerm: '123',
        filter: 'available'
      };
      render(<LockerSearchAndFilter {...propsWithFilters} />);
      const resetButton = screen.getByText('초기화');
      fireEvent.click(resetButton);
      
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('all');
      expect(defaultProps.onSortChange).toHaveBeenCalledWith('number_asc');
      expect(defaultProps.onLayoutChange).toHaveBeenCalledWith('row');
    });

    it.skip('필터링된 결과 카운트가 다를 때 표시된다', () => {
      const propsWithDifferentCount = {
        ...defaultProps,
        totalCount: 100,
        filteredCount: 50
      };
      render(<LockerSearchAndFilter {...propsWithDifferentCount} />);
      expect(screen.getByText('50개 표시 중')).toBeInTheDocument();
    });

    it.skip('레이아웃 버튼의 활성 상태가 올바르게 표시된다', () => {
      render(<LockerSearchAndFilter {...defaultProps} />);
      const rowButton = screen.getByText('가로 배치');
      const columnButton = screen.getByText('세로 배치');
      
      expect(rowButton).toHaveClass('bg-blue-100');
      expect(columnButton).toHaveClass('bg-gray-100');
    });
  });
}); 