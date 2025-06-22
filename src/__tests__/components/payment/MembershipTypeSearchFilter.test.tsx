import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MembershipTypeSearchFilter from '../../../components/payment/MembershipTypeSearchFilter';
import { MembershipTypeFilter } from '../../../types/payment';

const mockFilter: MembershipTypeFilter = {
  search: '',
  minPrice: undefined,
  maxPrice: undefined,
  minDuration: undefined,
  maxDuration: undefined,
};

const mockOnFilterChange = jest.fn();
const mockOnReset = jest.fn();
const mockOnAddMembershipType = jest.fn();

// 컴팩트 레이아웃 테스트용 props
const mockCompactProps = {
  filter: mockFilter,
  onFilterChange: mockOnFilterChange,
  onReset: mockOnReset,
};

// 액션 버튼 테스트용 props
const mockActionProps = {
  ...mockCompactProps,
  showActionButtons: true,
  onAddMembershipType: mockOnAddMembershipType,
  showToast: jest.fn(),
  membershipTypes: [],
  onImportSuccess: jest.fn(),
};

describe('MembershipTypeSearchFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('기본 필터 요소들이 렌더링되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      expect(screen.getByPlaceholderText('이용권 이름 또는 설명으로 검색...')).toBeInTheDocument();
      expect(screen.getByLabelText('최소 가격')).toBeInTheDocument();
      expect(screen.getByLabelText('최대 가격')).toBeInTheDocument();
      expect(screen.getByLabelText('최소 기간')).toBeInTheDocument();
      expect(screen.getByLabelText('최대 기간')).toBeInTheDocument();
    });

    it('검색 입력 시 onFilterChange가 호출되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      const searchInput = screen.getByPlaceholderText('이용권 이름 또는 설명으로 검색...');
      fireEvent.change(searchInput, { target: { value: '1개월권' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({ ...mockFilter, search: '1개월권' });
    });

    it('필터 초기화 버튼이 정상 작동해야 한다', () => {
      const activeFilter = { ...mockFilter, search: '테스트', minPrice: 100000 };
      render(<MembershipTypeSearchFilter {...mockCompactProps} filter={activeFilter} />);
      
      const resetButton = screen.getByText('초기화');
      fireEvent.click(resetButton);
      
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('컴팩트 레이아웃', () => {
    it('컴팩트 레이아웃 구조가 올바르게 렌더링되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      const container = screen.getByTestId('membership-type-search-filter-container');
      expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'border');
    });

    it('활성 필터 개수가 올바르게 표시되어야 한다', () => {
      const activeFilter = { ...mockFilter, search: '테스트', minPrice: 100000 };
      render(<MembershipTypeSearchFilter {...mockCompactProps} filter={activeFilter} />);
      
      expect(screen.getByText('2개 필터 적용됨')).toBeInTheDocument();
    });

    it('활성 필터가 있을 때 초기화 버튼이 표시되어야 한다', () => {
      const activeFilter = { ...mockFilter, search: '테스트' };
      render(<MembershipTypeSearchFilter {...mockCompactProps} filter={activeFilter} />);
      
      expect(screen.getByText('초기화')).toBeInTheDocument();
    });

    it('초기화 버튼 클릭 시 onReset이 호출되어야 한다', () => {
      const activeFilter = { ...mockFilter, search: '테스트' };
      render(<MembershipTypeSearchFilter {...mockCompactProps} filter={activeFilter} />);
      
      const resetButton = screen.getByText('초기화');
      fireEvent.click(resetButton);
      
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('컴팩트 그리드 레이아웃', () => {
    it('필터 필드들이 컴팩트 그리드로 배치되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      const gridContainers = screen.getAllByTestId(/grid-container/);
      expect(gridContainers.length).toBeGreaterThan(0);
    });

    it('검색 입력 필드가 컴팩트 스타일로 렌더링되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      const searchInput = screen.getByPlaceholderText('이용권 이름 또는 설명으로 검색...');
      expect(searchInput).toHaveClass('text-sm');
    });
  });

  describe('가격/기간 범위 섹션', () => {
    it('가격 범위 프리셋 버튼들이 컴팩트하게 표시되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      expect(screen.getByText('10만원 이하')).toBeInTheDocument();
      expect(screen.getByText('10-30만원')).toBeInTheDocument();
      expect(screen.getByText('30-50만원')).toBeInTheDocument();
      expect(screen.getByText('50만원 이상')).toBeInTheDocument();
    });

    it('기간 범위 프리셋 버튼들이 컴팩트하게 표시되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      expect(screen.getByText('1개월')).toBeInTheDocument();
      expect(screen.getByText('3개월')).toBeInTheDocument();
      expect(screen.getByText('6개월')).toBeInTheDocument();
      expect(screen.getByText('12개월')).toBeInTheDocument();
      expect(screen.getByText('장기권')).toBeInTheDocument();
    });
  });

  describe('반응형 레이아웃', () => {
    it('필터 컨테이너가 반응형 그리드 클래스를 가져야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      // 반응형 그리드 클래스들이 존재하는지 확인
      const gridElements = document.querySelectorAll('[class*="md:grid-cols"], [class*="lg:grid-cols"]');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  describe('필터 상태 관리', () => {
    it('검색 필터 변경 시 onFilterChange가 호출되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      const searchInput = screen.getByPlaceholderText('이용권 이름 또는 설명으로 검색...');
      fireEvent.change(searchInput, { target: { value: '테스트' } });
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({ ...mockFilter, search: '테스트' });
    });

    it('가격 프리셋 버튼 클릭 시 필터가 업데이트되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      const presetButton = screen.getByText('10만원 이하');
      fireEvent.click(presetButton);
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        minPrice: 0,
        maxPrice: 100000,
      });
    });

    it('기간 프리셋 버튼 클릭 시 필터가 업데이트되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      const presetButton = screen.getByText('3개월');
      fireEvent.click(presetButton);
      
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        minDuration: 3,
        maxDuration: 3,
      });
    });
  });

  describe('활성 필터 계산', () => {
    it('빈 필터일 때 활성 필터 개수가 0이어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} />);
      
      expect(screen.queryByText(/개 필터 적용됨/)).not.toBeInTheDocument();
    });

    it('복합 필터 적용 시 정확한 개수가 표시되어야 한다', () => {
      const activeFilter = {
        ...mockFilter,
        search: '테스트',
        minPrice: 100000,
        maxPrice: 500000,
        minDuration: 3,
      };
      render(<MembershipTypeSearchFilter {...mockCompactProps} filter={activeFilter} />);
      
      expect(screen.getByText('4개 필터 적용됨')).toBeInTheDocument();
    });
  });

  describe('액션 버튼 기능', () => {
    it('showActionButtons가 true일 때 액션 버튼들이 표시되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockActionProps} />);
      
      expect(screen.getByText('새 이용권 추가')).toBeInTheDocument();
    });

    it('showActionButtons가 false일 때 액션 버튼들이 숨겨져야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockCompactProps} showActionButtons={false} />);
      
      expect(screen.queryByText('새 이용권 추가')).not.toBeInTheDocument();
    });

    it('새 이용권 추가 버튼 클릭 시 onAddMembershipType이 호출되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockActionProps} />);
      
      const addButton = screen.getByText('새 이용권 추가');
      fireEvent.click(addButton);
      
      expect(mockOnAddMembershipType).toHaveBeenCalledTimes(1);
    });

    it('버튼들이 컴팩트 스타일로 렌더링되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockActionProps} />);
      
      const addButton = screen.getByText('새 이용권 추가');
      
      // 컴팩트 스타일 클래스 확인
      expect(addButton).toHaveClass('text-sm', 'py-1.5', 'px-3');
    });

    it('액션 버튼들이 헤더 오른쪽에 올바르게 배치되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockActionProps} />);
      
      const actionContainer = screen.getByText('새 이용권 추가').closest('div');
      expect(actionContainer).toHaveClass('flex', 'items-center', 'gap-2');
    });

    it('엑셀 버튼들도 함께 표시되어야 한다', () => {
      render(<MembershipTypeSearchFilter {...mockActionProps} />);
      
      expect(screen.getByTitle('엑셀 불러오기')).toBeInTheDocument();
      expect(screen.getByTitle('엑셀 내보내기')).toBeInTheDocument();
      expect(screen.getByTitle('엑셀 형식 안내')).toBeInTheDocument();
    });
  });
}); 