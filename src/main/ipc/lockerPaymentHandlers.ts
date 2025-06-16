// 락커 결제 관련 IPC 핸들러
import { ipcMain } from 'electron';
import { LockerPaymentData } from '../../types/lockerPayment';

// 데이터베이스 모듈 (가정)
// TODO: 실제 데이터베이스 모듈로 교체
const db = {
  run: (query: string, params: any[]) => Promise.resolve({ lastID: Date.now() }),
  get: (query: string, params: any[]) => Promise.resolve(null),
  all: (query: string, params: any[]) => Promise.resolve([]),
};

/**
 * 락커 결제 처리
 */
export const handleProcessLockerPayment = async (
  event: Electron.IpcMainInvokeEvent,
  paymentData: LockerPaymentData
) => {
  try {
    // 1. 결제 데이터 유효성 검증
    if (!paymentData.lockerId || !paymentData.memberId || !paymentData.amount) {
      return {
        success: false,
        error: '필수 결제 정보가 누락되었습니다'
      };
    }

    // 2. 결제 내역 저장
    const paymentResult = await db.run(
      `INSERT INTO locker_payments 
       (locker_id, member_id, amount, original_amount, discount_rate, discount_amount, 
        payment_method, months, start_date, end_date, notes, payment_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'completed')`,
      [
        paymentData.lockerId,
        paymentData.memberId,
        paymentData.amount,
        paymentData.originalAmount,
        paymentData.discountRate,
        paymentData.discountAmount,
        paymentData.paymentMethod,
        paymentData.months,
        paymentData.startDate,
        paymentData.endDate,
        paymentData.notes || ''
      ]
    );

    // 3. 락커 사용 기간 업데이트
    await db.run(
      `UPDATE lockers 
       SET member_id = ?, member_name = ?, start_date = ?, end_date = ?, status = 'occupied'
       WHERE id = ?`,
      [
        paymentData.memberId,
        paymentData.memberName,
        paymentData.startDate,
        paymentData.endDate,
        paymentData.lockerId
      ]
    );

    // 4. 일반 결제 내역에도 추가 (통합 관리를 위해)
    await db.run(
      `INSERT INTO payments 
       (member_id, amount, payment_date, payment_method, type, description, status)
       VALUES (?, ?, datetime('now'), ?, 'locker', ?, 'completed')`,
      [
        paymentData.memberId,
        paymentData.amount,
        paymentData.paymentMethod,
        `락커 ${paymentData.lockerNumber} ${paymentData.months}개월 사용료`
      ]
    );

    return {
      success: true,
      data: {
        paymentId: paymentResult.lastID.toString(),
        lockerId: paymentData.lockerId,
        amount: paymentData.amount,
        newEndDate: paymentData.endDate
      }
    };

  } catch (error) {
    console.error('락커 결제 처리 오류:', error);
    return {
      success: false,
      error: '결제 처리 중 오류가 발생했습니다'
    };
  }
};

/**
 * 락커 결제 내역 조회
 */
export const handleGetLockerPaymentHistory = async (
  event: Electron.IpcMainInvokeEvent,
  lockerId: string
) => {
  try {
    if (!lockerId) {
      return {
        success: false,
        error: '락커 ID가 필요합니다'
      };
    }

    const history = await db.all(
      `SELECT id, locker_id, amount, payment_date, months, payment_method, status
       FROM locker_payments 
       WHERE locker_id = ?
       ORDER BY payment_date DESC`,
      [lockerId]
    );

    return {
      success: true,
      data: history
    };

  } catch (error) {
    console.error('락커 결제 내역 조회 오류:', error);
    return {
      success: false,
      error: '결제 내역 조회 중 오류가 발생했습니다'
    };
  }
};

/**
 * 락커 사용 기간 업데이트
 */
export const handleUpdateLockerUsagePeriod = async (
  event: Electron.IpcMainInvokeEvent,
  data: { lockerId: string; newEndDate: string; isExtension: boolean }
) => {
  try {
    if (!data.lockerId || !data.newEndDate) {
      return {
        success: false,
        error: '필수 정보가 누락되었습니다'
      };
    }

    await db.run(
      `UPDATE lockers 
       SET end_date = ?
       WHERE id = ?`,
      [data.newEndDate, data.lockerId]
    );

    return {
      success: true,
      data: {
        lockerId: data.lockerId,
        endDate: data.newEndDate
      }
    };

  } catch (error) {
    console.error('락커 사용 기간 업데이트 오류:', error);
    return {
      success: false,
      error: '사용 기간 업데이트 중 오류가 발생했습니다'
    };
  }
};

/**
 * 락커 결제 취소
 */
export const handleCancelLockerPayment = async (
  event: Electron.IpcMainInvokeEvent,
  paymentId: string,
  reason: string
) => {
  try {
    if (!paymentId) {
      return {
        success: false,
        error: '결제 ID가 필요합니다'
      };
    }

    // 결제 내역 확인
    const payment = await db.get(
      `SELECT * FROM locker_payments WHERE id = ?`,
      [paymentId]
    );

    if (!payment) {
      return {
        success: false,
        error: '결제 내역을 찾을 수 없습니다'
      };
    }

    if (payment.status === 'cancelled') {
      return {
        success: false,
        error: '이미 취소된 결제입니다'
      };
    }

    // 결제 취소 처리
    await db.run(
      `UPDATE locker_payments 
       SET status = 'cancelled', cancel_reason = ?, cancel_date = datetime('now')
       WHERE id = ?`,
      [reason, paymentId]
    );

    // 락커 상태 원복 (필요한 경우)
    await db.run(
      `UPDATE lockers 
       SET member_id = NULL, member_name = NULL, start_date = NULL, end_date = NULL, status = 'available'
       WHERE id = ?`,
      [payment.locker_id]
    );

    return {
      success: true,
      data: {
        paymentId: paymentId,
        refundAmount: payment.amount,
        cancelDate: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('락커 결제 취소 오류:', error);
    return {
      success: false,
      error: '결제 취소 중 오류가 발생했습니다'
    };
  }
};

// IPC 핸들러 등록
export const registerLockerPaymentHandlers = () => {
  ipcMain.handle('processLockerPayment', handleProcessLockerPayment);
  ipcMain.handle('getLockerPaymentHistory', handleGetLockerPaymentHistory);
  ipcMain.handle('updateLockerUsagePeriod', handleUpdateLockerUsagePeriod);
  ipcMain.handle('cancelLockerPayment', handleCancelLockerPayment);
};

// TODO: 실제 main 프로세스에서 registerLockerPaymentHandlers() 호출 필요 