import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Staff from '../../pages/Staff';
import { ToastProvider } from '../../contexts/ToastContext';
import * as ipcService from '../../database/ipcService';
import { Staff as StaffType, StaffStatus, StaffPosition } from '../../models/types';

// DB 함수 mock 처리 - window.confirm은 각 테스트 케이스에서 필요시 jest.spyOn으로 모킹하는 것이 더 좋음
// global.window = Object.create(window);
// Object.defineProperty(window, 'confirm', {
//   value: jest.fn(() => true),
// });

// ipcService 모듈 전체를 모킹 (개별 함수 모킹을 위해)
jest.mock('../../database/ipcService');

// 모킹된 함수 타입 캐스팅
const mockGetAllStaff = ipcService.getAllStaff as jest.MockedFunction<typeof ipcService.getAllStaff>;
const mockAddStaff = ipcService.addStaff as jest.MockedFunction<typeof ipcService.addStaff>;
const mockUpdateStaff = ipcService.updateStaff as jest.MockedFunction<typeof ipcService.updateStaff>;
const mockDeleteStaff = ipcService.deleteStaff as jest.MockedFunction<typeof ipcService.deleteStaff>;

// ToastContext 모킹
const mockShowToast = jest.fn();
jest.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>, // 실제 Provider 대신 children만 렌더링
}));

// StaffModal 모킹 (실제 모달 테스트는 StaffModal.test.tsx에서 진행)
// Staff 페이지에서는 모달이 열리고 닫히는 인터랙션과 IPC 호출에 집중
jest.mock('../../components/StaffModal', () => ({
  __esModule: true,
  default: jest.fn(({ isOpen, onClose, onSubmit, staffData }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="staff-modal">
        StaffModal
        <button onClick={() => onSubmit({ name: '모킹된 스태프', hireDate: '2024-01-01', position: StaffPosition.TRAINER, status: StaffStatus.ACTIVE, permissions: { dashboard:true, members:true, attendance:true, payment:true, lockers:true, staff:true, excel:true, backup:true, settings:true } })}>Mock Submit</button>
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  }),
}));

const mockStaffList: StaffType[] = [
  {
    id: 1, name: '김관리', position: StaffPosition.MANAGER, phone: '010-1111-1111', email: 'manager@test.com',
    hireDate: '2022-01-01', status: StaffStatus.ACTIVE, 
    permissions: { dashboard:true, members:true, attendance:true, payment:true, lockers:true, staff:true, excel:true, backup:true, settings:true },
    createdAt: '2022-01-01', updatedAt: '2022-01-01'
  },
  {
    id: 2, name: '이트레이너', position: StaffPosition.TRAINER, phone: '010-2222-2222', email: 'trainer@test.com',
    hireDate: '2023-03-15', status: StaffStatus.ACTIVE, 
    permissions: { dashboard:false, members:true, attendance:true, payment:false, lockers:false, staff:false, excel:false, backup:false, settings:false },
    createdAt: '2023-03-15', updatedAt: '2023-03-15'
  },
];

const renderStaffPage = () => {
  return render(
    <ToastProvider> 
      <Staff />
    </ToastProvider>
  );
};

describe('직원 관리 페이지', () => {
  beforeEach(() => {
    mockGetAllStaff.mockReset();
    mockAddStaff.mockReset();
    mockUpdateStaff.mockReset();
    mockDeleteStaff.mockReset();
    mockShowToast.mockClear();
    // StaffModal 모킹된 컴포넌트의 mockClear (jest.fn()으로 직접 모킹했으므로)
    (require('../../components/StaffModal').default as jest.Mock).mockClear();
  });

  test('초기 렌더링: 제목, 추가 버튼, 직원 없을 시 안내 문구', async () => {
    mockGetAllStaff.mockResolvedValue({ success: true, data: [] }); // 직원이 없는 상황
    renderStaffPage();
    
    expect(await screen.findByText('직원 관리')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /직원 추가/i })).toBeInTheDocument();
    expect(await screen.findByText('직원 정보가 없습니다.')).toBeInTheDocument();
  });

  test('직원 목록이 있을 경우 정상적으로 표시되어야 한다', async () => {
    mockGetAllStaff.mockResolvedValue({ success: true, data: mockStaffList });
    renderStaffPage();

    expect(await screen.findByText('김관리')).toBeInTheDocument();
    expect(screen.getByText(StaffPosition.MANAGER)).toBeInTheDocument();
    expect(screen.getByText('2022-01-01')).toBeInTheDocument(); // 김관리 고용일

    expect(await screen.findByText('이트레이너')).toBeInTheDocument();
    expect(screen.getByText(StaffPosition.TRAINER)).toBeInTheDocument();
    expect(screen.getByText('2023-03-15')).toBeInTheDocument(); // 이트레이너 고용일

    // "직원 정보가 없습니다." 문구는 보이지 않아야 함
    expect(screen.queryByText('직원 정보가 없습니다.')).not.toBeInTheDocument();
  });

  test('직원 리스트 테이블에 생년월일 컬럼이 표시되어야 함', async () => {
    const mockStaffWithBirthDate = [
      {
        ...mockStaffList[0],
        birthDate: '1990-05-15'
      },
      {
        ...mockStaffList[1], 
        birthDate: '1985-12-10'
      }
    ];

    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: mockStaffWithBirthDate });

    renderStaffPage();

    // 테이블 헤더에 생년월일 컬럼이 있는지 확인
    expect(await screen.findByText('생년월일')).toBeInTheDocument();

    // 첫 번째 직원의 생년월일이 표시되는지 확인
    expect(await screen.findByText('1990-05-15')).toBeInTheDocument();
    
    // 두 번째 직원의 생년월일이 표시되는지 확인
    expect(await screen.findByText('1985-12-10')).toBeInTheDocument();
  });

  test('생년월일이 없는 직원은 "-"로 표시되어야 함', async () => {
    const mockStaffWithoutBirthDate = [
      {
        ...mockStaffList[0],
        birthDate: undefined
      }
    ];

    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: mockStaffWithoutBirthDate });

    renderStaffPage();

    // 헤더는 있어야 함
    expect(await screen.findByText('생년월일')).toBeInTheDocument();
    
    // 생년월일이 없는 경우 "-"로 표시
    expect(await screen.findByText('-')).toBeInTheDocument();
  });

  test('직원 추가: 모달 열고 저장 시 addStaff 호출 및 목록 새로고침', async () => {
    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: mockStaffList }); // 초기 로드
    const newStaffId = 3;
    const newStaffData = {
      name: '박신입', position: StaffPosition.PART_TIME, phone: '010-3333-3333', 
      hireDate: '2024-07-01', status: StaffStatus.ACTIVE,
      permissions: { dashboard:false, members:false, attendance:true, payment:false, lockers:false, staff:false, excel:false, backup:false, settings:false },
      // createdAt, updatedAt은 DB에서 자동 생성되므로 addStaff 시에는 보내지 않음
    };
    const newStaffEntry: StaffType = { ...newStaffData, id: newStaffId, email: '', createdAt: '2024-07-01', updatedAt: '2024-07-01' }; // email은 optional이므로 빈 값 가능

    mockAddStaff.mockResolvedValueOnce({ success: true, data: newStaffId });
    // 추가 후 getAllStaff가 다시 호출될 때 새 직원이 포함된 목록을 반환하도록 설정
    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: [...mockStaffList, newStaffEntry] });

    renderStaffPage();
    expect(await screen.findByText('김관리')).toBeInTheDocument(); // 초기 목록 로드 확인

    const addButton = screen.getByRole('button', { name: /직원 추가/i });
    await userEvent.click(addButton);

    // 모킹된 StaffModal이 열렸는지 확인
    const staffModal = await screen.findByTestId('staff-modal');
    expect(staffModal).toBeInTheDocument();

    // 모달 내의 "Mock Submit" 버튼 클릭 (StaffModal 모킹 내부에서 onSubmit 호출)
    // StaffModal 모킹에서 onSubmit은 newStaffData와 유사한 객체를 전달하도록 설정됨
    // 실제로는 StaffModal 내부 폼 입력을 시뮬레이션해야 하지만, 여기서는 모킹된 상호작용에 의존
    const mockSubmitButton = within(staffModal).getByRole('button', { name: /Mock Submit/i });
    
    // StaffModal의 onSubmit이 호출될 때 addStaff로 전달될 데이터를 준비 (모킹된 StaffModal의 onSubmit과 유사하게)
    // 실제로는 StaffModal의 내부 상태와 폼에서 이 데이터가 구성됨.
    // 여기서는 addStaff가 어떤 인자로 호출될지를 예상하여 mockAddStaff.toHaveBeenCalledWith와 맞춤.
    const expectedAddStaffPayload = {
      name: '모킹된 스태프', // StaffModal 모킹의 onSubmit에서 제공하는 값
      hireDate: '2024-01-01',
      position: StaffPosition.TRAINER,
      status: StaffStatus.ACTIVE,
      permissions: { dashboard:true, members:true, attendance:true, payment:true, lockers:true, staff:true, excel:true, backup:true, settings:true }
      // email, phone 등은 StaffModal 모킹에서 생략되었으므로, addStaff 호출 시 undefined 또는 기본값으로 전달될 것임.
    };

    await userEvent.click(mockSubmitButton);

    // addStaff가 올바른 데이터로 호출되었는지 확인
    expect(mockAddStaff).toHaveBeenCalledWith(expect.objectContaining(expectedAddStaffPayload));

    // 모달이 닫혔는지 확인 (Staff 페이지의 로직에 따라 다름, StaffModal의 onClose가 호출되어야 함)
    // StaffModal 모킹에서 "Close Modal" 버튼을 클릭하는 것으로 대체 가능, 또는 onSubmit 후 자동으로 닫힌다고 가정.
    // 여기서는 onSubmit 후 자동으로 닫힌다고 가정하고, 목록이 업데이트되는 것을 기다림.
    await waitFor(() => {
      expect(screen.queryByTestId('staff-modal')).not.toBeInTheDocument();
    });
    
    // getAllStaff가 다시 호출되었는지 확인 (목록 새로고침)
    expect(mockGetAllStaff).toHaveBeenCalledTimes(2); // 초기 로드 1번 + 추가 후 1번

    // 새 직원이 목록에 표시되는지 확인
    expect(await screen.findByText(newStaffEntry.name)).toBeInTheDocument(); 
    expect(screen.getByText(newStaffEntry.position)).toBeInTheDocument();
  });

  test('직원 수정: 모달 열고 저장 시 updateStaff 호출 및 목록 새로고침', async () => {
    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: mockStaffList }); // 초기 로드
    const staffToUpdate = mockStaffList[0]; // 김관리 (id: 1)
    const updatedPosition = StaffPosition.FRONT_DESK;
    const updatedStaffData = { 
      ...staffToUpdate, 
      position: updatedPosition, 
      updatedAt: '2022-01-02' // 업데이트 날짜 변경 가정
    };

    mockUpdateStaff.mockResolvedValueOnce({ success: true });
    // 수정 후 getAllStaff가 다시 호출될 때 수정된 직원이 포함된 목록을 반환하도록 설정
    mockGetAllStaff.mockResolvedValueOnce({ 
      success: true, 
      data: mockStaffList.map(s => s.id === staffToUpdate.id ? updatedStaffData : s)
    });

    renderStaffPage();
    expect(await screen.findByText(staffToUpdate.name)).toBeInTheDocument(); // 초기 '김관리' 확인
    expect(screen.getByText(staffToUpdate.position)).toBeInTheDocument(); // 초기 직책 확인

    // '김관리' 행의 수정 버튼 클릭 (더 구체적인 selector 권장)
    const row = screen.getByText(staffToUpdate.name).closest('tr'); // 테이블 행이라고 가정
    if (!row) throw new Error('Cannot find row for ' + staffToUpdate.name);
    const editButton = within(row).getByRole('button', { name: /수정/i });
    await userEvent.click(editButton);

    // 모킹된 StaffModal이 열렸는지 확인
    const staffModal = await screen.findByTestId('staff-modal');
    expect(staffModal).toBeInTheDocument();

    // StaffModal 모킹에서 onSubmit 시 전달될 데이터 (updateStaff의 payload)
    // 실제 StaffModal은 staffToUpdate 데이터를 받아 폼을 채우고, 수정된 값을 onSubmit으로 전달함.
    // 모킹된 StaffModal의 onSubmit은 고정된 값을 반환하므로, 
    // updateStaff 호출 시 staffToUpdate.id 와 함께 StaffModal의 onSubmit에서 오는 데이터가 전달된다고 가정.
    const expectedUpdatePayload = {
      // id는 updateStaff의 첫 번째 인자로 전달됨
      name: '모킹된 스태프', // StaffModal 모킹의 onSubmit에서 오는 값
      hireDate: '2024-01-01', 
      position: StaffPosition.TRAINER, // 실제로는 이 값을 updatedPosition으로 변경해서 보내야 함
      status: StaffStatus.ACTIVE,
      permissions: { dashboard:true, members:true, attendance:true, payment:true, lockers:true, staff:true, excel:true, backup:true, settings:true }
    };
    
    // 모달 내 "Mock Submit" 버튼 클릭
    const mockSubmitButton = within(staffModal).getByRole('button', { name: /Mock Submit/i });
    await userEvent.click(mockSubmitButton);

    // updateStaff가 올바른 ID와 데이터로 호출되었는지 확인
    // 첫 번째 인자는 ID, 두 번째 인자는 업데이트할 데이터
    expect(mockUpdateStaff).toHaveBeenCalledWith(
      staffToUpdate.id, 
      expect.objectContaining(expectedUpdatePayload) // StaffModal의 onSubmit에서 오는 데이터
    );

    // 모달 닫힘 확인
    await waitFor(() => {
      expect(screen.queryByTestId('staff-modal')).not.toBeInTheDocument();
    });

    // getAllStaff가 다시 호출되었는지 확인
    expect(mockGetAllStaff).toHaveBeenCalledTimes(2);

    // 수정된 직책이 목록에 표시되는지 확인
    expect(await screen.findByText(staffToUpdate.name)).toBeInTheDocument(); // 이름은 그대로
    expect(screen.getByText(updatedPosition)).toBeInTheDocument(); // 변경된 직책 확인
  });

  test('직원 삭제: 확인 후 deleteStaff 호출 및 목록 새로고침', async () => {
    mockGetAllStaff.mockResolvedValueOnce({ success: true, data: mockStaffList }); // 초기 로드
    const staffToDelete = mockStaffList[1]; // 이트레이너 (id: 2)

    // window.confirm 모킹 (항상 true 반환)
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);

    mockDeleteStaff.mockResolvedValueOnce({ success: true });
    // 삭제 후 getAllStaff가 다시 호출될 때 삭제된 직원이 제외된 목록을 반환
    mockGetAllStaff.mockResolvedValueOnce({ 
      success: true, 
      data: mockStaffList.filter(s => s.id !== staffToDelete.id)
    });

    renderStaffPage();
    expect(await screen.findByText(staffToDelete.name)).toBeInTheDocument(); // '이트레이너' 초기 확인

    // '이트레이너' 행의 삭제 버튼 클릭
    const row = screen.getByText(staffToDelete.name).closest('tr');
    if (!row) throw new Error('Cannot find row for ' + staffToDelete.name);
    const deleteButton = within(row).getByRole('button', { name: /삭제/i });
    await userEvent.click(deleteButton);

    // window.confirm이 호출되었는지 확인
    expect(mockConfirm).toHaveBeenCalled();

    // deleteStaff가 올바른 ID로 호출되었는지 확인
    expect(mockDeleteStaff).toHaveBeenCalledWith(staffToDelete.id);

    // getAllStaff가 다시 호출되었는지 확인
    await waitFor(() => {
      expect(mockGetAllStaff).toHaveBeenCalledTimes(2);
    });

    // 삭제된 직원이 목록에서 사라졌는지 확인
    expect(screen.queryByText(staffToDelete.name)).not.toBeInTheDocument();
    // 다른 직원(김관리)은 여전히 존재하는지 확인
    expect(screen.getByText(mockStaffList[0].name)).toBeInTheDocument();

    mockConfirm.mockRestore(); // confirm 모킹 복원
  });

  describe('에러 처리 테스트', () => {
    test('직원 목록 로드 실패 시 에러 메시지 표시', async () => {
      mockGetAllStaff.mockRejectedValueOnce(new Error('Failed to fetch staff list'));
      renderStaffPage();
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining('직원 목록을 불러오는데 실패했습니다'), 
          expect.objectContaining({ type: 'error' })
        );
      });
    });

    test('직원 추가 실패 시 에러 메시지 표시', async () => {
      mockGetAllStaff.mockResolvedValueOnce({ success: true, data: mockStaffList }); // 초기 로드는 성공
      renderStaffPage();
      expect(await screen.findByText('김관리')).toBeInTheDocument();

      const addButton = screen.getByRole('button', { name: /직원 추가/i });
      await userEvent.click(addButton);
      const staffModal = await screen.findByTestId('staff-modal');
      expect(staffModal).toBeInTheDocument();

      mockAddStaff.mockRejectedValueOnce(new Error('Failed to add staff'));
      
      const mockSubmitButton = within(staffModal).getByRole('button', { name: /Mock Submit/i });
      await userEvent.click(mockSubmitButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining('직원 추가 중 오류가 발생했습니다'),
          expect.objectContaining({ type: 'error' })
        );
      });
      // 모달은 여전히 열려있을 수 있음 (실패 시 닫지 않는다고 가정)
      expect(screen.getByTestId('staff-modal')).toBeInTheDocument();
    });
  });

  // TODO: 에러 처리 테스트 추가 (수정, 삭제 실패 시)
});
