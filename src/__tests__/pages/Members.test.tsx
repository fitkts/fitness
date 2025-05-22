import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
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
  { id: 1, name: '홍길동', phone: '010-1234-5678', gender: '남성', birthDate: '1990-01-01', joinDate: '2023-01-01', membershipType: '1개월', membershipStart: '2023-01-01', membershipEnd: '2023-02-01', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
  { id: 2, name: '김영희', phone: '010-2345-6789', gender: '여성', birthDate: '1992-02-02', joinDate: '2023-02-01', membershipType: '3개월', membershipStart: '2023-02-01', membershipEnd: '2023-05-01', createdAt: '2023-02-01', updatedAt: '2023-02-01' },
];

const mockMembersPage2: Member[] = [
  { id: 3, name: '이철수', phone: '010-3456-7890', gender: '남성', birthDate: '1985-03-03', joinDate: '2023-03-01', membershipType: '1개월', membershipStart: '2023-03-01', membershipEnd: '2023-04-01', createdAt: '2023-03-01', updatedAt: '2023-03-01' },
];

const mockDefaultStoreState = {
  members: [...mockMembersPage1, ...mockMembersPage2], // 모든 회원을 스토어에 넣어둠 (컴포넌트가 필터링/페이지네이션)
  isLoading: false,
  error: null,
  fetchMembers: jest.fn().mockResolvedValue(undefined), // 실제 호출은 Members 컴포넌트의 useEffect -> loadMembers
  addMember: jest.fn().mockResolvedValue({ success: true, id: 4 }), // 예시: 성공 응답 모킹
  updateMember: jest.fn().mockResolvedValue({ success: true, updated: true }), // 예시: 성공 응답 모킹
  deleteMember: jest.fn().mockResolvedValue({ success: true, deleted: true }), // 예시: 성공 응답 모킹
  deleteAllMembers: jest.fn().mockResolvedValue(undefined),
};

const renderMembersPage = () => {
  return render(
    <ToastProvider>
      <Members />
    </ToastProvider>,
  );
};

beforeAll(() => {
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.appendChild(root);
});

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
    mockGetMembersWithPagination.mockImplementation(async (page, pageSize, filter) => {
      let filteredMembers = [...mockMembersPage1, ...mockMembersPage2];
      if (filter?.search) {
        filteredMembers = filteredMembers.filter(
          m => m.name.includes(filter.search) || (m.phone && m.phone.includes(filter.search))
        );
      }
      // createdAt, updatedAt이 추가된 Member 객체를 반환하도록 보장
      const membersToReturn = filteredMembers.map(m => ({
        ...m,
        createdAt: m.createdAt || '2023-01-01', // 기본값 또는 실제 값 사용
        updatedAt: m.updatedAt || '2023-01-01', // 기본값 또는 실제 값 사용
      }));
      return {
        success: true,
        data: { members: membersToReturn, total: membersToReturn.length }
      };
    });
  });

  test('초기 렌더링 시 주요 UI 요소들이 표시되어야 한다', async () => {
    renderMembersPage();
    
    // Members.tsx의 useEffect 내 비동기 작업(getAllStaff, loadMembers) 완료 및 렌더링 대기
    expect(await screen.findByRole('heading', { name: /회원 관리/i })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /회원 추가/i })).toBeInTheDocument();
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
      members: [...mockMembersPage1, ...mockMembersPage2].map(m => ({ // 스토어 데이터에도 createdAt, updatedAt 추가
        ...m,
        createdAt: m.createdAt || '2023-01-01',
        updatedAt: m.updatedAt || '2023-01-01',
      })),
    });

    renderMembersPage();

    // 초기 목록 (홍길동)이 표시될 때까지 기다림
    expect(await screen.findByText('홍길동')).toBeInTheDocument();

    const searchInput = await screen.findByPlaceholderText(/이름 또는 전화번호 검색/i);
    
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
    
    const addButton = await screen.findByRole('button', { name: /회원 추가/i });
    await userEvent.click(addButton);

    // 모달이 열릴 때까지 기다립니다
    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog.textContent).toMatch(/신규 회원 등록/);
    });
  });

  // TODO: 회원 수정 테스트, 회원 삭제 테스트, 페이지네이션 테스트, 에러 처리 테스트 추가

  // 신규 테스트 케이스 예시 (회원 추가)
  test('회원 추가 모달에서 정보 입력 후 저장 시 addMember가 호출되어야 한다', async () => {
    // 스토어의 addMember가 성공적으로 호출되고 ID를 반환한다고 모킹
    mockDefaultStoreState.addMember.mockResolvedValueOnce({ success: true, id: 100 });
    // fetchMembers는 addMember 성공 후 재호출될 수 있으므로, 기본 mock으로 응답
    mockGetMembersWithPagination.mockResolvedValueOnce({
      success: true,
      data: { 
        members: [
          ...mockMembersPage1, 
          ...mockMembersPage2,
          { id: 100, name: '새회원', phone: '010-0000-0000', joinDate: '2024-01-01', gender: '남성', birthDate: '2000-01-01', membershipType: '1개월', membershipStart: '2024-01-01', membershipEnd: '2024-02-01', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
        ],
        total: mockMembersPage1.length + mockMembersPage2.length + 1 
      }
    });

    renderMembersPage();
    expect(await screen.findByText('홍길동')).toBeInTheDocument(); // 초기 로드 확인

    const addButton = screen.getByRole('button', { name: /회원 추가/i });
    await userEvent.click(addButton);

    const dialog = await screen.findByRole('dialog', { name: /신규 회원 등록/i });
    expect(dialog).toBeInTheDocument();

    // MemberModal 내부의 필드에 접근한다고 가정 (실제 data-testid 등으로 변경 필요)
    await userEvent.type(within(dialog).getByLabelText(/이름\*/i), '새회원');
    await userEvent.type(within(dialog).getByLabelText(/전화번호/i), '010-0000-0000');
    // 가입일은 필수. MemberModal에서 어떻게 입력받는지에 따라 달라짐 (Datepicker or 직접 입력)
    // 여기서는 직접 입력 가능한 input으로 가정하고, 'YYYY-MM-DD' 형식으로 입력
    const joinDateInput = within(dialog).getByLabelText(/가입일\*/i); 
    fireEvent.change(joinDateInput, { target: { value: '2024-01-01' } });
    
    // 다른 선택적 필드 (생년월일, 성별 등)도 필요에 따라 입력
    const birthDateInput = within(dialog).getByLabelText(/생년월일/i);
    fireEvent.change(birthDateInput, { target: { value: '2000-01-01' } });

    // 저장 버튼 클릭
    const saveButton = within(dialog).getByRole('button', { name: /저장/i });
    await userEvent.click(saveButton);

    // 모달이 닫히는지 확인
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /신규 회원 등록/i })).not.toBeInTheDocument();
    });
    
    // 스토어의 addMember 함수가 호출되었는지 확인
    expect(mockDefaultStoreState.addMember).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '새회원',
        phone: '010-0000-0000',
        joinDate: '2024-01-01',
        birthDate: '2000-01-01',
        // createdAt, updatedAt은 MemberModal에서 보내지 않음.
      })
    );

    // 스토어의 fetchMembers가 호출되어 목록을 새로고침하는지 확인
    // (MemberModal의 onSuccess -> memberStore.fetchMembers() 호출 가정)
    // 위에서 addMember 후 getMembersWithPagination을 한번 더 모킹했으므로, 
    // fetchMembers가 호출되면 해당 mock이 사용됨.
    await waitFor(() => {
        expect(mockDefaultStoreState.fetchMembers).toHaveBeenCalledTimes(2); // 초기 로드 1번 + 추가 후 1번
    });

    // 새 회원이 목록에 나타나는지 확인
    expect(await screen.findByText('새회원')).toBeInTheDocument();
  });

  test('회원 수정 모달에서 정보 변경 후 저장 시 updateMember가 호출되어야 한다', async () => {
    // 스토어의 updateMember가 성공적으로 호출된다고 모킹
    mockDefaultStoreState.updateMember.mockResolvedValueOnce({ success: true, updated: true });
    
    // fetchMembers는 updateMember 성공 후 재호출될 수 있으므로, 수정된 정보가 포함된 mock으로 응답
    const updatedMockMembers = mockMembersPage1.map(m => 
      m.id === 1 ? { ...m, phone: '010-8765-4321', updatedAt: '2023-01-02' } : m
    );
    mockGetMembersWithPagination.mockResolvedValueOnce({
      success: true,
      data: { 
        members: [...updatedMockMembers, ...mockMembersPage2],
        total: updatedMockMembers.length + mockMembersPage2.length 
      }
    });

    renderMembersPage();
    // 초기 "홍길동" 데이터가 표시될 때까지 기다림
    expect(await screen.findByText('홍길동')).toBeInTheDocument();
    expect(await screen.findByText('010-1234-5678')).toBeInTheDocument();

    // "홍길동" 행에서 수정 버튼을 찾아 클릭 (실제 버튼 selector 필요)
    // 예를 들어, 각 행에 data-testid={`edit-member-${member.id}`} 가 있다면:
    // const editButton = screen.getByTestId('edit-member-1');
    // 여기서는 "수정" 텍스트를 가진 버튼을 가정 (더 구체적인 selector 권장)
    const editButton = (await screen.findAllByRole('button', { name: /수정/i }))[0]; 
    await userEvent.click(editButton);

    // 회원 수정 모달이 열리는지 확인 (모달 이름/타이틀에 따라 selector 변경)
    const dialog = await screen.findByRole('dialog', { name: /회원 정보 수정/i });
    expect(dialog).toBeInTheDocument();

    // 모달 내의 전화번호 필드를 찾아 값 변경 (기존 값 '010-1234-5678')
    // 실제 MemberModal.tsx의 필드에 맞게 selector 수정 필요
    const phoneInput = within(dialog).getByDisplayValue('010-1234-5678');
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '010-8765-4321');
    
    // 저장 버튼 클릭
    const saveButton = within(dialog).getByRole('button', { name: /저장/i });
    await userEvent.click(saveButton);

    // 모달이 닫히는지 확인
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /회원 정보 수정/i })).not.toBeInTheDocument();
    });

    // 스토어의 updateMember 함수가 호출되었는지 확인
    expect(mockDefaultStoreState.updateMember).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1, // 수정 대상 회원의 ID
        phone: '010-8765-4321', // 변경된 전화번호
        // 다른 필드들은 변경되지 않았으므로 원래 값을 가지고 있어야 함
        name: '홍길동', 
      })
    );
    
    // 스토어의 fetchMembers가 호출되어 목록을 새로고침하는지 확인
    await waitFor(() => {
        expect(mockDefaultStoreState.fetchMembers).toHaveBeenCalledTimes(2); // 초기 로드 1번 + 수정 후 1번
    });

    // 수정된 전화번호가 화면에 표시되는지 확인
    expect(await screen.findByText('010-8765-4321')).toBeInTheDocument();
    // 기존 전화번호는 더 이상 표시되지 않아야 함
    expect(screen.queryByText('010-1234-5678')).not.toBeInTheDocument();
  });

  test('회원 삭제 시 deleteMember가 호출되고 목록에서 제거되어야 한다', async () => {
    // window.confirm 모킹하여 항상 true (삭제 확인)를 반환하도록 설정
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);

    // 스토어의 deleteMember가 성공적으로 호출된다고 모킹
    mockDefaultStoreState.deleteMember.mockResolvedValueOnce({ success: true, deleted: true });
    
    // fetchMembers는 deleteMember 성공 후 재호출될 수 있으므로, 삭제된 정보가 반영된 mock으로 응답
    // mockMembersPage1에서 id: 2 (김영희) 회원을 제외한 목록을 만듭니다.
    const membersAfterDelete = mockMembersPage1.filter(m => m.id !== 2);
    mockGetMembersWithPagination.mockResolvedValueOnce({
      success: true,
      data: { 
        members: [...membersAfterDelete, ...mockMembersPage2],
        total: membersAfterDelete.length + mockMembersPage2.length 
      }
    });

    renderMembersPage();
    // 초기 "김영희" 데이터가 표시될 때까지 기다림
    expect(await screen.findByText('김영희')).toBeInTheDocument();

    // "김영희" 행에서 삭제 버튼을 찾아 클릭 (실제 버튼 selector 필요)
    // 예를 들어, 각 행에 data-testid={`delete-member-${member.id}`} 가 있다면:
    // const deleteButton = screen.getByTestId('delete-member-2');
    // 여기서는 "삭제" 텍스트를 가진 버튼 중 "김영희" 행에 있는 것을 찾아야 함.
    // findAllByRole로 모든 삭제 버튼을 찾고, "김영희"와 관련된 버튼을 특정해야 함.
    // 좀 더 견고하게 하려면, 행을 먼저 찾고 그 안에서 버튼을 찾는 것이 좋음.
    const rowWithKim = screen.getByText('김영희').closest('tr'); // 테이블 행이라고 가정
    if (!rowWithKim) throw new Error('Cannot find row for 김영희');
    const deleteButton = within(rowWithKim).getByRole('button', { name: /삭제/i });
    await userEvent.click(deleteButton);

    // window.confirm이 호출되었는지 확인
    expect(mockConfirm).toHaveBeenCalled();

    // 스토어의 deleteMember 함수가 호출되었는지 확인
    expect(mockDefaultStoreState.deleteMember).toHaveBeenCalledWith(2); // 삭제 대상 회원의 ID (김영희)
    
    // 스토어의 fetchMembers가 호출되어 목록을 새로고침하는지 확인
    await waitFor(() => {
        expect(mockDefaultStoreState.fetchMembers).toHaveBeenCalledTimes(2); // 초기 로드 1번 + 삭제 후 1번
    });

    // "김영희" 회원이 목록에서 사라졌는지 확인
    await waitFor(() => {
      expect(screen.queryByText('김영희')).not.toBeInTheDocument();
    });

    // 다른 회원("홍길동")은 여전히 존재하는지 확인
    expect(screen.getByText('홍길동')).toBeInTheDocument();

    // 모킹한 confirm 함수 복원
    mockConfirm.mockRestore();
  });

  test('페이지네이션: 다음 페이지 버튼 클릭 시 다음 페이지 데이터 로드', async () => {
    // 첫 페이지 로드 모킹 (mockMembersPage1 - 2명)
    mockGetMembersWithPagination.mockResolvedValueOnce({
      success: true,
      data: { members: mockMembersPage1, total: mockMembersPage1.length + mockMembersPage2.length } // 전체 개수는 3명
    });
    // 다음 페이지(2페이지) 로드 모킹 (mockMembersPage2 - 1명)
    mockGetMembersWithPagination.mockResolvedValueOnce({
      success: true,
      data: { members: mockMembersPage2, total: mockMembersPage1.length + mockMembersPage2.length }
    });

    renderMembersPage();

    // 첫 페이지 멤버(홍길동, 김영희)가 보이는지 확인
    expect(await screen.findByText('홍길동')).toBeInTheDocument();
    expect(await screen.findByText('김영희')).toBeInTheDocument();
    expect(screen.queryByText('이철수')).not.toBeInTheDocument(); // 이철수는 아직 안보임

    // 스토어의 fetchMembers가 초기 로드 시 1번 호출되었는지 확인
    await waitFor(() => {
      expect(mockDefaultStoreState.fetchMembers).toHaveBeenCalledTimes(1);
    });

    // 페이지네이션 컴포넌트에서 "다음" 버튼 클릭 (실제 selector 필요)
    // Ant Design의 Pagination 컴포넌트를 사용한다면, li 엘리먼트의 title 속성 등으로 찾을 수 있음
    // 여기서는 간단히 '다음'이라는 텍스트를 가진 버튼으로 가정
    const nextPageButton = screen.getByRole('button', { name: /다음/i }); // 실제 컴포넌트에 맞게 수정
    await userEvent.click(nextPageButton);

    // 스토어의 fetchMembers가 페이지 변경으로 인해 다시 호출되었는지 확인 (총 2번)
    // Members 컴포넌트가 페이지 변경 시 pageSize와 함께 fetchMembers를 호출한다고 가정
    await waitFor(() => {
      expect(mockDefaultStoreState.fetchMembers).toHaveBeenCalledTimes(2);
    });
    // 그리고 getMembersWithPagination이 두 번째 호출될 때는 page=2 와 함께 호출되어야 함
    // (이 부분은 memberStore의 fetchMembers 구현에 따라 달라질 수 있으므로, 여기서는 호출 횟수만 확인)

    // 두 번째 페이지 멤버(이철수)가 보이는지 확인
    expect(await screen.findByText('이철수')).toBeInTheDocument();
    // 첫 페이지 멤버들은 더 이상 보이지 않아야 함 (페이지가 완전히 교체된다고 가정)
    expect(screen.queryByText('홍길동')).not.toBeInTheDocument();
    expect(screen.queryByText('김영희')).not.toBeInTheDocument();
  });

  describe('에러 처리 테스트', () => {
    test('회원 목록 로드 실패 시 에러 메시지 표시', async () => {
      mockGetMembersWithPagination.mockRejectedValueOnce(new Error('Network Error: Failed to fetch members'));
      renderMembersPage();

      // Toast 메시지 등으로 에러가 표시되는지 확인 (실제 Toast 구현에 따라 selector 변경)
      expect(await screen.findByText(/회원 목록을 불러오는데 실패했습니다./i)).toBeInTheDocument();
      // 또는 좀 더 구체적인 에러 메시지 확인 (store나 component에서 생성하는 메시지)
      // expect(await screen.findByText(/Network Error: Failed to fetch members/i)).toBeInTheDocument();
    });

    test('회원 추가 실패 시 에러 메시지 표시', async () => {
      renderMembersPage();
      expect(await screen.findByText('홍길동')).toBeInTheDocument(); // 초기 로드

      const addButton = screen.getByRole('button', { name: /회원 추가/i });
      await userEvent.click(addButton);
      const dialog = await screen.findByRole('dialog', { name: /신규 회원 등록/i });

      await userEvent.type(within(dialog).getByLabelText(/이름\*/i), '실패회원');
      const joinDateInput = within(dialog).getByLabelText(/가입일\*/i);
      fireEvent.change(joinDateInput, { target: { value: '2024-01-01' } });

      // 스토어의 addMember가 실패하도록 모킹
      mockDefaultStoreState.addMember.mockRejectedValueOnce(new Error('Failed to add member'));

      const saveButton = within(dialog).getByRole('button', { name: /저장/i });
      await userEvent.click(saveButton);

      // Toast 메시지 등으로 에러가 표시되는지 확인
      expect(await screen.findByText(/회원 추가 중 오류가 발생했습니다./i)).toBeInTheDocument();
      // 모달은 닫히지 않거나, 에러 상태를 표시할 수 있음 (구현에 따라 다름)
      expect(screen.getByRole('dialog', { name: /신규 회원 등록/i })).toBeInTheDocument(); 
    });
  });

  // TODO: 회원 수정 테스트, 회원 삭제 테스트, 페이지네이션 테스트, 에러 처리 테스트 추가
}); 