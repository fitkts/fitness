import * as staffRepository from '../../database/staffRepository';
import { setupDatabase, closeDatabase } from '../../database/setup';
import { Staff, StaffPosition, StaffStatus } from '../../types/staff';

describe('Staff Repository - 생년월일 저장 및 조회', () => {
  beforeAll(async () => {
    await setupDatabase();
  });

  afterAll(() => {
    closeDatabase();
  });

  test('직원 추가 시 생년월일이 데이터베이스에 저장되어야 함', async () => {
    const staffData = {
      name: '김테스트',
      position: StaffPosition.TRAINER,
      phone: '010-1234-5678',
      email: 'test@example.com',
      hireDate: '2024-01-01',
      birthDate: '1990-05-15', // 생년월일 포함
      status: StaffStatus.ACTIVE,
      permissions: {
        dashboard: true,
        members: true,
        attendance: true,
        payment: true,
        lockers: true,
        staff: true,
        excel: true,
        backup: true,
        settings: true,
      },
      notes: '테스트 직원',
    };

    // 직원 추가
    const staffId = await staffRepository.addStaff(staffData);
    expect(staffId).toBeGreaterThan(0);

    // 추가된 직원 조회
    const savedStaff = await staffRepository.getStaffById(staffId);
    expect(savedStaff).not.toBeNull();
    expect(savedStaff!.birthDate).toBe('1990-05-15');
    expect(savedStaff!.name).toBe('김테스트');
  });

  test('직원 수정 시 생년월일이 정상적으로 업데이트되어야 함', async () => {
    // 먼저 직원 추가
    const staffData = {
      name: '박수정',
      position: StaffPosition.MANAGER,
      hireDate: '2024-01-01',
      birthDate: '1985-12-10',
      status: StaffStatus.ACTIVE,
      permissions: {
        dashboard: true,
        members: true,
        attendance: true,
        payment: true,
        lockers: true,
        staff: true,
        excel: true,
        backup: true,
        settings: true,
      },
    };

    const staffId = await staffRepository.addStaff(staffData);
    
    // 생년월일 수정
    const updateSuccess = await staffRepository.updateStaff(staffId, {
      birthDate: '1987-03-22'
    });
    expect(updateSuccess).toBe(true);

    // 수정된 직원 조회
    const updatedStaff = await staffRepository.getStaffById(staffId);
    expect(updatedStaff).not.toBeNull();
    expect(updatedStaff!.birthDate).toBe('1987-03-22');
  });

  test('생년월일이 없는 직원 추가 및 조회가 정상 작동해야 함', async () => {
    const staffData = {
      name: '이직원',
      position: StaffPosition.GENERAL,
      hireDate: '2024-01-01',
      // birthDate 제외
      status: StaffStatus.ACTIVE,
      permissions: {
        dashboard: true,
        members: false,
        attendance: false,
        payment: false,
        lockers: false,
        staff: false,
        excel: false,
        backup: false,
        settings: false,
      },
    };

    const staffId = await staffRepository.addStaff(staffData);
    
    // 조회 시 생년월일이 undefined여야 함
    const savedStaff = await staffRepository.getStaffById(staffId);
    expect(savedStaff).not.toBeNull();
    expect(savedStaff!.birthDate).toBeUndefined();
  });

  test('getAllStaff 함수에서 생년월일이 포함되어 조회되어야 함', async () => {
    // 생년월일이 있는 직원 추가
    const staffWithBirthDate = {
      name: '생년월일테스트',
      position: StaffPosition.TRAINER,
      hireDate: '2024-01-01',
      birthDate: '1992-08-30',
      status: StaffStatus.ACTIVE,
      permissions: {
        dashboard: true,
        members: true,
        attendance: true,
        payment: true,
        lockers: true,
        staff: true,
        excel: true,
        backup: true,
        settings: true,
      },
    };

    const staffId = await staffRepository.addStaff(staffWithBirthDate);

    // 전체 직원 목록 조회
    const allStaff = await staffRepository.getAllStaff();
    const foundStaff = allStaff.find(staff => staff.id === staffId);
    
    expect(foundStaff).toBeDefined();
    expect(foundStaff!.birthDate).toBe('1992-08-30');
  });

  test('생년월일 값이 빈 문자열일 때 undefined로 처리되어야 함', async () => {
    const staffData = {
      name: '빈문자열테스트',
      position: StaffPosition.GENERAL,
      hireDate: '2024-01-01',
      birthDate: '', // 빈 문자열
      status: StaffStatus.ACTIVE,
      permissions: {
        dashboard: false,
        members: false,
        attendance: false,
        payment: false,
        lockers: false,
        staff: false,
        excel: false,
        backup: false,
        settings: false,
      },
    };

    const staffId = await staffRepository.addStaff(staffData);
    const savedStaff = await staffRepository.getStaffById(staffId);
    
    expect(savedStaff).not.toBeNull();
    expect(savedStaff!.birthDate).toBeUndefined();
  });
}); 