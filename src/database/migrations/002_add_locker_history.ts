/**
 * 락커 히스토리 테이블 마이그레이션
 * 락커 상태 변경 및 사용 이력 추적을 위한 테이블 생성
 */

import { Database } from 'better-sqlite3';
import * as electronLog from 'electron-log';

export function addLockerHistoryTable(db: Database): void {
  try {
    electronLog.info('락커 히스토리 테이블 생성 시작...');

    // locker_history 테이블 생성
    db.exec(`
      CREATE TABLE IF NOT EXISTS locker_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        locker_id INTEGER NOT NULL,
        locker_number TEXT NOT NULL,
        member_id INTEGER,
        member_name TEXT,
        action TEXT NOT NULL,
        previous_status TEXT NOT NULL,
        new_status TEXT NOT NULL,
        start_date INTEGER,
        end_date INTEGER,
        amount INTEGER,
        notes TEXT,
        staff_id INTEGER,
        staff_name TEXT,
        created_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
        updated_at INTEGER DEFAULT (cast(strftime('%s', 'now') as integer)),
        FOREIGN KEY (locker_id) REFERENCES lockers(id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
      )
    `);

    // locker_history 테이블 인덱스 생성 (검색 성능 향상)
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_locker_history_locker_id 
      ON locker_history(locker_id)
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_locker_history_member_id 
      ON locker_history(member_id)
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_locker_history_action 
      ON locker_history(action)
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_locker_history_created_at 
      ON locker_history(created_at)
    `);

    // 기존 락커 데이터를 히스토리에 초기 데이터로 추가
    const existingLockers = db.prepare(`
      SELECT id, number, status, member_id, start_date, created_at 
      FROM lockers 
      WHERE member_id IS NOT NULL
    `).all() as Array<{
      id: number;
      number: string;
      status: string;
      member_id: number;
      start_date: number | null;
      created_at: number;
    }>;

    electronLog.info(`기존 락커 ${existingLockers.length}개의 초기 히스토리 생성 중...`);

    const insertHistory = db.prepare(`
      INSERT INTO locker_history (
        locker_id, locker_number, member_id, action, 
        previous_status, new_status, start_date, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const locker of existingLockers) {
      try {
        insertHistory.run(
          locker.id,
          locker.number,
          locker.member_id,
          'assign',
          'available',
          locker.status,
          locker.start_date,
          locker.created_at
        );
      } catch (error) {
        electronLog.warn(`락커 ${locker.number} 히스토리 생성 실패:`, error);
      }
    }

    electronLog.info('락커 히스토리 테이블 및 인덱스 생성 완료');
    electronLog.info(`초기 히스토리 데이터 ${existingLockers.length}개 생성 완료`);

  } catch (error) {
    electronLog.error('락커 히스토리 테이블 생성 오류:', error);
    throw error;
  }
}

export function addLockerStatisticsView(db: Database): void {
  try {
    electronLog.info('락커 통계 뷰 생성 시작...');

    // 락커 통계를 위한 뷰 생성
    db.exec(`
      CREATE VIEW IF NOT EXISTS v_locker_statistics AS
      SELECT 
        COUNT(*) as total_lockers,
        COUNT(CASE WHEN status = 'available' THEN 1 END) as available_lockers,
        COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied_lockers,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_lockers,
        ROUND(
          COUNT(CASE WHEN status = 'occupied' THEN 1 END) * 100.0 / COUNT(*), 
          2
        ) as occupancy_rate,
        ROUND(
          COUNT(CASE WHEN status = 'available' THEN 1 END) * 100.0 / COUNT(*), 
          2
        ) as availability_rate
      FROM lockers
    `);

    // 만료 예정 락커 뷰 생성
    db.exec(`
      CREATE VIEW IF NOT EXISTS v_expiring_lockers AS
      SELECT 
        l.id,
        l.number,
        l.end_date,
        m.name as member_name,
        CAST((l.end_date - strftime('%s', 'now')) / 86400 AS INTEGER) as days_remaining
      FROM lockers l
      JOIN members m ON l.member_id = m.id
      WHERE l.status = 'occupied' 
        AND l.end_date IS NOT NULL
        AND l.end_date > strftime('%s', 'now')
        AND (l.end_date - strftime('%s', 'now')) / 86400 <= 7
      ORDER BY days_remaining ASC
    `);

    electronLog.info('락커 통계 뷰 생성 완료');

  } catch (error) {
    electronLog.error('락커 통계 뷰 생성 오류:', error);
    throw error;
  }
} 