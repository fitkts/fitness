import { transformNewMemberData, validateMemberData } from '../../utils/consultationUtils';
import { NewMemberFormData } from '../../types/consultation';

describe('상담 회원 데이터 변환 테스트', () => {
  const sampleFormData: NewMemberFormData = {
    name: '김태석',
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

  describe('transformNewMemberData', () => {
    it('모든 필드가 올바르게 변환되어야 함', () => {
      const result = transformNewMemberData(sampleFormData);
      
      expect(result.name).toBe('김태석');
      expect(result.phone).toBe('010-1234-5678');
      expect(result.email).toBe('test@example.com');
      expect(result.gender).toBe('남');
      expect(result.consultation_status).toBe('pending');
      expect(result.health_conditions).toBe('특별한 건강상 문제 없음');
      expect(result.membership_type).toBe('1개월 회원권');
      expect(result.staff_id).toBe(1);
      expect(result.staff_name).toBe('트레이너 김');
      expect(result.notes).toBe('상담 예정 회원');
    });

    it('날짜 문자열이 Unix timestamp로 올바르게 변환되어야 함', () => {
      const result = transformNewMemberData(sampleFormData);
      
      // birth_date: '1990-05-15' -> Unix timestamp
      const expectedBirthTimestamp = Math.floor(new Date('1990-05-15').getTime() / 1000);
      expect(result.birth_date).toBe(expectedBirthTimestamp);
      
      // first_visit: '2024-01-20' -> Unix timestamp
      const expectedVisitTimestamp = Math.floor(new Date('2024-01-20').getTime() / 1000);
      expect(result.first_visit).toBe(expectedVisitTimestamp);
      
      // join_date는 현재 시간으로 설정되어야 함
      expect(result.join_date).toBeCloseTo(Math.floor(Date.now() / 1000), -1);
    });

    it('fitness_goals 배열이 JSON 문자열로 변환되어야 함', () => {
      const result = transformNewMemberData(sampleFormData);
      
      expect(result.fitness_goals).toBe(JSON.stringify(['체중감량', '근력강화', '체력향상']));
    });

    it('승격 관련 필드가 초기값으로 설정되어야 함', () => {
      const result = transformNewMemberData(sampleFormData);
      
      expect(result.is_promoted).toBe(0);
      expect(result.promoted_at).toBeUndefined();
      expect(result.promoted_member_id).toBeUndefined();
    });

    it('회원권 관련 필드가 초기 상담 단계에 맞게 설정되어야 함', () => {
      const result = transformNewMemberData(sampleFormData);
      
      expect(result.membership_start).toBeUndefined();
      expect(result.membership_end).toBeUndefined();
      expect(result.last_visit).toBeUndefined();
    });

    it('선택적 필드가 비어있을 때 undefined로 처리되어야 함', () => {
      const minimalData: NewMemberFormData = {
        name: '김태석',
        phone: '010-1234-5678'
      };
      
      const result = transformNewMemberData(minimalData);
      
      expect(result.email).toBeUndefined(); 
      expect(result.gender).toBeUndefined();
      expect(result.birth_date).toBeUndefined();
      expect(result.first_visit).toBeUndefined();
      expect(result.health_conditions).toBeUndefined();
      expect(result.fitness_goals).toBeUndefined();
      expect(result.membership_type).toBeUndefined();
      expect(result.staff_id).toBeUndefined();
      expect(result.staff_name).toBeUndefined();
      expect(result.notes).toBeUndefined();
    });

    it('빈 fitness_goals 배열은 undefined로 처리되어야 함', () => {
      const dataWithEmptyGoals: NewMemberFormData = {
        ...sampleFormData,
        fitness_goals: []
      };
      
      const result = transformNewMemberData(dataWithEmptyGoals);
      expect(result.fitness_goals).toBeUndefined();
    });

    it('전화번호에서 숫자와 하이픈만 유지되어야 함', () => {
      const dataWithSpecialChars: NewMemberFormData = {
        ...sampleFormData,
        phone: '010-1234-5678 (개인번호)'
      };
      
      const result = transformNewMemberData(dataWithSpecialChars);
      expect(result.phone).toBe('010-1234-5678');
    });

    it('잘못된 날짜 형식은 undefined로 처리되어야 함', () => {
      const dataWithInvalidDate: NewMemberFormData = {
        ...sampleFormData,
        birth_date: 'invalid-date'
      };
      
      const result = transformNewMemberData(dataWithInvalidDate);
      expect(result.birth_date).toBeUndefined();
    });
  });

  describe('validateMemberData', () => {
    it('유효한 데이터는 에러가 없어야 함', () => {
      const errors = validateMemberData(sampleFormData);
      expect(errors).toHaveLength(0);
    });

    it('필수 필드가 누락되면 에러를 반환해야 함', () => {
      const invalidData: NewMemberFormData = {
        name: '',
        phone: ''
      };
      
      const errors = validateMemberData(invalidData);
      expect(errors).toContain('회원명은 필수 입력 항목입니다.');
      expect(errors).toContain('연락처는 필수 입력 항목입니다.');
    });

    it('잘못된 이메일 형식은 에러를 반환해야 함', () => {
      const invalidEmailData: NewMemberFormData = {
        ...sampleFormData,
        email: 'invalid-email'
      };
      
      const errors = validateMemberData(invalidEmailData);
      expect(errors).toContain('올바른 이메일 형식이 아닙니다.');
    });

    it('잘못된 전화번호 형식은 에러를 반환해야 함', () => {
      const invalidPhoneData: NewMemberFormData = {
        ...sampleFormData,
        phone: '010-abc-defg'
      };
      
      const errors = validateMemberData(invalidPhoneData);
      expect(errors).toContain('전화번호는 숫자와 하이픈만 포함할 수 있습니다.');
    });

    it('미래 날짜의 생년월일은 에러를 반환해야 함', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const futureBirthData: NewMemberFormData = {
        ...sampleFormData,
        birth_date: futureDate.toISOString().split('T')[0]
      };
      
      const errors = validateMemberData(futureBirthData);
      expect(errors).toContain('생년월일은 오늘보다 이전 날짜여야 합니다.');
    });

    it('미래 날짜의 최초 방문일은 에러를 반환해야 함', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const futureVisitData: NewMemberFormData = {
        ...sampleFormData,
        first_visit: futureDate.toISOString().split('T')[0]
      };
      
      const errors = validateMemberData(futureVisitData);
      expect(errors).toContain('최초 방문일은 오늘보다 이전 날짜여야 합니다.');
    });
  });
}); 