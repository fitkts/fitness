import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberTableWithPagination from '../../../components/member/MemberTableWithPagination';
import { Member } from '../../../models/types';
import { SortConfig, PaginationConfig } from '../../../types/member';

const mockMembers: Member[] = [
  {
    id: 1,
    name: '홍길동',
    gender: '남성',
    phone: '010-1234-5678',
    membershipType: '3개월',
    membershipEnd: '2024-12-31',
    staffName: '김직원',
  },
  {
    id: 2,
    name: '김철수',
    gender: '남성',
    phone: '010-5678-1234',
    membershipType: '6개월',
    membershipEnd: '2024-11-30',
    staffName: '이직원',
  },
];

const mockSortConfig: SortConfig = {
  key: '',
  direction: null,
};

const mockPagination: PaginationConfig = {
  currentPage: 1,
  pageSize: 30,
  totalPages: 1,
  showAll: false,
};

const mockProps = {
  members: mockMembers,
  sortConfig: mockSortConfig,
  pagination: mockPagination,
  isLoading: false,
  onSort: jest.fn(),
  onView: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onPaginationChange: jest.fn(),
};

describe('MemberTableWithPagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('컴팩트 레이아웃', () => {
    it('테이블 헤더가 작은 패딩을 가져야 한다', () => {
      render(<MemberTableWithPagination {...mockProps} />);
      
      const headerCell = screen.getByText('이름').closest('th');
      expect(headerCell).toHaveClass('py-2'); // 기존 py-3에서 변경
    });

    it('테이블 데이터 셀이 작은 패딩을 가져야 한다', () => {
      render(<MemberTableWithPagination {...mockProps} />);
      
      const dataCell = screen.getByText('홍길동').closest('td');
      expect(dataCell).toHaveClass('py-2'); // 기존 py-3에서 변경
    });

    it('컨테이너 헤더가 작은 패딩을 가져야 한다', () => {
      render(<MemberTableWithPagination {...mockProps} />);
      
      const container = screen.getByText('회원 목록').closest('.bg-gray-50');
      expect(container).toHaveClass('py-2'); // 기존 py-3에서 변경
    });

    it('아바타가 작은 크기를 가져야 한다', () => {
      render(<MemberTableWithPagination {...mockProps} />);
      
      const avatar = screen.getByText('홍').closest('div');
      expect(avatar).toHaveClass('h-7'); // 기존 h-8에서 변경
      expect(avatar).toHaveClass('w-7'); // 기존 w-8에서 변경
    });

    it('페이지네이션이 작은 패딩을 가져야 한다', () => {
      const propsWithMultiplePages = {
        ...mockProps,
        members: Array.from({ length: 60 }, (_, i) => ({
          ...mockMembers[0],
          id: i + 1,
          name: `회원${i + 1}`,
        })),
      };
      
      render(<MemberTableWithPagination {...propsWithMultiplePages} />);
      
      const paginationContainer = screen.getByText(/명 표시/).closest('.bg-gray-50');
      expect(paginationContainer).toHaveClass('py-2'); // 기존 py-3에서 변경
    });
  });

  // 기존 기능 유지 테스트
  it('회원 목록이 렌더링되어야 한다', () => {
    render(<MemberTableWithPagination {...mockProps} />);
    
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('김철수')).toBeInTheDocument();
  });

  it('로딩 상태가 표시되어야 한다', () => {
    render(<MemberTableWithPagination {...mockProps} isLoading={true} />);
    
    expect(screen.getByText('회원 목록을 불러오는 중...')).toBeInTheDocument();
  });
}); 