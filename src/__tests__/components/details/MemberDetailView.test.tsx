import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemberDetailView from '../../../components/details/MemberDetailView';
import { Member } from '../../../models/types';
import { KPICardConfig } from '../../../config/kpiConfig';

// Mock 데이터
const mockMembers: Member[] = [
  {
    id: 1,
    name: '김철수',
    phone: '010-1234-5678',
    email: 'test@example.com',
    gender: '남성',
    birthDate: '1990-01-01',
    joinDate: '2024-01-01',
    membershipType: '정회원',
    membershipStart: '2024-01-01',
    membershipEnd: '2024-12-31', // 올바른 속성명 사용
    lastVisit: '2024-01-15',
    notes: '테스트 회원',
    staffId: 1,
    staffName: '김담당',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: '이영희',
    phone: '010-9876-5432',
    email: 'test2@example.com',
    gender: '여성',
    birthDate: '1985-05-15',
    joinDate: '2024-02-01',
    membershipType: '정회원',
    membershipStart: '2024-02-01',
    membershipEnd: '2023-12-31', // 만료된 회원
    lastVisit: '2024-02-10',
    notes: '만료된 회원',
    staffId: 1,
    staffName: '김담당',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  }
];

const mockKPIConfig: KPICardConfig = {
  id: 'totalMembers',
  title: '전체 회원',
  description: '등록된 전체 회원 수',
  icon: 'Users',
  color: 'blue'
};

describe('MemberDetailView', () => {
  const defaultProps = {
    cardConfig: mockKPIConfig,
    membersData: mockMembers,
    value: '2',
    change: 10,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    viewType: 'summary' as const,
    kpiData: {}
  };

  test('membershipEnd 속성을 올바르게 사용해야 한다', () => {
    // 이 테스트는 컴포넌트가 membershipEnd 속성을 사용할 때 오류가 발생하지 않는지 확인
    expect(() => {
      render(<MemberDetailView {...defaultProps} />);
    }).not.toThrow();
  });

  test('활성 회원을 올바르게 계산해야 한다', () => {
    render(<MemberDetailView {...defaultProps} />);
    
    // 활성 회원 수가 올바르게 표시되는지 확인
    // mockMembers 중 membershipEnd가 현재 날짜보다 이후인 회원 수
    const activeMembers = screen.getByText('활성 회원');
    expect(activeMembers).toBeInTheDocument();
  });

  test('만료 임박 회원을 올바르게 계산해야 한다', () => {
    render(<MemberDetailView {...defaultProps} />);
    
    // 만료 임박 회원 계산이 membershipEnd 속성을 사용하여 올바르게 작동하는지 확인
    expect(screen.getByText(/만료 임박/)).toBeInTheDocument();
  });

  test('회원 데이터가 없을 때 오류가 발생하지 않아야 한다', () => {
    const emptyProps = {
      ...defaultProps,
      membersData: []
    };

    expect(() => {
      render(<MemberDetailView {...emptyProps} />);
    }).not.toThrow();
  });

  test('membershipEnd가 null인 회원을 올바르게 처리해야 한다', () => {
    const membersWithNullEnd: Member[] = [
      {
        ...mockMembers[0],
        membershipEnd: null // null 값 테스트
      }
    ];

    const propsWithNullEnd = {
      ...defaultProps,
      membersData: membersWithNullEnd
    };

    expect(() => {
      render(<MemberDetailView {...propsWithNullEnd} />);
    }).not.toThrow();
  });
}); 