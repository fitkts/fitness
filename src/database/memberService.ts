import { Member } from '../models/types';
import { getDatabase } from './setup';
import * as electronLog from 'electron-log';

export class MemberService {
  /**
   * 모든 회원 조회
   */
  static getAll(): Member[] {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT 
          id, name, phone, email, gender, 
          birth_date as birthDate, 
          join_date as joinDate, 
          membership_type as membershipType, 
          membership_start as membershipStart, 
          membership_end as membershipEnd, 
          last_visit as lastVisit, 
          notes, 
          created_at as createdAt, 
          updated_at as updatedAt
        FROM members
        ORDER BY name
      `);
      
      return stmt.all() || [];
    } catch (error) {
      electronLog.error('회원 목록 조회 오류:', error);
      return [];
    }
  }
  
  /**
   * 회원 ID로 단일 회원 조회
   */
  static getById(id: number): Member | null {
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        SELECT 
          id, name, phone, email, gender, 
          birth_date as birthDate, 
          join_date as joinDate, 
          membership_type as membershipType, 
          membership_start as membershipStart, 
          membership_end as membershipEnd, 
          last_visit as lastVisit, 
          notes, 
          created_at as createdAt, 
          updated_at as updatedAt
        FROM members
        WHERE id = ?
      `);
      
      return stmt.get(id) || null;
    } catch (error) {
      electronLog.error(`ID가 ${id}인 회원 조회 오류:`, error);
      return null;
    }
  }
  
  /**
   * 새 회원 추가
   */
  static add(member: Member): number {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();
      
      const stmt = db.prepare(`
        INSERT INTO members (
          name, phone, email, gender, birth_date, join_date, 
          membership_type, membership_start, membership_end, 
          notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      throw new Error('회원 추가 중 오류가 발생했습니다.');
    }
  }
  
  /**
   * 회원 정보 업데이트
   */
  static update(member: Member): boolean {
    try {
      if (!member.id) {
        throw new Error('회원 ID가 필요합니다');
      }
      
      const db = getDatabase();
      const now = new Date().toISOString();
      
      const stmt = db.prepare(`
        UPDATE members SET
          name = ?,
          phone = ?,
          email = ?,
          gender = ?,
          birth_date = ?,
          join_date = ?,
          membership_type = ?,
          membership_start = ?,
          membership_end = ?,
          notes = ?,
          updated_at = ?
        WHERE id = ?
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
        member.id
      );
      
      return result.changes > 0;
    } catch (error) {
      electronLog.error('회원 정보 업데이트 오류:', error);
      throw new Error('회원 정보 업데이트 중 오류가 발생했습니다.');
    }
  }
  
  /**
   * 회원 삭제
   */
  static delete(id: number): boolean {
    try {
      const db = getDatabase();
      
      // 트랜잭션 시작
      const deleteTransaction = db.transaction(() => {
        // 해당 회원의 출석 기록 삭제
        const deleteAttendance = db.prepare('DELETE FROM attendance WHERE member_id = ?');
        deleteAttendance.run(id);
        
        // 해당 회원의 결제 기록 삭제
        const deletePayments = db.prepare('DELETE FROM payments WHERE member_id = ?');
        deletePayments.run(id);
        
        // 회원 정보 삭제
        const deleteMember = db.prepare('DELETE FROM members WHERE id = ?');
        const result = deleteMember.run(id);
        
        return result.changes > 0;
      });
      
      return deleteTransaction();
    } catch (error) {
      electronLog.error(`ID가 ${id}인 회원 삭제 오류:`, error);
      throw new Error('회원 삭제 중 오류가 발생했습니다.');
    }
  }
  
  /**
   * 출석 기록 추가
   */
  static updateLastVisit(memberId: number, visitDate: string): boolean {
    try {
      const db = getDatabase();
      
      // 회원의 마지막 방문일 업데이트
      const stmt = db.prepare(`
        UPDATE members 
        SET last_visit = ?, updated_at = ? 
        WHERE id = ?
      `);
      
      const now = new Date().toISOString();
      const result = stmt.run(visitDate, now, memberId);
      
      return result.changes > 0;
    } catch (error) {
      electronLog.error(`ID가 ${memberId}인 회원의 마지막 방문일 업데이트 오류:`, error);
      return false;
    }
  }
} 