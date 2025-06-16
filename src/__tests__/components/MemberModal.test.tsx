import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import MemberModal from '../../components/MemberModal';
import { ToastProvider } from '../../contexts/ToastContext';
import { Member } from '../../models/types';
// import * as api from '../../api'; // 이전 mock 대상

// API 모킹 수정: ../../database/ipcService의 getAllStaff를 mock합니다.
const mockGetAllStaff = jest.fn().mockResolvedValue({ success: true, data: [] });
jest.mock('../../database/ipcService', () => ({
  __esModule: true, // ES Module 모킹 시 필요
  getAllStaff: mockGetAllStaff, // 수정된 mock 함수 사용
}));

// createPortal 모킹
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

// 테스트 전용 Mock 함수
const mockOnSave = jest.fn().mockResolvedValue(true);
const mockOnClose = jest.fn();

// Mock 데이터
const mockMemberWithLocker: Member = {
  id: 1,
  name: '김철수',
  phone: '010-1234-5678',
  email: 'test@example.com',
  membershipType: '3개월권',
  joinDate: '2025-01-01',
  notes: '테스트 회원'
};

// Mock API 응답
const mockLockerResponse = {
  success: true,
  data: {
    id: 1,
    number: '001',
    status: 'occupied',
    size: 'small',
    location: '1층 A구역',
    startDate: '2025-01-01',
    endDate: '2025-04-01',
    monthlyFee: 50000
  }
};

// window.api 모킹
global.window = {
  ...global.window,
  api: {
    getLockerByMemberId: jest.fn().mockResolvedValue(mockLockerResponse)
  }
};

describe('MemberModal', () => {
  beforeEach(() => {
    // root 요소 추가
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);
    // 각 테스트 전에 mock 함수들 초기화
    mockGetAllStaff.mockClear();
    mockOnSave.mockClear();
    mockOnClose.mockClear();
  });

  afterEach(() => {
    // root 요소 제거
    const root = document.getElementById('root');
    if (root) {
      document.body.removeChild(root);
    }
  });

  test('신규 등록 모달이 열렸을 때 제목, 버튼, 주요 입력 필드가 보여야 한다', async () => {
    // getAllStaff가 초기 staffList를 빈 배열로 반환하도록 설정
    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: [] });

    await act(async () => {
      render(
        <ToastProvider>
          <MemberModal
            isOpen={true}
            onClose={mockOnClose}
            onSave={mockOnSave}
            member={null} // 신규 등록 모드
            isViewMode={false}
          />
        </ToastProvider>,
      );
    });

    // 모달 제목 확인 (Modal.tsx의 h3#modal-title)
    // MemberModal의 getModalTitle()은 신규 등록 시 "신규 회원 등록" 반환
    expect(screen.getByRole('heading', { name: '신규 회원 등록' })).toBeInTheDocument();
    
    // 버튼 확인 (MemberModal.tsx의 footer 버튼들)
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();

    // MemberBasicInfoForm 필드 확인
    expect(screen.getByLabelText(/^이름/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/전화번호/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/성별/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/생년월일/i)).toBeInTheDocument();

    // MembershipInfoForm 필드 확인
    expect(screen.getByLabelText(/가입일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/회원권 종류/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/회원권 시작일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/담당자/i)).toBeInTheDocument();

    // MemberNotesForm 필드 확인
    expect(screen.getByPlaceholderText('회원에 대한 특이사항이나 메모를 입력하세요.')).toBeInTheDocument();
  });

  test('신규 회원 등록 시 사용자 입력 및 저장 테스트 (Full Flow)', async () => {
    const mockStaffList = [
      { id: 1, name: '김코치', position: '트레이너', phone: '010-1111-1111', email: 'kim@coach.com' }, // phone, email 추가
      { id: 2, name: '박코치', position: '트레이너', phone: '010-2222-2222', email: 'park@coach.com' },
    ];
    // getAllStaff가 호출될 때 mockStaffList를 반환하도록 설정
    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: mockStaffList });

    await act(async () => {
      render(
        <ToastProvider>
          <MemberModal
            isOpen={true}
            onClose={mockOnClose}
            onSave={mockOnSave}
            member={null} // 신규 등록
            isViewMode={false}
          />
        </ToastProvider>,
      );
    });

    // MemberBasicInfoForm 입력
    fireEvent.change(screen.getByLabelText(/^이름/i), { target: { value: '테스트회원' } });
    
    const phoneInput = screen.getByLabelText(/전화번호/i);
    fireEvent.change(phoneInput, { target: { value: '01012345678' } });
    // handleChange에서 formatPhoneNumber가 호출되어 formData가 업데이트 될 때까지 기다릴 수 있도록 waitFor 추가
    await waitFor(() => {
        expect(phoneInput).toHaveValue('010-1234-5678');
    });

    fireEvent.change(screen.getByLabelText(/이메일/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/성별/i), { target: { value: '여성' } });
    fireEvent.change(screen.getByLabelText(/생년월일/i), { target: { value: '1990-01-01' } });

    // MembershipInfoForm 입력
    fireEvent.change(screen.getByLabelText(/가입일/i), { target: { value: '2024-07-01' } });
    
    const membershipTypeSelect = screen.getByLabelText(/회원권 종류/i);
    fireEvent.change(membershipTypeSelect, { target: { value: '3개월권' } });

    const membershipStartInput = screen.getByLabelText(/회원권 시작일/i);
    fireEvent.change(membershipStartInput, { target: { value: '2024-07-15' } });
    
    // 담당자 선택 (staffList가 로드된 후 옵션들이 채워짐)
    // MemberModal의 useEffect에서 getAllStaff가 호출되고 staffList 상태가 업데이트됨.
    // MembershipInfoForm은 staffList를 prop으로 받아 select 옵션을 그림.
    const staffSelect = screen.getByLabelText(/담당자/i);
    await waitFor(() => {
      // staffList의 첫번째 담당자를 선택하는 것으로 가정 (김코치)
      expect(screen.getByRole('option', { name: '김코치 (트레이너)' })).toBeInTheDocument();
    });
    fireEvent.change(staffSelect, { target: { value: '1' } }); // 김코치 ID (문자열로 전달)

    // MemberNotesForm 입력
    fireEvent.change(screen.getByPlaceholderText('회원에 대한 특이사항이나 메모를 입력하세요.'), { target: { value: '테스트 메모입니다.' } });

    // 저장 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    // onSave 호출 검증
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '테스트회원',
          phone: '010-1234-5678',
          email: 'test@example.com',
          gender: '여성',
          birthDate: '1990-01-01',
          joinDate: '2024-07-01',
          membershipType: '3개월권',
          membershipStart: '2024-07-15',
          membershipEnd: '2024-10-15', // 자동 계산 (2024-07-15 + 3개월)
          staffId: 1, // staffId는 number 타입이어야 함
          staffName: '김코치',
          notes: '테스트 메모입니다.',
        }),
      );
    });

    // 모달 닫힘 확인
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('이름 필드 누락 시 유효성 검사 에러 메시지가 표시되어야 함', async () => {
    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: [] }); // staffList는 비어도 됨
    await act(async () => {
      render(
        <ToastProvider>
          <MemberModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} member={null} isViewMode={false} />
        </ToastProvider>,
      );
    });

    // 이름 필드를 제외한 다른 필수 값들은 기본값이나 임의 값으로 채워져 있다고 가정
    // (MemberModal의 defaultMember와 MembershipInfoForm의 select 기본값 등)
    // 예를 들어, 전화번호, 성별 등은 기본값이 있거나 사용자가 올바르게 입력했다고 가정

    // 저장 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    // 이름 에러 메시지 확인 (MemberBasicInfoForm에서 <p className="mt-1 text-sm text-red-600">{errors.name}</p>)
    expect(await screen.findByText('이름은 필수입니다')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('잘못된 이메일 형식 입력 시 유효성 검사 에러 메시지가 표시되어야 함', async () => {
    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: [] });
    await act(async () => {
      render(
        <ToastProvider>
          <MemberModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} member={null} isViewMode={false} />
        </ToastProvider>,
      );
    });

    // 이름 등 필수 필드는 입력
    fireEvent.change(screen.getByLabelText(/^이름/i), { target: { value: '테스트 사용자' } });
    // 기본값으로 다른 필수 필드들이 채워져 있다고 가정 (전화번호, 성별, 가입일, 회원권 종류, 시작일, 담당자 등)
    // MemberModal의 handleSubmit 로직은 이름과 이메일 유효성만 직접 체크함.
    // (다른 필드는 zod 스키마로 검증될 수 있으나, 현재 handleSubmit에는 없음)

    // 잘못된 형식의 이메일 입력
    fireEvent.change(screen.getByLabelText(/이메일/i), { target: { value: 'test@example' } }); 

    // 저장 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    // 이메일 에러 메시지 확인
    expect(await screen.findByText('유효한 이메일을 입력하세요')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  const mockExistingMember: Member = {
    id: 123,
    name: '기존회원',
    phone: '010-9876-5432',
    email: 'existing@example.com',
    gender: '남성',
    birthDate: '1985-05-15',
    joinDate: '2023-01-10',
    membershipType: '6개월권',
    membershipStart: '2023-01-15',
    membershipEnd: '2023-07-15',
    staffId: 2, 
    staffName: '박코치',
    notes: '기존 회원 메모입니다.',
    // lastVisit, createdAt, updatedAt 등은 optional이므로 생략 가능
  };

  test('회원 정보 수정 모드 테스트', async () => {
    const mockStaffList = [
      { id: 1, name: '김코치', position: '트레이너', phone: '010-1111-1111', email: 'kim@coach.com' },
      { id: 2, name: '박코치', position: '트레이너', phone: '010-2222-2222', email: 'park@coach.com' },
    ];
    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: mockStaffList });

    await act(async () => {
      render(
        <ToastProvider>
          <MemberModal
            isOpen={true}
            onClose={mockOnClose}
            onSave={mockOnSave}
            member={mockExistingMember} 
            isViewMode={false} 
          />
        </ToastProvider>,
      );
    });

    // 모달 제목 확인
    expect(screen.getByRole('heading', { name: '회원 정보 수정' })).toBeInTheDocument();

    // 폼에 기존 데이터가 채워져 있는지 확인
    expect(screen.getByLabelText(/^이름/i)).toHaveValue(mockExistingMember.name);
    expect(screen.getByLabelText(/전화번호/i)).toHaveValue(mockExistingMember.phone);
    expect(screen.getByLabelText(/이메일/i)).toHaveValue(mockExistingMember.email);
    expect(screen.getByLabelText(/성별/i)).toHaveValue(mockExistingMember.gender);
    expect(screen.getByLabelText(/생년월일/i)).toHaveValue(mockExistingMember.birthDate);
    expect(screen.getByLabelText(/가입일/i)).toHaveValue(mockExistingMember.joinDate);
    expect(screen.getByLabelText(/회원권 종류/i)).toHaveValue(mockExistingMember.membershipType);
    expect(screen.getByLabelText(/회원권 시작일/i)).toHaveValue(mockExistingMember.membershipStart);
    // 담당자 확인 (staffId가 select의 value로 설정되어 있어야 함)
    await waitFor(() => {
        expect((screen.getByRole('option', { name: '박코치 (트레이너)' }) as HTMLOptionElement).selected).toBe(true);
    });
    expect(screen.getByPlaceholderText('회원에 대한 특이사항이나 메모를 입력하세요.')).toHaveValue(mockExistingMember.notes);

    // 정보 수정 (예: 전화번호와 메모 수정)
    const newPhoneNumber = '010-0000-1111';
    const newNotes = '수정된 회원 메모입니다.';
    fireEvent.change(screen.getByLabelText(/전화번호/i), { target: { value: newPhoneNumber } });
    fireEvent.change(screen.getByPlaceholderText('회원에 대한 특이사항이나 메모를 입력하세요.'), { target: { value: newNotes } });
    
    await waitFor(() => {
        expect(screen.getByLabelText(/전화번호/i)).toHaveValue('010-0000-1111'); // 포맷팅된 값 확인
    });

    // 저장 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    // onSave 호출 검증
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockExistingMember,
          phone: newPhoneNumber, // 수정된 값
          notes: newNotes,       // 수정된 값
        }),
      );
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  const mockOnSwitchToEdit = jest.fn();

  test('회원 정보 조회 모드 테스트', async () => {
    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: [] }); // staffList는 이 테스트에서 중요하지 않음

    await act(async () => {
      render(
        <ToastProvider>
          <MemberModal
            isOpen={true}
            onClose={mockOnClose}
            onSave={mockOnSave} // 조회 모드에서는 호출되지 않아야 함
            member={mockExistingMember} // 기존 회원 데이터 전달
            isViewMode={true}          // 조회 모드
            onSwitchToEdit={mockOnSwitchToEdit} // 수정 모드 전환 콜백 전달
          />
        </ToastProvider>,
      );
    });

    // 모달 제목 확인
    expect(screen.getByRole('heading', { name: '회원 상세 정보' })).toBeInTheDocument();

    // MemberViewDetails에 정보가 올바르게 표시되는지 확인 (주요 정보만 샘플로 확인)
    // MemberViewDetails.tsx를 참고하여 querySelector 또는 텍스트 기반으로 확인
    expect(screen.getByText(mockExistingMember.name!)).toBeInTheDocument(); 
    expect(screen.getByText(mockExistingMember.phone!)).toBeInTheDocument();
    expect(screen.getByText(mockExistingMember.email!)).toBeInTheDocument();
    // formatDate가 적용된 날짜 확인 (MemberModal 내 formatDate 로직 사용)
    // 예: formatDate(mockExistingMember.joinDate) -> "2023년 1월 10일"
    // 실제 formatDate의 출력을 확인해야 함. 지금은 toLocaleDateString('ko-KR')만 가정.
    const expectedJoinDate = new Date(mockExistingMember.joinDate!).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    expect(screen.getByText(expectedJoinDate)).toBeInTheDocument();
    expect(screen.getByText(mockExistingMember.staffName!)).toBeInTheDocument();
    expect(screen.getByText(mockExistingMember.membershipType!)).toBeInTheDocument();
    
    // 이용권 상태 (예: "사용중" 또는 "만료")
    // daysLeft > 0 이면 "사용중"으로 표시될 것으로 예상 (mockExistingMember.membershipEnd가 미래라고 가정)
    // MemberViewDetails 로직: membershipStatus === 'active' ? '사용중' : '만료'
    // MemberModal의 getMembershipStatus 로직: expiryDate >= now ? 'active' : 'expired';
    // mockExistingMember.membershipEnd ('2023-07-15')는 과거이므로 "만료" 예상
    expect(screen.getByText('만료')).toBeInTheDocument();

    // 버튼 확인 ("닫기", "수정하기")
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
    const editButton = screen.getByRole('button', { name: '수정하기' });
    expect(editButton).toBeInTheDocument();

    // "수정하기" 버튼 클릭
    fireEvent.click(editButton);

    // onSwitchToEdit 콜백이 호출되었는지 확인
    expect(mockOnSwitchToEdit).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled(); // 저장 버튼은 없으므로 onSave는 호출되지 않음
  });

  test('회원의 락커 정보가 표시되어야 한다', async () => {
    render(
      <MemberModal
        isOpen={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        member={mockMemberWithLocker}
        isViewMode={true}
      />
    );

    // 락커 정보 로딩 대기
    await waitFor(() => {
      expect(screen.getByText('락커 정보')).toBeInTheDocument();
    });

    // 락커 번호 확인
    expect(screen.getByText('001번')).toBeInTheDocument();
    
    // 락커 위치 확인
    expect(screen.getByText('1층 A구역')).toBeInTheDocument();
    
    // 사용 기간 확인
    expect(screen.getByText(/2025-01-01 ~ 2025-04-01/)).toBeInTheDocument();
  });

  test('락커를 사용하지 않는 회원의 경우 "사용 중인 락커 없음" 메시지가 표시되어야 한다', async () => {
    // 락커 없음 응답 모킹
    window.api.getLockerByMemberId.mockResolvedValueOnce({
      success: true,
      data: null
    });

    render(
      <MemberModal
        isOpen={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        member={mockMemberWithLocker}
        isViewMode={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('사용 중인 락커 없음')).toBeInTheDocument();
    });
  });

  test('락커 정보 로딩 실패 시 에러 메시지가 표시되어야 한다', async () => {
    // API 오류 응답 모킹
    window.api.getLockerByMemberId.mockResolvedValueOnce({
      success: false,
      error: '락커 정보 조회 실패'
    });

    render(
      <MemberModal
        isOpen={true}
        onClose={jest.fn()}
        onSave={jest.fn()}
        member={mockMemberWithLocker}
        isViewMode={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('락커 정보를 불러올 수 없습니다')).toBeInTheDocument();
    });
  });
});
