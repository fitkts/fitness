import * as path from 'path';
import { app } from 'electron';
import * as fs from 'fs-extra';
import * as electronLog from 'electron-log';

// 데이터베이스 모듈을 동적으로 로드
let Database: any;
try {
  // require 대신 import 사용
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
      // 옵션 객체를 먼저 정의
      const dbOptions: any = {
        fileMustExist: false,
      };
      // 개발 모드일 때만 verbose 옵션 추가
      if (process.env.NODE_ENV === 'development') {
        dbOptions.verbose = console.log;
      }

      try {
        // 수정된 옵션 객체로 데이터베이스 생성
        if (Database) {
          db = new Database(dbPath, dbOptions);
          electronLog.info('데이터베이스 연결 성공:', dbPath);
        } else {
          throw new Error('데이터베이스 모듈이 로드되지 않았습니다.');
        }
      } catch (connError) {
        electronLog.error(
          '데이터베이스 연결 실패. 경로 또는 모듈 문제:',
          connError,
        );
        throw connError;
      }
    } catch (dbError) {
      electronLog.error('데이터베이스 연결 실패:', dbError);
      // 개발 모드에서는 오류가 있어도 계속 진행
      if (process.env.NODE_ENV === 'development') {
        electronLog.warn('개발 환경에서 데이터베이스 없이 진행합니다.');
        return;
      } else {
        throw dbError;
      }
    }

    // 테이블 생성 시도
    if (db) {
      try {
        // 회원 테이블 생성
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
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            updated_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer))
          )
        `);

        // 출석 테이블 생성
        db.exec(`
          CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            visit_date INTEGER NOT NULL,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            FOREIGN KEY (member_id) REFERENCES members(id)
          )
        `);

        // 결제 테이블 생성
        db.exec(`
          CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            amount INTEGER NOT NULL,
            payment_date INTEGER NOT NULL,
            payment_type TEXT NOT NULL,
            description TEXT,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            FOREIGN KEY (member_id) REFERENCES members(id)
          )
        `);

        // 결제 테이블에 payment_method 컬럼 추가
        try {
          db.exec(`
            SELECT payment_method FROM payments LIMIT 1;
          `);
          electronLog.info('payment_method 컬럼이 이미 존재합니다.');
        } catch (error) {
          electronLog.info('payment_method 컬럼 추가 중...');
          db.exec(`
            ALTER TABLE payments ADD COLUMN payment_method TEXT;
          `);
        }

        // 결제 테이블에 membership_type 컬럼 추가
        try {
          db.exec(`
            SELECT membership_type FROM payments LIMIT 1;
          `);
          electronLog.info('membership_type 컬럼이 이미 존재합니다.');
        } catch (error) {
          electronLog.info('membership_type 컬럼 추가 중...');
          db.exec(`
            ALTER TABLE payments ADD COLUMN membership_type TEXT;
          `);
        }

        // 결제 테이블에 start_date 컬럼 추가
        try {
          db.exec(`
            SELECT start_date FROM payments LIMIT 1;
          `);
          electronLog.info('start_date 컬럼이 이미 존재합니다.');
        } catch (error) {
          electronLog.info('start_date 컬럼 추가 중...');
          db.exec(`
            ALTER TABLE payments ADD COLUMN start_date INTEGER;
          `);
        }

        // 결제 테이블에 end_date 컬럼 추가
        try {
          db.exec(`
            SELECT end_date FROM payments LIMIT 1;
          `);
          electronLog.info('end_date 컬럼이 이미 존재합니다.');
        } catch (error) {
          electronLog.info('end_date 컬럼 추가 중...');
          db.exec(`
            ALTER TABLE payments ADD COLUMN end_date INTEGER;
          `);
        }

        // 결제 테이블에 receipt_number 컬럼 추가
        try {
          db.exec(`
            SELECT receipt_number FROM payments LIMIT 1;
          `);
          electronLog.info('receipt_number 컬럼이 이미 존재합니다.');
        } catch (error) {
          electronLog.info('receipt_number 컬럼 추가 중...');
          db.exec(`
            ALTER TABLE payments ADD COLUMN receipt_number TEXT;
          `);
        }

        // 결제 테이블에 status 컬럼 추가
        try {
          db.exec(`
            SELECT status FROM payments LIMIT 1;
          `);
          electronLog.info('status 컬럼이 이미 존재합니다.');
        } catch (error) {
          electronLog.info('status 컬럼 추가 중...');
          db.exec(`
            ALTER TABLE payments ADD COLUMN status TEXT DEFAULT '완료';
          `);
        }

        // 결제 테이블에 notes 컬럼 추가
        try {
          db.exec(`
            SELECT notes FROM payments LIMIT 1;
          `);
          electronLog.info('notes 컬럼이 이미 존재합니다.');
        } catch (error) {
          electronLog.info('notes 컬럼 추가 중...');
          db.exec(`
            ALTER TABLE payments ADD COLUMN notes TEXT;
          `);
        }

        // 결제 테이블에 staff_id 컬럼 추가
        try {
          db.exec(`
            SELECT staff_id FROM payments LIMIT 1;
          `);
          electronLog.info('staff_id 컬럼이 이미 존재합니다.');
        } catch (error) {
          electronLog.info('staff_id 컬럼 추가 중...');
          db.exec(`
            ALTER TABLE payments ADD COLUMN staff_id INTEGER;
          `);
        }

        // 기존 membership_types 테이블이 있는지 확인
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

          // 멤버십 타입 테이블 생성
          db.exec(`
            CREATE TABLE IF NOT EXISTS membership_types (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              price INTEGER NOT NULL,
              duration_months INTEGER NOT NULL DEFAULT 1,
              is_active INTEGER DEFAULT 1,
              description TEXT,
              max_uses INTEGER,
              available_facilities TEXT,
              created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
              updated_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer))
            )
          `);
        }

        // 스태프 테이블 생성
        db.exec(`
          CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            position TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            hire_date INTEGER NOT NULL,
            status TEXT NOT NULL,
            permissions TEXT NOT NULL,
            notes TEXT,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            updated_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer))
          )
        `);

        // 락커 테이블 생성 (기본 구조)
        db.exec(`
          CREATE TABLE IF NOT EXISTS lockers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            number TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL DEFAULT 'available',
            size TEXT,
            location TEXT,
            fee_options TEXT, -- JSON 문자열로 요금 옵션 저장
            member_id INTEGER,
            start_date INTEGER,
            end_date INTEGER,
            notes TEXT,
            created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            updated_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
            FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
          )
        `);
        electronLog.info('락커 테이블 (lockers) 스키마 확인/생성/수정 완료.');

        // lockers 테이블에 size 컬럼 추가 (존재하지 않을 경우)
        try {
          db.exec(`SELECT size FROM lockers LIMIT 1;`);
          electronLog.info('lockers 테이블에 size 컬럼이 이미 존재합니다.');
        } catch (error) {
          electronLog.info('lockers 테이블에 size 컬럼 추가 중...');
          db.exec(`ALTER TABLE lockers ADD COLUMN size TEXT;`);
        }

        // lockers 테이블에 location 컬럼 추가 (존재하지 않을 경우)
        try {
          db.exec(`SELECT location FROM lockers LIMIT 1;`);
          electronLog.info('lockers 테이블에 location 컬럼이 이미 존재합니다.');
        } catch (error) {
          electronLog.info('lockers 테이블에 location 컬럼 추가 중...');
          db.exec(`ALTER TABLE lockers ADD COLUMN location TEXT;`);
        }

        // lockers 테이블에 fee_options 컬럼 추가 (존재하지 않을 경우)
        try {
          db.exec(`SELECT fee_options FROM lockers LIMIT 1;`);
          electronLog.info('lockers 테이블에 fee_options 컬럼이 이미 존재합니다.');
        } catch (error) {
          electronLog.info('lockers 테이블에 fee_options 컬럼 추가 중...');
          db.exec(`ALTER TABLE lockers ADD COLUMN fee_options TEXT;`);
        }
        
        // 다른 staff, settings 등의 테이블 생성/수정 로직이 있다면 그 이후에...
        electronLog.info('데이터베이스 스키마 설정 완료.');
      } catch (tableError) {
        electronLog.error('테이블 생성 오류:', tableError);
        // 개발 모드에서는 오류가 있어도 계속 진행
        if (process.env.NODE_ENV === 'development') {
          electronLog.warn('개발 환경에서 테이블 없이 진행합니다.');
        } else {
          throw tableError;
        }
      }
    }

    return;
  } catch (error) {
    electronLog.error('데이터베이스 초기화 오류:', error);
    // 개발 모드에서는 오류가 있어도 계속 진행
    if (process.env.NODE_ENV !== 'development') {
      throw error;
    }
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
