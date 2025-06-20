import { getDatabase } from './setup';
import * as electronLog from 'electron-log';

// 상담 회원 인터페이스 (consultation_members 테이블용)
export interface ConsultationMemberData {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  gender?: '남' | '여';
  birth_date?: number; // Unix timestamp
  first_visit?: number; // Unix timestamp
  health_conditions?: string;
  fitness_goals?: string; // JSON 문자열
  staff_id?: number;
  staff_name?: string;
  consultation_status?: 'pending' | 'in_progress' | 'completed' | 'follow_up';
  notes?: string;
  is_promoted?: number; // 0 또는 1
  promoted_at?: number;
  promoted_member_id?: number;
  created_at?: number;
  updated_at?: number;
}

export interface ConsultationRecord {
  id?: number;
  member_id: number;
  consultation_date: number; // Unix timestamp
  consultation_type: 'initial' | 'progress' | 'follow_up' | 'special';
  consultant_id: number;
  consultant_name: string;
  content: string;
  goals_discussed: string[]; // 배열이지만 DB에는 JSON 문자열로 저장
  recommendations: string;
  next_appointment?: number; // Unix timestamp
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  created_at?: number;
  updated_at?: number;
}

// ============== CONSULTATION MEMBERS CRUD ==============

// 상담 회원 생성
export function createConsultationMember(member: Omit<ConsultationMemberData, 'id' | 'created_at' | 'updated_at'>): ConsultationMemberData {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const now = Math.floor(Date.now() / 1000);
    
    const stmt = db.prepare(`
      INSERT INTO consultation_members (
        name, phone, email, gender, birth_date, first_visit, health_conditions,
        fitness_goals, staff_id, staff_name, consultation_status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      member.name,
      member.phone || null,
      member.email || null,
      member.gender || null,
      member.birth_date || null,
      member.first_visit || null,
      member.health_conditions || null,
      member.fitness_goals || null,
      member.staff_id || null,
      member.staff_name || null,
      member.consultation_status || 'pending',
      member.notes || null,
      now,
      now
    );

    electronLog.info('상담 회원 생성 완료:', result.lastInsertRowid);

    return {
      id: result.lastInsertRowid as number,
      ...member,
      created_at: now,
      updated_at: now
    };
  } catch (error) {
    electronLog.error('상담 회원 생성 실패:', error);
    throw error;
  }
}

// 모든 상담 회원 조회
export function getAllConsultationMembers(): ConsultationMemberData[] {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const stmt = db.prepare(`
      SELECT * FROM consultation_members 
      ORDER BY created_at DESC
    `);

    const rows = stmt.all();
    electronLog.info(`상담 회원 ${rows.length}명 조회 완료`);

    return rows.map((row: any) => ({
      ...row,
      is_promoted: Boolean(row.is_promoted)
    }));
  } catch (error) {
    electronLog.error('상담 회원 조회 실패:', error);
    throw error;
  }
}

// 상담 회원 수정
export function updateConsultationMember(id: number, updates: Partial<ConsultationMemberData>): boolean {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const now = Math.floor(Date.now() / 1000);
    
    // 동적으로 업데이트할 필드들 구성
    const fields = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.phone !== undefined) { fields.push('phone = ?'); values.push(updates.phone); }
    if (updates.email !== undefined) { fields.push('email = ?'); values.push(updates.email); }
    if (updates.gender !== undefined) { fields.push('gender = ?'); values.push(updates.gender); }
    if (updates.birth_date !== undefined) { fields.push('birth_date = ?'); values.push(updates.birth_date); }
    if (updates.first_visit !== undefined) { fields.push('first_visit = ?'); values.push(updates.first_visit); }
    if (updates.health_conditions !== undefined) { fields.push('health_conditions = ?'); values.push(updates.health_conditions); }
    if (updates.fitness_goals !== undefined) { fields.push('fitness_goals = ?'); values.push(updates.fitness_goals); }
    if (updates.staff_id !== undefined) { fields.push('staff_id = ?'); values.push(updates.staff_id); }
    if (updates.staff_name !== undefined) { fields.push('staff_name = ?'); values.push(updates.staff_name); }
    if (updates.consultation_status !== undefined) { fields.push('consultation_status = ?'); values.push(updates.consultation_status); }
    if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
    if (updates.is_promoted !== undefined) { fields.push('is_promoted = ?'); values.push(updates.is_promoted ? 1 : 0); }
    if (updates.promoted_at !== undefined) { fields.push('promoted_at = ?'); values.push(updates.promoted_at); }
    if (updates.promoted_member_id !== undefined) { fields.push('promoted_member_id = ?'); values.push(updates.promoted_member_id); }
    
    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = db.prepare(`
      UPDATE consultation_members 
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    const result = stmt.run(...values);
    electronLog.info('상담 회원 수정 완료:', { id, changes: result.changes });

    return result.changes > 0;
  } catch (error) {
    electronLog.error('상담 회원 수정 실패:', error);
    throw error;
  }
}

// 상담 회원 삭제
export function deleteConsultationMember(id: number): boolean {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const stmt = db.prepare('DELETE FROM consultation_members WHERE id = ?');
    const result = stmt.run(id);

    electronLog.info('상담 회원 삭제 완료:', { id, changes: result.changes });
    return result.changes > 0;
  } catch (error) {
    electronLog.error('상담 회원 삭제 실패:', error);
    throw error;
  }
}

// 상담 회원 단일 조회
export function getConsultationMemberById(id: number): ConsultationMemberData | null {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const stmt = db.prepare('SELECT * FROM consultation_members WHERE id = ?');
    const row = stmt.get(id);

    if (row) {
      return {
        ...row,
        is_promoted: Boolean(row.is_promoted)
      };
    }
    return null;
  } catch (error) {
    electronLog.error('상담 회원 단일 조회 실패:', error);
    throw error;
  }
}

// ============== CONSULTATION RECORDS CRUD ==============

// 상담 기록 생성
export function createConsultationRecord(record: Omit<ConsultationRecord, 'id' | 'created_at' | 'updated_at'>): ConsultationRecord {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const now = Math.floor(Date.now() / 1000);
    
    const stmt = db.prepare(`
      INSERT INTO consultation_records (
        member_id, consultation_date, consultation_type, consultant_id, consultant_name,
        content, goals_discussed, recommendations, next_appointment, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      record.member_id,
      record.consultation_date,
      record.consultation_type,
      record.consultant_id,
      record.consultant_name,
      record.content,
      JSON.stringify(record.goals_discussed),
      record.recommendations,
      record.next_appointment || null,
      record.status,
      now,
      now
    );

    electronLog.info('상담 기록 생성 완료:', result.lastInsertRowid);

    return {
      id: result.lastInsertRowid as number,
      ...record,
      created_at: now,
      updated_at: now
    };
  } catch (error) {
    electronLog.error('상담 기록 생성 실패:', error);
    throw error;
  }
}

// 회원별 상담 기록 조회
export function getConsultationRecordsByMember(memberId: number): ConsultationRecord[] {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const stmt = db.prepare(`
      SELECT * FROM consultation_records 
      WHERE member_id = ? 
      ORDER BY consultation_date DESC
    `);

    const records = stmt.all(memberId);
    
    return records.map((record: any) => ({
      ...record,
      goals_discussed: record.goals_discussed ? JSON.parse(record.goals_discussed) : []
    }));
  } catch (error) {
    electronLog.error('상담 기록 조회 실패:', error);
    throw error;
  }
}

// 모든 상담 기록 조회
export function getAllConsultationRecords(): ConsultationRecord[] {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const stmt = db.prepare(`
      SELECT * FROM consultation_records 
      ORDER BY consultation_date DESC
    `);

    const records = stmt.all();
    
    return records.map((record: any) => ({
      ...record,
      goals_discussed: record.goals_discussed ? JSON.parse(record.goals_discussed) : []
    }));
  } catch (error) {
    electronLog.error('상담 기록 조회 실패:', error);
    throw error;
  }
}

// 상담 기록 수정
export function updateConsultationRecord(id: number, updates: Partial<ConsultationRecord>): boolean {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const now = Math.floor(Date.now() / 1000);
    
    // goals_discussed가 배열이면 JSON 문자열로 변환
    if (updates.goals_discussed && Array.isArray(updates.goals_discussed)) {
      updates.goals_discussed = JSON.stringify(updates.goals_discussed) as any;
    }

    const fields = Object.keys(updates).filter(key => key !== 'id');
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => (updates as any)[field]);

    const stmt = db.prepare(`
      UPDATE consultation_records 
      SET ${setClause}, updated_at = ? 
      WHERE id = ?
    `);

    const result = stmt.run(...values, now, id);
    
    electronLog.info('상담 기록 수정 완료:', id);
    return result.changes > 0;
  } catch (error) {
    electronLog.error('상담 기록 수정 실패:', error);
    throw error;
  }
}

// 상담 기록 삭제
export function deleteConsultationRecord(id: number): boolean {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const stmt = db.prepare('DELETE FROM consultation_records WHERE id = ?');
    const result = stmt.run(id);
    
    electronLog.info('상담 기록 삭제 완료:', id);
    return result.changes > 0;
  } catch (error) {
    electronLog.error('상담 기록 삭제 실패:', error);
    throw error;
  }
}

// 특정 상담 기록 조회
export function getConsultationRecordById(id: number): ConsultationRecord | null {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const stmt = db.prepare('SELECT * FROM consultation_records WHERE id = ?');
    const record = stmt.get(id);
    
    if (!record) {
      return null;
    }

    return {
      ...record,
      goals_discussed: record.goals_discussed ? JSON.parse(record.goals_discussed) : []
    };
  } catch (error) {
    electronLog.error('상담 기록 조회 실패:', error);
    throw error;
  }
}

/**
 * 상담 회원을 정식 회원으로 승격하는 함수
 */
export function promoteConsultationMember(
  promotionData: {
    consultationMemberId: number;
    membershipTypeId: number;
    membershipType: string;
    startDate: string;
    endDate: string;
    paymentAmount: number;
    paymentMethod: 'card' | 'cash' | 'transfer';
    notes?: string;
  }
): { memberId: number; consultationMemberId: number } {
  try {
    const db = getDatabase();
    if (!db) {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }

    const transaction = db.transaction(() => {
      // 1. 상담 회원 정보 조회
      const consultationMember = db.prepare(`
        SELECT * FROM consultation_members 
        WHERE id = ? AND consultation_status = 'completed' AND is_promoted = 0
      `).get(promotionData.consultationMemberId) as ConsultationMemberData;

      if (!consultationMember) {
        throw new Error('승격할 수 없는 상담 회원입니다. 상담이 완료되었고 아직 승격되지 않은 회원만 승격 가능합니다.');
      }

      // 2. 회원권 정보 조회
      const membershipType = db.prepare(`
        SELECT * FROM membership_types WHERE id = ?
      `).get(promotionData.membershipTypeId);

      if (!membershipType) {
        throw new Error('유효하지 않은 회원권 정보입니다.');
      }

      // 3. 정식 회원으로 등록
      const memberInsert = db.prepare(`
        INSERT INTO members (
          name, phone, email, gender, birth_date, join_date,
          membership_type, membership_start, membership_end, 
          staff_id, staff_name, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const currentTimestamp = Math.floor(Date.now() / 1000);
      const joinDate = new Date().toISOString().split('T')[0];
      
      const memberNotes = [
        `상담 회원에서 승격 (${new Date().toLocaleDateString()})`,
        `이전 상담 기록: ${consultationMember.health_conditions}`,
        `운동 목표: ${JSON.parse(consultationMember.fitness_goals || '[]').join(', ')}`,
        promotionData.notes || ''
      ].filter(note => note.trim()).join('\n');

      const memberResult = memberInsert.run(
        consultationMember.name,
        consultationMember.phone,
        consultationMember.email,
        consultationMember.gender,
        consultationMember.birth_date,
        Math.floor(new Date(joinDate).getTime() / 1000),
        promotionData.membershipType,
        Math.floor(new Date(promotionData.startDate).getTime() / 1000),
        Math.floor(new Date(promotionData.endDate).getTime() / 1000),
        consultationMember.staff_id,
        consultationMember.staff_name,
        memberNotes,
        currentTimestamp,
        currentTimestamp
      );

      const memberId = memberResult.lastInsertRowid as number;

      // 4. 결제 기록 생성
      const paymentInsert = db.prepare(`
        INSERT INTO payments (
          member_id, amount, payment_date, payment_method, 
          payment_type, description, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      paymentInsert.run(
        memberId,
        promotionData.paymentAmount,
        Math.floor(new Date().getTime() / 1000),
        promotionData.paymentMethod,
        'membership',
        `회원 승격 결제 - ${promotionData.membershipType}`,
        currentTimestamp,
        currentTimestamp
      );

      // 5. 상담 회원 상태 업데이트 (승격 완료 표시)
      const updateConsultation = db.prepare(`
        UPDATE consultation_members 
        SET is_promoted = 1, 
            promoted_at = ?, 
            promoted_member_id = ?,
            updated_at = ?
        WHERE id = ?
      `);

      updateConsultation.run(
        currentTimestamp,
        memberId,
        currentTimestamp,
        promotionData.consultationMemberId
      );

      return { memberId, consultationMemberId: promotionData.consultationMemberId };
    });

    const result = transaction();
    electronLog.info('회원 승격 완료:', result);
    return result;
  } catch (error) {
    electronLog.error('회원 승격 실패:', error);
    throw error;
  }
}

 