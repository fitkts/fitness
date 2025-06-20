import * as path from 'path';
import { app } from 'electron';
import * as fs from 'fs-extra';
import * as electronLog from 'electron-log';

// 데이터베이스 모듈을 동적으로 로드
let Database: any;
try {
  const betterSqlite3 = require('better-sqlite3');
  Database = betterSqlite3;
  electronLog.info('Better-sqlite3 모듈 로드 성공');
} catch (error) {
  electronLog.error('Better-sqlite3 모듈 로드 실패:', error);
  Database = null;
}

let db: any = null;

// 데이터베이스 경로 설정 함수
function getDbPath(): string {
  try {
    // app이 ready 상태인지 확인
    if (app && typeof app.getPath === 'function') {
      return path.join(app.getPath('userData'), 'fitness.db');
    } else {
      // 개발 환경에서는 임시 경로 사용
      let tempPath = '';

      if (process.env.NODE_ENV === 'development') {
        tempPath = path.join(__dirname, '../../temp', 'fitness.db');
      } else {
        // 안전하게 경로 확인
        const appData = process.env.APPDATA || '';
        const home = process.env.HOME || '';
        const basePath = appData || home || __dirname;
        tempPath = path.join(basePath, 'fitness.db');
      }

      electronLog.warn(
        'Electron app 객체가 준비되지 않음. 임시 경로 사용:',
        tempPath,
      );
      return tempPath;
    }
  } catch (error) {
    const fallbackPath = path.join(__dirname, '../../temp', 'fitness.db');
    electronLog.error('데이터베이스 경로 설정 오류:', error);
    electronLog.warn('대체 경로 사용:', fallbackPath);
    return fallbackPath;
  }
}

// 데이터베이스 인스턴스 반환
export function getDatabase(): any {
  if (!db) {
    if (process.env.NODE_ENV === 'development') {
      // 개발 환경에서는 더미 데이터베이스 객체 반환
      electronLog.warn('개발 환경: 더미 데이터베이스 객체를 사용합니다.');
      return {
        prepare: () => ({
          run: () => ({ changes: 0, lastInsertRowid: 0 }),
          get: () => null,
          all: () => [],
        }),
        exec: () => {},
        transaction: (fn: any) => fn,
        close: () => {},
      };
    } else {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
  }
  return db;
}

// 데이터베이스 연결 종료
export function closeDatabase(): void {
  if (db && typeof db.close === 'function') {
    try {
      db.close();
      electronLog.info('데이터베이스 연결 종료');
    } catch (error) {
      electronLog.error('데이터베이스 연결 종료 오류:', error);
    }
  }
}

// 마이그레이션 관리를 위한 테이블 생성
function createMigrationsTable(db: any): void {
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        executed_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer))
      )
    `);
    electronLog.info('migrations 테이블 생성 완료');
  } catch (error) {
    electronLog.error('migrations 테이블 생성 실패:', error);
    throw error;
  }
}

// 마이그레이션 실행 여부 확인
function isMigrationExecuted(db: any, migrationName: string): boolean {
  try {
    const result = db.prepare('SELECT id FROM migrations WHERE name = ?').get(migrationName);
    return !!result;
  } catch (error) {
    electronLog.error(`마이그레이션 확인 실패 (${migrationName}):`, error);
    return false;
  }
}

// 마이그레이션 실행 기록
function recordMigration(db: any, migrationName: string): void {
  try {
    db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migrationName);
    electronLog.info(`마이그레이션 기록됨: ${migrationName}`);
  } catch (error) {
    electronLog.error(`마이그레이션 기록 실패 (${migrationName}):`, error);
    throw error;
  }
}

// 향상된 이용권 시스템 마이그레이션
function migrateEnhancedMembershipTypes(db: any): void {
  const migrationName = 'add_membership_category_and_pt_type_columns';
  
  if (isMigrationExecuted(db, migrationName)) {
    electronLog.info('향상된 이용권 시스템 마이그레이션이 이미 실행되었습니다.');
    return;
  }

  try {
    electronLog.info('향상된 이용권 시스템 마이그레이션을 시작합니다...');

    // 새로운 컬럼 추가
    try {
      db.exec(`ALTER TABLE membership_types ADD COLUMN membership_category TEXT DEFAULT 'monthly'`);
      electronLog.info('membership_category 컬럼 추가 완료');
    } catch (error) {
      electronLog.info('membership_category 컬럼이 이미 존재하거나 추가하지 못했습니다:', error);
    }

    try {
      db.exec(`ALTER TABLE membership_types ADD COLUMN pt_type TEXT NULL`);
      electronLog.info('pt_type 컬럼 추가 완료');
    } catch (error) {
      electronLog.info('pt_type 컬럼이 이미 존재하거나 추가하지 못했습니다:', error);
    }

    // 기존 데이터 마이그레이션: maxUses가 있으면 PT로, 없으면 월간으로 설정
    const existingTypes = db.prepare('SELECT id, max_uses FROM membership_types').all();
    
    for (const type of existingTypes) {
      if (type.max_uses && type.max_uses > 0) {
        // PT 회원권으로 설정 (횟수제)
        db.prepare(`
          UPDATE membership_types 
          SET membership_category = 'pt', pt_type = 'session_based' 
          WHERE id = ?
        `).run(type.id);
        electronLog.info(`ID ${type.id}: PT 횟수제로 마이그레이션`);
      } else {
        // 월간 회원권으로 설정
        db.prepare(`
          UPDATE membership_types 
          SET membership_category = 'monthly', pt_type = NULL 
          WHERE id = ?
        `).run(type.id);
        electronLog.info(`ID ${type.id}: 월간 회원권으로 마이그레이션`);
      }
    }

    // 마이그레이션 완료 기록
    recordMigration(db, migrationName);
    electronLog.info('향상된 이용권 시스템 마이그레이션 완료');

  } catch (error) {
    electronLog.error('향상된 이용권 시스템 마이그레이션 실패:', error);
    throw error;
  }
}

// 데이터베이스 초기화
export async function setupDatabase(): Promise<void> {
  try {
    // better-sqlite3 모듈이 로드되지 않은 경우
    if (!Database) {
      electronLog.warn('개발 환경에서 데이터베이스 없이 진행합니다.');
      return;
    }

    const dbPath = getDbPath();
    electronLog.info('데이터베이스 경로:', dbPath);

    // 데이터베이스 디렉토리 확인
    const dbDir = path.dirname(dbPath);
    await fs.ensureDir(dbDir);

    // 데이터베이스 파일 생성 및 연결
    try {
      const dbOptions: any = {
        fileMustExist: false,
      };
      
      if (process.env.NODE_ENV === 'development') {
        dbOptions.verbose = console.log;
      }

      if (Database) {
        db = new Database(dbPath, dbOptions);
        electronLog.info('데이터베이스 연결 성공:', dbPath);
      } else {
        throw new Error('데이터베이스 모듈이 로드되지 않았습니다.');
      }
    } catch (dbError) {
      electronLog.error('데이터베이스 연결 실패:', dbError);
      if (process.env.NODE_ENV === 'development') {
        electronLog.warn('개발 환경에서 데이터베이스 없이 진행합니다.');
        return;
      } else {
        throw dbError;
      }
    }

    electronLog.info('데이터베이스 초기화를 시작합니다...');

    // 먼저 마이그레이션 테이블 생성
    createMigrationsTable(db);

    // WAL 모드 및 외래 키 제약 조건 활성화
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // 트랜잭션으로 모든 테이블 생성을 래핑
    const transaction = db.transaction(() => {
      // members 테이블 생성
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            gender TEXT,
            birth_date INTEGER,
            join_date INTEGER NOT NULL,
            membership_type TEXT,
            membership_start INTEGER,
            membership_end INTEGER,
            last_visit INTEGER,
            notes TEXT,
            staff_id INTEGER,
            staff_name TEXT,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            updated_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer))
          )
        `);
        electronLog.info('members 테이블 생성/확인 완료');
      } catch (error) {
        electronLog.error('members 테이블 생성 실패:', error);
        throw error;
      }

      // attendance 테이블 생성
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            visit_date INTEGER NOT NULL,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
          )
        `);
        electronLog.info('attendance 테이블 생성/확인 완료');
      } catch (error) {
        electronLog.error('attendance 테이블 생성 실패:', error);
        throw error;
      }

      // payments 테이블 생성
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            amount INTEGER NOT NULL,
            payment_date INTEGER NOT NULL,
            payment_type TEXT NOT NULL,
            payment_method TEXT,
            membership_type TEXT,
            start_date INTEGER,
            end_date INTEGER,
            receipt_number TEXT,
            status TEXT DEFAULT '완료',
            description TEXT,
            notes TEXT,
            staff_id INTEGER,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
            FOREIGN KEY (staff_id) REFERENCES staff(id)
          )
        `);
        electronLog.info('payments 테이블 생성/확인 완료');
      } catch (error) {
        electronLog.error('payments 테이블 생성 실패:', error);
        throw error;
      }

      // membership_types 테이블 스키마 확인 및 생성
      let hasCorrectMembershipTypesSchema = false;
      try {
        db.exec(`
          SELECT duration_months FROM membership_types LIMIT 1;
        `);
        hasCorrectMembershipTypesSchema = true;
        electronLog.info('membership_types 테이블의 스키마가 정상입니다.');
      } catch (error) {
        electronLog.info(
          'membership_types 테이블의 스키마를 수정해야 합니다.',
        );
      }

      // 멤버십 타입 테이블이 정상이 아니면 삭제하고 다시 생성
      if (!hasCorrectMembershipTypesSchema) {
        try {
          electronLog.info(
            'membership_types 테이블을 삭제하고 다시 생성합니다.',
          );
          db.exec(`DROP TABLE IF EXISTS membership_types;`);
        } catch (error) {
          electronLog.error('membership_types 테이블 삭제 실패:', error);
        }
      }

      // 멤버십 타입 테이블 생성 (향상된 스키마)
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS membership_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            duration_months INTEGER NOT NULL DEFAULT 1,
            membership_category TEXT DEFAULT 'monthly',
            pt_type TEXT,
            is_active INTEGER DEFAULT 1,
            description TEXT,
            max_uses INTEGER,
            available_facilities TEXT,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            updated_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer))
          )
        `);
        electronLog.info('membership_types 테이블 생성/확인 완료');
      } catch (error) {
        electronLog.error('membership_types 테이블 생성 실패:', error);
        throw error;
      }

      // staff 테이블 생성
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            position TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            hire_date INTEGER NOT NULL,
            birth_date INTEGER,
            status TEXT NOT NULL,
            permissions TEXT NOT NULL,
            notes TEXT,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            updated_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer))
          )
        `);
        electronLog.info('staff 테이블 생성/확인 완료');
      } catch (error) {
        electronLog.error('staff 테이블 생성 실패:', error);
        throw error;
      }

      // lockers 테이블 생성
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS lockers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            number TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL DEFAULT 'available',
            size TEXT,
            location TEXT,
            fee_options TEXT,
            member_id INTEGER,
            start_date INTEGER,
            end_date INTEGER,
            notes TEXT,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            updated_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
          )
        `);
        electronLog.info('lockers 테이블 생성/확인 완료');
      } catch (error) {
        electronLog.error('lockers 테이블 생성 실패:', error);
        throw error;
      }

      // consultation_members 테이블 생성 (상담 회원용)
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS consultation_members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            gender TEXT,
            birth_date INTEGER,
            join_date INTEGER NOT NULL,
            first_visit INTEGER,
            membership_type TEXT,
            membership_start INTEGER,
            membership_end INTEGER,
            last_visit INTEGER,
            notes TEXT,
            staff_id INTEGER,
            staff_name TEXT,
            consultation_status TEXT DEFAULT 'pending',
            health_conditions TEXT,
            fitness_goals TEXT,
            is_promoted INTEGER DEFAULT 0,
            promoted_at INTEGER,
            promoted_member_id INTEGER,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            updated_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            FOREIGN KEY (staff_id) REFERENCES staff(id)
          )
        `);
        electronLog.info('consultation_members 테이블 생성/확인 완료');
      } catch (error) {
        electronLog.error('consultation_members 테이블 생성 실패:', error);
        throw error;
      }

      // locker_history 테이블 생성
      try {
        db.exec(`
          CREATE TABLE IF NOT EXISTS locker_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            locker_id INTEGER NOT NULL,
            locker_number TEXT NOT NULL,
            member_id INTEGER,
            member_name TEXT,
            action TEXT NOT NULL,
            start_date INTEGER,
            end_date INTEGER,
            payment_amount INTEGER,
            payment_method TEXT,
            notes TEXT,
            staff_id INTEGER,
            staff_name TEXT,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            FOREIGN KEY (locker_id) REFERENCES lockers(id),
            FOREIGN KEY (member_id) REFERENCES members(id),
            FOREIGN KEY (staff_id) REFERENCES staff(id)
          )
        `);
        electronLog.info('locker_history 테이블 생성/확인 완료');
      } catch (error) {
        electronLog.error('locker_history 테이블 생성 실패:', error);
        throw error;
      }
    });

    // 트랜잭션 실행
    transaction();

    // 인덱스 생성
    try {
      db.exec(`CREATE INDEX IF NOT EXISTS idx_members_name ON members(name)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_members_phone ON members(phone)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_attendance_member_id ON attendance(member_id)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_attendance_visit_date ON attendance(visit_date)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_lockers_number ON lockers(number)`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_lockers_member_id ON lockers(member_id)`);
      electronLog.info('인덱스 생성 완료');
    } catch (error) {
      electronLog.error('인덱스 생성 실패:', error);
    }

    // 향상된 이용권 시스템 마이그레이션 실행
    migrateEnhancedMembershipTypes(db);

    electronLog.info('데이터베이스 초기화가 완료되었습니다.');

  } catch (error) {
    electronLog.error('데이터베이스 초기화 실패:', error);
    throw error;
  }
}
