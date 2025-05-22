import { getDatabase } from './setup';
import { Attendance } from '../models/types';
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

function mapRowToAttendance(row: any): Attendance {
  const attendance: Partial<Attendance> = {
    id: row.id,
    memberId: row.member_id,
    visitDate: fromTimestampToISO(row.visit_date)!,
  };
  if (row.created_at !== undefined && row.created_at !== null) {
    attendance.createdAt = fromTimestampToISO(row.created_at);
  }
  return attendance as Attendance;
}

/**
 * 새 출석 기록 추가
 * @param attendanceData memberId, visitDate (Date 객체 또는 ISO 문자열) 포함
 * @returns 생성된 출석 ID
 */
export async function addAttendance(
  attendanceData: Omit<Attendance, 'id' | 'createdAt'>,
): Promise<number> {
  try {
    const db = getDatabase();
    const now = getUnixTime(new Date());
    const visitTimestamp = toTimestamp(attendanceData.visitDate);

    if (visitTimestamp === null) {
      throw new Error('유효하지 않은 방문 날짜입니다.');
    }

    const query = `
      INSERT INTO attendance (member_id, visit_date, created_at)
      VALUES (?, ?, ?)
    `;
    const result = db
      .prepare(query)
      .run(attendanceData.memberId, visitTimestamp, now);
    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('출석 기록 추가 오류:', error);
    throw error;
  }
}

/**
 * 특정 날짜의 출석 기록 조회
 * @param date ISO 문자열 (YYYY-MM-DD)
 * @returns 해당 날짜의 출석 기록 배열
 */
export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  try {
    const db = getDatabase();
    // 입력된 date 문자열 (YYYY-MM-DD)의 시작과 끝 타임스탬프를 계산
    const dayStartTimestamp = toTimestamp(date + 'T00:00:00.000Z');
    const dayEndTimestamp = toTimestamp(date + 'T23:59:59.999Z');

    if (dayStartTimestamp === null || dayEndTimestamp === null) {
        electronLog.error('잘못된 날짜 형식으로 출석 조회 시도:', date);
        return [];
    }

    const query = `
      SELECT id, member_id, visit_date, created_at
      FROM attendance
      WHERE visit_date >= ? AND visit_date <= ?
      ORDER BY created_at DESC
    `;
    const rows = db.prepare(query).all(dayStartTimestamp, dayEndTimestamp);
    return rows.map(mapRowToAttendance);
  } catch (error) {
    electronLog.error('날짜별 출석 기록 조회 오류:', error);
    throw error;
  }
}

/**
 * 특정 회원의 모든 출석 기록 삭제
 * (회원 삭제 시 사용될 수 있음)
 * @param memberId 회원 ID
 * @returns 삭제 성공 여부
 */
export async function deleteAttendanceByMemberId(memberId: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const query = `DELETE FROM attendance WHERE member_id = ?`;
    const result = db.prepare(query).run(memberId);
    return result.changes > 0;
  } catch (error) {
    electronLog.error(`회원 ID ${memberId}의 출석 기록 삭제 오류:`, error);
    throw error;
  }
}

/**
 * 특정 날짜의 출석 회원 수 조회
 * @param date ISO 문자열 (YYYY-MM-DD)
 */
export async function getAttendanceCountByDate(date: string): Promise<number> {
    try {
        const db = getDatabase();
        const dayStartTimestamp = toTimestamp(date + 'T00:00:00.000Z');
        const dayEndTimestamp = toTimestamp(date + 'T23:59:59.999Z');

        if (dayStartTimestamp === null || dayEndTimestamp === null) {
            electronLog.error('잘못된 날짜 형식으로 출석 카운트 조회 시도:', date);
            return 0;
        }

        const result = db.prepare(
            'SELECT COUNT(*) as count FROM attendance WHERE visit_date >= ? AND visit_date <= ?'
        ).get(dayStartTimestamp, dayEndTimestamp);
        return result.count as number;
    } catch (error) {
        electronLog.error('날짜별 출석 회원 수 조회 오류:', error);
        throw error;
    }
}

/**
 * 기간별 출석 기록 조회 (월별 통계 등에 사용)
 * @param startDate ISO 문자열 (YYYY-MM-DD)
 * @param endDate ISO 문자열 (YYYY-MM-DD)
 */
export async function getAttendanceBetweenDates(startDate: string, endDate: string): Promise<Attendance[]> {
    try {
        const db = getDatabase();
        const startTimestamp = toTimestamp(startDate + 'T00:00:00.000Z');
        const endTimestamp = toTimestamp(endDate + 'T23:59:59.999Z');

        if (startTimestamp === null || endTimestamp === null) {
            electronLog.error('잘못된 날짜 형식으로 기간별 출석 조회 시도:', startDate, endDate);
            return [];
        }

        const query = `
            SELECT id, member_id, visit_date, created_at
            FROM attendance
            WHERE visit_date >= ? AND visit_date <= ?
            ORDER BY visit_date ASC
        `;
        const rows = db.prepare(query).all(startTimestamp, endTimestamp);
        return rows.map(mapRowToAttendance);
    } catch (error) {
        electronLog.error('기간별 출석 기록 조회 오류:', error);
        throw error;
    }
}

/**
 * ID로 특정 출석 기록 삭제
 * @param id 출석 기록 ID
 * @returns 삭제 성공 여부
 */
export async function deleteAttendanceById(id: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const query = `DELETE FROM attendance WHERE id = ?`;
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  } catch (error) {
    electronLog.error(`출석 기록 ID ${id} 삭제 오류:`, error);
    throw error;
  }
}

/**
 * 회원 ID와 방문 날짜로 특정 출석 기록 조회 (중복 체크용)
 * @param memberId 회원 ID
 * @param visitDate 방문 날짜 (ISO 문자열 YYYY-MM-DD)
 * @returns Attendance 객체 또는 null
 */
export async function findAttendanceByMemberAndDate(memberId: number, visitDate: string): Promise<Attendance | null> {
  try {
    const db = getDatabase();
    const visitTimestamp = toTimestamp(visitDate + 'T00:00:00.000Z'); // 날짜의 시작으로 검색
    // 정확히 해당 날짜만 비교하기 위해 하루의 시작과 끝을 사용
    const dayStartTimestamp = toTimestamp(visitDate + 'T00:00:00.000Z');
    const dayEndTimestamp = toTimestamp(visitDate + 'T23:59:59.999Z');

    if (dayStartTimestamp === null || dayEndTimestamp === null) {
      electronLog.error('잘못된 날짜 형식으로 출석 조회 시도 (find): ', visitDate);
      return null;
    }

    const query = `
      SELECT id, member_id, visit_date, created_at 
      FROM attendance 
      WHERE member_id = ? AND visit_date >= ? AND visit_date <= ?
    `;
    const row = db.prepare(query).get(memberId, dayStartTimestamp, dayEndTimestamp);
    return row ? mapRowToAttendance(row) : null;
  } catch (error) {
    electronLog.error('회원 및 날짜별 출석 기록 조회 오류:', error);
    throw error;
  }
}

/**
 * 기준일로부터 N개월간의 월별 출석 수를 조회합니다.
 * @param referenceDateISO 기준 날짜 (YYYY-MM-DD, 이 날짜가 포함된 달부터 계산)
 * @param numberOfMonths 조회할 개월 수 (예: 6이면 기준달 포함 과거 6개월)
 */
export async function getMonthlyAttendanceCounts(
  referenceDateISO: string,
  numberOfMonths: number,
): Promise<{ month: string; count: number }[]> {
  try {
    const db = getDatabase();
    const result: { month: string; count: number }[] = [];
    const refDate = parseISO(referenceDateISO); // 기준 날짜 파싱

    if (!isValid(refDate)) {
        electronLog.error('잘못된 기준 날짜 형식으로 월별 출석 통계 조회 시도:', referenceDateISO);
        return [];
    }

    for (let i = 0; i < numberOfMonths; i++) {
      const targetMonthDate = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
      const monthStartISO = format(targetMonthDate, 'yyyy-MM-dd');
      const monthEndTargetDate = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth() + 1, 0);
      const monthEndISO = format(monthEndTargetDate, 'yyyy-MM-dd');
      
      const monthStartTimestamp = toTimestamp(monthStartISO + 'T00:00:00.000Z');
      const monthEndTimestamp = toTimestamp(monthEndISO + 'T23:59:59.999Z');

      if (monthStartTimestamp === null || monthEndTimestamp === null) {
        electronLog.warn(`월별 통계 중 날짜 변환 오류: ${monthStartISO} 또는 ${monthEndISO}`);
        continue; 
      }

      const row = db.prepare(
          'SELECT COUNT(*) as count FROM attendance WHERE visit_date BETWEEN ? AND ?'
        ).get(monthStartTimestamp, monthEndTimestamp);
      
      result.push({
        month: format(targetMonthDate, 'yyyy년 M월'), // 또는 'MMMM' 등 원하는 형식으로
        count: row ? (row.count as number) : 0,
      });
    }
    return result.reverse(); // 시간 순서대로 (과거 -> 현재)
  } catch (error) {
    electronLog.error('월별 출석 통계 조회 오류:', error);
    throw error;
  }
}

/**
 * 최근 출석 기록을 회원 이름과 함께 지정된 수만큼 조회합니다.
 * @param limit 조회할 출석 기록 수
 */
export async function getRecentAttendanceWithMemberName(
  limit: number,
): Promise<{ id: number; memberId: number; memberName: string; visitDate: string; createdAt?: string }[]> {
  try {
    const db = getDatabase();
    const query = `
      SELECT a.id, a.member_id, m.name as memberName, a.visit_date, a.created_at
      FROM attendance a
      JOIN members m ON a.member_id = m.id
      ORDER BY a.visit_date DESC, a.id DESC LIMIT ?
    `;
    const rows = db.prepare(query).all(limit);
    return rows.map(row => ({
      id: row.id,
      memberId: row.member_id,
      memberName: row.memberName,
      visitDate: fromTimestampToISO(row.visit_date)!,
      createdAt: row.created_at ? fromTimestampToISO(row.created_at) : undefined,
    }));
  } catch (error) {
    electronLog.error('최근 출석(회원명 포함) 조회 오류:', error);
    throw error;
  }
} 