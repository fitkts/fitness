import { getDatabase } from './setup';
import { Payment } from '../models/types'; // Payment 타입 임포트 (경로 확인)
import * as electronLog from 'electron-log';

// DB 컬럼 이름과 인터페이스 필드 이름 매핑 (snake_case -> camelCase)
function mapPaymentToModel(row: any): Payment {
  return {
    id: row.id,
    memberId: row.member_id,
    memberName: row.member_name || '',
    amount: row.amount,
    paymentDate: row.payment_date,
    paymentMethod: row.payment_method,
    membershipType: row.membership_type,
    startDate: row.start_date,
    endDate: row.end_date,
    receiptNumber: row.receipt_number,
    notes: row.notes,
    status: row.status,
    // memberName은 여기서 가져오지 않음 (필요 시 서비스 레벨에서 처리)
  };
}

// 모든 결제 조회
export async function getAllPayments(): Promise<Payment[]> {
  try {
    const db = getDatabase();
    const query = `
      SELECT
        p.id, p.member_id, m.name AS member_name, p.amount, p.payment_date, p.payment_method, p.membership_type,
        p.start_date, p.end_date, p.receipt_number, p.notes, p.status
      FROM payments p
      LEFT JOIN members m ON p.member_id = m.id
      ORDER BY p.payment_date DESC
    `;
    const rows = db.prepare(query).all();
    return rows.map(row => ({
      id: row.id,
      memberId: row.member_id,
      memberName: row.member_name || '',
      amount: row.amount,
      paymentDate: row.payment_date,
      paymentMethod: row.payment_method,
      membershipType: row.membership_type,
      startDate: row.start_date,
      endDate: row.end_date,
      receiptNumber: row.receipt_number,
      notes: row.notes,
      status: row.status,
    }));
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
        id, member_id, amount, payment_date, payment_method, membership_type,
        start_date, end_date, receipt_number, notes, status
      FROM payments
      WHERE id = ?
    `;
    const row = db.prepare(query).get(id);
    return row ? mapPaymentToModel(row) : null;
  } catch (error) {
    electronLog.error('결제 조회 오류:', error);
    throw error;
  }
}

// 새 결제 추가
// Omit<Payment, 'id'> 타입을 사용하나, memberName은 받지 않음
export async function addPayment(paymentData: Omit<Payment, 'id' | 'memberName'>): Promise<number> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const query = `
      INSERT INTO payments (
        member_id, amount, payment_date, payment_method, membership_type,
        start_date, end_date, receipt_number, notes, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = db.prepare(query).run(
      paymentData.memberId,
      paymentData.amount,
      paymentData.paymentDate,
      paymentData.paymentMethod,
      paymentData.membershipType,
      paymentData.startDate,
      paymentData.endDate,
      paymentData.receiptNumber || null,
      paymentData.notes || null,
      paymentData.status,
      now,
      now
    );
    return result.lastInsertRowid as number;
  } catch (error) {
    electronLog.error('결제 추가 오류:', error);
    throw error;
  }
}

// 결제 정보 업데이트
// Partial<Omit<Payment, 'id' | 'memberName'>> 사용
export async function updatePayment(id: number, paymentData: Partial<Omit<Payment, 'id' | 'memberName'>>): Promise<boolean> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    // 업데이트할 필드 동적 생성 (snake_case 사용)
    if ('memberId' in paymentData) { updates.push('member_id = ?'); values.push(paymentData.memberId); }
    if ('amount' in paymentData) { updates.push('amount = ?'); values.push(paymentData.amount); }
    if ('paymentDate' in paymentData) { updates.push('payment_date = ?'); values.push(paymentData.paymentDate); }
    if ('paymentMethod' in paymentData) { updates.push('payment_method = ?'); values.push(paymentData.paymentMethod); }
    if ('membershipType' in paymentData) { updates.push('membership_type = ?'); values.push(paymentData.membershipType); }
    if ('startDate' in paymentData) { updates.push('start_date = ?'); values.push(paymentData.startDate); }
    if ('endDate' in paymentData) { updates.push('end_date = ?'); values.push(paymentData.endDate); }
    if ('receiptNumber' in paymentData) { updates.push('receipt_number = ?'); values.push(paymentData.receiptNumber || null); }
    if ('notes' in paymentData) { updates.push('notes = ?'); values.push(paymentData.notes || null); }
    if ('status' in paymentData) { updates.push('status = ?'); values.push(paymentData.status); }

    if (updates.length === 0) {
      return false; // 변경할 내용 없음
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id); // WHERE 절에 사용할 ID

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

