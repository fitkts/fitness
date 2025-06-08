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
  // 빈 문자열이나 falsy 값 처리
  if (!dateValue || dateValue === '') return null;
  
  // 디버깅 로그
  electronLog.info('🔍 [toTimestamp] 변환 시도:', {
    input: dateValue,
    type: typeof dateValue,
  });
  
  const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  if (!isValid(date)) {
    electronLog.warn('🔍 [toTimestamp] 유효하지 않은 날짜:', dateValue);
    return null;
  }
  
  const timestamp = getUnixTime(date);
  electronLog.info('🔍 [toTimestamp] 변환 결과:', {
    input: dateValue,
    timestamp,
  });
  
  return timestamp;
}

// Helper function to convert Unix timestamp (seconds) to ISO string (YYYY-MM-DD)
function fromTimestampToISO(timestamp: number | undefined | null): string | null {
  if (timestamp === null || timestamp === undefined) return null;
  const date = fromUnixTime(timestamp);
  if (!isValid(date)) return null;
  
  // 디버깅 로그
  electronLog.info('🔍 [fromTimestampToISO] 변환:', {
    timestamp,
    date: date.toISOString(),
    formatted: format(date, 'yyyy-MM-dd'),
  });
  
  return format(date, 'yyyy-MM-dd');
}

function mapRowToStaff(row: any): Staff {
  // 디버깅: row 데이터 로그
  electronLog.info('🔍 [mapRowToStaff] 받은 row 데이터:', {
    id: row.id,
    name: row.name,
    birth_date: row.birth_date,
    birth_date_type: typeof row.birth_date,
    hire_date: row.hire_date,
  });

  const staff: Partial<Staff> = {
    id: row.id,
    name: row.name,
    position: row.position,
    phone: row.phone || null,
    email: row.email || null,
    hireDate: fromTimestampToISO(row.hire_date)!,
    birthDate: row.birth_date ? fromTimestampToISO(row.birth_date) : undefined,
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
  
  // 디버깅: 변환된 staff 데이터 로그
  electronLog.info('🔍 [mapRowToStaff] 변환된 staff 데이터:', {
    id: staff.id,
    name: staff.name,
    birthDate: staff.birthDate,
    hireDate: staff.hireDate,
  });
  
  return staff as Staff;
}

// 모든 스태프 조회
export async function getAllStaff(): Promise<Staff[]> {
  try {
    const db = getDatabase();
    const query = `
      SELECT 
        id, name, position, phone, email, hire_date, birth_date,
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
        id, name, position, phone, email, hire_date, birth_date,
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
    
    // 디버깅: 입력 데이터 로그
    electronLog.info('🔍 [addStaff] 받은 데이터:', {
      name: staffData.name,
      birthDate: staffData.birthDate,
      birthDateType: typeof staffData.birthDate,
      birthDateConverted: toTimestamp(staffData.birthDate),
    });
    
    const query = `
      INSERT INTO staff (
        name, position, phone, email, hire_date, birth_date,
        status, permissions, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      staffData.name,
      staffData.position,
      staffData.phone || null,
      staffData.email || null,
      toTimestamp(staffData.hireDate), // Unix timestamp로 변환 (hireDate는 StaffCreationData에서 필수)
      toTimestamp(staffData.birthDate), // Unix timestamp로 변환 (선택사항)
      staffData.status,
      JSON.stringify(staffData.permissions),
      staffData.notes || null,
      now, // created_at
      now, // updated_at
    ];
    
    // 디버깅: SQL 쿼리와 값들 로그
    electronLog.info('🔍 [addStaff] SQL 쿼리:', query);
    electronLog.info('🔍 [addStaff] SQL 값들:', values);
    
    const result = db.prepare(query).run(...values);
    
    electronLog.info('🔍 [addStaff] 결과:', { insertId: result.lastInsertRowid });
    
    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('스태프 추가 오류:', error);
    throw error;
  }
}

// Staff 타입에서 id, createdAt, updatedAt은 직접 수정 불가. 날짜 필드는 string | Date | null 허용
type StaffUpdateData = Partial<Omit<Staff, 'id' | 'createdAt' | 'updatedAt'> > & {
    hireDate?: string | Date | null; 
    birthDate?: string | Date | null; 
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

    // 디버깅: 입력 데이터 로그
    electronLog.info('🔍 [updateStaff] 받은 데이터:', {
      id,
      staffData,
      birthDate: staffData.birthDate,
      birthDateType: typeof staffData.birthDate,
      birthDateConverted: staffData.birthDate !== undefined ? toTimestamp(staffData.birthDate) : undefined,
    });

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
    if (staffData.birthDate !== undefined) {
      updates.push('birth_date = ?');
      values.push(toTimestamp(staffData.birthDate)); // Unix timestamp로 변환
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
      electronLog.info('🔍 [updateStaff] 업데이트할 필드가 없음');
      return false; 
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id); 

    const query = `UPDATE staff SET ${updates.join(', ')} WHERE id = ?`;
    
    // 디버깅: SQL 쿼리와 값들 로그
    electronLog.info('🔍 [updateStaff] SQL 쿼리:', query);
    electronLog.info('🔍 [updateStaff] SQL 값들:', values);
    
    const result = db.prepare(query).run(...values);
    
    electronLog.info('🔍 [updateStaff] 결과:', { changes: result.changes });
    
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
