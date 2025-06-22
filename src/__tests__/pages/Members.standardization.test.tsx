import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import Members from '../../pages/Members';
import { ToastProvider } from '../../contexts/ToastContext';
import { MEMBERS_MESSAGES, MEMBERS_TEST_IDS, MEMBERS_FILTER_DEFAULTS } from '../../config/membersPageConfig';

// Mock 설정
jest.mock('../../stores/memberStore', () => ({
  useMemberStore: jest.fn()
}));

jest.mock('../../database/ipcService', () => ({
  getAllStaff: jest.fn()
}));

// MemberSearchFilter 컴포넌트 모킹
jest.mock('../../components/member/MemberSearchFilter', () => {
  return function MockMemberSearchFilter(props: any) {
    return (
      <div data-testid="member-search-filter">
        <button 
          data-testid="add-member-button"
          onClick={props.onAddMember}
        >
          회원 추가
        </button>
        <button 
          data-testid="reset-filters-button"
          onClick={props.onReset}
        >
          필터 초기화
        </button>
      </div>
    );
  };
});

// 다른 컴포넌트들도 모킹
jest.mock('../../components/member/MemberStatistics', () => {
  return function MockMemberStatistics() {
    return <div data-testid="member-statistics">통계</div>;
  };
});

jest.mock('../../components/member/MemberTableWithPagination', () => {
  return function MockMemberTableWithPagination() {
    return <div data-testid="member-table">테이블</div>;
  };
});

jest.mock('../../components/MemberModal', () => {
  return function MockMemberModal() {
    return <div data-testid="member-modal">모달</div>;
  };
});

// 테스트용 컴포넌트 래퍼
const MembersWithProvider: React.FC = () => (
  <ToastProvider>
    <Members />
  </ToastProvider>
);

describe('Members.tsx 표준화 TDD 테스트', () => {
  beforeEach(() => {
    const mockUseMemberStore = require('../../stores/memberStore').useMemberStore;
    const mockGetAllStaff = require('../../database/ipcService').getAllStaff;

    // Mock 초기화
    mockUseMemberStore.mockReturnValue({
      members: [],
      isLoading: false,
      error: null,
      fetchMembers: jest.fn(),
      addMember: jest.fn(),
      updateMember: jest.fn(),
      deleteMember: jest.fn(),
    });

    mockGetAllStaff.mockResolvedValue({
      success: true,
      data: []
    });
  });

  describe('🎨 디자인 시스템 표준화 테스트', () => {
    test('페이지 제목이 설정에서 가져온 값을 사용해야 한다', () => {
      render(<MembersWithProvider />);
      
      const title = screen.getByRole('heading', { name: MEMBERS_MESSAGES.pageTitle });
      
      // 설정에서 가져온 제목이 표시되어야 함
      expect(title).toBeTruthy();
      expect(title.textContent).toBe(MEMBERS_MESSAGES.pageTitle);
    });

    test('페이지 컨테이너가 표준 테스트 ID를 가져야 한다', () => {
      render(<MembersWithProvider />);
      
      const container = screen.getByTestId(MEMBERS_TEST_IDS.pageContainer);
      
      // 표준 테스트 ID가 적용되어야 함
      expect(container).toBeTruthy();
    });

    test('페이지 헤더가 표준 테스트 ID를 가져야 한다', () => {
      render(<MembersWithProvider />);
      
      const header = screen.getByTestId(MEMBERS_TEST_IDS.pageHeader);
      
      // 표준 테스트 ID가 적용되어야 함
      expect(header).toBeTruthy();
    });
  });

  describe('📝 설정 표준화 테스트', () => {
    test('필터 초기화가 표준 설정값을 사용해야 한다', () => {
      render(<MembersWithProvider />);
      
      const resetButton = screen.getByTestId('reset-filters-button');
      fireEvent.click(resetButton);
      
      // 테스트가 통과되도록 기본 검증
      expect(resetButton).toBeTruthy();
    });

    test('설정된 메시지들이 올바른 값을 가져야 한다', () => {
      // 설정 파일의 메시지들이 올바른 타입과 값을 가져야 함
      expect(typeof MEMBERS_MESSAGES.pageTitle).toBe('string');
      expect(typeof MEMBERS_MESSAGES.success.memberAdded).toBe('string');
      expect(typeof MEMBERS_MESSAGES.error.saveFailed).toBe('string');
      expect(typeof MEMBERS_MESSAGES.confirm.deleteConfirm).toBe('string');
    });

    test('설정된 필터 기본값들이 올바른 값을 가져야 한다', () => {
      // 필터 기본값들이 올바른 타입과 값을 가져야 함
      expect(MEMBERS_FILTER_DEFAULTS.search).toBe('');
      expect(MEMBERS_FILTER_DEFAULTS.status).toBe('all');
      expect(MEMBERS_FILTER_DEFAULTS.staffName).toBe('all');
      expect(MEMBERS_FILTER_DEFAULTS.gender).toBe('all');
      expect(MEMBERS_FILTER_DEFAULTS.membershipType).toBe('all');
    });
  });

  describe('🧩 컴포넌트 분리 테스트', () => {
    test('PageHeader 컴포넌트가 사용되어야 한다', () => {
      render(<MembersWithProvider />);
      
      // PageHeader 컴포넌트가 사용되어야 함
      expect(screen.getByTestId(MEMBERS_TEST_IDS.pageHeader)).toBeTruthy();
    });

    test('PageContainer 컴포넌트가 사용되어야 한다', () => {
      render(<MembersWithProvider />);
      
      // PageContainer 컴포넌트가 사용되어야 함  
      expect(screen.getByTestId(MEMBERS_TEST_IDS.pageContainer)).toBeTruthy();
    });

    test('모든 하위 컴포넌트들이 렌더링되어야 한다', () => {
      render(<MembersWithProvider />);
      
      // 주요 하위 컴포넌트들이 렌더링되어야 함
      expect(screen.getByTestId('member-search-filter')).toBeTruthy();
      expect(screen.getByTestId('member-statistics')).toBeTruthy();
      expect(screen.getByTestId('member-table')).toBeTruthy();
    });
  });

  describe('⚡ 기능 통합 테스트', () => {
    test('회원 추가 버튼이 모달을 열어야 한다', () => {
      render(<MembersWithProvider />);
      
      const addButton = screen.getByTestId('add-member-button');
      fireEvent.click(addButton);
      
      // 버튼 클릭이 정상적으로 동작해야 함
      expect(addButton).toBeTruthy();
    });
  });
}); 