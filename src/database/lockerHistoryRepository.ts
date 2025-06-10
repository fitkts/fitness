/**
 * 락커 히스토리 Repository
 * 락커 상태 변경 이력 및 통계 데이터 관리
 */

import { getDatabase } from './setup';
import { 
  LockerHistory, 
  LockerHistoryFilter, 
  LockerStatistics, 
  LockerExpiringInfo,
  LockerUsagePattern,
  LockerDashboardData
} from '../types/lockerHistory';
import * as electronLog from 'electron-log';
import { getUnixTime, fromUnixTime, parseISO, isValid } from 'date-fns';

// Unix Timestamp to ISO string conversion
function fromTimestampToISO(timestamp: number | null): string | undefined {
  if (!timestamp) return undefined;
  try {
    return fromUnixTime(timestamp).toISOString().split('T')[0];
  } catch (error) {
    electronLog.error('Timestamp 변환 오류:', error);
    return undefined;
  }
}

// ISO string to Unix Timestamp conversion
function toTimestamp(dateValue: string | Date | undefined | null): number | null {
  if (!dateValue) return null;
  const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
  if (!isValid(date)) return null;
  return getUnixTime(date);
}

// 락커 히스토리 데이터 매핑
function mapRowToLockerHistory(row: any): LockerHistory {
  return {
    id: row.id,
    lockerId: row.locker_id,
    lockerNumber: row.locker_number,
    memberId: row.member_id || undefined,
    memberName: row.member_name || undefined,
    action: row.action,
    previousStatus: row.previous_status,
    newStatus: row.new_status,
    startDate: fromTimestampToISO(row.start_date),
    endDate: fromTimestampToISO(row.end_date),
    amount: row.amount || undefined,
    notes: row.notes || undefined,
    staffId: row.staff_id || undefined,
    staffName: row.staff_name || undefined,
    createdAt: fromTimestampToISO(row.created_at),
    updatedAt: fromTimestampToISO(row.updated_at)
  };
}

// 락커 히스토리 기록 추가
export async function addLockerHistory(historyData: Omit<LockerHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  try {
    const db = getDatabase();
    const now = getUnixTime(new Date());

    const query = `
      INSERT INTO locker_history (
        locker_id, locker_number, member_id, member_name, action,
        previous_status, new_status, start_date, end_date, amount,
        notes, staff_id, staff_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = db.prepare(query).run(
      historyData.lockerId,
      historyData.lockerNumber,
      historyData.memberId || null,
      historyData.memberName || null,
      historyData.action,
      historyData.previousStatus,
      historyData.newStatus,
      toTimestamp(historyData.startDate),
      toTimestamp(historyData.endDate),
      historyData.amount || null,
      historyData.notes || null,
      historyData.staffId || null,
      historyData.staffName || null,
      now,
      now
    );

    electronLog.info(`락커 히스토리 기록 추가: 락커 #${historyData.lockerNumber}, 액션: ${historyData.action}`);
    return result.lastInsertRowid as number;

  } catch (error) {
    electronLog.error('락커 히스토리 추가 오류:', error);
    throw error;
  }
}

// 락커 히스토리 조회 (필터링 및 페이지네이션 지원)
export async function getLockerHistory(filter: LockerHistoryFilter = {}): Promise<{ data: LockerHistory[]; total: number }> {
  try {
    const db = getDatabase();
    
    let query = `
      SELECT 
        lh.id, lh.locker_id, lh.locker_number, lh.member_id, lh.member_name,
        lh.action, lh.previous_status, lh.new_status, lh.start_date, lh.end_date,
        lh.amount, lh.notes, lh.staff_id, lh.staff_name, lh.created_at, lh.updated_at
      FROM locker_history lh
    `;

    const conditions = [];
    const params = [];

    if (filter.lockerId) {
      conditions.push('lh.locker_id = ?');
      params.push(filter.lockerId);
    }

    if (filter.memberId) {
      conditions.push('lh.member_id = ?');
      params.push(filter.memberId);
    }

    if (filter.action) {
      conditions.push('lh.action = ?');
      params.push(filter.action);
    }

    if (filter.status) {
      conditions.push('lh.new_status = ?');
      params.push(filter.status);
    }

    if (filter.startDate) {
      conditions.push('lh.created_at >= ?');
      params.push(toTimestamp(filter.startDate));
    }

    if (filter.endDate) {
      conditions.push('lh.created_at <= ?');
      params.push(toTimestamp(filter.endDate));
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // 전체 개수 조회
    const countQuery = `SELECT COUNT(*) as total FROM locker_history lh${conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''}`;
    const totalResult = db.prepare(countQuery).get(...params) as { total: number };
    const total = totalResult.total;

    // 정렬 및 페이지네이션
    query += ' ORDER BY lh.created_at DESC';
    
    if (filter.pageSize) {
      query += ' LIMIT ? OFFSET ?';
      params.push(filter.pageSize, ((filter.page || 1) - 1) * filter.pageSize);
    }

    const rows = db.prepare(query).all(...params);
    const data = rows.map(mapRowToLockerHistory);

    return { data, total };

  } catch (error) {
    electronLog.error('락커 히스토리 조회 오류:', error);
    throw error;
  }
}

// 락커별 히스토리 조회
export async function getLockerHistoryByLockerId(lockerId: number): Promise<LockerHistory[]> {
  const result = await getLockerHistory({ lockerId });
  return result.data;
}

// 회원별 락커 사용 패턴 조회
export async function getMemberLockerUsagePattern(memberId: number): Promise<LockerUsagePattern | null> {
  try {
    const db = getDatabase();

    // 회원 정보 조회
    const memberQuery = `SELECT name FROM members WHERE id = ?`;
    const member = db.prepare(memberQuery).get(memberId) as { name: string } | undefined;
    
    if (!member) {
      return null;
    }

    // 회원의 락커 사용 히스토리 조회
    const historyQuery = `
      SELECT 
        locker_number, start_date, end_date, new_status,
        CASE 
          WHEN new_status = 'occupied' AND end_date > strftime('%s', 'now') THEN 'active'
          WHEN new_status = 'available' OR end_date < strftime('%s', 'now') THEN 'completed'
          ELSE 'expired'
        END as status,
        CASE 
          WHEN start_date IS NOT NULL AND end_date IS NOT NULL 
          THEN CAST((end_date - start_date) / 86400 AS INTEGER)
          ELSE 0
        END as duration
      FROM locker_history 
      WHERE member_id = ? AND action IN ('assign', 'extend')
      ORDER BY created_at DESC
    `;

    const historyRows = db.prepare(historyQuery).all(memberId) as Array<{
      locker_number: string;
      start_date: number | null;
      end_date: number | null;
      status: string;
      duration: number;
    }>;

    const lockerHistory = historyRows.map(row => ({
      lockerNumber: row.locker_number,
      startDate: fromTimestampToISO(row.start_date) || '',
      endDate: fromTimestampToISO(row.end_date) || '',
      duration: row.duration,
      status: row.status as 'active' | 'completed' | 'expired'
    }));

    const totalUsageDays = lockerHistory.reduce((sum, item) => sum + item.duration, 0);
    const averageUsageDuration = lockerHistory.length > 0 ? totalUsageDays / lockerHistory.length : 0;
    const renewalCount = lockerHistory.filter(item => item.status === 'active').length;

    return {
      memberId,
      memberName: member.name,
      lockerHistory,
      totalUsageDays,
      averageUsageDuration,
      renewalCount
    };

  } catch (error) {
    electronLog.error('회원 락커 사용 패턴 조회 오류:', error);
    throw error;
  }
}

// 락커 통계 조회
export async function getLockerStatistics(): Promise<LockerStatistics> {
  try {
    const db = getDatabase();

    // 기본 통계
    const statsQuery = `SELECT * FROM v_locker_statistics`;
    const stats = db.prepare(statsQuery).get() as {
      total_lockers: number;
      available_lockers: number;
      occupied_lockers: number;
      maintenance_lockers: number;
      occupancy_rate: number;
      availability_rate: number;
    };

    // 만료 예정 락커
    const expiringQuery = `SELECT * FROM v_expiring_lockers LIMIT 10`;
    const expiringRows = db.prepare(expiringQuery).all() as Array<{
      id: number;
      number: string;
      member_name: string;
      end_date: number;
      days_remaining: number;
    }>;

    const expiringLockers: LockerExpiringInfo[] = expiringRows.map(row => ({
      id: row.id,
      number: row.number,
      memberName: row.member_name,
      endDate: fromTimestampToISO(row.end_date) || '',
      daysRemaining: row.days_remaining
    }));

    // 월별 수익 (락커 관련 결제)
    const revenueQuery = `
      SELECT COALESCE(SUM(amount), 0) as monthly_revenue
      FROM payments 
      WHERE strftime('%Y-%m', datetime(payment_date, 'unixepoch')) = strftime('%Y-%m', 'now')
        AND description LIKE '%락커%'
    `;
    const revenueResult = db.prepare(revenueQuery).get() as { monthly_revenue: number };

    // 평균 사용 기간
    const avgDurationQuery = `
      SELECT AVG(
        CASE 
          WHEN start_date IS NOT NULL AND end_date IS NOT NULL 
          THEN CAST((end_date - start_date) / 86400 AS INTEGER)
          ELSE 30
        END
      ) as avg_duration
      FROM locker_history 
      WHERE action = 'assign' AND start_date IS NOT NULL AND end_date IS NOT NULL
    `;
    const avgResult = db.prepare(avgDurationQuery).get() as { avg_duration: number };

    // 갱신율 계산 (최근 3개월)
    const renewalQuery = `
      SELECT 
        COUNT(CASE WHEN action = 'extend' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN action = 'assign' THEN 1 END), 0) as renewal_rate
      FROM locker_history 
      WHERE created_at >= strftime('%s', 'now', '-3 months')
    `;
    const renewalResult = db.prepare(renewalQuery).get() as { renewal_rate: number };

    // 인기 사이즈
    const sizeQuery = `
      SELECT size, COUNT(*) as count 
      FROM lockers 
      WHERE size IS NOT NULL 
      GROUP BY size 
      ORDER BY count DESC
    `;
    const sizeRows = db.prepare(sizeQuery).all() as Array<{ size: string; count: number }>;

    return {
      totalLockers: stats.total_lockers,
      availableLockers: stats.available_lockers,
      occupiedLockers: stats.occupied_lockers,
      maintenanceLockers: stats.maintenance_lockers,
      occupancyRate: stats.occupancy_rate,
      availabilityRate: stats.availability_rate,
      monthlyRevenue: revenueResult.monthly_revenue,
      averageUsageDuration: Math.round(avgResult.avg_duration || 30),
      renewalRate: Math.round(renewalResult.renewal_rate || 0),
      popularSizes: sizeRows,
      expiringWithin7Days: expiringLockers
    };

  } catch (error) {
    electronLog.error('락커 통계 조회 오류:', error);
    throw error;
  }
}

// 대시보드 데이터 조회 (통계 + 최근 활동 + 차트 데이터)
export async function getLockerDashboardData(): Promise<LockerDashboardData> {
  try {
    const statistics = await getLockerStatistics();
    
    // 최근 활동 (최근 10개)
    const recentActivities = await getLockerHistory({ pageSize: 10, page: 1 });

    // 월별 수익 차트 데이터 (최근 6개월)
    const db = getDatabase();
    const revenueChartQuery = `
      SELECT 
        strftime('%Y-%m', datetime(payment_date, 'unixepoch')) as month,
        SUM(amount) as revenue,
        COUNT(DISTINCT member_id) as locker_count
      FROM payments 
      WHERE payment_date >= strftime('%s', 'now', '-6 months')
        AND description LIKE '%락커%'
      GROUP BY strftime('%Y-%m', datetime(payment_date, 'unixepoch'))
      ORDER BY month DESC
    `;
    
    const revenueChartRows = db.prepare(revenueChartQuery).all() as Array<{
      month: string;
      revenue: number;
      locker_count: number;
    }>;

    const revenueChart = revenueChartRows.map(row => ({
      month: row.month,
      revenue: row.revenue,
      lockerCount: row.locker_count
    }));

    // 사용 패턴 데이터 (시간별, 일별, 월별)
    const usagePatterns = {
      hourly: [] as { hour: number; count: number }[],
      daily: [] as { day: string; count: number }[],
      monthly: [] as { month: string; count: number }[]
    };

    return {
      statistics,
      recentActivities: recentActivities.data,
      expiringLockers: statistics.expiringWithin7Days,
      revenueChart,
      usagePatterns
    };

  } catch (error) {
    electronLog.error('락커 대시보드 데이터 조회 오류:', error);
    throw error;
  }
}
