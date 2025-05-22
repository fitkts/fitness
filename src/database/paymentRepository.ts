import { getDatabase } from './setup';
import { Payment } from '../models/types'; // Payment 타입 임포트 (경로 확인)
import * as electronLog from 'electron-log';
import {
  getUnixTime,
  fromUnixTime,
  parseISO,
  isValid,
  format,
} from 'date-fns';

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

// DB 컬럼 이름과 인터페이스 필드 이름 매핑 (snake_case -> camelCase)
// 날짜 필드 변환 추가
function mapRowToPayment(row: any): Payment {
  const payment: Partial<Payment> = {
    id: row.id,
    memberId: row.member_id,
    memberName: row.member_name || '',
    staffId: row.staff_id,
    staffName: row.staff_name || '',
    amount: row.amount,
    paymentDate: fromTimestampToISO(row.payment_date)!,
    paymentMethod: row.payment_method,
    paymentType: row.payment_type,
    membershipType: row.membership_type,
    startDate: fromTimestampToISO(row.start_date),
    endDate: fromTimestampToISO(row.end_date),
    receiptNumber: row.receipt_number,
    notes: row.notes,
    status: row.status,
  };

  if (row.created_at !== undefined && row.created_at !== null) {
    payment.createdAt = fromTimestampToISO(row.created_at);
  }

  return payment as Payment;
}

// 모든 결제 조회
export async function getAllPayments(): Promise<Payment[]> {
  try {
    const db = getDatabase();
    const query = `
      SELECT
        p.id, p.member_id, m.name AS member_name, p.staff_id, s.name AS staff_name,
        p.amount, p.payment_date, p.payment_method, p.payment_type, p.membership_type,
        p.start_date, p.end_date, p.receipt_number, p.notes, p.status, p.created_at
      FROM payments p
      LEFT JOIN members m ON p.member_id = m.id
      LEFT JOIN staff s ON p.staff_id = s.id
      ORDER BY p.payment_date DESC
    `;
    const rows = db.prepare(query).all();
    return rows.map(mapRowToPayment);
  } catch (error) {
    electronLog.error('결제 목록 조회 오류:', error);
    throw error;
  }
}

// ID로 결제 조회
export async function getPaymentById(id: number): Promise<Payment | null> {
  try {
    const db = getDatabase();
    const query = `
      SELECT
        p.id, p.member_id, m.name AS member_name, p.staff_id, s.name AS staff_name,
        p.amount, p.payment_date, p.payment_method, p.payment_type, p.membership_type,
        p.start_date, p.end_date, p.receipt_number, p.notes, p.status, p.created_at
      FROM payments p
      LEFT JOIN members m ON p.member_id = m.id
      LEFT JOIN staff s ON p.staff_id = s.id
      WHERE p.id = ?
    `;
    const row = db.prepare(query).get(id);
    return row ? mapRowToPayment(row) : null;
  } catch (error) {
    electronLog.error('결제 조회 오류:', error);
    throw error;
  }
}

// 새 결제 추가 시 입력 데이터 타입
// Payment 모델에서 id, memberName, createdAt은 자동 생성/관리되므로 제외.
// UI에서 넘어오는 membershipTypeId를 추가.
interface PaymentCreationInput extends Omit<Payment, 'id' | 'memberName' | 'createdAt'> {
  membershipTypeId: number | null; 
}

export async function addPayment(
  paymentData: PaymentCreationInput,
): Promise<number> {
  try {
    const db = getDatabase();
    const now = getUnixTime(new Date());
    const query = `
      INSERT INTO payments (
        member_id, amount, payment_date, payment_method, membership_type,
        start_date, end_date, receipt_number, notes, status, created_at,
        payment_type, description, staff_id -- 필요한 모든 컬럼 명시
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = db
      .prepare(query)
      .run(
        paymentData.memberId,
        paymentData.amount,
        toTimestamp(paymentData.paymentDate),
        paymentData.paymentMethod, 
        paymentData.membershipType,
        toTimestamp(paymentData.startDate),
        toTimestamp(paymentData.endDate),
        paymentData.receiptNumber || null,
        paymentData.notes || null,
        paymentData.status,
        now,
        paymentData.paymentType,
        paymentData.description || null,
        paymentData.staffId || null
      );
    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('결제 추가 오류:', error);
    throw error;
  }
}

// 결제 정보 업데이트 시 입력 데이터 타입
// 모든 필드는 선택적(Partial). id는 경로 파라미터로 받으므로 제외.
// memberId도 일반적으로 업데이트하지 않음.
// PaymentCreationInput에서 memberId와 membershipTypeId를 제외하고 Partial 적용
interface PaymentUpdateInput extends Partial<Omit<PaymentCreationInput, 'memberId' | 'membershipTypeId'>> {}

export async function updatePayment(
  id: number,
  paymentData: PaymentUpdateInput,
): Promise<boolean> {
  try {
    const db = getDatabase();
    const updates: string[] = [];
    const values: any[] = [];

    if (paymentData.amount !== undefined) {
      updates.push('amount = ?');
      values.push(paymentData.amount);
    }
    if (paymentData.paymentDate !== undefined) {
      updates.push('payment_date = ?');
      values.push(toTimestamp(paymentData.paymentDate));
    }
    if (paymentData.paymentMethod !== undefined) {
      updates.push('payment_method = ?');
      values.push(paymentData.paymentMethod);
    }
    if (paymentData.paymentType !== undefined) {
      updates.push('payment_type = ?');
      values.push(paymentData.paymentType);
    }
    if (paymentData.membershipType !== undefined) {
      updates.push('membership_type = ?');
      values.push(paymentData.membershipType);
    }
    if (paymentData.startDate !== undefined) {
      updates.push('start_date = ?');
      values.push(toTimestamp(paymentData.startDate));
    }
    if (paymentData.endDate !== undefined) {
      updates.push('end_date = ?');
      values.push(toTimestamp(paymentData.endDate));
    }
    if (paymentData.receiptNumber !== undefined) {
      updates.push('receipt_number = ?');
      values.push(paymentData.receiptNumber || null);
    }
    if (paymentData.notes !== undefined) {
      updates.push('notes = ?');
      values.push(paymentData.notes || null);
    }
    if (paymentData.status !== undefined) {
      updates.push('status = ?');
      values.push(paymentData.status);
    }
    if (paymentData.description !== undefined) {
      updates.push('description = ?');
      values.push(paymentData.description || null);
    }
    if (paymentData.staffId !== undefined) {
      updates.push('staff_id = ?');
      values.push(paymentData.staffId || null);
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(id);

    const query = `UPDATE payments SET ${updates.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...values);
    return result.changes > 0;
  } catch (error) {
    electronLog.error('결제 업데이트 오류:', error);
    throw error;
  }
}

// 결제 삭제
export async function deletePayment(id: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const query = `DELETE FROM payments WHERE id = ?`;
    const result = db.prepare(query).run(id);
    return result.changes > 0;
  } catch (error) {
    electronLog.error('결제 삭제 오류:', error);
    throw error;
  }
}

// 특정 회원의 모든 결제 기록 삭제 (회원 삭제 시 사용)
export async function deletePaymentsByMemberId(memberId: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const query = `DELETE FROM payments WHERE member_id = ?`;
    const result = db.prepare(query).run(memberId);
    // 여러 건이 삭제될 수 있으므로, 삭제된 건이 있는지 여부만 반환
    // result.changes가 0 이상이면 성공으로 간주 (0건 삭제도 성공)
    return result.changes >= 0; 
  } catch (error) {
    electronLog.error(`회원 ID ${memberId}의 결제 기록 삭제 오류:`, error);
    throw error;
  }
}
