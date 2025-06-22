import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsultationSearchFilter from '../../../components/consultation/ConsultationSearchFilter';
import { ConsultationFilter } from '../../../types/consultation';

const mockStaffList = [
  { id: 1, name: '김트레이너', position: '헬스 트레이너' },
  { id: 2, name: '이코치', position: '필라테스 강사' }
];

const defaultFilter: ConsultationFilter = {
  search: '',
  status: 'all',
  staffName: 'all',
  gender: 'all'
};

const mockProps = {
  filter: defaultFilter,
  onFilterChange: jest.fn(),
  onReset: jest.fn(),
  onPaginationReset: jest.fn(),
  staffList: mockStaffList,
  onAddMember: jest.fn(),
  onImportSuccess: jest.fn(),
  showToast: jest.fn(),
  members: [],
  showActionButtons: true
};

describe('ConsultationSearchFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('컴포넌트가 올바르게 렌더링된다', () => {
    render(<ConsultationSearchFilter {...mockProps} />);
    
    expect(screen.getByText('상담 회원 검색 및 필터')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('회원 이름으로 검색...')).toBeInTheDocument();
  });

  test('검색 입력 시 올바른 필터 함수가 호출된다', () => {
    render(<ConsultationSearchFilter {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('회원 이름으로 검색...');
    fireEvent.change(searchInput, { target: { value: '홍길동' } });
    
    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultFilter,
      search: '홍길동'
    });
    expect(mockProps.onPaginationReset).toHaveBeenCalled();
  });

  test('상담 상태 필터 변경 시 올바른 함수가 호출된다', () => {
    render(<ConsultationSearchFilter {...mockProps} />);
    
    const statusSelect = screen.getByLabelText('상담 상태');
    fireEvent.change(statusSelect, { target: { value: 'pending' } });
    
    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultFilter,
      status: 'pending'
    });
    expect(mockProps.onPaginationReset).toHaveBeenCalled();
  });

  test('담당자 필터 변경 시 올바른 함수가 호출된다', () => {
    render(<ConsultationSearchFilter {...mockProps} />);
    
    const staffSelect = screen.getByLabelText('담당자');
    fireEvent.change(staffSelect, { target: { value: '김트레이너' } });
    
    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultFilter,
      staffName: '김트레이너'
    });
    expect(mockProps.onPaginationReset).toHaveBeenCalled();
  });

  test('성별 필터 변경 시 올바른 함수가 호출된다', () => {
    render(<ConsultationSearchFilter {...mockProps} />);
    
    const genderSelect = screen.getByLabelText('성별');
    fireEvent.change(genderSelect, { target: { value: '남성' } });
    
    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultFilter,
      gender: '남성'
    });
    expect(mockProps.onPaginationReset).toHaveBeenCalled();
  });

  test('필터 초기화 버튼이 작동한다', () => {
    const filterWithValues: ConsultationFilter = {
      search: '홍길동',
      status: 'pending',
      staffName: '김트레이너',
      gender: '남성'
    };
    
    render(<ConsultationSearchFilter {...mockProps} filter={filterWithValues} />);
    
    expect(screen.getByText('4개 필터 적용됨')).toBeInTheDocument();
    
    const resetButton = screen.getByText('초기화');
    fireEvent.click(resetButton);
    
    expect(mockProps.onReset).toHaveBeenCalled();
  });

  test('상담회원 추가 버튼이 작동한다', () => {
    render(<ConsultationSearchFilter {...mockProps} />);
    
    const addButton = screen.getByText('상담회원 추가');
    fireEvent.click(addButton);
    
    expect(mockProps.onAddMember).toHaveBeenCalled();
  });

  test('활성 필터 개수가 올바르게 표시된다', () => {
    const filterWith2Values: ConsultationFilter = {
      search: '홍길동',
      status: 'pending',
      staffName: 'all',
      gender: 'all'
    };
    
    render(<ConsultationSearchFilter {...mockProps} filter={filterWith2Values} />);
    
    expect(screen.getByText('2개 필터 적용됨')).toBeInTheDocument();
  });

  test('액션 버튼이 showActionButtons=false일 때 숨겨진다', () => {
    render(<ConsultationSearchFilter {...mockProps} showActionButtons={false} />);
    
    expect(screen.queryByTitle('엑셀 불러오기')).not.toBeInTheDocument();
    expect(screen.queryByTitle('엑셀 내보내기')).not.toBeInTheDocument();
  });

  test('엑셀 버튼들이 showActionButtons=true일 때 표시된다', () => {
    render(<ConsultationSearchFilter {...mockProps} showActionButtons={true} />);
    
    expect(screen.getByTitle('엑셀 불러오기')).toBeInTheDocument();
    expect(screen.getByTitle('엑셀 내보내기')).toBeInTheDocument();
    expect(screen.getByTitle('엑셀 형식 안내')).toBeInTheDocument();
  });

  test('날짜 필터가 올바르게 작동한다', () => {
    render(<ConsultationSearchFilter {...mockProps} />);
    
    const dateFromInput = screen.getByLabelText('등록일 (시작)');
    fireEvent.change(dateFromInput, { target: { value: '2024-01-01' } });
    
    expect(mockProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultFilter,
      dateFrom: '2024-01-01'
    });
    expect(mockProps.onPaginationReset).toHaveBeenCalled();
  });
}); 