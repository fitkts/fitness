import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConsultationTable from '../../components/consultation/ConsultationTable';
import { ConsultationMember } from '../../types/consultation';

// Mock 데이터
const mockMembers: ConsultationMember[] = [
  {
    id: 1,
    name: '김철수',
    phone: '010-1234-5678',
    email: 'test@example.com',
    gender: '남',
    birth_date: 946684800, // 2000-01-01
    join_date: 1640995200, // 2022-01-01
    first_visit: 1640995200,
    last_visit: 1672531200, // 2023-01-01
    consultation_status: 'pending',
    staff_id: 1,
    staff_name: '트레이너김',
    notes: '테스트 노트',
    health_conditions: '없음',
    fitness_goals: ['체중감량'],
    is_promoted: false,
    created_at: 1640995200,
    updated_at: 1640995200
  },
  {
    id: 2,
    name: '이영희',
    phone: '010-9876-5432',
    email: 'test2@example.com',
    gender: '여',
    birth_date: 978307200, // 2001-01-01
    join_date: 1641081600, // 2022-01-02
    first_visit: 1641081600,
    last_visit: 1672617600, // 2023-01-02
    consultation_status: 'completed',
    staff_id: 2,
    staff_name: '트레이너이',
    notes: '테스트 노트2',
    health_conditions: '없음',
    fitness_goals: ['근력강화'],
    is_promoted: true,
    promoted_at: 1672617600,
    promoted_member_id: 100,
    created_at: 1641081600,
    updated_at: 1641081600
  }
];

describe('ConsultationTable 상세보기 기능', () => {
  const mockProps = {
    members: mockMembers,
    filters: {},
    sort: { field: 'name' as const, direction: 'asc' as const },
    onFilterChange: jest.fn(),
    onSortChange: jest.fn(),
    onMemberSelect: jest.fn(),
    onAddNewMember: jest.fn(),
    onViewDetail: jest.fn(),
    loading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('테이블 행을 클릭하면 상세보기가 열려야 한다', async () => {
    render(<ConsultationTable {...mockProps} />);
    
    // 첫 번째 회원 행 찾기
    const memberRow = screen.getByText('김철수').closest('tr');
    expect(memberRow).toBeInTheDocument();
    
    // 행 클릭
    fireEvent.click(memberRow!);
    
    // onViewDetail이 호출되어야 함
    await waitFor(() => {
      expect(mockProps.onViewDetail).toHaveBeenCalledWith(1);
    });
  });

  it('상세보기 버튼을 클릭하면 상세보기가 열려야 한다', async () => {
    render(<ConsultationTable {...mockProps} />);
    
    // 상세보기 버튼 찾기
    const detailButtons = screen.getAllByText('상세보기');
    expect(detailButtons.length).toBeGreaterThan(0);
    
    // 첫 번째 상세보기 버튼 클릭
    fireEvent.click(detailButtons[0]);
    
    // onViewDetail이 호출되어야 함
    await waitFor(() => {
      expect(mockProps.onViewDetail).toHaveBeenCalledWith(1);
    });
  });

  it('상세보기 버튼 클릭 시 이벤트 전파가 중단되어야 한다', async () => {
    render(<ConsultationTable {...mockProps} />);
    
    // 상세보기 버튼 찾기
    const detailButton = screen.getAllByText('상세보기')[0];
    
    // 버튼 클릭
    fireEvent.click(detailButton);
    
    // onViewDetail만 호출되고 onMemberSelect는 호출되지 않아야 함
    await waitFor(() => {
      expect(mockProps.onViewDetail).toHaveBeenCalledWith(1);
      expect(mockProps.onMemberSelect).not.toHaveBeenCalled();
    });
  });

  it('onViewDetail prop이 없으면 상세보기 버튼이 표시되지 않아야 한다', () => {
    const propsWithoutDetail = { ...mockProps, onViewDetail: undefined };
    render(<ConsultationTable {...propsWithoutDetail} />);
    
    // 상세보기 버튼이 없어야 함
    expect(screen.queryByText('상세보기')).not.toBeInTheDocument();
  });

  it('회원 ID가 없는 경우에도 에러가 발생하지 않아야 한다', async () => {
    const membersWithoutId = [
      { ...mockMembers[0], id: undefined }
    ];
    
    const propsWithoutId = { ...mockProps, members: membersWithoutId };
    render(<ConsultationTable {...propsWithoutId} />);
    
    // 행 클릭
    const memberRow = screen.getByText('김철수').closest('tr');
    fireEvent.click(memberRow!);
    
    // onViewDetail이 undefined와 함께 호출되어야 함
    await waitFor(() => {
      expect(mockProps.onViewDetail).toHaveBeenCalledWith(undefined);
    });
  });

  it('로딩 중일 때는 행 클릭이 동작하지 않아야 한다', () => {
    const loadingProps = { ...mockProps, loading: true };
    render(<ConsultationTable {...loadingProps} />);
    
    // 로딩 스켈레톤이 표시되어야 함
    const skeletons = screen.getAllByRole('row');
    expect(skeletons.length).toBeGreaterThan(1); // 헤더 + 스켈레톤 행들
    
    // 실제 회원 데이터가 표시되지 않아야 함
    expect(screen.queryByText('김철수')).not.toBeInTheDocument();
  });

  it('회원 데이터가 없을 때는 빈 상태가 표시되어야 한다', () => {
    const emptyProps = { ...mockProps, members: [] };
    render(<ConsultationTable {...emptyProps} />);
    
    // 빈 상태 메시지가 표시되어야 함
    expect(screen.getByText('회원 데이터가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('첫 번째 상담을 등록해보세요')).toBeInTheDocument();
  });

  it('회원 이름의 첫 글자가 아바타에 표시되어야 한다', () => {
    render(<ConsultationTable {...mockProps} />);
    
    // 김철수의 첫 글자 '김'이 표시되어야 함
    expect(screen.getByText('김')).toBeInTheDocument();
    
    // 이영희의 첫 글자 '이'가 표시되어야 함
    expect(screen.getByText('이')).toBeInTheDocument();
  });
}); 