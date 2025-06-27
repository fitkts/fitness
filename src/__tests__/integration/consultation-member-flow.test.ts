import { transformNewMemberData, validateMemberData } from '../../utils/consultationUtils';
import { NewMemberFormData, ConsultationMember } from '../../types/consultation';

describe('상담 회원 데이터 플로우 통합 테스트', () => {
  const mockFormData: NewMemberFormData = {
    name: '김상담',
    phone: '010-1234-5678',
    email: 'test@example.com',
    gender: '남',
    birth_date: '1990-05-15',
    first_visit: '2024-01-20',
    health_conditions: '특별한 건강상 문제 없음',
    fitness_goals: ['체중감량', '근력강화', '체력향상'],
    membership_type: '1개월 회원권',
    staff_id: 1,
    staff_name: '트레이너 김',
    consultation_status: 'pending',
    notes: '상담 예정 회원'
  };

  describe('모달 → 데이터베이스 전체 플로우', () => {
    it('폼 데이터가 데이터베이스 스키마와 완전히 일치해야 함', () => {
      // 1단계: 유효성 검증
      const validationErrors = validateMemberData(mockFormData);
      expect(validationErrors).toHaveLength(0);

      // 2단계: 데이터 변환
      const transformedData = transformNewMemberData(mockFormData);

      // 3단계: 데이터베이스 스키마 일치성 검증
      // consultation_members 테이블의 모든 필드가 있는지 확인
      expect(transformedData).toHaveProperty('name');
      expect(transformedData).toHaveProperty('phone');
      expect(transformedData).toHaveProperty('email');
      expect(transformedData).toHaveProperty('gender');
      expect(transformedData).toHaveProperty('birth_date');
      expect(transformedData).toHaveProperty('join_date');
      expect(transformedData).toHaveProperty('first_visit');
      expect(transformedData).toHaveProperty('membership_type');
      expect(transformedData).toHaveProperty('membership_start');
      expect(transformedData).toHaveProperty('membership_end');
      expect(transformedData).toHaveProperty('last_visit');
      expect(transformedData).toHaveProperty('notes');
      expect(transformedData).toHaveProperty('staff_id');
      expect(transformedData).toHaveProperty('staff_name');
      expect(transformedData).toHaveProperty('consultation_status');
      expect(transformedData).toHaveProperty('health_conditions');
      expect(transformedData).toHaveProperty('fitness_goals');
      expect(transformedData).toHaveProperty('is_promoted');
      expect(transformedData).toHaveProperty('promoted_at');
      expect(transformedData).toHaveProperty('promoted_member_id');
      expect(transformedData).toHaveProperty('created_at');
      expect(transformedData).toHaveProperty('updated_at');
    });

    it('변환된 데이터가 올바른 타입을 가져야 함', () => {
      const transformedData = transformNewMemberData(mockFormData);

      // 문자열 필드
      expect(typeof transformedData.name).toBe('string');
      expect(typeof transformedData.phone).toBe('string');
      expect(typeof transformedData.consultation_status).toBe('string');

      // 숫자 필드 (Unix timestamp)
      expect(typeof transformedData.birth_date).toBe('number');
      expect(typeof transformedData.join_date).toBe('number');
      expect(typeof transformedData.first_visit).toBe('number');
      expect(typeof transformedData.created_at).toBe('number');
      expect(typeof transformedData.updated_at).toBe('number');

      // Boolean/Number 필드
      expect(typeof transformedData.is_promoted).toBe('number');
      expect(transformedData.is_promoted).toBe(0);

      // JSON 문자열 필드
      expect(typeof transformedData.fitness_goals).toBe('string');
      expect(() => JSON.parse(transformedData.fitness_goals)).not.toThrow();
    });

    it('변환된 데이터의 값이 정확해야 함', () => {
      const transformedData = transformNewMemberData(mockFormData);

      // 기본 정보
      expect(transformedData.name).toBe('김상담');
      expect(transformedData.phone).toBe('010-1234-5678');
      expect(transformedData.email).toBe('test@example.com');
      expect(transformedData.gender).toBe('남');
      expect(transformedData.consultation_status).toBe('pending');
      expect(transformedData.health_conditions).toBe('특별한 건강상 문제 없음');
      expect(transformedData.membership_type).toBe('1개월 회원권');
      expect(transformedData.staff_id).toBe(1);
      expect(transformedData.staff_name).toBe('트레이너 김');
      expect(transformedData.notes).toBe('상담 예정 회원');

      // 날짜 변환 검증
      const expectedBirthTimestamp = Math.floor(new Date('1990-05-15').getTime() / 1000);
      const expectedVisitTimestamp = Math.floor(new Date('2024-01-20').getTime() / 1000);
      
      expect(transformedData.birth_date).toBe(expectedBirthTimestamp);
      expect(transformedData.first_visit).toBe(expectedVisitTimestamp);

      // JSON 변환 검증
      const parsedGoals = JSON.parse(transformedData.fitness_goals);
      expect(parsedGoals).toEqual(['체중감량', '근력강화', '체력향상']);

      // 초기값 검증
      expect(transformedData.is_promoted).toBe(0);
      expect(transformedData.membership_start).toBeUndefined();
      expect(transformedData.membership_end).toBeUndefined();
      expect(transformedData.last_visit).toBeUndefined();
      expect(transformedData.promoted_at).toBeUndefined();
      expect(transformedData.promoted_member_id).toBeUndefined();
    });

    it('IPC 데이터 변환이 중복되지 않아야 함', () => {
      // Frontend에서 변환된 데이터
      const transformedData = transformNewMemberData(mockFormData);
      
      // Backend에서 다시 변환하지 않고 그대로 사용해야 함
      expect(typeof transformedData.birth_date).toBe('number');
      expect(typeof transformedData.first_visit).toBe('number');
      expect(typeof transformedData.fitness_goals).toBe('string');
      
      // 이미 변환된 데이터를 다시 변환하면 오류가 발생할 수 있음
      // 따라서 Backend에서는 타입 체크만 하고 그대로 사용해야 함
    });

    it('필수 필드가 누락되면 검증에 실패해야 함', () => {
      const incompleteData: NewMemberFormData = {
        name: '',
        phone: ''
      };

      const errors = validateMemberData(incompleteData);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors).toContain('회원명은 필수 입력 항목입니다.');
      expect(errors).toContain('연락처는 필수 입력 항목입니다.');
    });

    it('잘못된 데이터 형식은 안전하게 처리되어야 함', () => {
      const invalidData: NewMemberFormData = {
        name: '김상담',
        phone: '010-1234-5678',
        birth_date: 'invalid-date',
        first_visit: 'invalid-date',
        email: 'invalid-email',
        fitness_goals: []
      };

      // 검증 단계에서 이메일 오류는 잡힘
      const errors = validateMemberData(invalidData);
      expect(errors).toContain('올바른 이메일 형식이 아닙니다.');

      // 변환 단계에서 잘못된 날짜는 undefined로 처리
      const transformedData = transformNewMemberData(invalidData);
      expect(transformedData.birth_date).toBeUndefined();
      expect(transformedData.first_visit).toBeUndefined();
      expect(transformedData.fitness_goals).toBeUndefined(); // 빈 배열은 undefined로
    });
  });

  describe('데이터 일관성 검증', () => {
    it('변환된 데이터가 ConsultationMember 타입과 호환되어야 함', () => {
      const transformedData = transformNewMemberData(mockFormData);
      
      // TypeScript 타입 체크를 위한 변수 할당
      // 실제로는 컴파일 타임에 타입 체크가 이루어짐
      const consultationMember: Partial<ConsultationMember> = {
        ...transformedData,
        id: 1 // ID는 데이터베이스에서 자동 생성
      };

      expect(consultationMember.name).toBeDefined();
      expect(consultationMember.phone).toBeDefined();
      expect(consultationMember.consultation_status).toBeDefined();
    });

    it('날짜 데이터가 일관된 형식으로 저장되어야 함', () => {
      const transformedData = transformNewMemberData(mockFormData);
      
      // 모든 날짜가 Unix timestamp (초 단위)로 저장되어야 함
      if (transformedData.birth_date) {
        expect(transformedData.birth_date).toBeGreaterThan(0);
        expect(transformedData.birth_date.toString().length).toBeGreaterThanOrEqual(9); // Unix timestamp는 9-10자리
        expect(transformedData.birth_date.toString().length).toBeLessThanOrEqual(10);
      }
      
      if (transformedData.first_visit) {
        expect(transformedData.first_visit).toBeGreaterThan(0);
        expect(transformedData.first_visit.toString().length).toBeGreaterThanOrEqual(9);
        expect(transformedData.first_visit.toString().length).toBeLessThanOrEqual(10);
      }
      
      expect(transformedData.join_date).toBeGreaterThan(0);
      expect(transformedData.join_date.toString().length).toBeGreaterThanOrEqual(9);
      expect(transformedData.join_date.toString().length).toBeLessThanOrEqual(10);
    });

    it('JSON 데이터가 올바르게 직렬화되어야 함', () => {
      const transformedData = transformNewMemberData(mockFormData);
      
      if (transformedData.fitness_goals) {
        // JSON 문자열이어야 함
        expect(typeof transformedData.fitness_goals).toBe('string');
        
        // 파싱이 가능해야 함
        const parsed = JSON.parse(transformedData.fitness_goals);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toEqual(['체중감량', '근력강화', '체력향상']);
      }
    });
  });
}); 