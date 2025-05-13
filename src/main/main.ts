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
import { Staff } from '../models/types';
import * as lockerRepository from '../database/lockerRepository';
import { Locker } from '../models/types';

// 개발 모드 설정
const isDevelopment = process.env.NODE_ENV === 'development';
electronLog.info('개발 모드 설정:', isDevelopment);

// 개발 환경에서만 electron-reload 적용
if (isDevelopment) {
  try {
    const electronReload = require('electron-reload');
    electronReload(__dirname, {
      electron: path.join(__dirname, '../../node_modules/electron')
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
      const fallbackPath = process.env.APPDATA || process.env.HOME || path.join(__dirname, '../../temp');
      electronLog.warn('Electron app 객체가 준비되지 않음. 경로 사용:', fallbackPath);
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
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    show: false,
  });

  // URL 설정
  // 개발 모드에서는 localhost:5000, 프로덕션 모드에서는 로컬 파일
  // 특수한 경우 강제로 개발 서버 사용 가능
  const forceDevServer = true;  // 항상 개발 서버 사용하도록 설정
  
  const startUrl = (isDevelopment || forceDevServer)
    ? 'http://localhost:5000'
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
        } catch (e) { /* 이미 있으면 무시 */ }
        try {
          const db = getDatabase();
          db.prepare('ALTER TABLE members ADD COLUMN staff_name TEXT').run();
        } catch (e) { /* 이미 있으면 무시 */ }
        // staff 테이블에 isActive 컬럼이 없으면 추가
        try {
          const db = getDatabase();
          db.prepare('ALTER TABLE staff ADD COLUMN isActive INTEGER DEFAULT 1').run();
        } catch (e) { /* 이미 있으면 무시 */ }
        // staff 테이블에 createdAt, updatedAt 컬럼이 없으면 추가
        try {
          const db = getDatabase();
          db.prepare('ALTER TABLE staff ADD COLUMN createdAt TEXT').run();
        } catch (e) { /* 이미 있으면 무시 */ }
        try {
          const db = getDatabase();
          db.prepare('ALTER TABLE staff ADD COLUMN updatedAt TEXT').run();
        } catch (e) { /* 이미 있으면 무시 */ }
      } catch (dbError) {
        electronLog.error('이베스 초기류:', dbError);
        if (!isDevelopment) {
          throw dbError; // 로션서류 파
        }
      }
    } else {
      electronLog.info('데이터베이스 초기화 건너뜀 - 데이터베이스 사용 설정이 false입니다');
    }
    
    createWindow();

    // 동 백업 정 (매일 정행)
    cron.schedule('0 0 * * *', () => {
      createBackup(backupDir)
        .then(() => electronLog.info('동 백업 료'))
        .catch(err => electronLog.error('동 백업 패:', err));
    });

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
    filters: [{ name: 'Excel 일', extensions: ['xlsx', 'xls'] }]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 수동 백업 실행
ipcMain.handle('manual-backup', async () => {
  try {
    const backupPath = await createBackup(backupDir);
    return { success: true, path: backupPath };
  } catch (error) {
    electronLog.error('동 백업 패:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 회원 관리 API

// 모든 회원 조회
ipcMain.handle('get-all-members', () => {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스 연결이 초기화되지 않았습니다.');
    }

    const members = db.prepare(`
      SELECT 
        id, name, phone, email, gender, 
        birth_date as birthDate, 
        join_date as joinDate, 
        membership_type as membershipType, 
        membership_start as membershipStart, 
        membership_end as membershipEnd, 
        last_visit as lastVisit, 
        notes,
        staff_id as staffId,
        staff_name as staffName,
        created_at as createdAt, 
        updated_at as updatedAt
      FROM members
      ORDER BY name
    `).all();
    
    return { success: true, data: members };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('회원 목록 조회 오류:', errorMessage);
    return { success: false, error: errorMessage };
  }
});

// 회원 추가
ipcMain.handle('add-member', (_, member) => {
  try {
    if (!member.name) {
      throw new Error('회원 이름은 필수 입력 항목입니다.');
    }

    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스 연결이 초기화되지 않았습니다.');
    }

    const now = new Date().toISOString();
    
    const result = db.prepare(`
      INSERT INTO members (
        name, phone, email, gender, birth_date, join_date, 
        membership_type, membership_start, membership_end, 
        notes, staff_id, staff_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      member.name, 
      member.phone || null, 
      member.email || null, 
      member.gender || null, 
      member.birthDate || null, 
      member.joinDate, 
      member.membershipType || null, 
      member.membershipStart || null, 
      member.membershipEnd || null, 
      member.notes || null,
      member.staffId || null,
      member.staffName || null,
      now, 
      now
    );
    
    if (!result.changes) {
      throw new Error('회원 추가에 실패했습니다.');
    }

    return { 
      success: true, 
      id: result.lastInsertRowid 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('회원 추가 오류:', errorMessage);
    return { success: false, error: errorMessage };
  }
});

// 회원 수정
ipcMain.handle('update-member', (_, member) => {
  try {
    if (!member.id) {
      throw new Error('회원 ID가 필요합니다.');
    }
    if (!member.name) {
      throw new Error('회원 이름은 필수 입력 항목입니다.');
    }
    
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스 연결이 초기화되지 않았습니다.');
    }

    const now = new Date().toISOString();
    
    const result = db.prepare(`
      UPDATE members SET
        name = ?,
        phone = ?,
        email = ?,
        gender = ?,
        birth_date = ?,
        join_date = ?,
        membership_type = ?,
        membership_start = ?,
        membership_end = ?,
        notes = ?,
        staff_id = ?,
        staff_name = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      member.name, 
      member.phone || null, 
      member.email || null, 
      member.gender || null, 
      member.birthDate || null, 
      member.joinDate, 
      member.membershipType || null, 
      member.membershipStart || null, 
      member.membershipEnd || null, 
      member.notes || null,
      member.staffId || null,
      member.staffName || null,
      now,
      member.id
    );
    
    if (!result.changes) {
      throw new Error('회원 정보를 찾을 수 없거나 업데이트에 실패했습니다.');
    }

    return { 
      success: true, 
      updated: result.changes > 0 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('회원 수정 오류:', errorMessage);
    return { success: false, error: errorMessage };
  }
});

// 회원 삭제
ipcMain.handle('delete-member', (_, id) => {
  try {
    if (!id) {
      throw new Error('삭제할 회원 ID가 필요합니다.');
    }

    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스 연결이 초기화되지 않았습니다.');
    }
    
    // 트랜잭션 시작
    const deleteTransaction = db.transaction(() => {
      try {
        // 해당 회원의 출석 기록 삭제
        db.prepare('DELETE FROM attendance WHERE member_id = ?').run(id);
        
        // 해당 회원의 결제 기록 삭제
        db.prepare('DELETE FROM payments WHERE member_id = ?').run(id);
        
        // 회원 정보 삭제
        const result = db.prepare('DELETE FROM members WHERE id = ?').run(id);
        
        if (!result.changes) {
          throw new Error('회원을 찾을 수 없습니다.');
        }

        return result.changes > 0;
      } catch (error) {
        throw new Error(`회원 삭제 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      }
    });
    
    const deleted = deleteTransaction();
    return { success: true, deleted };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    electronLog.error(`ID가 ${id}인 회원 삭제 오류:`, errorMessage);
    return { success: false, error: errorMessage };
  }
});

// 대시보드 통계 데이터 가져오기
ipcMain.handle('get-dashboard-stats', () => {
  try {
    const db = getDatabase();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    // 1. 총 회원 수
    const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count;

    // 2. 활성 회원 수 (회원권이 유효한 회원)
    const activeMembers = db.prepare(`
      SELECT COUNT(*) as count FROM members 
      WHERE membership_end >= ? OR membership_end IS NULL
    `).get(today).count;

    // 3. 이번달 신규 회원 수
    const newMembersThisMonth = db.prepare(`
      SELECT COUNT(*) as count FROM members 
      WHERE join_date >= ?
    `).get(firstDayOfMonth).count;

    // 4. 오늘 출석 회원 수
    const attendanceToday = db.prepare(`
      SELECT COUNT(*) as count FROM attendance 
      WHERE visit_date = ?
    `).get(today).count;

    // 5. 회원권 종류별 분포
    const membershipDistribution = db.prepare(`
      SELECT membership_type as type, COUNT(*) as count 
      FROM members 
      WHERE membership_type IS NOT NULL
      GROUP BY membership_type
    `).all();

    // 6. 최근 6개월 월별 방문 통계
    const monthlyAttendance = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = month.toISOString().split('T')[0];
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const count = db.prepare(`
        SELECT COUNT(*) as count FROM attendance 
        WHERE visit_date BETWEEN ? AND ?
      `).get(monthStart, monthEnd).count;
      
      const monthName = month.toLocaleDateString('ko-KR', { month: 'long' });
      monthlyAttendance.push({
        month: monthName,
        count
      });
    }

    // 7. 최근 활동 (최근 가입한 회원 3명)
    const recentMembers = db.prepare(`
      SELECT id, name, join_date as joinDate FROM members 
      ORDER BY join_date DESC LIMIT 3
    `).all();

    // 8. 최근 출석 회원 3명
    const recentAttendance = db.prepare(`
      SELECT m.id, m.name, a.visit_date as visitDate
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      ORDER BY a.visit_date DESC, a.id DESC LIMIT 3
    `).all();

    return { 
      success: true, 
      data: {
        totalMembers,
        activeMembers,
        newMembersThisMonth,
        attendanceToday,
        membershipDistribution,
        monthlyAttendance,
        recentActivities: {
          recentMembers,
          recentAttendance
        }
      }
    };
  } catch (error) {
    electronLog.error('대시보드 통계 조회 오류:', error);
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

    const dataWithMemberNames = payments.map(p => {
      const member = members.find(m => m.id === p.memberId);
      return {
        ...p,
        memberName: member ? member.name : '알 수 없음' // memberName 필드 추가
      };
    });

    return { success: true, data: dataWithMemberNames };
  } catch (error) {
    electronLog.error('결제 목록 조회 IPC 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 결제 추가
ipcMain.handle('add-payment', async (_, paymentData) => { // paymentData는 Omit<Payment, 'id' | 'memberName'> 형태
  try {
    const newId = await paymentRepository.addPayment(paymentData);
    return { success: true, id: newId };
  } catch (error) {
    electronLog.error('결제 추가 IPC 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 결제 업데이트
ipcMain.handle('update-payment', async (_, paymentData) => { // paymentData는 Payment 형태 (id 포함, memberName 불포함)
  try {
    const { id, memberName, ...dataToUpdate } = paymentData; // id 추출, memberName 제거
    const success = await paymentRepository.updatePayment(id, dataToUpdate);
    return { success };
  } catch (error) {
    electronLog.error('결제 업데이트 IPC 오류:', error);
    return { success: false, error: (error as Error).message };
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
ipcMain.handle('add-membership-type', async (_, typeData) => { // typeData는 Omit<MembershipType, 'id'> 형태
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
ipcMain.handle('update-membership-type', async (_, typeData) => { // typeData는 MembershipType 형태 (id 포함)
  try {
    const { id, ...dataToUpdate } = typeData; // id 추출
    const success = await membershipTypeRepository.updateMembershipType(id, dataToUpdate);
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
    const db = getDatabase();
    const staff = db.prepare(`
      SELECT id, name, phone, email, position, isActive, createdAt, updatedAt
      FROM staff
      WHERE isActive = 1
      ORDER BY name ASC
    `).all();
    return { success: true, data: staff };
  } catch (error) {
    console.error('직원 목록 가져오기 오류:', error);
    return { success: false, error: '직원 목록을 가져오는데 실패했습니다.' };
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
ipcMain.handle('add-staff', async (_, staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const id = await staffRepository.addStaff(staff);
    return { success: true, data: id };
  } catch (error) {
    electronLog.error('스태프 추가 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

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

// 모든 락커 조회
ipcMain.handle('get-all-lockers', async () => {
  try {
    const lockers = await lockerRepository.getAllLockers();
    return { success: true, data: lockers };
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
ipcMain.handle('add-locker', async (_, locker: Omit<Locker, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const id = await lockerRepository.addLocker(locker);
    return { success: true, data: id };
  } catch (error) {
    electronLog.error('락커 추가 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 락커 정보 업데이트
ipcMain.handle('update-locker', async (_, id: number, locker: Partial<Locker>) => {
  try {
    const success = await lockerRepository.updateLocker(id, locker);
    return { success };
  } catch (error) {
    electronLog.error('락커 업데이트 오류:', error);
    return { success: false, error: (error as Error).message };
  }
});

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

// 추가해야 할 main.ts 코드 (참고용)
ipcMain.handle('get-attendance-by-date', async (event, date) => {
  try {
    // 데이터베이스에서 해당 날짜의 출석 데이터 조회 로직
    const db = getDatabase();
    
    // 날짜 형식이 올바른지 확인
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {
        success: false,
        error: '올바른 날짜 형식이 아닙니다.'
      };
    }
    
    // SQL 쿼리 실행
    const query = `
      SELECT a.id, a.member_id as memberId, m.name as memberName, a.visit_date as visitDate
      FROM attendance a
      LEFT JOIN members m ON a.member_id = m.id
      WHERE a.visit_date = ?
    `;
    
    const attendanceRecords = db.prepare(query).all(date);
    return {
      success: true,
      data: attendanceRecords
    };
  } catch (error) {
    electronLog.error('날짜별 출석 조회 오류:', error);
    return {
      success: false,
      error: '출석 데이터 조회 중 오류가 발생했습니다.'
    };
  }
});

// 회원 목록 페이지네이션 조회
ipcMain.handle('get-members-pagination', async (_, page, pageSize, options) => {
  try {
    if (!useDatabase) {
      throw new Error('데이터베이스가 비활성화되어 있습니다.');
    }

    const result = await memberRepository.getMembersWithPagination(page, pageSize, options);
    return { 
      success: true, 
      data: result 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('회원 목록 페이지네이션 조회 오류:', errorMessage);
    return { 
      success: false, 
      error: errorMessage,
      data: { members: [], total: 0 }
    };
  }
});

// 엑셀 회원 데이터 임포트
ipcMain.handle('import-members-excel', async (_, data) => {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스 연결이 초기화되지 않았습니다.');
    }

    const now = new Date().toISOString();
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // 트랜잭션 시작
    db.prepare('BEGIN TRANSACTION').run();

    try {
      for (const row of data) {
        try {
          // 필수 필드 검증
          if (!row.name) {
            throw new Error('이름은 필수 입력 항목입니다.');
          }

          // 데이터 정제
          const member = {
            name: row.name,
            phone: row.phone || null,
            email: row.email || null,
            gender: row.gender || null,
            birthDate: row.birthDate || null,
            joinDate: row.joinDate || now,
            membershipType: row.membershipType || null,
            membershipStart: row.membershipStart || null,
            membershipEnd: row.membershipEnd || null,
            notes: row.notes || null,
            staffId: row.staffId || null,
            staffName: row.staffName || null
          };

          // 회원 추가
          const result = db.prepare(`
            INSERT INTO members (
              name, phone, email, gender, birth_date, join_date, 
              membership_type, membership_start, membership_end, 
              notes, staff_id, staff_name, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            member.name,
            member.phone,
            member.email,
            member.gender,
            member.birthDate,
            member.joinDate,
            member.membershipType,
            member.membershipStart,
            member.membershipEnd,
            member.notes,
            member.staffId || null,
            member.staffName || null,
            now,
            now
          );

          if (result.changes > 0) {
            successCount++;
          } else {
            throw new Error('회원 추가 실패');
          }
        } catch (error) {
          failedCount++;
          errors.push(`${row.name || '알 수 없음'}: ${error.message}`);
        }
      }

      // 트랜잭션 커밋
      db.prepare('COMMIT').run();

      return {
        success: true,
        data: {
          successCount,
          failedCount,
          errors
        }
      };
    } catch (error) {
      // 트랜잭션 롤백
      db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    electronLog.error('엑셀 회원 데이터 임포트 오류:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}); 
