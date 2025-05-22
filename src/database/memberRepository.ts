import { getDatabase } from './setup';
import { Member, MemberFilter } from '../models/types';
import * as electronLog from 'electron-log';
import {
  getUnixTime,
  fromUnixTime,
  parseISO,
  isValid,
  format,
} from 'date-fns';
import * as attendanceRepository from './attendanceRepository';
import * as paymentRepository from './paymentRepository';

// Helper function to convert date string or Date object to Unix timestamp (seconds)
// Returns null if the date is invalid or null/undefined
function toTimestamp(dateValue: string | Date | undefined | null): number | null {
  if (!dateValue) return null;
  const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  if (!isValid(date)) return null;
  return getUnixTime(date);
}

// Helper function to convert Unix timestamp (seconds) to ISO string (YYYY-MM-DD)
// Returns null if the timestamp is invalid or null/undefined
function fromTimestampToISO(timestamp: number | undefined | null): string | null {
  if (timestamp === null || timestamp === undefined) return null;
  const date = fromUnixTime(timestamp);
  if (!isValid(date)) return null;
  return format(date, 'yyyy-MM-dd');
}

// 회원 추가
export async function addMember(
  member: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<number> {
  try {
    const db = getDatabase();

    const now = getUnixTime(new Date()); // Unix timestamp for current time

    const stmt = db.prepare(`
      INSERT INTO members (
        name, phone, email, gender, birth_date, join_date, 
        membership_type, membership_start, membership_end, 
        notes, created_at, updated_at, staff_id, staff_name
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const result = stmt.run(
      member.name,
      member.phone || null,
      member.email || null,
      member.gender || null,
      toTimestamp(member.birthDate),
      toTimestamp(member.joinDate), // joinDate는 NOT NULL이므로, 실제로는 null이 오면 안됨. 호출부에서 검증 필요.
      member.membershipType || null,
      toTimestamp(member.membershipStart),
      toTimestamp(member.membershipEnd),
      member.notes || null,
      now,
      now,
      member.staffId || null,
      member.staffName || null
    );

    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('회원 추가 오류:', error);
    throw error;
  }
}

// 회원 업데이트
export async function updateMember(
  id: number,
  member: Partial<Omit<Member, 'id' | 'createdAt' | 'updatedAt'> & { birthDate?: string | Date; joinDate?: string | Date; membershipStart?: string | Date; membershipEnd?: string | Date; lastVisit?: string | Date } >,
): Promise<boolean> {
  try {
    const db = getDatabase();

    const now = getUnixTime(new Date());

    const updates: string[] = [];
    const values: any[] = [];

    if ('name' in member && member.name !== undefined) {
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

    // staffId 추가
    if ('staffId' in member) {
      updates.push('staff_id = ?');
      values.push(member.staffId || null);
    }
    // staffName 추가
    if ('staffName' in member) {
      updates.push('staff_name = ?');
      values.push(member.staffName || null);
    }

    if ('birthDate' in member) {
      updates.push('birth_date = ?');
      values.push(toTimestamp(member.birthDate));
    }
    if ('joinDate' in member) {
      updates.push('join_date = ?');
      values.push(toTimestamp(member.joinDate));
    }
    if ('membershipType' in member && member.membershipType !== undefined) {
      updates.push('membership_type = ?');
      values.push(member.membershipType);
    }
    if ('membershipStart' in member) {
      updates.push('membership_start = ?');
      values.push(toTimestamp(member.membershipStart));
    }
    if ('membershipEnd' in member) {
      updates.push('membership_end = ?');
      values.push(toTimestamp(member.membershipEnd));
    }
    if ('lastVisit' in member) {
      updates.push('last_visit = ?');
      values.push(toTimestamp(member.lastVisit));
    }
    if ('notes' in member && member.notes !== undefined) {
      updates.push('notes = ?');
      values.push(member.notes);
    }

    if (updates.length === 0) {
      // 업데이트할 내용이 없으면 updated_at만 갱신하거나 아무 작업도 안 할 수 있음
      // 여기서는 최소한 updated_at은 갱신하도록 함
      updates.push('updated_at = ?');
      values.push(now);
    } else {
      updates.push('updated_at = ?');
      values.push(now);
    }

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
    const deleteTransaction = db.transaction(async () => {
      // 관련 출석 기록 삭제 (attendanceRepository 사용)
      await attendanceRepository.deleteAttendanceByMemberId(id);

      // 관련 결제 기록 삭제 (paymentRepository 사용)
      await paymentRepository.deletePaymentsByMemberId(id);

      // 회원 삭제
      const result = db.prepare('DELETE FROM members WHERE id = ?').run(id);

      return result.changes > 0;
    });

    return deleteTransaction(); // 비동기 트랜잭션 실행 결과를 반환
  } catch (error) {
    electronLog.error('회원 삭제 오류:', error);
    throw error;
  }
}

// 데이터베이스 row를 Member 타입으로 변환 (날짜 필드 변환 포함)
function mapRowToMember(row: any): Member {
  console.log('[mapRowToMember] Received row:', row); // DB 로우 데이터 확인용 로그
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    gender: row.gender,
    birthDate: fromTimestampToISO(row.birth_date),
    joinDate: fromTimestampToISO(row.join_date)!, // join_date는 NOT NULL이므로 항상 값이 있다고 가정
    membershipType: row.membership_type,
    membershipStart: fromTimestampToISO(row.membership_start),
    membershipEnd: fromTimestampToISO(row.membership_end),
    lastVisit: fromTimestampToISO(row.last_visit),
    notes: row.notes,
    staffId: row.staff_id,
    staffName: row.staff_name,
    createdAt: fromTimestampToISO(row.created_at)!,
    updatedAt: fromTimestampToISO(row.updated_at)!,
  };
}

// 모든 회원 조회
export async function getAllMembers(): Promise<Member[]> {
  try {
    const db = getDatabase();
    const query = `
      SELECT 
        id, name, phone, email, gender, birth_date, join_date, 
        membership_type, membership_start, membership_end, 
        last_visit, notes, created_at, updated_at, staff_id, staff_name
      FROM members
      ORDER BY name ASC
    `;
    const rows = db.prepare(query).all();
    return rows.map(mapRowToMember);
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
        id, name, phone, email, gender, birth_date, join_date, 
        membership_type, membership_start, membership_end, 
        last_visit, notes, created_at, updated_at, staff_id, staff_name
      FROM members
      WHERE id = ?
    `;
    const row = db.prepare(query).get(id);
    return row ? mapRowToMember(row) : null;
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
  },
): Promise<Member[]> {
  try {
    const db = getDatabase();
    let query = `
      SELECT 
        id, name, phone, email, gender, birth_date, join_date, 
        membership_type, membership_start, membership_end, 
        last_visit, notes, created_at, updated_at, staff_id, staff_name
      FROM members
      WHERE (name LIKE ? OR phone LIKE ? OR email LIKE ?)
    `;
    const params: any[] = [
      `%${searchTerm}%`,
      `%${searchTerm}%`,
      `%${searchTerm}%`,
    ];

    if (options?.membershipType) {
      query += ` AND membership_type = ?`;
      params.push(options.membershipType);
    }

    if (options?.status && options.status !== 'all') {
      const nowTimestamp = getUnixTime(new Date(new Date().setHours(0, 0, 0, 0))); // 오늘 날짜 자정 기준 Unix timestamp

      if (options.status === 'active') {
        // 멤버십 종료일이 없거나(무기한) 오늘 이후인 경우
        query += ` AND (membership_end IS NULL OR membership_end >= ?)`;
      } else if (options.status === 'expired') {
        query += ` AND membership_end < ?`;
      }
      params.push(nowTimestamp);
    }

    query += ` ORDER BY name ASC`;
    const rows = db.prepare(query).all(...params);
    return rows.map(mapRowToMember);
  } catch (error) {
    electronLog.error('회원 검색 오류:', error);
    throw error;
  }
}

// 회원권 만료 예정 회원 조회
export async function getMembersWithExpiringMembership(
  daysUntilExpiry: number,
): Promise<Member[]> {
  try {
    const db = getDatabase();
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilExpiry);

    const todayTimestamp = getUnixTime(today);
    const targetTimestamp = getUnixTime(targetDate);

    const query = `
      SELECT 
        id, name, phone, email, gender, birth_date, join_date, 
        membership_type, membership_start, membership_end, 
        last_visit, notes, created_at, updated_at, staff_id, staff_name
      FROM members
      WHERE membership_end BETWEEN ? AND ?
      ORDER BY membership_end ASC
    `;
    const rows = db.prepare(query).all(todayTimestamp, targetTimestamp);
    return rows.map(mapRowToMember);
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
    const todayTimestamp = getUnixTime(new Date(new Date().setHours(0, 0, 0, 0)));
    const firstDayOfMonth = new Date(new Date().setDate(1));
    firstDayOfMonth.setHours(0,0,0,0);
    const firstDayOfMonthTimestamp = getUnixTime(firstDayOfMonth);

    const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count;
    const activeMembers = db.prepare(
      'SELECT COUNT(*) as count FROM members WHERE membership_end IS NULL OR membership_end >= ?'
    ).get(todayTimestamp).count;
    const expiredMembers = db.prepare(
      'SELECT COUNT(*) as count FROM members WHERE membership_end < ?'
    ).get(todayTimestamp).count;
    const newMembersThisMonth = db.prepare(
      'SELECT COUNT(*) as count FROM members WHERE join_date >= ?'
    ).get(firstDayOfMonthTimestamp).count;

    return { totalMembers, activeMembers, expiredMembers, newMembersThisMonth };
  } catch (error) {
    electronLog.error('회원 통계 조회 오류:', error);
    throw error;
  }
}

// 마지막 방문일 업데이트
export async function updateLastVisit(memberId: number, visitDate: string | Date): Promise<boolean> {
  try {
    const db = getDatabase();
    const visitTimestamp = toTimestamp(visitDate);
    if (visitTimestamp === null) {
      throw new Error('유효하지 않은 방문 날짜입니다.');
    }
    const stmt = db.prepare('UPDATE members SET last_visit = ? WHERE id = ?');
    const result = stmt.run(visitTimestamp, memberId);
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
  options?: MemberFilter, // MemberFilter 타입 사용
): Promise<{ members: Member[]; total: number }> {
  try {
    const db = getDatabase();
    const offset = (page - 1) * pageSize;

    let query = `
      SELECT 
        id, name, phone, email, gender, birth_date, join_date, 
        membership_type, membership_start, membership_end, 
        last_visit, notes, created_at, updated_at, staff_id, staff_name
      FROM members
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) as total FROM members WHERE 1=1`;
    const params: any[] = [];
    const countParams: any[] = [];

    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      const searchCondition = ` AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)`;
      query += searchCondition;
      countQuery += searchCondition;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    if (options?.membershipType) {
      const typeCondition = ` AND membership_type = ?`;
      query += typeCondition;
      countQuery += typeCondition;
      params.push(options.membershipType);
      countParams.push(options.membershipType);
    }

    if (options?.status && options.status !== 'all') {
      const nowTimestamp = getUnixTime(new Date(new Date().setHours(0,0,0,0)));
      let statusCondition = '';
      if (options.status === 'active') {
        statusCondition = ` AND (membership_end IS NULL OR membership_end >= ?)`;
      } else if (options.status === 'expired') {
        statusCondition = ` AND membership_end < ?`;
      }
      query += statusCondition;
      countQuery += statusCondition;
      params.push(nowTimestamp);
      countParams.push(nowTimestamp);
    }

    // 정렬 처리 (DB 컬럼명 직접 사용)
    if (options?.sortKey && options?.sortDirection) {
      // sortKey는 Member 모델의 키 (예: 'membershipEnd')
      // 실제 DB 컬럼명으로 매핑 필요 (예: 'membership_end')
      const columnMapping: { [key: string]: string } = {
        name: 'name',
        gender: 'gender',
        phone: 'phone',
        membershipType: 'membership_type',
        membershipEnd: 'membership_end',
        createdAt: 'created_at',
        joinDate: 'join_date',
        birthDate: 'birth_date',
        lastVisit: 'last_visit'
      };
      const dbColumn = columnMapping[options.sortKey] || 'name'; // 기본 정렬 컬럼
      const direction = options.sortDirection === 'ascending' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${dbColumn} ${direction}`;
    } else {
      query += ` ORDER BY name ASC`;
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const rows = db.prepare(query).all(...params);
    const totalResult = db.prepare(countQuery).get(...countParams);
    const total = totalResult ? totalResult.total : 0;

    return { members: rows.map(mapRowToMember), total };
  } catch (error) {
    electronLog.error('페이지네이션 회원 조회 오류:', error);
    throw error;
  }
}

/**
 * 전체 회원 수를 조회합니다.
 */
export async function getTotalMemberCount(): Promise<number> {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT COUNT(*) as count FROM members').get();
    return result.count as number;
  } catch (error) {
    electronLog.error('전체 회원 수 조회 오류:', error);
    throw error;
  }
}

/**
 * 특정 날짜 기준 활성 회원 수를 조회합니다.
 * @param asOfDateISO 기준 날짜 (YYYY-MM-DD)
 */
export async function getActiveMemberCount(asOfDateISO: string): Promise<number> {
  try {
    const db = getDatabase();
    const asOfTimestamp = toTimestamp(asOfDateISO + 'T23:59:59.999Z'); // 기준일의 가장 마지막 시간
    if (asOfTimestamp === null) {
      electronLog.error('잘못된 날짜 형식으로 활성 회원 수 조회 시도:', asOfDateISO);
      return 0;
    }
    const result = db.prepare(
      'SELECT COUNT(*) as count FROM members WHERE membership_end IS NULL OR membership_end >= ?'
    ).get(asOfTimestamp);
    return result.count as number;
  } catch (error) {
    electronLog.error('활성 회원 수 조회 오류:', error);
    throw error;
  }
}

/**
 * 특정 날짜 이후 신규 회원 수를 조회합니다.
 * @param sinceDateISO 기준 날짜 (YYYY-MM-DD)
 */
export async function getNewMemberCountSince(sinceDateISO: string): Promise<number> {
  try {
    const db = getDatabase();
    const sinceTimestamp = toTimestamp(sinceDateISO + 'T00:00:00.000Z'); // 기준일의 가장 처음 시간
    if (sinceTimestamp === null) {
      electronLog.error('잘못된 날짜 형식으로 신규 회원 수 조회 시도:', sinceDateISO);
      return 0;
    }
    const result = db.prepare(
      'SELECT COUNT(*) as count FROM members WHERE join_date >= ?'
    ).get(sinceTimestamp);
    return result.count as number;
  } catch (error) {
    electronLog.error('신규 회원 수 조회 오류:', error);
    throw error;
  }
}

/**
 * 회원권 종류별 분포를 조회합니다.
 */
export async function getMembershipDistribution(): Promise<{ type: string; count: number }[]> {
  try {
    const db = getDatabase();
    const rows = db.prepare(
      'SELECT membership_type as type, COUNT(*) as count FROM members WHERE membership_type IS NOT NULL GROUP BY membership_type'
    ).all();
    return rows.map(row => ({ type: row.type || '미지정', count: row.count }));
  } catch (error) {
    electronLog.error('회원권 분포 조회 오류:', error);
    throw error;
  }
}

/**
 * 최근 가입한 회원을 지정된 수만큼 조회합니다.
 * @param limit 조회할 회원 수
 */
export async function getRecentMembers(limit: number): Promise<Member[]> {
  try {
    const db = getDatabase();
    const query = `
      SELECT id, name, phone, email, gender, birth_date, join_date, 
             membership_type, membership_start, membership_end, 
             last_visit, notes, created_at, updated_at, staff_id, staff_name
      FROM members 
      ORDER BY join_date DESC, id DESC LIMIT ?
    `;
    const rows = db.prepare(query).all(limit);
    return rows.map(mapRowToMember);
  } catch (error) {
    electronLog.error('최근 가입 회원 조회 오류:', error);
    throw error;
  }
}
