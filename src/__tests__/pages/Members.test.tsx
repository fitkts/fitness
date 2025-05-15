import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Members from '../../pages/Members';
import { ToastProvider } from '../../contexts/ToastContext';
import * as ipcService from '../../database/ipcService';
import { useMemberStore } from '../../stores/memberStore';
import { Member } from '../../models/types';

// ipcService 모듈 전체를 모킹
jest.mock('../../database/ipcService');

// Zustand 스토어 모킹
jest.mock('../../stores/memberStore');

// 모킹된 함수 및 스토어 타입 캐스팅
const mockGetMembersWithPagination = ipcService.getMembersWithPagination as jest.MockedFunction<
  typeof ipcService.getMembersWithPagination
>;
const mockGetAllStaff = ipcService.getAllStaff as jest.MockedFunction<
  typeof ipcService.getAllStaff
>;
const mockUseMemberStore = useMemberStore as jest.MockedFunction<typeof useMemberStore>; 

// 테스트용 회원 데이터
const mockMembersPage1: Member[] = [
  { id: 1, name: '홍길동', phone: '010-1234-5678', gender: '남성', birthDate: '1990-01-01', joinDate: '2023-01-01', membershipType: '1개월', membershipStart: '2023-01-01', membershipEnd: '2023-02-01' },
  { id: 2, name: '김영희', phone: '010-2345-6789', gender: '여성', birthDate: '1992-02-02', joinDate: '2023-02-01', membershipType: '3개월', membershipStart: '2023-02-01', membershipEnd: '2023-05-01' },
];

const mockMembersPage2: Member[] = [
  { id: 3, name: '이철수', phone: '010-3456-7890', gender: '남성', birthDate: '1985-03-03', joinDate: '2023-03-01', membershipType: '1개월', membershipStart: '2023-03-01', membershipEnd: '2023-04-01' },
];

const mockDefaultStoreState = {
  members: [...mockMembersPage1, ...mockMembersPage2], // 모든 회원을 스토어에 넣어둠 (컴포넌트가 필터링/페이지네이션)
  isLoading: false,
  error: null,
  fetchMembers: jest.fn().mockResolvedValue(undefined), // 실제 호출은 Members 컴포넌트의 useEffect -> loadMembers
  addMember: jest.fn().mockResolvedValue(undefined),
  updateMember: jest.fn().mockResolvedValue(undefined),
  deleteMember: jest.fn().mockResolvedValue(undefined),
  deleteAllMembers: jest.fn().mockResolvedValue(undefined),
};

const renderMembersPage = () => {
  return render(
    <ToastProvider>
      <Members />
    </ToastProvider>,
  );
};

describe('Members 페이지', () => {
  beforeEach(async () => { 
    mockGetMembersWithPagination.mockReset();
    mockGetAllStaff.mockReset();
    mockUseMemberStore.mockReset();
    mockDefaultStoreState.fetchMembers.mockClear(); // 각 테스트 전에 fetchMembers 호출 기록도 초기화

    mockUseMemberStore.mockReturnValue(mockDefaultStoreState as any);
    mockGetAllStaff.mockResolvedValue({ success: true, data: [] });

    // Members.tsx의 loadMembers가 호출될 때의 기본 응답
    // 대부분의 테스트에서 이 mock이 초기 데이터 로딩에 사용됨
    mockGetMembersWithPagination.mockResolvedValue({ 
      success: true, 
      data: { members: mockMembersPage1, total: mockMembersPage1.length } 
    });
  });

  test('초기 렌더링 시 주요 UI 요소들이 표시되어야 한다', async () => {
    renderMembersPage();
    
    // Members.tsx의 useEffect 내 비동기 작업(getAllStaff, loadMembers) 완료 및 렌더링 대기
    expect(await screen.findByRole('heading', { name: /회원 관리/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /새 회원 추가/i })).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/이름 또는 전화번호 검색/i)).toBeInTheDocument();
  });

  test('회원 목록이 정상적으로 표시되어야 한다', async () => {
    // beforeEach에서 mockGetMembersWithPagination이 mockMembersPage1을 반환하도록 설정됨
    // useMemberStore는 mockDefaultStoreState를 반환 (모든 회원이 들어있음)
    // Members 컴포넌트는 useEffect -> loadMembers -> getMembersWithPagination 호출 -> pagedMembers 설정
    // 스토어의 fetchMembers는 Members 컴포넌트의 useEffect에서 호출됨

    renderMembersPage();

    // 스토어의 fetchMembers가 호출되었는지 확인 (실제 데이터 로딩은 getMembersWithPagination mock이 처리)
    await waitFor(() => {
      expect(mockDefaultStoreState.fetchMembers).toHaveBeenCalled();
    });

    // getMembersWithPagination mock의 결과(mockMembersPage1)가 화면에 표시되는지 확인
    expect(await screen.findByText('홍길동')).toBeInTheDocument();
    expect(await screen.findByText('김영희')).toBeInTheDocument();
  });

  test('검색어 입력 시 회원 목록이 필터링되어야 한다', async () => {
    // 스토어는 모든 회원을 가지고 있고, Members 컴포넌트가 client-side 필터링을 수행한다고 가정
    // 초기 로드 시 getMembersWithPagination은 mockMembersPage1을 반환 (beforeEach)
    mockUseMemberStore.mockReturnValue({
      ...mockDefaultStoreState,
      members: [...mockMembersPage1, ...mockMembersPage2], // 모든 회원을 스토어에 넣어둠
    });

    renderMembersPage();

    // 초기 목록 (홍길동)이 표시될 때까지 기다림
    expect(await screen.findByText('홍길동')).toBeInTheDocument();

    const searchInput = await screen.findByPlaceholderText(/이름 또는 연락처 검색/i);
    
    // '홍길동' 검색
    await userEvent.type(searchInput, '홍길동');

    // Members.tsx의 필터링은 useState와 useEffect를 통해 비동기적으로 pagedMembers를 업데이트함
    // 검색 결과가 DOM에 반영될 때까지 기다려야 함
    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument();
      expect(screen.queryByText('김영희')).not.toBeInTheDocument();
    });

    // 검색어 지우고 '010-2345-6789' 검색
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, '010-2345-6789');
    
    await waitFor(() => {
        expect(screen.queryByText('홍길동')).not.toBeInTheDocument();
        expect(screen.getByText('김영희')).toBeInTheDocument();
    });
  });

  test('"새 회원 추가" 버튼 클릭 시 회원 추가 모달이 열려야 한다', async () => {
    // 초기 데이터 로드 모킹은 beforeEach에서 처리됨
    renderMembersPage();
    
    const addButton = await screen.findByRole('button', { name: /새 회원 추가/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // MemberModal이 MemberBasicInfoForm을 렌더링하고, 여기에 "기본 정보"라는 텍스트가 있는지 확인
      // 또는 모달의 제목이나 다른 고유한 식별자를 사용할 수 있음
      expect(screen.getByText(/기본 정보/i)).toBeInTheDocument(); 
    });
  });

  // TODO: 회원 수정/조회 테스트, 페이지네이션 테스트, 에러 처리 테스트 추가
}); 