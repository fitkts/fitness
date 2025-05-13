import { create } from 'zustand';
import { Member } from '../models/types'; // 회원 데이터 타입 정의 파일 경로 (추후 확인 필요)
import { IpcMemberService } from '../database/ipcService'; // IpcMemberService 가져오기 (경로 확인 필요)



interface MemberState {
  members: Member[]; // 회원 목록 배열
  isLoading: boolean; // 데이터 로딩 중 상태 표시
  error: string | null; // 오류 메시지 저장

  // 회원 데이터 관련 함수들
  fetchMembers: () => Promise<void>; // 회원 목록 불러오기 (비동기)
  addMember: (newMemberData: Omit<Member, 'id'>) => Promise<Member | undefined>; // ID 없이 데이터를 받고, 생성된 Member 반환 (ID 포함)
  updateMember: (updatedMember: Member) => Promise<void>; // 회원 정보 수정 (비동기)
  deleteMember: (memberId: number) => Promise<void>; // 회원 삭제 (비동기)
  deleteAllMembers: () => Promise<void>; // 모든 회원 삭제 함수 추가
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [], // 초기 회원 목록은 비어있음
  isLoading: false,
  error: null,

  // 회원 목록 불러오기 (IpcMemberService.getAll 사용)
  fetchMembers: async () => {
    // 이미 로딩 중이면 중복 실행 방지 (선택 사항)
    if (get().isLoading) return; 

    set({ isLoading: true, error: null });
    try {
      console.log('IPC: 회원 목록 요청 시작');
      const fetchedMembers = await IpcMemberService.getAll();
      console.log('IPC: 회원 목록 수신:', fetchedMembers?.length ?? 0, '명');
      set({ members: fetchedMembers || [], isLoading: false }); // 데이터가 없을 경우 빈 배열 설정
    } catch (err) {
      console.error("IPC: 회원 목록 로딩 실패:", err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류 발생';
      set({ error: `회원 목록 로딩 실패: ${errorMessage}`, isLoading: false });
      // 에러 발생 시 빈 배열로 설정할 수도 있음
      // set({ members: [], error: `회원 목록 로딩 실패: ${errorMessage}`, isLoading: false }); 
    }
  },

  // 새 회원 추가 (IpcMemberService.add 사용 - ID 반환 방식에 맞게 수정)
  addMember: async (newMemberData) => { // ID가 없는 데이터를 받음
    if (get().isLoading) throw new Error("다른 작업이 진행 중입니다.");

    set({ isLoading: true, error: null });
    try {
      // IpcMemberService.add는 Member 타입(id 포함)을 인자로 받으므로,
      // 임시 id (예: null 또는 0)를 포함한 객체를 생성하여 전달해야 할 수 있습니다.
      // 또는 IpcMemberService.add의 인자 타입을 Omit<Member, 'id'> 로 변경하는 것이 더 좋을 수 있습니다.
      // 여기서는 임시로 id: 0 을 넣어 호출한다고 가정합니다. (백엔드 로직 확인 필요)
      const memberToSend = { ...newMemberData, id: 0 }; // 임시 ID 추가
      
      console.log('IPC: 회원 추가 요청 (임시 ID 포함):', memberToSend);
      const newId = await IpcMemberService.add(memberToSend as Member); // 반환값은 number (새 ID)
      console.log('IPC: 회원 추가 완료, 새 ID:', newId);

      if (typeof newId !== 'number') {
        throw new Error("IPC 서비스에서 유효한 회원 ID를 반환하지 않았습니다.");
      }

      // 반환받은 실제 ID를 사용하여 상태에 추가할 최종 회원 객체 생성
      const addedMember = { ...newMemberData, id: newId };

      set((state) => ({
        members: [...state.members, addedMember], // 실제 ID가 포함된 객체를 상태에 추가
        isLoading: false,
      }));
      return addedMember; // 실제 ID가 포함된 객체 반환
    } catch (err) {
      console.error("IPC: 회원 추가 실패:", err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류 발생';
      set({ error: `회원 추가 실패: ${errorMessage}`, isLoading: false });
      throw new Error(`회원 추가 실패: ${errorMessage}`); 
    }
  },

  // 회원 정보 수정 (IpcMemberService.update 사용)
  updateMember: async (updatedMember) => {
    if (get().isLoading) throw new Error("다른 작업이 진행 중입니다.");
    if (!updatedMember.id) throw new Error("수정할 회원의 ID가 없습니다.");

    set({ isLoading: true, error: null });
    try {
      console.log('IPC: 회원 수정 요청:', updatedMember);
      await IpcMemberService.update(updatedMember);
      console.log('IPC: 회원 수정 완료 (ID:', updatedMember.id, ')');

      // 수정 후 목록을 새로 불러와서 DB와 싱크 맞추기
      await get().fetchMembers();
      set({ isLoading: false });
    } catch (err) {
      console.error("IPC: 회원 수정 실패:", err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류 발생';
      set({ error: `회원 수정 실패: ${errorMessage}`, isLoading: false });
      throw new Error(`회원 수정 실패: ${errorMessage}`);
    }
  },

  // 회원 삭제 (IpcMemberService.delete 사용)
  deleteMember: async (memberId) => {
    if (get().isLoading) throw new Error("다른 작업이 진행 중입니다.");

    set({ isLoading: true, error: null });
    try {
      console.log('IPC: 회원 삭제 요청 (ID:', memberId, ')');
      await IpcMemberService.delete(memberId);
      console.log('IPC: 회원 삭제 완료 (ID:', memberId, ')');

      set((state) => ({
        members: state.members.filter((member) => member.id !== memberId),
        isLoading: false,
      }));
    } catch (err) {
      console.error("IPC: 회원 삭제 실패:", err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류 발생';
      set({ error: `회원 삭제 실패: ${errorMessage}`, isLoading: false });
      throw new Error(`회원 삭제 실패: ${errorMessage}`);
    }
  },

  // 모든 회원 삭제 (IpcMemberService.deleteAll 사용)
  deleteAllMembers: async () => {
    if (get().isLoading) throw new Error("다른 작업이 진행 중입니다.");

    set({ isLoading: true, error: null });
    try {
      console.log('Store: 모든 회원 삭제 요청');
      await IpcMemberService.deleteAll(); // IPC 서비스 호출
      console.log('Store: 모든 회원 삭제 완료, 상태 업데이트');

      set({ members: [], isLoading: false }); // 스토어 상태 비우기
    } catch (err) {
      console.error("Store: 모든 회원 삭제 실패:", err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류 발생';
      set({ error: `모든 회원 삭제 실패: ${errorMessage}`, isLoading: false });
      throw new Error(`모든 회원 삭제 실패: ${errorMessage}`);
    }
  },
})); 