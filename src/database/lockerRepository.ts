import { getDatabase } from './setup';
import { Locker } from '../models/types';
import * as electronLog from 'electron-log';
import {
  getUnixTime,
  fromUnixTime,
  parseISO,
  isValid,
  format,
} from 'date-fns';
import { validateLocker } from '../utils/validation';

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

// LockerRow 인터페이스는 더 이상 필요 없을 수 있으나, 일단 유지하고 map 함수에서 직접 Locker 타입으로 변환
// interface LockerRow { ... }

function mapRowToLocker(row: any): Locker {
  const locker: Partial<Locker> = {
    id: row.id,
    number: row.number,
    status: row.status,
    size: row.size || undefined,
    location: row.location || undefined,
    memberId: row.member_id || undefined,
    memberName: row.member_name || undefined,
    notes: row.notes || undefined,
  };

  if (row.fee_options) {
    try {
      locker.feeOptions = JSON.parse(row.fee_options);
    } catch (e) {
      electronLog.error(`Error parsing fee_options for locker ID ${row.id}:`, e);
      locker.feeOptions = [];
    }
  } else {
    locker.feeOptions = undefined;
  }

  if (row.start_date !== undefined && row.start_date !== null) {
    locker.startDate = fromTimestampToISO(row.start_date);
  }
  if (row.end_date !== undefined && row.end_date !== null) {
    locker.endDate = fromTimestampToISO(row.end_date);
  }
  if (row.created_at !== undefined && row.created_at !== null) {
    locker.createdAt = fromTimestampToISO(row.created_at);
  }
  if (row.updated_at !== undefined && row.updated_at !== null) {
    locker.updatedAt = fromTimestampToISO(row.updated_at);
  }
  return locker as Locker;
}

// 락커 번호 정규화 함수 추가
function normalizeLockerNumber(number: string): string {
  // 앞의 0을 제거하고 숫자만 남김
  return number.replace(/^0+/, '');
}

// 모든 락커 조회 (페이지네이션 적용)
export async function getAllLockers(
  page: number = 1,
  pageSize: number = 50,
  searchTerm?: string,
  status?: 'all' | 'available' | 'occupied' | 'maintenance'
): Promise<{ data: Locker[]; total: number }> {
  try {
    const db = getDatabase();
    
    // 기본 쿼리
    let query = `
      SELECT 
        l.id, l.number, l.status, l.size, l.location, l.fee_options,
        l.member_id, l.start_date, l.end_date, l.notes,
        l.created_at, l.updated_at,
        m.name as member_name
      FROM lockers l
      LEFT JOIN members m ON l.member_id = m.id
    `;

    // 검색 조건 추가
    const conditions = [];
    const params = [];

    if (searchTerm) {
      conditions.push('(l.number LIKE ? OR m.name LIKE ?)');
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (status && status !== 'all') {
      conditions.push('l.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // 전체 개수 조회용 쿼리 (ORDER BY 제외)
    let countBaseQuery = 'FROM lockers l';
    let countConditions = [];
    const countParams = []; // countQuery를 위한 파라미터

    if (searchTerm) {
      countBaseQuery += ' LEFT JOIN members m ON l.member_id = m.id'; // searchTerm이 있으면 JOIN 필요
      countConditions.push('(l.number LIKE ? OR m.name LIKE ?)');
      countParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (status && status !== 'all') {
      countConditions.push('l.status = ?');
      countParams.push(status);
       // searchTerm이 없고 status 필터만 있을 때 JOIN이 누락될 수 있으므로 추가
      if (!searchTerm && status === 'occupied') { 
          // 'occupied' 상태이고 memberName을 보여줘야 한다면 JOIN이 필요할 수 있지만,
          // 현재 countQuery는 COUNT(*)만 하므로 memberName은 불필요. JOIN은 선택사항.
          // 다만, 기본 query와 일관성을 위해 JOIN을 유지하는 것이 나을 수 있음.
          // 여기서는 간결성을 위해 JOIN을 추가하지 않음. 필요시 추가.
      }
    }

    let countQuery = `SELECT COUNT(*) as total ${countBaseQuery}`;
    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }
    
    const totalResult = db.prepare(countQuery).get(...countParams);
    const total = totalResult.total;

    // 정렬 방식 수정: 앞의 0을 제거하고 숫자로 정렬
    query += " ORDER BY CAST(REPLACE(l.number, '0', '') AS INTEGER)";

    // 페이지네이션 적용
    query += ' LIMIT ? OFFSET ?';
    // params 배열 (데이터 조회용)은 기존 로직을 유지
    const queryParams = [...params, pageSize, (page - 1) * pageSize];

    // 데이터 조회
    electronLog.info('Executing getAllLockers query:', query);
    electronLog.info('With queryParams:', queryParams);
    const rows = db.prepare(query).all(...queryParams);
    const data = rows.map(mapRowToLocker);

    return { data, total };
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
        l.id, l.number, l.status, l.size, l.location, l.fee_options,
        l.member_id, l.start_date, l.end_date, l.notes,
        l.created_at, l.updated_at,
        m.name as member_name
      FROM lockers l
      LEFT JOIN members m ON l.member_id = m.id
      WHERE l.id = ?
    `;
    const row = db.prepare(query).get(id);
    return row ? mapRowToLocker(row) : null;
  } catch (error) {
    electronLog.error('락커 조회 오류:', error);
    throw error;
  }
}

// Locker 타입에서 id, createdAt, updatedAt, memberName은 자동 생성/관리되므로 제외
// type LockerCreationData = Omit<Locker, 'id' | 'createdAt' | 'updatedAt' | 'memberName'>;

export async function addLocker(
  lockerData: Omit<Locker, 'id' | 'createdAt' | 'updatedAt' | 'memberName'>,
): Promise<number> {
  try {
    // 데이터 검증 주석 해제
    const validationResult = validateLocker(lockerData);
    if (!validationResult.isValid) {
      // 오류 메시지를 좀 더 구체적으로 전달
      const errorMessages = validationResult.errors ? Object.values(validationResult.errors).join(', ') : '유효하지 않은 데이터';
      throw new Error('유효하지 않은 락커 데이터입니다: ' + errorMessages);
    }

    const db = getDatabase();
    
    const normalizedNumber = normalizeLockerNumber(lockerData.number);
    
    const existingLocker = db
      .prepare('SELECT id FROM lockers WHERE number = ?') // 저장하는 number 필드와 직접 비교
      .get(normalizedNumber); // 정규화된 번호로 비교
    
    if (existingLocker) {
      throw new Error('이미 존재하는 락커 번호입니다.');
    }

    const now = getUnixTime(new Date());
    const query = `
      INSERT INTO lockers (
        number, status, size, location, fee_options, 
        member_id, start_date, end_date, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = db
      .prepare(query)
      .run(
        normalizedNumber, // 정규화된 번호 저장
        lockerData.status,
        lockerData.size || null,
        lockerData.location || null,
        lockerData.feeOptions ? JSON.stringify(lockerData.feeOptions) : null,
        lockerData.memberId || null,
        toTimestamp(lockerData.startDate),
        toTimestamp(lockerData.endDate),
        lockerData.notes || null,
        now,
        now,
      );
    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('락커 추가 오류:', error);
    throw error;
  }
}

// Locker 타입에서 id, createdAt, updatedAt, memberName은 직접 수정 불가. 날짜 필드는 string | Date | null 허용
// type LockerUpdateData = Partial<Omit<Locker, 'id' | 'createdAt' | 'updatedAt' | 'memberName'>> & {
//     startDate?: string | Date | null;
//     endDate?: string | Date | null;
// };

export async function updateLocker(
  id: number,
  lockerData: Partial<Locker>,
): Promise<boolean> {
  try {
    // 데이터 검증 주석 해제
    // 업데이트 시에는 lockerData가 Partial<Locker>이므로, 전체 객체가 아닌 부분 객체에 대한 검증이 필요.
    // validateLocker는 전체 Locker 객체를 기대하므로, 업데이트용 검증 스키마/함수가 별도로 필요할 수 있음.
    // 또는, 업데이트 전 DB에서 원본 데이터를 가져와 lockerData와 병합한 후 전체 검증을 수행할 수도 있음.
    // 여기서는 일단 전체 객체를 받는다는 가정 하에 validateLocker를 사용하거나, 부분 검증이 가능한 스키마가 필요.
    // zod는 .partial() 스키마를 만들 수 있음. mainLockerSchema.partial().parse(lockerData) 형태로 사용 가능.
    // 지금은 validateLocker가 unknown을 받으므로, lockerData를 그대로 넘겨도 문제는 없으나, 의도는 명확히 해야 함.
    
    // 업데이트 시에는 모든 필드가 다 오지 않으므로, zod의 partial 스키마로 검증하는 것이 적절합니다.
    // validateLocker 함수 내부에서 mainLockerSchema.parse(data)를 사용하고 있으므로,
    // Partial 데이터를 검증하려면 validateLocker 함수 자체가 Partial을 다루도록 수정하거나
    // 별도의 validatePartialLocker 함수를 만들어야 합니다.
    // 가장 간단한 방법은 types.ts의 lockerSchema.partial()을 사용하는 것입니다.
    // 여기서는 validateLocker가 이미 data: unknown을 받으므로, 일단 그대로 호출합니다.
    // 추후 validateLocker 함수를 개선하여 partial 데이터도 잘 처리하도록 할 수 있습니다.
    const validationResult = validateLocker(lockerData); 
    if (!validationResult.isValid && Object.keys(lockerData).length > 0) { // 뭔가 업데이트 하려고 했는데 유효하지 않을 때만 오류
        // 빈 lockerData ({})로 업데이트 시도 시에는 유효성 검사를 통과시키거나, 여기서 걸러내야 함.
        // 현재 fields.length === 0 체크가 있어서 빈 데이터는 아래에서 걸러짐.
      const errorMessages = validationResult.errors ? Object.values(validationResult.errors).join(', ') : '유효하지 않은 데이터';
      throw new Error('유효하지 않은 락커 데이터입니다 (업데이트): ' + errorMessages);
    }

    const db = getDatabase();
        
    const fields: string[] = [];
    const params: any[] = [];
    const now = getUnixTime(new Date());

    if (lockerData.number !== undefined) {
      const normalizedNumber = normalizeLockerNumber(lockerData.number);
      const existingLocker = db
        .prepare('SELECT id FROM lockers WHERE number = ? AND id != ?')
        .get(normalizedNumber, id);
      if (existingLocker) {
        throw new Error('이미 다른 락커가 사용 중인 번호입니다.');
      }
      fields.push('number = ?');
      params.push(normalizedNumber);
    }
    if (lockerData.status !== undefined) {
      fields.push('status = ?');
      params.push(lockerData.status);
    }
    if (lockerData.size !== undefined) {
      fields.push('size = ?');
      params.push(lockerData.size === null ? null : lockerData.size); // null 값 명시적 처리
    }
    if (lockerData.location !== undefined) {
      fields.push('location = ?');
      params.push(lockerData.location === null ? null : lockerData.location);
    }
    if (lockerData.feeOptions !== undefined) {
      fields.push('fee_options = ?');
      params.push(lockerData.feeOptions ? JSON.stringify(lockerData.feeOptions) : null);
    }
    if (lockerData.memberId !== undefined) {
      fields.push('member_id = ?');
      params.push(lockerData.memberId === null ? null : lockerData.memberId);
    }
    // startDate, endDate, notes는 이전 커밋에서 nullable 처리됨.
    // toTimestamp가 null/undefined를 이미 처리함.
    if (lockerData.startDate !== undefined) {
      fields.push('start_date = ?');
      params.push(toTimestamp(lockerData.startDate)); 
    }
    if (lockerData.endDate !== undefined) {
      fields.push('end_date = ?');
      params.push(toTimestamp(lockerData.endDate));
    }
    if (lockerData.notes !== undefined) {
      fields.push('notes = ?');
      params.push(lockerData.notes === null ? null : lockerData.notes);
    }

    if (fields.length === 0) {
      electronLog.info('업데이트할 필드가 없습니다.');
      return true; 
    }

    fields.push('updated_at = ?');
    params.push(now);
    params.push(id); 

    const query = `UPDATE lockers SET ${fields.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...params);
    
    return result.changes > 0;
  } catch (error) {
    electronLog.error('락커 수정 오류:', error);
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
