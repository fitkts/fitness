import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsultationTableRefactored from '../../../components/consultation/ConsultationTableRefactored';
import { ConsultationMember, ConsultationSortConfig } from '../../../types/consultation';

// 실제 컴포넌트는 생성 후 import
// import ConsultationTableRefactored from '../../../components/consultation/ConsultationTableRefactored';

const mockMembers: ConsultationMember[] = [
  {
    id: 1,
    name: '김테스트',
    phone: '010-1234-5678',
    email: 'test@example.com',
    gender: '남',
    birth_date: Math.floor(new Date('1990-05-15').getTime() / 1000),
    join_date: Math.floor(Date.now() / 1000),
    first_visit: Math.floor(new Date('2024-01-20').getTime() / 1000),
    consultation_status: 'pending',
    health_conditions: '특별한 건강상 문제 없음',
    fitness_goals: JSON.stringify(['체중감량', '근력강화']) as any,
    notes: '테스트 노트',
    staff_id: 1,
    staff_name: '트레이너김',
    is_promoted: false,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000)
  },
  {
    id: 2,
    name: '이상담',
    phone: '010-9876-5432',
    email: 'consultation@example.com',
    gender: '여',
    birth_date: Math.floor(new Date('1985-03-10').getTime() / 1000),
    join_date: Math.floor(Date.now() / 1000),
    consultation_status: 'completed',
    staff_name: '트레이너이',
    is_promoted: true,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000)
  }
];

const mockSortConfig: ConsultationSortConfig = {
  key: 'name',
  direction: 'ascending'
};

const mockProps = {
  members: mockMembers,
  sortConfig: mockSortConfig,
  onSort: jest.fn(),
  onView: jest.fn(),
  onPromote: jest.fn(),
  onDelete: jest.fn()
};

describe('ConsultationTableRefactored', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('회원 목록을 올바르게 렌더링해야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    expect(screen.getByText('김테스트')).toBeInTheDocument();
    expect(screen.getByText('이상담')).toBeInTheDocument();
    expect(screen.getByText('010-1234-5678')).toBeInTheDocument();
    expect(screen.getByText('010-9876-5432')).toBeInTheDocument();
  });

  it('빈 목록일 때 적절한 메시지를 표시해야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} members={[]} />);
    
    expect(screen.getByText('상담 회원 정보가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('새로운 상담을 등록하려면 \'신규 상담 등록\' 버튼을 클릭하세요.')).toBeInTheDocument();
  });

  it('정렬 아이콘이 올바르게 표시되어야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    // name 컬럼에 정렬 아이콘이 있어야 함
    const nameHeader = screen.getByText('이름').closest('th');
    expect(nameHeader).toHaveClass('cursor-pointer');
  });

  it('행 클릭 시 onView가 호출되어야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    const firstRow = screen.getByText('김테스트').closest('tr');
    fireEvent.click(firstRow!);
    
    expect(mockProps.onView).toHaveBeenCalledWith(mockMembers[0]);
  });

  it('상세보기 버튼 클릭 시 onView가 호출되어야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    const firstRow = screen.getByText('김테스트').closest('tr');
    fireEvent.mouseEnter(firstRow!);
    
    const viewButton = screen.getAllByTitle('상세보기')[0];
    fireEvent.click(viewButton);
    
    expect(mockProps.onView).toHaveBeenCalledWith(mockMembers[0]);
  });

  it('승격 버튼이 미승격 회원에게만 표시되어야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    const firstRow = screen.getByText('김테스트').closest('tr');
    const secondRow = screen.getByText('이상담').closest('tr');
    
    fireEvent.mouseEnter(firstRow!);
    fireEvent.mouseEnter(secondRow!);
    
    // 첫 번째 회원(미승격)에게는 승격 버튼이 있어야 함
    expect(screen.getByTitle('정식 회원으로 승격')).toBeInTheDocument();
    
    // 두 번째 회원(승격됨)에게는 승격 버튼이 없어야 함
    const promoteButtons = screen.queryAllByTitle('정식 회원으로 승격');
    expect(promoteButtons).toHaveLength(1);
  });

  it('승격 버튼 클릭 시 onPromote가 호출되어야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    const firstRow = screen.getByText('김테스트').closest('tr');
    fireEvent.mouseEnter(firstRow!);
    
    const promoteButton = screen.getByTitle('정식 회원으로 승격');
    fireEvent.click(promoteButton);
    
    expect(mockProps.onPromote).toHaveBeenCalledWith(mockMembers[0]);
  });

  it('삭제 버튼이 표시되어야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    const firstRow = screen.getByText('김테스트').closest('tr');
    fireEvent.mouseEnter(firstRow!);
    
    expect(screen.getAllByTitle('삭제')[0]).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 onDelete가 호출되어야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    const firstRow = screen.getByText('김테스트').closest('tr');
    fireEvent.mouseEnter(firstRow!);
    
    const deleteButton = screen.getAllByTitle('삭제')[0];
    fireEvent.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockMembers[0]);
  });

  it('onDelete가 제공되지 않으면 삭제 버튼이 표시되지 않아야 함', () => {
    const propsWithoutDelete = {
      ...mockProps,
      onDelete: undefined
    };
    
    render(<ConsultationTableRefactored {...propsWithoutDelete} />);
    
    const firstRow = screen.getByText('김테스트').closest('tr');
    fireEvent.mouseEnter(firstRow!);
    
    expect(screen.queryByTitle('삭제')).not.toBeInTheDocument();
  });

  it('컬럼 헤더 클릭 시 onSort가 호출되어야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    const nameHeader = screen.getByText('이름').closest('th');
    fireEvent.click(nameHeader!);
    
    expect(mockProps.onSort).toHaveBeenCalledWith('name');
  });

  it('상담 상태 배지가 올바르게 표시되어야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    // pending 상태와 completed 상태의 배지가 표시되어야 함
    expect(screen.getByText('대기 중')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('액션 버튼들이 이벤트 전파를 막아야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    const firstRow = screen.getByText('김테스트').closest('tr');
    fireEvent.mouseEnter(firstRow!);
    
    const viewButton = screen.getAllByTitle('상세보기')[0];
    const deleteButton = screen.getAllByTitle('삭제')[0];
    
    // 버튼 클릭 시 행 클릭 이벤트가 발생하지 않아야 함
    fireEvent.click(viewButton);
    fireEvent.click(deleteButton);
    
    // onView는 버튼 클릭으로 한 번, onDelete는 한 번 호출되어야 함
    expect(mockProps.onView).toHaveBeenCalledTimes(1);
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('hover 시에만 액션 버튼들이 표시되어야 함', () => {
    render(<ConsultationTableRefactored {...mockProps} />);
    
    const firstRow = screen.getByText('김테스트').closest('tr');
    
    // hover 전에는 버튼이 보이지 않아야 함 (opacity-0)
    const actionDiv = firstRow?.querySelector('.opacity-0');
    expect(actionDiv).toBeInTheDocument();
    
    // hover 후에는 버튼이 보여야 함 (group-hover:opacity-100)
    fireEvent.mouseEnter(firstRow!);
    
    expect(screen.getAllByTitle('상세보기')[0]).toBeInTheDocument();
    expect(screen.getAllByTitle('삭제')[0]).toBeInTheDocument();
  });
}); 