import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as cron from 'node-cron';
import * as electronLog from 'electron-log';
import { setupDatabase, getDatabase, closeDatabase } from '../database/setup';
import { createBackup } from '../backup/backupService';
import * as paymentRepository from '../database/paymentRepository';
import * as membershipTypeRepository from '../database/membershipTypeRepository';
import * as memberRepository from '../database/memberRepository';
import * as staffRepository from '../database/staffRepository';
import * as lockerRepository from '../database/lockerRepository';
import * as attendanceRepository from '../database/attendanceRepository';
import * as consultationRepository from '../database/consultationRepository';
import { Member, Staff, Locker } from '../models/types';
import { format } from 'date-fns';
import {
  promoteConsultationMember,
  getConsultationMemberById
} from '../database/consultationRepository';
import { registerUnifiedMemberHandlers, unregisterUnifiedMemberHandlers } from '../ipc/unifiedMemberHandlers';

// 개발 모드 설정
const isDevelopment = process.env.NODE_ENV === 'development';
electronLog.info('개발 모드 설정:', isDevelopment);

// 개발 환경에서만 electron-reload 적용
if (isDevelopment) {
  try {
    const electronReload = require('electron-reload');
    electronReload(__dirname, {
      electron: path.join(__dirname, '../../node_modules/electron'),
    });
    electronLog.info('electron-reload 활성화됨');
  } catch (e) {
    electronLog.error('electron-reload 로드 실패:', e);
  }
}

// 데이터베이스 사용 설정 (개발 환경에서도 필요에 따라 활성화 가능)
const useDatabase = true; // 데이터베이스 활성화로 변경
electronLog.info('데이터베이스 사용:', useDatabase);

// 로그 설정
electronLog.transports.file.level = 'info';
electronLog.info('애플리케이션 시작');
electronLog.info('데이터베이스 사용:', useDatabase);

let mainWindow: BrowserWindow | null = null;

// 용량 사용이 이상한 경로 전체 가오기
function getUserDataPath(): string {
  try {
    if (app && app.getPath) {
      return app.getPath('userData');
    } else {
      const fallbackPath =
        process.env.APPDATA ||
        process.env.HOME ||
        path.join(__dirname, '../../temp');
      electronLog.warn(
        'Electron app 객체가 준비되지 않음. 경로 사용:',
        fallbackPath,
      );
      return fallbackPath;
    }
  } catch (error) {
    const fallbackPath = path.join(__dirname, '../../temp');
    electronLog.error('용량 사용이 이상한 경로 가오기 오류:', error);
    return fallbackPath;
  }
}

// 백업 렉터리 성
const backupDir = path.join(getUserDataPath(), 'backups');
fs.ensureDirSync(backupDir);

function createWindow() {
  // 브라우저 창 생성
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  // URL 설정
  // 개발 모드에서는 localhost:5000, 프로덕션 모드에서는 로컬 파일
  // 특수한 경우 강제로 개발 서버 사용 가능
  const forceDevServer = true; // 항상 개발 서버 사용하도록 설정

  const startUrl =
    isDevelopment || forceDevServer
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../renderer/index.html')}`;

  electronLog.info('Loading URL:', startUrl);
  electronLog.info('isDevelopment:', isDevelopment);
  electronLog.info('forceDevServer:', forceDevServer);

  // 개발 환경에서개발 구 콘솔서 류 정
  mainWindow.webContents.on('did-frame-finish-load', () => {
    if (isDevelopment) {
      mainWindow.webContents.executeJavaScript(`
        window.dragEvent = null; // dragEvent 락 문제 결
      `);
    }
  });

  mainWindow.loadURL(startUrl);

  // 개발 환경에서개발 구 동 기
  if (isDevelopment) {
    mainWindow.webContents.openDevTools();

    // 개발 모드서webpack-dev-server가 준비될 까지 기다리기 해 시
    mainWindow.webContents.on('did-fail-load', () => {
      electronLog.info('이지 로딩 패, 시..');
      setTimeout(() => {
        if (mainWindow) {
          electronLog.info('URL 시 로딩:', startUrl);
          mainWindow.loadURL(startUrl);
        }
      }, 1000);
    });
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 통합 회원 관리 IPC 핸들러 등록
  registerUnifiedMemberHandlers();
  electronLog.info('통합 회원 관리 IPC 핸들러 등록 완료');

  // 동 백업 정 (매일 정행)
  cron.schedule('0 0 * * *', () => {
    createBackup(backupDir)
      .then(() => electronLog.info('동 백업 료'))
      .catch((err) => electronLog.error('동 백업 패:', err));
  });
}

// Electron초기 마치성
app.whenReady().then(async () => {
  try {
    // 캐시 비활성화 설정 추가
    app.commandLine.appendSwitch('disable-http-cache');

    // 이베스 초기(개발 모드서택으로 행)
    if (useDatabase) {
      try {
        await setupDatabase();
        electronLog.info('이베스 초기료');
        // members 테이블에 staff_id, staff_name 컬럼이 없으면 추가
        try {
          const db = getDatabase();
          db.prepare('ALTER TABLE members ADD COLUMN staff_id INTEGER').run();
        } catch (e) {
          /* 이미 있으면 무시 */
        }
        try {
          const db = getDatabase();
          db.prepare('ALTER TABLE members ADD COLUMN staff_name TEXT').run();
        } catch (e) {
          /* 이미 있으면 무시 */
        }
        // staff 테이블에 isActive 컬럼이 없으면 추가
        try {
          const db = getDatabase();
          db.prepare(
            'ALTER TABLE staff ADD COLUMN isActive INTEGER DEFAULT 1',
          ).run();
        } catch (e) {
          /* 이미 있으면 무시 */
        }
        // staff 테이블에 createdAt, updatedAt 컬럼이 없으면 추가
        try {
          const db = getDatabase();
          db.prepare('ALTER TABLE staff ADD COLUMN createdAt TEXT').run();
        } catch (e) {
          /* 이미 있으면 무시 */
        }
        try {
          const db = getDatabase();
          db.prepare('ALTER TABLE staff ADD COLUMN updatedAt TEXT').run();
        } catch (e) {
          /* 이미 있으면 무시 */
        }
      } catch (dbError) {
        electronLog.error('이베스 초기류:', dbError);
        if (!isDevelopment) {
          throw dbError; // 로션서류 파
        }
      }
    } else {
      electronLog.info(
        '데이터베이스 초기화 건너뜀 - 데이터베이스 사용 설정이 false입니다',
      );
    }

    createWindow();

    app.on('activate', () => {
      // macOS서창이 모두 종료? ?음
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  } catch (error) {
    electronLog.error('애플리케이션 초기류:', error);
    // 개발 모드서류가 어UI시
    if (isDevelopment) {
      createWindow();
    }
  }
});

// 모든 창이 히종료
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC 신 정
// 엑셀 파일 선택 다이얼로그
ipcMain.handle('select-excel-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Excel 일', extensions: ['xlsx', 'xls'] }],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 설정 파일 경로
const SETTINGS_FILE_NAME = 'app-settings.json';

// 기본 설정값 (설정 파일이 없을 때 사용)
const getDefaultSettings = () => ({
  theme: 'system',
  backupSchedule: 'daily',
  backupCount: 30,
  notificationsEnabled: true,
  notificationsBeforeMembershipEnd: 7,
  autoDeleteBackup: true,
  developerMode: false,
});

// 설정 불러오기 핸들러
ipcMain.handle('load-settings', async () => {
  electronLog.info('[Main Process] Received load-settings request');
  const settingsFilePath = path.join(
    app.getPath('userData'),
    SETTINGS_FILE_NAME,
  );
  try {
    const fileExists = await fs.pathExists(settingsFilePath);
    if (fileExists) {
      const settingsFromFile = await fs.readJson(settingsFilePath);
      // 기본 설정과 불러온 설정을 병합하여 항상 모든 키가 존재하도록 보장
      const mergedSettings = { ...getDefaultSettings(), ...settingsFromFile };
      electronLog.info(
        '[Main Process] Settings loaded and merged successfully.',
      );
      return mergedSettings;
    }
    electronLog.info(
      '[Main Process] Settings file not found, returning default settings and attempting to save them.',
    );
    // 설정 파일이 없으면 기본 설정을 반환하고, 동시에 기본 설정을 파일에 저장 시도
    const defaultSettings = getDefaultSettings();
    try {
      await fs.writeJson(settingsFilePath, defaultSettings, { spaces: 2 });
      electronLog.info('[Main Process] Default settings saved to new file.');
    } catch (saveError) {
      electronLog.error(
        '[Main Process] Error saving default settings to new file:',
        saveError,
      );
    }
    return defaultSettings;
  } catch (error) {
    electronLog.error(
      '[Main Process] Error loading settings, returning default settings:',
      error,
    );
    return getDefaultSettings(); // 로드 중 에러 발생 시에도 기본값 반환
  }
});

// 설정 저장 핸들러
ipcMain.handle('save-settings', async (event, receivedSettings) => {
  electronLog.info(
    '[Main Process] Received save-settings request with data:',
    receivedSettings,
  );
  const settingsFilePath = path.join(
    app.getPath('userData'),
    SETTINGS_FILE_NAME,
  );
  try {
    if (!receivedSettings || typeof receivedSettings !== 'object') {
      electronLog.warn(
        '[Main Process] Invalid settings data received for saving.',
      );
      throw new Error('유효하지 않은 설정 데이터입니다.');
    }
    // 저장 시에도 기본 설정의 모든 키가 포함되도록 보장 (누락된 키가 있다면 기본값으로 채움)
    const settingsToSave = { ...getDefaultSettings(), ...receivedSettings };

    await fs.writeJson(settingsFilePath, settingsToSave, { spaces: 2 });
    electronLog.info('[Main Process] Settings saved successfully.');
    return { success: true };
  } catch (error) {
    electronLog.error('[Main Process] Error saving settings:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 애플리케이션 재시작 핸들러
ipcMain.on('relaunch-app', () => {
  electronLog.info('[Main Process] Received relaunch-app request');
  app.relaunch();
  app.quit(); // 또는 app.exit(0);
});

// 회원 관리 API

// 모든 회원 조회
ipcMain.handle('get-all-members', async () => {
  try {
    const members = await memberRepository.getAllMembers();
    return { success: true, data: members };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('회원 목록 조회 오류 (IPC):', errorMessage);
    return { success: false, error: errorMessage };
  }
});

// 회원 추가
ipcMain.handle('add-member', async (_, memberData: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    if (!memberData.name) {
      throw new Error('회원 이름은 필수 입력 항목입니다.');
    }
    const newId = await memberRepository.addMember(memberData);
    return { success: true, id: newId };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('회원 추가 오류 (IPC):', errorMessage);
    return { success: false, error: errorMessage };
  }
});

// 회원 수정
ipcMain.handle('update-member', async (_, memberData: Member) => {
  try {
    if (!memberData.id) {
      throw new Error('회원 ID가 필요합니다.');
    }
    if (!memberData.name) {
      throw new Error('회원 이름은 필수 입력 항목입니다.');
    }
    const { id, createdAt, updatedAt, ...dataToUpdate } = memberData;
    const success = await memberRepository.updateMember(id, dataToUpdate);
    return { success: true, updated: success };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('회원 수정 오류 (IPC):', errorMessage);
    return { success: false, error: errorMessage };
  }
});

// 회원 삭제
ipcMain.handle('delete-member', async (_, id: number) => {
  try {
    if (!id) {
      throw new Error('삭제할 회원 ID가 필요합니다.');
    }
    const deleted = await memberRepository.deleteMember(id);
    return { success: true, deleted };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.';
    electronLog.error(`ID가 ${id}인 회원 삭제 오류 (IPC):`, errorMessage);
    return { success: false, error: errorMessage };
  }
});

// 대시보드 통계 데이터 가져오기
ipcMain.handle('get-dashboard-stats', async () => {
  try {
    const todayISO = format(new Date(), 'yyyy-MM-dd');
    const firstDayOfMonthISO = format(new Date(new Date().setDate(1)), 'yyyy-MM-dd');
    const recentLimit = 3; // 최근 항목 조회 시 개수
    const monthlyStatCount = 6; // 최근 N개월 통계

    // 병렬로 데이터 가져오기
    const [
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      attendanceToday,
      membershipDistribution,
      monthlyAttendance,
      recentMembers,
      recentAttendance,
    ] = await Promise.all([
      memberRepository.getTotalMemberCount(),
      memberRepository.getActiveMemberCount(todayISO),
      memberRepository.getNewMemberCountSince(firstDayOfMonthISO),
      attendanceRepository.getAttendanceCountByDate(todayISO),
      memberRepository.getMembershipDistribution(),
      attendanceRepository.getMonthlyAttendanceCounts(todayISO, monthlyStatCount),
      memberRepository.getRecentMembers(recentLimit),
      attendanceRepository.getRecentAttendanceWithMemberName(recentLimit),
    ]);

    return {
      success: true,
      data: {
        totalMembers,
        activeMembers,
        newMembersThisMonth,
        attendanceToday,
        membershipDistribution,
        monthlyAttendance, // Repository에서 이미 { month: string; count: number }[] 형태로 반환
        recentActivities: {
          recentMembers, // Repository에서 Member[] 반환, 필요시 여기서 가공 (이미 joinDate는 ISO 문자열)
          recentAttendance, // Repository에서 이미 { id, memberId, memberName, visitDate, createdAt? }[] 형태로 반환
        },
      },
    };
  } catch (error) {
    electronLog.error('대시보드 통계 조회 오류 (IPC):', error);
    return { success: false, error: (error as Error).message };
  }
});

// --- 결제 관련 API ---

// 모든 결제 내역 조회
ipcMain.handle('get-all-payments', async () => {
  try {
    // memberName을 포함하기 위해 members 정보와 조인하거나 여기서 처리
    const payments = await paymentRepository.getAllPayments();
    const members = await memberRepository.getAllMembers(); // memberName 추가 위해 로드

    const dataWithMemberNames = payments.map((p) => {
      const member = members.find((m) => m.id === p.memberId);
      return {
        ...p,
        memberName: member ? member.name : '알 수 없음', // memberName 필드 추가
      };
    });

    return { success: true, data: dataWithMemberNames };
  } catch (error) {
    electronLog.error('결제 목록 조회 IPC 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 결제 추가
ipcMain.handle('add-payment', async (_, paymentData) => {
  // paymentData는 Omit<Payment, 'id' | 'memberName'> 형태
  try {
    const newId = await paymentRepository.addPayment(paymentData);
    return { success: true, id: newId };
  } catch (error) {
    electronLog.error('결제 추가 IPC 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 결제 정보 수정
ipcMain.handle('update-payment', async (_, id, paymentData) => {
  try {
    // electronLog.info('IPC update-payment received:', id, paymentData);
    const success = await paymentRepository.updatePayment(id, paymentData);
    return { success };
  } catch (error: any) {
    electronLog.error('결제 정보 수정 IPC 오류:', error);
    return { success: false, error: error.message };
  }
});

// 결제 삭제
ipcMain.handle('delete-payment', async (_, id) => {
  try {
    const success = await paymentRepository.deletePayment(id);
    return { success };
  } catch (error) {
    electronLog.error('결제 삭제 IPC 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// --- 이용권 종류 관련 API ---

// 모든 이용권 종류 조회
ipcMain.handle('get-all-membership-types', async () => {
  try {
    const data = await membershipTypeRepository.getAllMembershipTypes();
    return { success: true, data };
  } catch (error) {
    electronLog.error('이용권 종류 목록 조회 IPC 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 이용권 종류 추가
ipcMain.handle('add-membership-type', async (_, typeData) => {
  // typeData는 Omit<MembershipType, 'id'> 형태
  try {
    const newId = await membershipTypeRepository.addMembershipType(typeData);
    return { success: true, id: newId };
  } catch (error) {
    electronLog.error('이용권 종류 추가 IPC 오류:', error);
    // 이름 중복 오류 처리 등 추가 가능
    return { success: false, error: (error as Error).message };
  }
});

// 이용권 종류 업데이트
ipcMain.handle('update-membership-type', async (_, typeData) => {
  // typeData는 MembershipType 형태 (id 포함)
  try {
    const { id, ...dataToUpdate } = typeData; // id 추출
    const success = await membershipTypeRepository.updateMembershipType(
      id,
      dataToUpdate,
    );
    return { success };
  } catch (error) {
    electronLog.error('이용권 종류 업데이트 IPC 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 이용권 종류 삭제
ipcMain.handle('delete-membership-type', async (_, id) => {
  try {
    const success = await membershipTypeRepository.deleteMembershipType(id);
    return { success };
  } catch (error) {
    electronLog.error('이용권 종류 삭제 IPC 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// --- 스태프 관련 API ---

// 모든 스태프 조회
ipcMain.handle('get-all-staff', async () => {
  try {
    const staff = await staffRepository.getAllStaff();
    const activeStaff = staff.filter(s => s.status === 'active');
    return { success: true, data: activeStaff };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('직원 목록 가져오기 오류 (IPC):', errorMessage);
    return { success: false, error: errorMessage };
  }
});

// ID로 스태프 조회
ipcMain.handle('get-staff-by-id', async (_, id: number) => {
  try {
    const staff = await staffRepository.getStaffById(id);
    return { success: true, data: staff };
  } catch (error) {
    electronLog.error('스태프 조회 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 새 스태프 추가
ipcMain.handle(
  'add-staff',
  async (_, staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await staffRepository.addStaff(staff);
      return { success: true, data: id };
    } catch (error) {
      electronLog.error('스태프 추가 오류:', error);
      return { success: false, error: (error as Error).message };
    }
  },
);

// 스태프 정보 업데이트
ipcMain.handle('update-staff', async (_, id: number, staff: Partial<Staff>) => {
  try {
    const success = await staffRepository.updateStaff(id, staff);
    return { success };
  } catch (error) {
    electronLog.error('스태프 업데이트 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 스태프 삭제
ipcMain.handle('delete-staff', async (_, id: number) => {
  try {
    const success = await staffRepository.deleteStaff(id);
    return { success };
  } catch (error) {
    electronLog.error('스태프 삭제 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// --- 락커 관련 API ---

// 모든 락커 조회 (페이지네이션 및 필터링 지원)
ipcMain.handle('get-all-lockers', async (_, page = 1, pageSize = 50, searchTerm = '', status = 'all') => {
  try {
    electronLog.info('락커 목록 조회 요청:', { page, pageSize, searchTerm, status });
    const result = await lockerRepository.getAllLockers(page, pageSize, searchTerm, status);
    electronLog.info('락커 목록 조회 결과:', { 
      dataCount: result.data.length, 
      total: result.total,
      page,
      expectedStart: (page - 1) * pageSize + 1,
      expectedEnd: Math.min(page * pageSize, result.total)
    });
    return { success: true, data: result };
  } catch (error) {
    electronLog.error('락커 목록 조회 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// ID로 락커 조회
ipcMain.handle('get-locker-by-id', async (_, id: number) => {
  try {
    const locker = await lockerRepository.getLockerById(id);
    return { success: true, data: locker };
  } catch (error) {
    electronLog.error('락커 조회 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 새 락커 추가
ipcMain.handle(
  'add-locker',
  async (_, locker: Omit<Locker, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const id = await lockerRepository.addLocker(locker);
      return { success: true, data: id };
    } catch (error) {
      electronLog.error('락커 추가 오류:', error);
      return { success: false, error: (error as Error).message };
    }
  },
);

// 락커 정보 업데이트
ipcMain.handle(
  'update-locker',
  async (_, id: number, locker: Partial<Locker>) => {
    try {
      const success = await lockerRepository.updateLocker(id, locker);
      return { success };
    } catch (error) {
      electronLog.error('락커 업데이트 오류:', error);
      return { success: false, error: (error as Error).message };
    }
  },
);

// 락커 삭제
ipcMain.handle('delete-locker', async (_, id: number) => {
  try {
    const success = await lockerRepository.deleteLocker(id);
    return { success };
  } catch (error) {
    electronLog.error('락커 삭제 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// --- 락커 히스토리 관련 API ---

// 락커 히스토리 조회
ipcMain.handle('get-locker-history', async (_, filter = {}) => {
  try {
    const { getLockerHistory } = await import('../database/lockerHistoryRepository');
    const result = await getLockerHistory(filter);
    return { success: true, data: result };
  } catch (error) {
    electronLog.error('락커 히스토리 조회 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 락커별 히스토리 조회
ipcMain.handle('get-locker-history-by-id', async (_, lockerId: number) => {
  try {
    const { getLockerHistory } = await import('../database/lockerHistoryRepository');
    const result = await getLockerHistory({ lockerId });
    return { success: true, data: result.data };
  } catch (error) {
    electronLog.error('락커별 히스토리 조회 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 락커 통계 조회
ipcMain.handle('get-locker-statistics', async () => {
  try {
    const { getLockerStatistics } = await import('../database/lockerHistoryRepository');
    const statistics = await getLockerStatistics();
    return { success: true, data: statistics };
  } catch (error) {
    electronLog.error('락커 통계 조회 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 락커 대시보드 데이터 조회
ipcMain.handle('get-locker-dashboard-data', async () => {
  try {
    const { getLockerDashboardData } = await import('../database/lockerHistoryRepository');
    const dashboardData = await getLockerDashboardData();
    return { success: true, data: dashboardData };
  } catch (error) {
    electronLog.error('락커 대시보드 데이터 조회 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 추가해야 할 main.ts 코드 (참고용)
ipcMain.handle('get-attendance-by-date', async (event, date: string) => {
  try {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {
        success: false,
        error: '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD).',
      };
    }
    const attendanceRecords = await attendanceRepository.getAttendanceByDate(date);
    const recordsWithMemberName = await Promise.all(attendanceRecords.map(async (record) => {
        const member = await memberRepository.getMemberById(record.memberId);
        return { ...record, memberName: member ? member.name : '알 수 없음' };
    }));
    return { success: true, data: recordsWithMemberName };
  } catch (error) {
    electronLog.error('날짜별 출석 조회 오류 (IPC):', error);
    return {
      success: false,
      error: '출석 데이터 조회 중 오류가 발생했습니다.',
    };
  }
});

// 회원 목록 페이지네이션 조회
ipcMain.handle('get-members-pagination', async (_, page, pageSize, options) => {
  try {
    if (!useDatabase) {
      throw new Error('데이터베이스가 비활성화되어 있습니다.');
    }

    const result = await memberRepository.getMembersWithPagination(
      page,
      pageSize,
      options,
    );
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('회원 목록 페이지네이션 조회 오류:', errorMessage);
    return {
      success: false,
      error: errorMessage,
      data: { members: [], total: 0 },
    };
  }
});

// 엑셀 회원 데이터 임포트
ipcMain.handle('import-members-excel', async (_, data: any[]) => {
  electronLog.info('[Main Process] Received import-members-excel request with data count:', data.length);
  try {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        // 필수 필드 검증
        if (!row.name) {
          errors.push(`필수 항목 누락: 이름 (행 데이터: ${JSON.stringify(row)})`);
          failedCount++;
          continue;
        }
        if (!row.joinDate) { // 가입일은 Member 타입에서 필수 문자열
            errors.push(`필수 항목 누락: 가입일 (회원: ${row.name})`);
            failedCount++;
            continue;
        }

        // Zod 스키마와 Member 타입에 맞게 데이터 준비
        // Omit<Member, 'id' | 'createdAt' | 'updatedAt'> 타입에 맞춤
        const memberDataForRepo: Omit<Member, 'id' | 'createdAt' | 'updatedAt'> = {
          name: String(row.name),
          phone: row.phone ? String(row.phone) : undefined,
          email: row.email ? String(row.email) : undefined,
          gender: (rawGender => (rawGender === '남성' || rawGender === '여성' || rawGender === '기타') ? rawGender : undefined)(row.gender ? String(row.gender).trim() : undefined),
          // 날짜 필드는 ISO 문자열 (YYYY-MM-DD) 또는 undefined로 전달. Repository에서 타임스탬프로 변환.
          birthDate: row.birthDate ? format(new Date(row.birthDate), 'yyyy-MM-dd') : undefined,
          joinDate: format(new Date(row.joinDate), 'yyyy-MM-dd'), // 필수
          membershipType: row.membershipType ? String(row.membershipType) : undefined,
          membershipStart: row.membershipStart ? format(new Date(row.membershipStart), 'yyyy-MM-dd') : undefined,
          membershipEnd: row.membershipEnd ? format(new Date(row.membershipEnd), 'yyyy-MM-dd') : undefined,
          notes: row.notes ? String(row.notes) : undefined,
          // staffId, staffName은 Member 타입에 있지만, addMember Omit에 포함되지 않았으므로 Repository에서 처리 안 함.
          // 만약 필요하다면 Member 타입 및 addMember 인자 수정 필요. 여기서는 일단 제외.
        };
        
        // birthDate, membershipStart, membershipEnd가 빈 문자열일 경우 undefined로 처리 (엑셀에서 공백으로 올 수 있음)
        if (memberDataForRepo.birthDate === '') memberDataForRepo.birthDate = undefined;
        if (memberDataForRepo.membershipStart === '') memberDataForRepo.membershipStart = undefined;
        if (memberDataForRepo.membershipEnd === '') memberDataForRepo.membershipEnd = undefined;

        await memberRepository.addMember(memberDataForRepo);
        successCount++;
      } catch (error) {
        failedCount++;
        errors.push(`${row.name || '알 수 없는 행'}: ${(error as Error).message}`);
        electronLog.error('엑셀 행 임포트 중 오류:', { row, error });
      }
    }

    electronLog.info('[Main Process] Excel import finished:', { successCount, failedCount, errors });
    return {
      success: true,
      data: {
        successCount,
        failedCount,
        errors,
      },
    };

  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('엑셀 회원 데이터 임포트 처리 중 오류 (IPC):', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
});

// 출석 기록 추가 핸들러
ipcMain.handle(
  'add-attendance-record',
  async (
    event,
    recordData: { memberId: number; visitDate: string; memberName?: string },
  ) => {
    electronLog.info(
      '[Main Process] Received add-attendance-record request:',
      recordData,
    );
    try {
      // 날짜 형식 검증 (YYYY-MM-DD)
      if (!recordData.visitDate || !/^\d{4}-\d{2}-\d{2}$/.test(recordData.visitDate)) {
        return {
          success: false,
          error: '올바른 방문 날짜 형식이 아닙니다 (YYYY-MM-DD).',
        };
      }

      // 중복 출석 확인
      const existingRecord = await attendanceRepository.findAttendanceByMemberAndDate(
        recordData.memberId,
        recordData.visitDate,
      );

      if (existingRecord) {
        electronLog.warn(
          '[Main Process] Attendance record already exists for member:',
          recordData.memberId,
          'on date:',
          recordData.visitDate,
        );
        const member = await memberRepository.getMemberById(recordData.memberId); // memberName 최신화
        return {
          success: true,
          data: { 
            ...existingRecord, 
            memberName: member ? member.name : (recordData.memberName || '알 수 없음') 
          },
          message: '이미 출석 처리된 회원입니다.',
        };
      }

      // 출석 추가 (Attendance 타입에 맞게 전달, visitDate는 string)
      const newRecordId = await attendanceRepository.addAttendance({
        memberId: recordData.memberId,
        visitDate: recordData.visitDate,
      });
      
      // 추가된 전체 기록을 반환하기 위해 조회
      const addedRecord = await attendanceRepository.findAttendanceByMemberAndDate(recordData.memberId, recordData.visitDate);
      if (!addedRecord) { // 이론적으로는 발생하기 어려움
          throw new Error('출석 기록 추가 후 조회에 실패했습니다.');
      }

      const member = await memberRepository.getMemberById(recordData.memberId);
      const responseRecord = {
        ...addedRecord,
        memberName: member ? member.name : (recordData.memberName || '알 수 없음'),
      };

      electronLog.info(
        '[Main Process] Attendance record added successfully:',
        responseRecord,
      );
      return { success: true, data: responseRecord };
    } catch (error) {
      electronLog.error(
        '[Main Process] Error adding attendance record:',
        error,
      );
      return { success: false, error: (error as Error).message };
    }
  },
);

// 출석 기록 삭제 핸들러
ipcMain.handle('delete-attendance-record', async (event, recordId: number) => {
  electronLog.info(
    '[Main Process] Received delete-attendance-record request for ID:',
    recordId,
  );
  try {
    const success = await attendanceRepository.deleteAttendanceById(recordId);
    if (success) {
      electronLog.info(
        '[Main Process] Attendance record deleted successfully, ID:',
        recordId,
      );
      return { success: true };
    } else {
      electronLog.warn(
        '[Main Process] Attendance record not found for deletion or delete failed, ID:',
        recordId,
      );
      throw new Error('삭제할 출석 기록을 찾지 못했거나 삭제에 실패했습니다.');
    }
  } catch (error) {
    electronLog.error(
      '[Main Process] Error deleting attendance record:',
      error,
    );
    return { success: false, error: (error as Error).message };
  }
});

// 회원 검색 핸들러
ipcMain.handle('search-members', async (event, searchTerm: string) => {
  electronLog.info(
    '[Main Process] Received search-members request with term:',
    searchTerm,
  );
  try {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return { success: true, data: [] };
    }
    const membersFound = await memberRepository.searchMembers(searchTerm.trim());
    const resultData = membersFound.map(m => ({ id: m.id, name: m.name, phone: m.phone }));
    
    electronLog.info(
      '[Main Process] Member search successful, found items:',
      resultData.length,
    );
    return { success: true, data: resultData };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('[Main Process] Error searching members (IPC):', errorMessage);
    return { success: false, error: errorMessage, data: [] };
  }
});

// 상담 기록 생성 핸들러
ipcMain.handle('add-consultation-record', async (event, recordData: any) => {
  electronLog.info('[Main Process] Received add-consultation-record request:', recordData);
  try {
    // 날짜를 Unix timestamp로 변환
    const consultationDate = Math.floor(new Date(recordData.consultation_date).getTime() / 1000);
    const nextAppointment = recordData.next_appointment 
      ? Math.floor(new Date(recordData.next_appointment).getTime() / 1000)
      : undefined;

    const consultationRecord = {
      member_id: recordData.member_id,
      consultation_date: consultationDate,
      consultation_type: recordData.consultation_type,
      consultant_id: recordData.consultant_id,
      consultant_name: recordData.consultant_name,
      content: recordData.content,
      goals_discussed: recordData.goals_discussed || [],
      recommendations: recordData.recommendations || '',
      next_appointment: nextAppointment,
      status: recordData.status || 'completed'
    };

    const newRecord = consultationRepository.createConsultationRecord(consultationRecord);
    
    electronLog.info('[Main Process] Consultation record created successfully:', newRecord.id);
    return { success: true, data: newRecord };
  } catch (error) {
    electronLog.error('[Main Process] Error creating consultation record:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 회원별 상담 기록 조회 핸들러
ipcMain.handle('get-consultation-records-by-member', async (event, memberId: number) => {
  electronLog.info('[Main Process] Received get-consultation-records-by-member request for member:', memberId);
  try {
    const records = consultationRepository.getConsultationRecordsByMember(memberId);
    
    electronLog.info('[Main Process] Consultation records retrieved successfully, count:', records.length);
    return { success: true, data: records };
  } catch (error) {
    electronLog.error('[Main Process] Error retrieving consultation records:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 모든 상담 기록 조회 핸들러
ipcMain.handle('get-all-consultation-records', async () => {
  electronLog.info('[Main Process] Received get-all-consultation-records request');
  try {
    const records = consultationRepository.getAllConsultationRecords();
    
    electronLog.info('[Main Process] All consultation records retrieved successfully, count:', records.length);
    return { success: true, data: records };
  } catch (error) {
    electronLog.error('[Main Process] Error retrieving all consultation records:', error);
    return { success: false, error: (error as Error).message };
  }
});

// ============== CONSULTATION MEMBERS API ==============

// 모든 상담 회원 조회
ipcMain.handle('get-all-consultation-members', async () => {
  electronLog.info('[Main Process] Received get-all-consultation-members request');
  try {
    const members = consultationRepository.getAllConsultationMembers();
    
    electronLog.info('[Main Process] All consultation members retrieved successfully, count:', members.length);
    return { success: true, data: members };
  } catch (error) {
    electronLog.error('[Main Process] Error retrieving consultation members:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 상담 회원 생성
ipcMain.handle('add-consultation-member', async (event, memberData: any) => {
  electronLog.info('[Main Process] Received add-consultation-member request:', memberData);
  try {
    // 날짜 문자열을 Unix timestamp로 변환
    const processedData = {
      ...memberData,
      birth_date: memberData.birth_date ? Math.floor(new Date(memberData.birth_date).getTime() / 1000) : undefined,
      first_visit: memberData.first_visit ? Math.floor(new Date(memberData.first_visit).getTime() / 1000) : undefined,
      fitness_goals: memberData.fitness_goals ? JSON.stringify(memberData.fitness_goals) : undefined
    };

    const newMember = consultationRepository.createConsultationMember(processedData);
    
    electronLog.info('[Main Process] Consultation member created successfully:', newMember.id);
    return { success: true, data: newMember };
  } catch (error) {
    electronLog.error('[Main Process] Error creating consultation member:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 상담 회원 수정
ipcMain.handle('update-consultation-member', async (event, id: number, updates: any) => {
  electronLog.info('[Main Process] Received update-consultation-member request:', { id, updates });
  try {
    // updates가 유효한지 먼저 체크
    if (!updates || typeof updates !== 'object') {
      throw new Error('유효하지 않은 업데이트 데이터입니다.');
    }

    // 날짜 문자열을 Unix timestamp로 변환 (null 체크 강화)
    const processedUpdates = {
      ...updates,
      birth_date: (updates.birth_date && updates.birth_date !== null) 
        ? Math.floor(new Date(updates.birth_date).getTime() / 1000) 
        : undefined,
      first_visit: (updates.first_visit && updates.first_visit !== null) 
        ? Math.floor(new Date(updates.first_visit).getTime() / 1000) 
        : undefined,
      fitness_goals: (updates.fitness_goals && updates.fitness_goals !== null) 
        ? JSON.stringify(updates.fitness_goals) 
        : undefined
    };

    const success = consultationRepository.updateConsultationMember(id, processedUpdates);
    
    electronLog.info('[Main Process] Consultation member updated successfully:', { id, success });
    return { success: true, updated: success };
  } catch (error) {
    electronLog.error('[Main Process] Error updating consultation member:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 상담 회원 삭제
ipcMain.handle('delete-consultation-member', async (event, id: number) => {
  electronLog.info('[Main Process] Received delete-consultation-member request:', id);
  try {
    const success = consultationRepository.deleteConsultationMember(id);
    
    electronLog.info('[Main Process] Consultation member deleted successfully:', { id, success });
    return { success: true, deleted: success };
  } catch (error) {
    electronLog.error('[Main Process] Error deleting consultation member:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 상담 회원 단일 조회
ipcMain.handle('get-consultation-member-by-id', async (event, id: number) => {
  electronLog.info('상담 회원 단일 조회 요청:', id);
  try {
    const result = getConsultationMemberById(id);
    
    electronLog.info('상담 회원 단일 조회 성공');
    return {
      success: true,
      data: result
    };
  } catch (error) {
    electronLog.error('상담 회원 단일 조회 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '상담 회원 조회 중 알 수 없는 오류가 발생했습니다.'
    };
  }
});

// ============== 회원 승격 관련 IPC ==============

// 회원 승격 처리
ipcMain.handle('promote-consultation-member', async (event, promotionData) => {
  try {
    electronLog.info('회원 승격 요청:', promotionData);
    
    const result = promoteConsultationMember(promotionData);
    
    electronLog.info('회원 승격 성공:', result);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    electronLog.error('회원 승격 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '회원 승격 중 알 수 없는 오류가 발생했습니다.'
    };
  }
});

// ============== 통합 회원 관리 IPC 핸들러 등록 ==============
electronLog.info('통합 회원 관리 IPC 핸들러 등록 시작');
try {
  registerUnifiedMemberHandlers();
  electronLog.info('통합 회원 관리 IPC 핸들러 등록 완료');
} catch (error) {
  electronLog.error('통합 회원 관리 IPC 핸들러 등록 실패:', error);
}
