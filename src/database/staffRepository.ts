import { getDatabase } from './setup';
import { Staff } from '../models/types';
import * as electronLog from 'electron-log';
import {
  getUnixTime,
  fromUnixTime,
  parseISO,
  isValid,
  format,
} from 'date-fns';

// Helper function to convert date string or Date object to Unix timestamp (seconds)
function toTimestamp(dateValue: string | Date | undefined | null): number | null {
  if (!dateValue) return null;
  const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  if (!isValid(date)) return null;
  return getUnixTime(date);
}

// Helper function to convert Unix timestamp (seconds) to ISO string (YYYY-MM-DD)
function fromTimestampToISO(timestamp: number | undefined | null): string | null {
  if (timestamp === null || timestamp === undefined) return null;
  const date = fromUnixTime(timestamp);
  if (!isValid(date)) return null;
  return format(date, 'yyyy-MM-dd');
}

function mapRowToStaff(row: any): Staff {
  const staff: Partial<Staff> = {
    id: row.id,
    name: row.name,
    position: row.position,
    phone: row.phone || null,
    email: row.email || null,
    hireDate: fromTimestampToISO(row.hire_date)!,
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
  };
  if (row.created_at !== undefined && row.created_at !== null) {
    staff.createdAt = fromTimestampToISO(row.created_at);
  }
  if (row.updated_at !== undefined && row.updated_at !== null) {
    staff.updatedAt = fromTimestampToISO(row.updated_at);
  }
  return staff as Staff;
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
    return rows.map(mapRowToStaff);
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
    return row ? mapRowToStaff(row) : null;
  } catch (error) {
    electronLog.error('스태프 조회 오류:', error);
    throw error;
  }
}

// Staff 타입에서 id, createdAt, updatedAt은 자동 생성/관리되므로 제외
type StaffCreationData = Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>;

export async function addStaff(
  staffData: StaffCreationData,
): Promise<number> {
  try {
    const db = getDatabase();
    const now = getUnixTime(new Date()); // Unix timestamp
    const query = `
      INSERT INTO staff (
        name, position, phone, email, hire_date,
        status, permissions, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = db
      .prepare(query)
      .run(
        staffData.name,
        staffData.position,
        staffData.phone || null,
        staffData.email || null,
        toTimestamp(staffData.hireDate), // Unix timestamp로 변환 (hireDate는 StaffCreationData에서 필수)
        staffData.status,
        JSON.stringify(staffData.permissions),
        staffData.notes || null,
        now, // created_at
        now, // updated_at
      );
    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('스태프 추가 오류:', error);
    throw error;
  }
}

// Staff 타입에서 id, createdAt, updatedAt은 직접 수정 불가. 날짜 필드는 string | Date | null 허용
type StaffUpdateData = Partial<Omit<Staff, 'id' | 'createdAt' | 'updatedAt'> > & {
    hireDate?: string | Date | null; 
};

export async function updateStaff(
  id: number,
  staffData: StaffUpdateData,
): Promise<boolean> {
  try {
    const db = getDatabase();
    const now = getUnixTime(new Date()); // Unix timestamp for updated_at
    const updates: string[] = [];
    const values: any[] = [];

    if (staffData.name !== undefined) {
      updates.push('name = ?');
      values.push(staffData.name);
    }
    if (staffData.position !== undefined) {
      updates.push('position = ?');
      values.push(staffData.position);
    }
    if (staffData.phone !== undefined) {
      updates.push('phone = ?');
      values.push(staffData.phone || null);
    }
    if (staffData.email !== undefined) {
      updates.push('email = ?');
      values.push(staffData.email || null);
    }
    if (staffData.hireDate !== undefined) {
      updates.push('hire_date = ?');
      values.push(toTimestamp(staffData.hireDate)); // Unix timestamp로 변환
    }
    if (staffData.status !== undefined) {
      updates.push('status = ?');
      values.push(staffData.status);
    }
    if (staffData.permissions !== undefined) {
      updates.push('permissions = ?');
      values.push(JSON.stringify(staffData.permissions));
    }
    if (staffData.notes !== undefined) {
      updates.push('notes = ?');
      values.push(staffData.notes || null);
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
