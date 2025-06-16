import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MemberSearchFilter from '../../../components/member/MemberSearchFilter';
import { MemberFilter } from '../../../types/member';

describe('MemberSearchFilter', () => {
  const mockOnFilterChange = jest.fn();
  const mockOnStaffChange = jest.fn();
  const mockOnGenderChange = jest.fn();
  const mockOnMembershipTypeChange = jest.fn();
  const mockOnReset = jest.fn();

  const defaultProps = {
    filter: { search: '', status: 'all' as MemberFilter['status'] },
    selectedStaff: 'all',
    selectedGender: 'all',
    selectedMembershipType: 'all',
    staffList: [{ id: 1, name: '김직원' }],
    genderOptions: ['남', '여'],
    membershipTypeOptions: ['3개월', '6개월'],
    onFilterChange: mockOnFilterChange,
    onStaffChange: mockOnStaffChange,
    onGenderChange: mockOnGenderChange,
    onMembershipTypeChange: mockOnMembershipTypeChange,
    onReset: mockOnReset,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('검색 입력 필드가 렌더링되어야 한다', () => {
    render(<MemberSearchFilter {...defaultProps} />);
    expect(screen.getByPlaceholderText('이름 검색')).toBeInTheDocument();
  });

  it('검색어 입력 시 onFilterChange가 호출되어야 한다', () => {
    render(<MemberSearchFilter {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText('이름 검색');
    
    fireEvent.change(searchInput, { target: { value: '홍길동' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      search: '홍길동',
      status: 'all'
    });
  });

  it('상태 필터 변경 시 onFilterChange가 호출되어야 한다', () => {
    render(<MemberSearchFilter {...defaultProps} />);
    const statusSelect = screen.getByDisplayValue('전체 상태');
    
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      search: '',
      status: 'active'
    });
  });

  it('직원 필터 변경 시 onStaffChange가 호출되어야 한다', () => {
    render(<MemberSearchFilter {...defaultProps} />);
    const staffSelect = screen.getByDisplayValue('전체 직원');
    
    fireEvent.change(staffSelect, { target: { value: '김직원' } });
    
    expect(mockOnStaffChange).toHaveBeenCalledWith('김직원');
  });

  it('초기화 버튼 클릭 시 onReset이 호출되어야 한다', () => {
    render(<MemberSearchFilter {...defaultProps} />);
    const resetButton = screen.getByText('초기화');
    
    fireEvent.click(resetButton);
    
    expect(mockOnReset).toHaveBeenCalled();
  });
}); 