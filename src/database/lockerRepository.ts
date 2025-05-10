import { getDatabase } from './setup';
import { Locker } from '../models/types';
import * as electronLog from 'electron-log';

// DB 컬럼 이름과 인터페이스 필드 이름 매핑
function mapLockerToModel(row: any): Locker {
  return {
    id: row.id,
    number: row.number,
    status: row.status,
    memberId: row.member_id || undefined,
    memberName: row.member_name || undefined,
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 모든 락커 조회
export async function getAllLockers(): Promise<Locker[]> {
  try {
    const db = getDatabase();
    const query = `
      SELECT 
        l.id, l.number, l.status, l.member_id, l.start_date, l.end_date, l.notes,
        l.created_at, l.updated_at,
        m.name as member_name
      FROM lockers l
      LEFT JOIN members m ON l.member_id = m.id
      ORDER BY CAST(l.number AS INTEGER)
    `;
    const rows = db.prepare(query).all();
    return rows.map(mapLockerToModel);
  } catch (error) {
    electronLog.error('락커 목록 조회 오류:', error);
    throw error;
  }
}

// ID로 락커 조회
export async function getLockerById(id: number): Promise<Locker | null> {
  try {
    const db = getDatabase();
    const query = `
      SELECT 
        l.id, l.number, l.status, l.member_id, l.start_date, l.end_date, l.notes,
        l.created_at, l.updated_at,
        m.name as member_name
      FROM lockers l
      LEFT JOIN members m ON l.member_id = m.id
      WHERE l.id = ?
    `;
    const row = db.prepare(query).get(id);
    return row ? mapLockerToModel(row) : null;
  } catch (error) {
    electronLog.error('락커 조회 오류:', error);
    throw error;
  }
}

// 새 락커 추가
export async function addLocker(locker: Omit<Locker, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const query = `
      INSERT INTO lockers (
        number, status, member_id, start_date, end_date, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = db.prepare(query).run(
      locker.number,
      locker.status,
      locker.memberId || null,
      locker.startDate || null,
      locker.endDate || null,
      locker.notes || null,
      now,
      now
    );
    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('락커 추가 오류:', error);
    throw error;
  }
}

// 락커 정보 업데이트
export async function updateLocker(id: number, locker: Partial<Locker>): Promise<boolean> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if ('number' in locker) { updates.push('number = ?'); values.push(locker.number); }
    if ('status' in locker) { updates.push('status = ?'); values.push(locker.status); }
    if ('memberId' in locker) { updates.push('member_id = ?'); values.push(locker.memberId || null); }
    if ('startDate' in locker) { updates.push('start_date = ?'); values.push(locker.startDate || null); }
    if ('endDate' in locker) { updates.push('end_date = ?'); values.push(locker.endDate || null); }
    if ('notes' in locker) { updates.push('notes = ?'); values.push(locker.notes || null); }

    if (updates.length === 0) {
      return false;
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const query = `UPDATE lockers SET ${updates.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...values);
    return result.changes > 0;
  } catch (error) {
    electronLog.error('락커 업데이트 오류:', error);
    throw error;
  }
}

// 락커 삭제
export async function deleteLocker(id: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const query = `DELETE FROM lockers WHERE id = ?`;
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  } catch (error) {
    electronLog.error('락커 삭제 오류:', error);
    throw error;
  }
} 