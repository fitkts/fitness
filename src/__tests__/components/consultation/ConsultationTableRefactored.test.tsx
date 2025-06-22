import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConsultationMember, ConsultationSortConfig } from '../../../types/consultation';

// 실제 컴포넌트는 생성 후 import
// import ConsultationTableRefactored from '../../../components/consultation/ConsultationTableRefactored';

const mockMembers: ConsultationMember[] = [
  {
    id: 1,
    name: '홍길동',
    phone: '010-1234-5678',
    gender: '남성',
    birth_date: '1990-01-01',
    consultation_status: 'pending',
    staff_name: '김트레이너',
    first_visit: '2024-01-01',
    created_at: 1640995200
  },
  {
    id: 2,
    name: '김영희',
    phone: '010-2345-6789',
    gender: '여성',
    birth_date: '1985-05-15',
    consultation_status: 'in_progress',
    staff_name: '이코치',
    first_visit: '2024-01-02',
    created_at: 1641081600
  }
];

const defaultSortConfig: ConsultationSortConfig = {
  key: 'name',
  direction: 'ascending'
};

const mockProps = {
  members: mockMembers,
  sortConfig: defaultSortConfig,
  onSort: jest.fn(),
  onView: jest.fn(),
  onEdit: jest.fn(),
  onPromote: jest.fn()
};

describe('ConsultationTableRefactored', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.skip('테이블이 올바르게 렌더링된다', () => {
    // render(<ConsultationTableRefactored {...mockProps} />);
    
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('김영희')).toBeInTheDocument();
    expect(screen.getByText('010-1234-5678')).toBeInTheDocument();
  });

  test.skip('빈 데이터일 때 적절한 메시지가 표시된다', () => {
    // render(<ConsultationTableRefactored {...mockProps} members={[]} />);
    
    expect(screen.getByText('상담 회원 정보가 없습니다.')).toBeInTheDocument();
  });

  test.skip('정렬 기능이 작동한다', () => {
    // render(<ConsultationTableRefactored {...mockProps} />);
    
    const nameHeader = screen.getByText('회원명');
    fireEvent.click(nameHeader);
    
    expect(mockProps.onSort).toHaveBeenCalledWith('name');
  });

  test.skip('상세보기 버튼이 작동한다', () => {
    // render(<ConsultationTableRefactored {...mockProps} />);
    
    const viewButtons = screen.getAllByText('상세보기');
    fireEvent.click(viewButtons[0]);
    
    expect(mockProps.onView).toHaveBeenCalledWith(mockMembers[0]);
  });

  test.skip('승격 버튼이 작동한다', () => {
    // render(<ConsultationTableRefactored {...mockProps} />);
    
    const promoteButtons = screen.getAllByText('승격');
    fireEvent.click(promoteButtons[0]);
    
    expect(mockProps.onPromote).toHaveBeenCalledWith(mockMembers[0]);
  });
}); 