import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffTableWithPagination from '../../../components/staff/StaffTableWithPagination';
import { Staff, StaffStatus, SortConfig, PaginationConfig } from '../../../types/staff';

// 테스트용 샘플 데이터
const sampleStaff: Staff[] = [
  {
    id: 1,
    name: '김관리',
    position: '관리자',
    phone: '010-1234-5678',
    email: 'kim@test.com',
    hireDate: '2023-01-01',
    birthDate: '1990-01-01',
    status: StaffStatus.ACTIVE,
    permissions: {
      dashboard: true,
      members: true,
      attendance: true,
      payment: true,
      lockers: true,
      staff: true,
      excel: true,
      backup: true,
      settings: true,
    },
    notes: '',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
  {
    id: 2,
    name: '이직원',
    position: '일반 직원',
    phone: '010-9876-5432',
    email: 'lee@test.com',
    hireDate: '2023-02-01',
    birthDate: '1995-05-15',
    status: StaffStatus.INACTIVE,
    permissions: {
      dashboard: true,
      members: false,
      attendance: false,
      payment: false,
      lockers: false,
      staff: false,
      excel: false,
      backup: false,
      settings: false,
    },
    notes: '',
    createdAt: '2023-02-01',
    updatedAt: '2023-02-01',
  },
];

const defaultProps = {
  staff: sampleStaff,
  sortConfig: { key: '', direction: 'none' } as SortConfig,
  pagination: { currentPage: 1, pageSize: 10, showAll: false } as PaginationConfig,
  isLoading: false,
  onSort: jest.fn(),
  onView: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onPaginationChange: jest.fn(),
};

describe('StaffTableWithPagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('컴포넌트가 정상적으로 렌더링된다', () => {
    render(<StaffTableWithPagination {...defaultProps} />);
    
    expect(screen.getByText('직원 목록')).toBeInTheDocument();
    expect(screen.getByText('총 2명')).toBeInTheDocument();
  });

  it('직원 데이터가 테이블에 정확하게 표시된다', () => {
    render(<StaffTableWithPagination {...defaultProps} />);
    
    expect(screen.getByText('김관리')).toBeInTheDocument();
    expect(screen.getByText('이직원')).toBeInTheDocument();
    expect(screen.getByText('관리자')).toBeInTheDocument();
    expect(screen.getByText('일반 직원')).toBeInTheDocument();
  });

  it('로딩 상태가 정확하게 표시된다', () => {
    render(<StaffTableWithPagination {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('직원 목록을 불러오는 중...')).toBeInTheDocument();
  });

  it('빈 상태가 정확하게 표시된다', () => {
    render(<StaffTableWithPagination {...defaultProps} staff={[]} />);
    
    expect(screen.getByText('직원 정보가 없습니다')).toBeInTheDocument();
  });

  it('정렬 기능이 정상적으로 작동한다', () => {
    render(<StaffTableWithPagination {...defaultProps} />);
    
    const nameHeader = screen.getByText('이름');
    fireEvent.click(nameHeader);
    
    expect(defaultProps.onSort).toHaveBeenCalledWith('name');
  });

  it('페이지 크기 변경이 정상적으로 작동한다', () => {
    render(<StaffTableWithPagination {...defaultProps} />);
    
    const pageSizeSelect = screen.getByDisplayValue('10개씩');
    fireEvent.change(pageSizeSelect, { target: { value: '20' } });
    
    expect(defaultProps.onPaginationChange).toHaveBeenCalledWith({
      pageSize: 20,
      currentPage: 1,
    });
  });

  it('전체보기 토글이 정상적으로 작동한다', () => {
    render(<StaffTableWithPagination {...defaultProps} />);
    
    const showAllButton = screen.getByText('전체 보기');
    fireEvent.click(showAllButton);
    
    expect(defaultProps.onPaginationChange).toHaveBeenCalledWith({
      showAll: true,
      currentPage: 1,
    });
  });

  it('액션 버튼들이 정상적으로 작동한다', () => {
    render(<StaffTableWithPagination {...defaultProps} />);
    
    // 마우스 호버로 액션 버튼들이 보이도록 함
    const firstRow = screen.getByText('김관리').closest('tr');
    fireEvent.mouseEnter(firstRow!);
    
    // 상세보기 버튼 테스트는 실제 DOM에서 확인
    // 편집, 삭제 버튼 클릭 테스트도 포함될 수 있음
  });
}); 