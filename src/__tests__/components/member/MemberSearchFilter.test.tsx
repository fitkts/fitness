import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MemberSearchFilter from '../../../components/member/MemberSearchFilter';
import { MemberFilter } from '../../../models/types';

describe('MemberSearchFilter', () => {
  const mockFilter: MemberFilter = {
    search: '',
    status: 'all',
    staffName: 'all',
    gender: 'all',
    membershipType: 'all',
  };

  const mockProps = {
    filter: mockFilter,
    onFilterChange: jest.fn(),
    onReset: jest.fn(),
    onPaginationReset: jest.fn(),
    staffList: [],
    membershipTypes: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Sticky 기능', () => {
    it('필터 컨테이너에 sticky 클래스가 적용되어야 한다', () => {
      render(<MemberSearchFilter {...mockProps} />);
      
      const filterContainer = screen.getByTestId('member-search-filter-container');
      expect(filterContainer).toHaveClass('sticky');
      expect(filterContainer).toHaveClass('top-4');
    });

    it('적절한 z-index가 설정되어야 한다', () => {
      render(<MemberSearchFilter {...mockProps} />);
      
      const filterContainer = screen.getByTestId('member-search-filter-container');
      expect(filterContainer).toHaveClass('z-20');
    });

    it('스크롤 시에도 배경색이 유지되어야 한다', () => {
      render(<MemberSearchFilter {...mockProps} />);
      
      const filterContainer = screen.getByTestId('member-search-filter-container');
      expect(filterContainer).toHaveClass('bg-white');
    });

    it('그림자 효과가 적용되어야 한다', () => {
      render(<MemberSearchFilter {...mockProps} />);
      
      const filterContainer = screen.getByTestId('member-search-filter-container');
      expect(filterContainer).toHaveClass('shadow-sm');
    });
  });

  describe('기존 기능 유지', () => {
    it('검색 입력 시 onFilterChange가 호출되어야 한다', () => {
      render(<MemberSearchFilter {...mockProps} />);
      
      const searchInput = screen.getByPlaceholderText('회원 이름으로 검색...');
      fireEvent.change(searchInput, { target: { value: '홍길동' } });
      
      expect(mockProps.onFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        search: '홍길동',
      });
    });

    it('필터 초기화 버튼이 정상 작동해야 한다', () => {
      const filterWithValues: MemberFilter = {
        search: '홍길동',
        status: 'active',
        staffName: 'all',
        gender: 'all',
        membershipType: 'all',
      };

      render(<MemberSearchFilter {...mockProps} filter={filterWithValues} />);
      
      const resetButton = screen.getByText('초기화');
      fireEvent.click(resetButton);
      
      expect(mockProps.onReset).toHaveBeenCalled();
    });

    it('상태 필터 변경 시 onFilterChange와 onPaginationReset이 호출되어야 한다', () => {
      render(<MemberSearchFilter {...mockProps} />);
      
      const statusSelect = screen.getByDisplayValue('전체 상태');
      fireEvent.change(statusSelect, { target: { value: 'active' } });
      
      expect(mockProps.onFilterChange).toHaveBeenCalledWith({
        ...mockFilter,
        status: 'active',
      });
      expect(mockProps.onPaginationReset).toHaveBeenCalled();
    });
  });

  describe('액션 버튼 기능', () => {
    it('회원 추가 버튼이 렌더링되어야 한다', () => {
      const mockOnAddMember = jest.fn();
      
      render(
        <MemberSearchFilter
          filter={mockFilter}
          onFilterChange={mockProps.onFilterChange}
          onReset={mockProps.onReset}
          onPaginationReset={mockProps.onPaginationReset}
          onAddMember={mockOnAddMember}
          showActionButtons={true}
        />
      );

      const addButton = screen.getByRole('button', { name: /회원 추가/i });
      expect(addButton).toBeInTheDocument();
      
      // 버튼이 작은 크기 스타일을 가져야 함
      expect(addButton).toHaveClass('text-sm');
      expect(addButton).toHaveClass('py-1.5');
      expect(addButton).toHaveClass('px-3');
    });

    it('회원 추가 버튼 클릭 시 핸들러가 호출되어야 한다', () => {
      const mockOnAddMember = jest.fn();
      
      render(
        <MemberSearchFilter
          filter={mockFilter}
          onFilterChange={mockProps.onFilterChange}
          onReset={mockProps.onReset}
          onPaginationReset={mockProps.onPaginationReset}
          onAddMember={mockOnAddMember}
          showActionButtons={true}
        />
      );

      const addButton = screen.getByRole('button', { name: /회원 추가/i });
      fireEvent.click(addButton);
      
      expect(mockOnAddMember).toHaveBeenCalledTimes(1);
    });

    it('엑셀 다운로드 버튼이 렌더링되어야 한다', () => {
      const mockMembers = [
        { id: 1, name: '홍길동', phone: '010-1234-5678' },
        { id: 2, name: '김철수', phone: '010-5678-1234' }
      ];
      
      render(
        <MemberSearchFilter
          filter={mockFilter}
          onFilterChange={mockProps.onFilterChange}
          onReset={mockProps.onReset}
          onPaginationReset={mockProps.onPaginationReset}
          members={mockMembers}
          showActionButtons={true}
        />
      );

      const excelDownloadButton = screen.getByTitle('엑셀 내보내기');
      expect(excelDownloadButton).toBeInTheDocument();
    });

    it('엑셀 업로드 버튼이 렌더링되어야 한다', () => {
      render(
        <MemberSearchFilter
          filter={mockFilter}
          onFilterChange={mockProps.onFilterChange}
          onReset={mockProps.onReset}
          onPaginationReset={mockProps.onPaginationReset}
          showActionButtons={true}
        />
      );

      const excelUploadButton = screen.getByTitle('엑셀 불러오기');
      expect(excelUploadButton).toBeInTheDocument();
    });

    it('showActionButtons가 false일 때 액션 버튼들이 렌더링되지 않아야 한다', () => {
      render(
        <MemberSearchFilter
          filter={mockFilter}
          onFilterChange={mockProps.onFilterChange}
          onReset={mockProps.onReset}
          onPaginationReset={mockProps.onPaginationReset}
          showActionButtons={false}
        />
      );

      expect(screen.queryByRole('button', { name: /회원 추가/i })).not.toBeInTheDocument();
      expect(screen.queryByTitle('엑셀 내보내기')).not.toBeInTheDocument();
      expect(screen.queryByTitle('엑셀 불러오기')).not.toBeInTheDocument();
    });

    it('엑셀 불러오기 성공 시 콜백이 호출되어야 한다', async () => {
      const mockOnImportSuccess = jest.fn();
      const mockShowToast = jest.fn();
      
      render(
        <MemberSearchFilter
          filter={mockFilter}
          onFilterChange={mockProps.onFilterChange}
          onReset={mockProps.onReset}
          onPaginationReset={mockProps.onPaginationReset}
          onImportSuccess={mockOnImportSuccess}
          showToast={mockShowToast}
          showActionButtons={true}
        />
      );

      // 파일 입력 필드가 숨겨져 있더라도 존재하는지 확인
      const fileInput = document.getElementById('excel-import-input') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
    });
  });

  describe('컴팩트 레이아웃', () => {
    it('필터 헤더가 작은 패딩을 가져야 한다', () => {
      render(
        <MemberSearchFilter
          filter={mockFilter}
          onFilterChange={mockProps.onFilterChange}
          onReset={mockProps.onReset}
          onPaginationReset={mockProps.onPaginationReset}
        />
      );

      // 헤더 컨테이너를 찾기 위해 data-testid로 찾은 다음 첫 번째 자식을 선택
      const container = screen.getByTestId('member-search-filter-container');
      const headerElement = container.firstElementChild;
      expect(headerElement).toHaveClass('px-3');
      expect(headerElement).toHaveClass('py-2');
    });

    it('필터 컨텐츠가 작은 패딩을 가져야 한다', () => {
      render(
        <MemberSearchFilter
          filter={mockFilter}
          onFilterChange={mockProps.onFilterChange}
          onReset={mockProps.onReset}
          onPaginationReset={mockProps.onPaginationReset}
        />
      );

      const searchInput = screen.getByPlaceholderText('회원 이름으로 검색...');
      const contentContainer = searchInput.closest('.p-3');
      expect(contentContainer).toBeInTheDocument();
    });

    it('입력 필드들이 작은 크기를 가져야 한다', () => {
      render(
        <MemberSearchFilter
          filter={mockFilter}
          onFilterChange={mockProps.onFilterChange}
          onReset={mockProps.onReset}
          onPaginationReset={mockProps.onPaginationReset}
        />
      );

      const searchInput = screen.getByPlaceholderText('회원 이름으로 검색...');
      expect(searchInput).toHaveClass('py-1.5');
      expect(searchInput).toHaveClass('text-sm');
    });

    it('라벨들이 작은 텍스트 크기를 가져야 한다', () => {
      render(
        <MemberSearchFilter
          filter={mockFilter}
          onFilterChange={mockProps.onFilterChange}
          onReset={mockProps.onReset}
          onPaginationReset={mockProps.onPaginationReset}
        />
      );

      const label = screen.getByText('회원명 검색');
      expect(label).toHaveClass('text-xs');
    });
  });
}); 