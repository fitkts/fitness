import { getDatabase } from './setup';
import { Member } from '../models/types';
import { MemberFilter } from '../models/types';
import * as electronLog from 'electron-log';

// 회원 추가
export async function addMember(member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  try {
    const db = getDatabase();
    
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO members (
        name, phone, email, gender, birth_date, join_date, 
        membership_type, membership_start, membership_end, 
        notes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    
    const result = stmt.run(
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
      now,
      now
    );
    
    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('회원 추가 오류:', error);
    throw error;
  }
}

// 회원 업데이트
export async function updateMember(id: number, member: Partial<Member>): Promise<boolean> {
  try {
    const db = getDatabase();
    
    const now = new Date().toISOString();
    
    // 업데이트할 필드 동적 생성
    const updates: string[] = [];
    const values: any[] = [];
    
    if ('name' in member) {
      updates.push('name = ?');
      values.push(member.name);
    }
    
    if ('phone' in member) {
      updates.push('phone = ?');
      values.push(member.phone || null);
    }
    
    if ('email' in member) {
      updates.push('email = ?');
      values.push(member.email || null);
    }
    
    if ('gender' in member) {
      updates.push('gender = ?');
      values.push(member.gender || null);
    }
    
    if ('birthDate' in member) {
      updates.push('birth_date = ?');
      values.push(member.birthDate || null);
    }
    
    if ('joinDate' in member) {
      updates.push('join_date = ?');
      values.push(member.joinDate);
    }
    
    if ('membershipType' in member) {
      updates.push('membership_type = ?');
      values.push(member.membershipType || null);
    }
    
    if ('membershipStart' in member) {
      updates.push('membership_start = ?');
      values.push(member.membershipStart || null);
    }
    
    if ('membershipEnd' in member) {
      updates.push('membership_end = ?');
      values.push(member.membershipEnd || null);
    }
    
    if ('lastVisit' in member) {
      updates.push('last_visit = ?');
      values.push(member.lastVisit || null);
    }
    
    if ('notes' in member) {
      updates.push('notes = ?');
      values.push(member.notes || null);
    }
    
    // 항상 updated_at 업데이트
    updates.push('updated_at = ?');
    values.push(now);
    
    // ID 추가
    values.push(id);
    
    const query = `UPDATE members SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    const result = stmt.run(...values);
    
    return result.changes > 0;
  } catch (error) {
    electronLog.error('회원 업데이트 오류:', error);
    throw error;
  }
}

// 회원 삭제
export async function deleteMember(id: number): Promise<boolean> {
  try {
    const db = getDatabase();
    
    // 트랜잭션 사용 - 관련 데이터도 함께 삭제
    const deleteTransaction = db.transaction(() => {
      // 관련 출석 기록 삭제
      db.prepare('DELETE FROM attendance WHERE member_id = ?').run(id);
      
      // 관련 결제 기록 삭제
      db.prepare('DELETE FROM payments WHERE member_id = ?').run(id);
      
      // 회원 삭제
      const result = db.prepare('DELETE FROM members WHERE id = ?').run(id);
      
      return result.changes > 0;
    });
    
    return deleteTransaction();
  } catch (error) {
    electronLog.error('회원 삭제 오류:', error);
    throw error;
  }
}

// 모든 회원 조회
export async function getAllMembers(): Promise<Member[]> {
  try {
    const db = getDatabase();
    
    const query = `
      SELECT 
        id, name, phone, email, gender, birth_date as birthDate, 
        join_date as joinDate, membership_type as membershipType, 
        membership_start as membershipStart, membership_end as membershipEnd, 
        last_visit as lastVisit, notes, created_at as createdAt, 
        updated_at as updatedAt
      FROM members
      ORDER BY name ASC
    `;
    
    const rows = db.prepare(query).all();
    
    return rows as Member[];
  } catch (error) {
    electronLog.error('회원 목록 조회 오류:', error);
    throw error;
  }
}

// 회원 ID로 조회
export async function getMemberById(id: number): Promise<Member | null> {
  try {
    const db = getDatabase();
    
    const query = `
      SELECT 
        id, name, phone, email, gender, birth_date as birthDate, 
        join_date as joinDate, membership_type as membershipType, 
        membership_start as membershipStart, membership_end as membershipEnd, 
        last_visit as lastVisit, notes, created_at as createdAt, 
        updated_at as updatedAt
      FROM members
      WHERE id = ?
    `;
    
    const row = db.prepare(query).get(id);
    
    return row as Member || null;
  } catch (error) {
    electronLog.error('회원 조회 오류:', error);
    throw error;
  }
}

// 회원 검색
export async function searchMembers(
  searchTerm: string,
  options?: {
    membershipType?: string;
    status?: 'active' | 'expired' | 'all';
  }
): Promise<Member[]> {
  try {
    const db = getDatabase();
    
    let query = `
      SELECT 
        id, name, phone, email, gender, birth_date as birthDate, 
        join_date as joinDate, membership_type as membershipType, 
        membership_start as membershipStart, membership_end as membershipEnd, 
        last_visit as lastVisit, notes, created_at as createdAt, 
        updated_at as updatedAt
      FROM members
      WHERE (name LIKE ? OR phone LIKE ? OR email LIKE ?)
    `;
    
    const params: any[] = [
      `%${searchTerm}%`, 
      `%${searchTerm}%`, 
      `%${searchTerm}%`
    ];
    
    // 회원권 타입 필터링
    if (options?.membershipType) {
      query += ` AND membership_type = ?`;
      params.push(options.membershipType);
    }
    
    // 회원권 상태 필터링
    if (options?.status && options.status !== 'all') {
      const now = new Date().toISOString().split('T')[0]; // 오늘 날짜 (YYYY-MM-DD)
      
      if (options.status === 'active') {
        query += ` AND (membership_end IS NULL OR membership_end >= ?)`;
      } else if (options.status === 'expired') {
        query += ` AND membership_end < ?`;
      }
      
      params.push(now);
    }
    
    query += ` ORDER BY name ASC`;
    
    const rows = db.prepare(query).all(...params);
    
    return rows as Member[];
  } catch (error) {
    electronLog.error('회원 검색 오류:', error);
    throw error;
  }
}

// 회원권 만료 예정 회원 조회
export async function getMembersWithExpiringMembership(daysUntilExpiry: number): Promise<Member[]> {
  try {
    const db = getDatabase();
    
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + daysUntilExpiry);
    
    const todayStr = today.toISOString().split('T')[0];
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    const query = `
      SELECT 
        id, name, phone, email, gender, birth_date as birthDate, 
        join_date as joinDate, membership_type as membershipType, 
        membership_start as membershipStart, membership_end as membershipEnd, 
        last_visit as lastVisit, notes, created_at as createdAt, 
        updated_at as updatedAt
      FROM members
      WHERE membership_end BETWEEN ? AND ?
      ORDER BY membership_end ASC
    `;
    
    const rows = db.prepare(query).all(todayStr, targetDateStr);
    
    return rows as Member[];
  } catch (error) {
    electronLog.error('만료 예정 회원 조회 오류:', error);
    throw error;
  }
}

// 회원 통계 조회
export async function getMemberStats(): Promise<{
  totalMembers: number;
  activeMembers: number;
  expiredMembers: number;
  newMembersThisMonth: number;
}> {
  try {
    const db = getDatabase();
    
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = today.substring(0, 8) + '01';
    
    // 총 회원 수
    const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count;
    
    // 활성 회원 수 (만료되지 않은 회원)
    const activeMembers = db.prepare(
      'SELECT COUNT(*) as count FROM members WHERE membership_end IS NULL OR membership_end >= ?'
    ).get(today).count;
    
    // 만료된 회원 수
    const expiredMembers = db.prepare(
      'SELECT COUNT(*) as count FROM members WHERE membership_end < ?'
    ).get(today).count;
    
    // 이번 달 신규 가입 회원 수
    const newMembersThisMonth = db.prepare(
      'SELECT COUNT(*) as count FROM members WHERE join_date >= ?'
    ).get(firstDayOfMonth).count;
    
    return {
      totalMembers,
      activeMembers,
      expiredMembers,
      newMembersThisMonth
    };
  } catch (error) {
    electronLog.error('회원 통계 조회 오류:', error);
    throw error;
  }
}

// 마지막 방문일 업데이트
export async function updateLastVisit(memberId: number, visitDate: string): Promise<boolean> {
  try {
    const db = getDatabase();
    
    const stmt = db.prepare(
      'UPDATE members SET last_visit = ? WHERE id = ?'
    );
    const result = stmt.run(visitDate, memberId);
    
    return result.changes > 0;
  } catch (error) {
    electronLog.error('마지막 방문일 업데이트 오류:', error);
    throw error;
  }
}

// 페이지네이션을 위한 회원 조회 함수 추가
export async function getMembersWithPagination(
  page: number,
  pageSize: number,
  options?: MemberFilter
): Promise<{ members: Member[]; total: number }> {
  try {
    const db = getDatabase();
    const offset = (page - 1) * pageSize;
    
    let query = `
      SELECT 
        id, name, phone, email, gender, birth_date as birthDate, 
        join_date as joinDate, membership_type as membershipType, 
        membership_start as membershipStart, membership_end as membershipEnd, 
        last_visit as lastVisit, notes, created_at as createdAt, 
        updated_at as updatedAt
      FROM members
      WHERE 1=1
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total
      FROM members
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // 검색어 필터링
    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      query += ` AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)`;
      countQuery += ` AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // 회원권 타입 필터링
    if (options?.membershipType) {
      query += ` AND membership_type = ?`;
      countQuery += ` AND membership_type = ?`;
      params.push(options.membershipType);
    }
    
    // 회원권 상태 필터링
    if (options?.status && options.status !== 'all') {
      const now = new Date().toISOString().split('T')[0];
      
      if (options.status === 'active') {
        query += ` AND (membership_end IS NULL OR membership_end >= ?)`;
        countQuery += ` AND (membership_end IS NULL OR membership_end >= ?)`;
      } else if (options.status === 'expired') {
        query += ` AND membership_end < ?`;
        countQuery += ` AND membership_end < ?`;
      }
      
      params.push(now);
    }
    
    // 정렬 처리
    if (options?.sortKey && options?.sortDirection) {
      const sortKey = options.sortKey;
      const direction = options.sortDirection === 'ascending' ? 'ASC' : 'DESC';
      
      // 컬럼명 매핑
      const columnMapping: { [key: string]: string } = {
        name: 'name',
        gender: 'gender',
        phone: 'phone',
        membershipType: 'membership_type',
        membershipEnd: 'membership_end',
        createdAt: 'created_at'
      };
      
      const dbColumn = columnMapping[sortKey] || 'name';
      query += ` ORDER BY ${dbColumn} ${direction}`;
    } else {
      query += ` ORDER BY name ASC`; // 기본 정렬
    }
    
    // 페이지네이션
    query += ` LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);
    
    const members = db.prepare(query).all(...params) as Member[];
    const total = db.prepare(countQuery).get(...params.slice(0, -2)) as { total: number };
    
    return {
      members,
      total: total.total
    };
  } catch (error) {
    electronLog.error('회원 목록 조회 오류:', error);
    throw error;
  }
} 