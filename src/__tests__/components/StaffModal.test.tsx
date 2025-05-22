import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StaffModal from '../../components/StaffModal';
import { ToastProvider } from '../../contexts/ToastContext';
import { Staff, StaffPosition, StaffStatus } from '../../models/types';

// createPortal 모킹
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

// 테스트 전용 Mock 함수
const mockOnSave = jest.fn().mockResolvedValue(true);
const mockOnClose = jest.fn();

describe('StaffModal', () => {
  beforeEach(() => {
    // root 요소 추가
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.appendChild(root);
    // 각 테스트 전에 mock 함수들 초기화
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
    await act(async () => {
      render(
        <ToastProvider>
          <StaffModal
            isOpen={true}
            onClose={mockOnClose}
            onSave={mockOnSave}
            staff={null}
            isViewMode={false}
          />
        </ToastProvider>,
      );
    });

    // 모달 제목 확인 (Modal.tsx의 h3#modal-title)
    // StaffModal의 modalTitle은 신규 등록 시 "새 직원 등록" 반환
    expect(screen.getByRole('heading', { name: '새 직원 등록' })).toBeInTheDocument();
    
    // 버튼 확인 (StaffModal.tsx의 버튼들)
    expect(screen.getByRole('button', { name: '등록 완료' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();

    // StaffForm의 기본 정보 필드 확인
    expect(screen.getByLabelText(/^이름/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/직책/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/전화번호/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/입사일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/상태/i)).toBeInTheDocument();
    // 메모는 StaffForm에서 label이 없으므로 placeholder나 name으로 접근해야 함
    // StaffForm.tsx: <textarea name="notes" ... />
    expect(screen.getByRole('textbox', {name: 'notes'})).toBeInTheDocument();

    // StaffPermissionsForm의 권한 설정 제목 및 일부 체크박스 확인
    expect(screen.getByRole('heading', { name: '권한 설정' })).toBeInTheDocument();
    expect(screen.getByLabelText('대시보드')).toBeInTheDocument();
    expect(screen.getByLabelText('회원 관리')).toBeInTheDocument();
    // 모든 권한 프리셋 버튼이 있는지 확인
    expect(screen.getByRole('button', { name: '관리자' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '프론트데스크' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '트레이너' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '아르바이트' })).toBeInTheDocument();
  });

  test('신규 직원 등록 시 사용자 입력 및 저장 테스트 (Full Flow)', async () => {
    await act(async () => {
      render(
        <ToastProvider>
          <StaffModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} staff={null} isViewMode={false} />
        </ToastProvider>,
      );
    });

    // StaffForm 기본 정보 입력
    fireEvent.change(screen.getByLabelText(/^이름/i), { target: { value: '신규직원' } });
    fireEvent.change(screen.getByLabelText(/직책/i), { target: { value: StaffPosition.TRAINER } });
    fireEvent.change(screen.getByLabelText(/입사일/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/상태/i), { target: { value: StaffStatus.ACTIVE } });
    
    const phoneInput = screen.getByLabelText(/전화번호/i);
    fireEvent.change(phoneInput, { target: { value: '01033334444' } });
    await waitFor(() => expect(phoneInput).toHaveValue('010-3333-4444'));

    fireEvent.change(screen.getByLabelText(/이메일/i), { target: { value: 'newstaff@example.com' } });
    fireEvent.change(screen.getByRole('textbox', {name: 'notes'}), { target: { value: '신규 직원 메모입니다.' } });

    // StaffPermissionsForm 권한 설정 (트레이너 프리셋 버튼 클릭)
    fireEvent.click(screen.getByRole('button', { name: '트레이너' }));
    
    // 프리셋 적용 후 권한 체크박스 상태 확인 (trainerPermissions 기준)
    const permissionLabelMap: { [key: string]: string } = {
      dashboard: '대시보드', members: '회원 관리', attendance: '출석 관리', payment: '결제 관리',
      lockers: '락커 관리', staff: '직원 관리', excel: '엑셀 관리', backup: '백업 관리', settings: '환경 설정',
    };
    const expectedTrainerPermissions = {
      dashboard: true, members: true, attendance: true, payment: false,
      lockers: false, staff: false, excel: false, backup: false, settings: false,
    };
    await waitFor(() => {
      for (const key in expectedTrainerPermissions) {
        const label = permissionLabelMap[key as keyof typeof permissionLabelMap];
        if (label) {
          const checkbox = screen.getByLabelText(label) as HTMLInputElement;
          expect(checkbox.checked).toBe(expectedTrainerPermissions[key as keyof typeof expectedTrainerPermissions]);
        }
      }
    });

    // '등록 완료' 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '등록 완료' }));

    // onSave 호출 검증
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '신규직원',
          position: StaffPosition.TRAINER,
          hireDate: '2024-01-01',
          status: StaffStatus.ACTIVE,
          phone: '010-3333-4444',
          email: 'newstaff@example.com',
          notes: '신규 직원 메모입니다.',
          permissions: expectedTrainerPermissions,
        }),
      );
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('필수 필드(이름, 직책, 입사일) 누락 시 유효성 검사 에러 메시지 표시', async () => {
    await act(async () => {
      render(
        <ToastProvider>
          <StaffModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} staff={null} isViewMode={false} />
        </ToastProvider>,
      );
    });

    // 이름, 직책, 입사일 필드를 비워두기 위해 초기 formData에서 해당 값들을 제거하거나 빈 값으로 설정.
    // StaffModal은 defaultStaff를 사용하므로, 해당 값들이 초기에 채워져 있을 수 있음.
    // 이 테스트를 위해서는 초기 formData가 해당 필드에 대해 빈 값을 갖도록 조작하거나,
    // 사용자가 해당 필드를 지우는 인터랙션을 추가해야 함.
    // 지금은 validateStaffForm이 호출될 때 해당 필드가 비어있다고 가정하고 에러 메시지만 확인.
    // (실제로는 StaffModal의 handleSubmit이 먼저 호출되고, 그 안에서 validateStaffForm이 호출됨)

    // StaffModal의 defaultStaff는 name, position, hireDate에 기본값이 있음.
    // 따라서 이 테스트는 사용자가 해당 필드의 값을 지웠을 때를 시뮬레이션해야 함.
    fireEvent.change(screen.getByLabelText(/^이름/i), { target: { value: ' ' } }); // 공백으로 만들어 trim()에서 걸리도록
    fireEvent.change(screen.getByLabelText(/직책/i), { target: { value: ' ' } }); // 실제 select에서는 빈 value를 선택해야 함. StaffForm의 position은 enum이라 빈 값 선택이 현재 UI에선 어려움. validateStaffForm은 trim()을 하므로 공백으로 테스트.
    fireEvent.change(screen.getByLabelText(/입사일/i), { target: { value: '' } });

    // '등록 완료' 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '등록 완료' }));

    expect(await screen.findByText('이름은 필수입니다')).toBeInTheDocument();
    expect(await screen.findByText('직책은 필수입니다')).toBeInTheDocument();
    expect(await screen.findByText('입사일은 필수입니다')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('잘못된 전화번호 또는 이메일 형식 입력 시 유효성 검사 에러 메시지 표시', async () => {
    await act(async () => {
      render(
        <ToastProvider>
          <StaffModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} staff={null} isViewMode={false} />
        </ToastProvider>,
      );
    });
    // 필수 필드는 채움 (이름, 직책, 입사일)
    fireEvent.change(screen.getByLabelText(/^이름/i), { target: { value: '테스트' } });
    fireEvent.change(screen.getByLabelText(/직책/i), { target: { value: StaffPosition.TRAINER } });
    fireEvent.change(screen.getByLabelText(/입사일/i), { target: { value: '2024-01-01' } });

    // 잘못된 전화번호 형식
    fireEvent.change(screen.getByLabelText(/전화번호/i), { target: { value: '123' } });
    // 잘못된 이메일 형식
    fireEvent.change(screen.getByLabelText(/이메일/i), { target: { value: 'test@co' } });

    fireEvent.click(screen.getByRole('button', { name: '등록 완료' }));

    expect(await screen.findByText('유효한 전화번호를 입력하세요')).toBeInTheDocument();
    expect(await screen.findByText('유효한 이메일을 입력하세요')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  // frontDeskPermissions를 StaffUtils.ts에서 가져오지 않고 테스트 파일 내에 정의
  const frontDeskPermissions = {
    dashboard: true, members: true, attendance: true, payment: true, lockers: true,
    staff: false, excel: false, backup: false, settings: false,
  };

  const mockExistingStaff: Staff = {
    id: 101,
    name: '기존직원',
    position: StaffPosition.FRONT_DESK,
    phone: '010-8888-9999',
    email: 'existing.staff@example.com',
    hireDate: '2022-05-01',
    status: StaffStatus.ACTIVE,
    permissions: frontDeskPermissions,
    notes: '기존 직원 테스트 메모입니다.',
  };

  test('직원 정보 수정 모드 테스트', async () => {
    await act(async () => {
      render(
        <ToastProvider>
          <StaffModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} staff={mockExistingStaff} isViewMode={false} />
        </ToastProvider>,
      );
    });

    // 모달 제목 확인
    expect(screen.getByRole('heading', { name: '직원 정보 수정' })).toBeInTheDocument();

    // 폼에 기존 데이터가 채워져 있는지 확인
    expect(screen.getByLabelText(/^이름/i)).toHaveValue(mockExistingStaff.name);
    expect(screen.getByLabelText(/직책/i)).toHaveValue(mockExistingStaff.position);
    // (다른 필드들도 유사하게 확인)
    expect(screen.getByLabelText(/이메일/i)).toHaveValue(mockExistingStaff.email);

    // 권한 확인 (예: members는 true, staff는 false)
    expect((screen.getByLabelText('회원 관리') as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText('직원 관리') as HTMLInputElement).checked).toBe(false);

    // 정보 수정 (예: 전화번호, 메모, 특정 권한)
    const newPhone = '010-7777-6666';
    const newNotes = '수정된 직원 메모.';
    fireEvent.change(screen.getByLabelText(/전화번호/i), { target: { value: newPhone } });
    fireEvent.change(screen.getByRole('textbox', {name: 'notes'}), { target: { value: newNotes } });
    fireEvent.click(screen.getByLabelText('직원 관리')); // staff 권한을 true로 변경

    await waitFor(() => expect(screen.getByLabelText(/전화번호/i)).toHaveValue('010-7777-6666'));
    await waitFor(() => expect((screen.getByLabelText('직원 관리') as HTMLInputElement).checked).toBe(true));

    // '수정 완료' 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '수정 완료' }));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        ...mockExistingStaff,
        phone: newPhone,
        notes: newNotes,
        permissions: { ...frontDeskPermissions, staff: true }, // staff 권한이 true로 변경됨
      }));
    });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('직원 정보 조회 모드 및 수정 모드 전환 테스트', async () => {
    await act(async () => {
      render(
        <ToastProvider>
          <StaffModal isOpen={true} onClose={mockOnClose} onSave={mockOnSave} staff={mockExistingStaff} isViewMode={true} />
        </ToastProvider>,
      );
    });
    // 모달 제목 (조회 모드)
    expect(screen.getByRole('heading', { name: '직원 정보 보기' })).toBeInTheDocument();
    // 주요 정보가 읽기 전용으로 표시되는지 확인 (StaffForm의 isViewMode=true 렌더링 확인)
    expect(screen.getByText(mockExistingStaff.name)).toBeInTheDocument();
    expect(screen.getByText(mockExistingStaff.position)).toBeInTheDocument();
    // 권한 체크박스는 비활성화 상태여야 함
    expect((screen.getByLabelText('회원 관리') as HTMLInputElement).disabled).toBe(true);

    // '수정하기' 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: '수정하기' }));

    // 모달 제목 (수정 모드) 및 편집 가능한 필드 확인
    await waitFor(() => expect(screen.getByRole('heading', { name: '직원 정보 수정' })).toBeInTheDocument());
    expect(screen.getByLabelText(/^이름/i)).not.toBeDisabled();
    expect((screen.getByLabelText('회원 관리') as HTMLInputElement).disabled).toBe(false);
    expect(screen.getByRole('button', { name: '수정 완료' })).toBeInTheDocument(); // 저장 버튼 이름 변경 확인
  });
});
