import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffSearchFilter from '../../../components/staff/StaffSearchFilter';
import { StaffFilter } from '../../../types/staff';

// 기본 props 설정
const defaultProps = {
  filter: {
    search: '',
    position: 'all',
    status: 'all',
  } as StaffFilter,
  onFilterChange: jest.fn(),
  onReset: jest.fn(),
  onPaginationReset: jest.fn(),
  onAddStaff: jest.fn(),
  onImportSuccess: jest.fn(),
  showToast: jest.fn(),
  staff: [],
  showActionButtons: true,
};

describe('StaffSearchFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('컴포넌트가 정상적으로 렌더링된다', () => {
    render(<StaffSearchFilter {...defaultProps} />);
    
    expect(screen.getByText('직원 검색 및 필터')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('직원 이름으로 검색...')).toBeInTheDocument();
  });

  it('검색어 입력이 정상적으로 작동한다', () => {
    render(<StaffSearchFilter {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText('직원 이름으로 검색...');
    fireEvent.change(searchInput, { target: { value: '김직원' } });
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultProps.filter,
      search: '김직원',
    });
    expect(defaultProps.onPaginationReset).toHaveBeenCalled();
  });

  it('직책별 필터가 정상적으로 작동한다', () => {
    render(<StaffSearchFilter {...defaultProps} />);
    
    const positionSelect = screen.getByDisplayValue('전체 직책');
    fireEvent.change(positionSelect, { target: { value: '관리자' } });
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultProps.filter,
      position: '관리자',
    });
  });

  it('상태별 필터가 정상적으로 작동한다', () => {
    render(<StaffSearchFilter {...defaultProps} />);
    
    const statusSelect = screen.getByDisplayValue('전체 상태');
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    
    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultProps.filter,
      status: 'active',
    });
  });

  it('필터 초기화 버튼이 정상적으로 작동한다', () => {
    const filterWithData = {
      search: '검색어',
      position: '관리자',
      status: 'active',
    } as StaffFilter;

    render(<StaffSearchFilter {...defaultProps} filter={filterWithData} />);
    
    const resetButton = screen.getByText('초기화');
    fireEvent.click(resetButton);
    
    expect(defaultProps.onReset).toHaveBeenCalled();
  });

  it('직원 추가 버튼이 정상적으로 작동한다', () => {
    render(<StaffSearchFilter {...defaultProps} />);
    
    const addButton = screen.getByText('직원 추가');
    fireEvent.click(addButton);
    
    expect(defaultProps.onAddStaff).toHaveBeenCalled();
  });

  it('활성 필터 개수가 정확하게 표시된다', () => {
    const filterWithMultipleValues = {
      search: '검색어',
      position: '관리자',
      status: 'active',
    } as StaffFilter;

    render(<StaffSearchFilter {...defaultProps} filter={filterWithMultipleValues} />);
    
    expect(screen.getByText('3개 필터 적용됨')).toBeInTheDocument();
  });
}); 