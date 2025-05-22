import { getDatabase } from './setup';
import { MembershipType } from '../models/types'; // MembershipType 타입 임포트 (경로 확인)
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

// DB 컬럼 이름과 인터페이스 필드 이름 매핑 (snake_case -> camelCase)
function mapRowToMembershipType(row: any): MembershipType {
  const type: Partial<MembershipType> = {
    id: row.id,
    name: row.name,
    durationMonths: row.duration_months,
    price: row.price,
    isActive: !!row.is_active, // SQLite는 BOOLEAN을 0 또는 1로 저장
    description: row.description,
    maxUses: row.max_uses,
    availableFacilities: row.available_facilities
      ? JSON.parse(row.available_facilities)
      : undefined, // JSON 문자열 파싱
  };
  if (row.created_at !== undefined && row.created_at !== null) {
    type.createdAt = fromTimestampToISO(row.created_at);
  }
  if (row.updated_at !== undefined && row.updated_at !== null) {
    type.updatedAt = fromTimestampToISO(row.updated_at);
  }
  return type as MembershipType;
}

// 모든 이용권 종류 조회
export async function getAllMembershipTypes(): Promise<MembershipType[]> {
  try {
    const db = getDatabase();
    const query = `
      SELECT
        id, name, duration_months, price, is_active, description, max_uses, available_facilities, created_at, updated_at
      FROM membership_types
      ORDER BY name ASC
    `;
    const rows = db.prepare(query).all();
    return rows.map(mapRowToMembershipType);
  } catch (error) {
    electronLog.error('이용권 종류 목록 조회 오류:', error);
    throw error;
  }
}

// ID로 이용권 종류 조회
export async function getMembershipTypeById(
  id: number,
): Promise<MembershipType | null> {
  try {
    const db = getDatabase();
    const query = `
      SELECT
        id, name, duration_months, price, is_active, description, max_uses, available_facilities, created_at, updated_at
      FROM membership_types
      WHERE id = ?
    `;
    const row = db.prepare(query).get(id);
    return row ? mapRowToMembershipType(row) : null;
  } catch (error) {
    electronLog.error('이용권 종류 조회 오류:', error);
    throw error;
  }
}

// 새 이용권 종류 추가
export async function addMembershipType(
  typeData: Omit<MembershipType, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<number> {
  try {
    const db = getDatabase();
    const now = getUnixTime(new Date()); // Unix timestamp
    const query = `
      INSERT INTO membership_types (
        name, duration_months, price, is_active, description, max_uses, available_facilities, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = db.prepare(query).run(
      typeData.name,
      typeData.durationMonths,
      typeData.price,
      typeData.isActive ? 1 : 0, // Boolean을 1 또는 0으로 변환
      typeData.description || null,
      typeData.maxUses || null,
      typeData.availableFacilities
        ? JSON.stringify(typeData.availableFacilities)
        : null, // 배열을 JSON 문자열로 변환
      now, // created_at
      now, // updated_at
    );
    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('이용권 종류 추가 오류:', error);
    throw error; // UNIQUE 제약 조건 위반 (name 중복) 등의 오류가 발생할 수 있음
  }
}

// 이용권 종류 업데이트
export async function updateMembershipType(
  id: number,
  typeData: Partial<Omit<MembershipType, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<boolean> {
  try {
    const db = getDatabase();
    const now = getUnixTime(new Date()); // Unix timestamp for updated_at
    const updates: string[] = [];
    const values: any[] = [];

    if ('name' in typeData) {
      updates.push('name = ?');
      values.push(typeData.name);
    }
    if ('durationMonths' in typeData) {
      updates.push('duration_months = ?');
      values.push(typeData.durationMonths);
    }
    if ('price' in typeData) {
      updates.push('price = ?');
      values.push(typeData.price);
    }
    if ('isActive' in typeData) {
      updates.push('is_active = ?');
      values.push(typeData.isActive ? 1 : 0);
    }
    if ('description' in typeData) {
      updates.push('description = ?');
      values.push(typeData.description || null);
    }
    if ('maxUses' in typeData) {
      updates.push('max_uses = ?');
      values.push(typeData.maxUses || null);
    }
    if ('availableFacilities' in typeData) {
      updates.push('available_facilities = ?');
      values.push(
        typeData.availableFacilities
          ? JSON.stringify(typeData.availableFacilities)
          : null,
      );
    }

    if (updates.length === 0) {
      return false; // 변경할 내용 없음
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id); // WHERE 절에 사용할 ID

    const query = `UPDATE membership_types SET ${updates.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...values);
    return result.changes > 0;
  } catch (error) {
    electronLog.error('이용권 종류 업데이트 오류:', error);
    throw error;
  }
}

// 이용권 종류 삭제
export async function deleteMembershipType(id: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const query = `DELETE FROM membership_types WHERE id = ?`;
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  } catch (error) {
    electronLog.error('이용권 종류 삭제 오류:', error);
    throw error;
  }
}
