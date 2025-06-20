import { 
  promoteConsultationMember,
  createConsultationMember, 
  updateConsultationMember,
  getConsultationMemberById,
  ConsultationMemberData 
} from '../../database/consultationRepository';
import { setupDatabase, getDatabase, closeDatabase } from '../../database/setup';

describe('🔧 상담 회원 승격 버그 수정 테스트', () => {
  beforeAll(async () => {
    await setupDatabase();
  });

  afterAll(() => {
    closeDatabase();
  });

  beforeEach(() => {
    // 테스트용 데이터 초기화
    const db = getDatabase();
    db.exec('DELETE FROM consultation_members');
    db.exec('DELETE FROM members');
    db.exec('DELETE FROM payments');
    db.exec('DELETE FROM membership_types');
    
    // 테스트용 회원권 타입 생성
    db.prepare(`
      INSERT INTO membership_types (id, name, price, duration_months, is_active)
      VALUES (1, '일반 회원권', 100000, 1, 1)
    `).run();
  });

  test('❌ [BUG-FIX] is_promoted boolean 타입 문제 해결', () => {
    // Given: 상담 완료된 회원 생성
    const memberData: Omit<ConsultationMemberData, 'id' | 'created_at' | 'updated_at'> = {
      name: '테스트 회원',
      phone: '010-1234-5678',
      gender: '남',
      consultation_status: 'completed',
      is_promoted: 0  // 숫자 0으로 저장 (boolean false 대신)
    };

    const consultationMember = createConsultationMember(memberData);

    // When: 승격 시도
    const promotionData = {
      consultationMemberId: consultationMember.id!,
      membershipTypeId: 1,
      membershipType: '일반 회원권',
      startDate: '2025-01-01',
      endDate: '2025-02-01',
      paymentAmount: 100000,
      paymentMethod: 'card' as const
    };

    // Then: 성공적으로 승격되어야 함 (이전에는 실패했음)
    expect(() => {
      promoteConsultationMember(promotionData);
    }).not.toThrow();
  });

  test('❌ [BUG-FIX] undefined 업데이트 데이터 처리', () => {
    // Given: 상담 회원 생성
    const memberData: Omit<ConsultationMemberData, 'id' | 'created_at' | 'updated_at'> = {
      name: '테스트 회원2',
      phone: '010-9876-5432'
    };
    
    const member = createConsultationMember(memberData);

    // When: undefined와 null이 포함된 업데이트 시도 (이전에는 오류 발생)
    const updates = {
      birth_date: null,  // null 값
      fitness_goals: undefined,  // undefined 값
      health_conditions: '좋음'  // 정상 값
    };

    // Then: 오류 없이 업데이트되어야 함
    expect(() => {
      updateConsultationMember(member.id!, updates);
    }).not.toThrow();

    // 업데이트된 데이터 확인
    const updatedMember = getConsultationMemberById(member.id!);
    expect(updatedMember?.health_conditions).toBe('좋음');
  });

  test('✅ 승격 조건 검증 - 미완료 상담 거부', () => {
    // Given: 상담 미완료 회원
    const memberData: Omit<ConsultationMemberData, 'id' | 'created_at' | 'updated_at'> = {
      name: '미완료 회원',
      consultation_status: 'pending',  // 미완료 상태
      is_promoted: 0
    };
    
    const member = createConsultationMember(memberData);

    // When: 승격 시도
    const promotionData = {
      consultationMemberId: member.id!,
      membershipTypeId: 1,
      membershipType: '일반 회원권',
      startDate: '2025-01-01',
      endDate: '2025-02-01',
      paymentAmount: 100000,
      paymentMethod: 'card' as const
    };

    // Then: 승격이 실패해야 함
    expect(() => {
      promoteConsultationMember(promotionData);
    }).toThrow('승격할 수 없는 상담 회원입니다');
  });

  test('✅ 승격 조건 검증 - 이미 승격된 회원 거부', () => {
    // Given: 이미 승격된 회원
    const memberData: Omit<ConsultationMemberData, 'id' | 'created_at' | 'updated_at'> = {
      name: '이미 승격된 회원',
      consultation_status: 'completed',
      is_promoted: 1  // 이미 승격됨
    };
    
    const member = createConsultationMember(memberData);

    // When: 다시 승격 시도
    const promotionData = {
      consultationMemberId: member.id!,
      membershipTypeId: 1,
      membershipType: '일반 회원권',
      startDate: '2025-01-01',
      endDate: '2025-02-01',
      paymentAmount: 100000,
      paymentMethod: 'card' as const
    };

    // Then: 승격이 실패해야 함
    expect(() => {
      promoteConsultationMember(promotionData);
    }).toThrow('승격할 수 없는 상담 회원입니다');
  });

  test('✅ 정상 승격 플로우 - 전체 검증', () => {
    // Given: 승격 가능한 상담 회원
    const memberData: Omit<ConsultationMemberData, 'id' | 'created_at' | 'updated_at'> = {
      name: '정상 승격 대상',
      phone: '010-1111-2222',
      email: 'test@example.com',
      gender: '여',
      birth_date: Math.floor(new Date('1990-01-01').getTime() / 1000),
      consultation_status: 'completed',
      fitness_goals: JSON.stringify(['체중 감량', '근력 증가']),
      health_conditions: '양호',
      staff_id: 1,
      staff_name: '김트레이너',
      is_promoted: 0
    };
    
    const member = createConsultationMember(memberData);

    // When: 승격 실행
    const promotionData = {
      consultationMemberId: member.id!,
      membershipTypeId: 1,
      membershipType: '일반 회원권',
      startDate: '2025-01-01',
      endDate: '2025-02-01',
      paymentAmount: 100000,
      paymentMethod: 'card' as const,
      notes: '테스트 승격'
    };

    const result = promoteConsultationMember(promotionData);

    // Then: 결과 검증
    expect(result).toHaveProperty('memberId');
    expect(result).toHaveProperty('consultationMemberId');
    expect(typeof result.memberId).toBe('number');
    expect(result.consultationMemberId).toBe(member.id);

    // 상담 회원 상태 업데이트 확인
    const updatedConsultationMember = getConsultationMemberById(member.id!);
    expect(updatedConsultationMember?.is_promoted).toBe(true);
    expect(updatedConsultationMember?.promoted_member_id).toBe(result.memberId);

    // 새로 생성된 정식 회원 확인
    const db = getDatabase();
    const newMember = db.prepare('SELECT * FROM members WHERE id = ?').get(result.memberId);
    expect(newMember).toBeTruthy();
    expect(newMember.name).toBe('정상 승격 대상');
    expect(newMember.phone).toBe('010-1111-2222');
    expect(newMember.membership_type).toBe('일반 회원권');

    // 결제 기록 생성 확인
    const payment = db.prepare('SELECT * FROM payments WHERE member_id = ?').get(result.memberId);
    expect(payment).toBeTruthy();
    expect(payment.amount).toBe(100000);
    expect(payment.payment_method).toBe('card');
    expect(payment.description).toContain('회원 승격 결제');
  });
}); 