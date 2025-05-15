import { getDatabase } from './setup';
import { Staff } from '../models/types';
import * as electronLog from 'electron-log';

// DB 컬럼 이름과 인터페이스 필드 이름 매핑
function mapStaffToModel(row: any): Staff {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    phone: row.phone || null,
    email: row.email || null,
    hireDate: row.hire_date,
    status: row.status,
    permissions: row.permissions
      ? JSON.parse(row.permissions)
      : {
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
    notes: row.notes || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 모든 스태프 조회
export async function getAllStaff(): Promise<Staff[]> {
  try {
    const db = getDatabase();
    const query = `
      SELECT 
        id, name, position, phone, email, hire_date,
        status, permissions, notes, created_at, updated_at
      FROM staff
      ORDER BY name
    `;
    const rows = db.prepare(query).all();
    return rows.map(mapStaffToModel);
  } catch (error) {
    electronLog.error('스태프 목록 조회 오류:', error);
    throw error;
  }
}

// ID로 스태프 조회
export async function getStaffById(id: number): Promise<Staff | null> {
  try {
    const db = getDatabase();
    const query = `
      SELECT 
        id, name, position, phone, email, hire_date,
        status, permissions, notes, created_at, updated_at
      FROM staff
      WHERE id = ?
    `;
    const row = db.prepare(query).get(id);
    return row ? mapStaffToModel(row) : null;
  } catch (error) {
    electronLog.error('스태프 조회 오류:', error);
    throw error;
  }
}

// 새 스태프 추가
export async function addStaff(
  staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<number> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const query = `
      INSERT INTO staff (
        name, position, phone, email, hire_date,
        status, permissions, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = db
      .prepare(query)
      .run(
        staff.name,
        staff.position,
        staff.phone || null,
        staff.email || null,
        staff.hireDate,
        staff.status,
        JSON.stringify(staff.permissions),
        staff.notes || null,
        now,
        now,
      );
    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('스태프 추가 오류:', error);
    throw error;
  }
}

// 스태프 정보 업데이트
export async function updateStaff(
  id: number,
  staff: Partial<Staff>,
): Promise<boolean> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if ('name' in staff) {
      updates.push('name = ?');
      values.push(staff.name);
    }
    if ('position' in staff) {
      updates.push('position = ?');
      values.push(staff.position);
    }
    if ('phone' in staff) {
      updates.push('phone = ?');
      values.push(staff.phone || null);
    }
    if ('email' in staff) {
      updates.push('email = ?');
      values.push(staff.email || null);
    }
    if ('hireDate' in staff) {
      updates.push('hire_date = ?');
      values.push(staff.hireDate);
    }
    if ('status' in staff) {
      updates.push('status = ?');
      values.push(staff.status);
    }
    if ('permissions' in staff) {
      updates.push('permissions = ?');
      values.push(JSON.stringify(staff.permissions));
    }
    if ('notes' in staff) {
      updates.push('notes = ?');
      values.push(staff.notes || null);
    }

    if (updates.length === 0) {
      return false;
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const query = `UPDATE staff SET ${updates.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...values);
    return result.changes > 0;
  } catch (error) {
    electronLog.error('스태프 업데이트 오류:', error);
    throw error;
  }
}

// 스태프 삭제
export async function deleteStaff(id: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const query = `DELETE FROM staff WHERE id = ?`;
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  } catch (error) {
    electronLog.error('스태프 삭제 오류:', error);
    throw error;
  }
}
