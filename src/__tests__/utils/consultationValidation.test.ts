import { 
  validateMemberEdit, 
  convertToUpdateData, 
  convertToFormData, 
  formatPhoneNumber 
} from '../../utils/consultationValidation';
import { MemberEditFormData, ConsultationMember } from '../../types/consultation';

describe('상담 회원 검증 및 변환 테스트', () => {
  const mockFormData: MemberEditFormData = {
    name: '김테스트',
    phone: '010-1234-5678',
    email: 'test@example.com',
    gender: '남',
    birth_date: '1990-05-15',
    consultation_status: 'pending',
    health_conditions: '특별한 건강상 문제 없음',
    fitness_goals: ['체중감량', '근력강화'],
    notes: '테스트 노트',
    staff_id: 1,
    staff_name: '트레이너김'
  };

  const mockConsultationMember: ConsultationMember = {
    id: 1,
    name: '김테스트',
    phone: '010-1234-5678',
    email: 'test@example.com',
    gender: '남',
    birth_date: Math.floor(new Date('1990-05-15').getTime() / 1000),
    join_date: Math.floor(Date.now() / 1000),
    consultation_status: 'pending',
    health_conditions: '특별한 건강상 문제 없음',
    fitness_goals: JSON.stringify(['체중감량', '근력강화']) as any,
    notes: '테스트 노트',
    staff_id: 1,
    staff_name: '트레이너',
    is_promoted: false,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000)
  };

  describe('validateMemberEdit', () => {
    it('유효한 데이터는 에러가 없어야 함', () => {
      const errors = validateMemberEdit(mockFormData);
      expect(errors).toHaveLength(0);
    });

    it('필수 필드가 누락되면 에러를 반환해야 함', () => {
      const invalidData: MemberEditFormData = {
        ...mockFormData,
        name: '',
        phone: ''
      };
      
      const errors = validateMemberEdit(invalidData);
      expect(errors).toContain('이름은 필수 입력 항목입니다.');
      expect(errors).toContain('전화번호는 필수 입력 항목입니다.');
    });

    it('잘못된 전화번호 형식은 에러를 반환해야 함', () => {
      const invalidData: MemberEditFormData = {
        ...mockFormData,
        phone: '010-123-456'
      };
      
      const errors = validateMemberEdit(invalidData);
      expect(errors).toContain('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
    });

    it('잘못된 이메일 형식은 에러를 반환해야 함', () => {
      const invalidData: MemberEditFormData = {
        ...mockFormData,
        email: 'invalid-email'
      };
      
      const errors = validateMemberEdit(invalidData);
      expect(errors).toContain('이메일 형식이 올바르지 않습니다.');
    });

    it('잘못된 생년월일 형식은 에러를 반환해야 함', () => {
      const invalidData: MemberEditFormData = {
        ...mockFormData,
        birth_date: '1990/05/15'
      };
      
      const errors = validateMemberEdit(invalidData);
      expect(errors).toContain('생년월일 형식이 올바르지 않습니다. (예: 1990-01-01)');
    });
  });

  describe('convertToUpdateData', () => {
    it('폼 데이터를 업데이트 데이터로 올바르게 변환해야 함', () => {
      const updateData = convertToUpdateData(1, mockFormData);
      
      expect(updateData.id).toBe(1);
      expect(updateData.name).toBe('김테스트');
      expect(updateData.phone).toBe('010-1234-5678');
      expect(updateData.email).toBe('test@example.com');
      expect(updateData.gender).toBe('남');
      expect(updateData.consultation_status).toBe('pending');
      expect(updateData.health_conditions).toBe('특별한 건강상 문제 없음');
      expect(updateData.notes).toBe('테스트 노트');
      expect(updateData.staff_id).toBe(1);
    });

    it('날짜 문자열을 Unix timestamp로 변환해야 함', () => {
      const updateData = convertToUpdateData(1, mockFormData);
      
      const expectedTimestamp = Math.floor(new Date('1990-05-15').getTime() / 1000);
      expect(updateData.birth_date).toBe(expectedTimestamp);
    });

    it('fitness_goals 배열을 그대로 유지해야 함', () => {
      const updateData = convertToUpdateData(1, mockFormData);
      
      expect(Array.isArray(updateData.fitness_goals)).toBe(true);
      expect(updateData.fitness_goals).toEqual(['체중감량', '근력강화']);
    });

    it('빈 문자열은 undefined로 변환해야 함', () => {
      const emptyFormData: MemberEditFormData = {
        ...mockFormData,
        email: '',
        health_conditions: '',
        notes: '',
        birth_date: ''
      };
      
      const updateData = convertToUpdateData(1, emptyFormData);
      
      expect(updateData.email).toBeUndefined();
      expect(updateData.health_conditions).toBeUndefined();
      expect(updateData.notes).toBeUndefined();
      expect(updateData.birth_date).toBeUndefined();
    });

    it('잘못된 날짜 형식은 undefined로 처리해야 함', () => {
      const invalidDateFormData: MemberEditFormData = {
        ...mockFormData,
        birth_date: 'invalid-date'
      };
      
      const updateData = convertToUpdateData(1, invalidDateFormData);
      expect(updateData.birth_date).toBeUndefined();
    });
  });

  describe('convertToFormData', () => {
    it('상담 회원 데이터를 폼 데이터로 올바르게 변환해야 함', () => {
      const formData = convertToFormData(mockConsultationMember);
      
      expect(formData.name).toBe('김테스트');
      expect(formData.phone).toBe('010-1234-5678');
      expect(formData.email).toBe('test@example.com');
      expect(formData.gender).toBe('남');
      expect(formData.birth_date).toBe('1990-05-15');
      expect(formData.consultation_status).toBe('pending');
      expect(formData.health_conditions).toBe('특별한 건강상 문제 없음');
      expect(formData.notes).toBe('테스트 노트');
      expect(formData.staff_id).toBe(1);
    });

    it('Unix timestamp를 날짜 문자열로 변환해야 함', () => {
      const formData = convertToFormData(mockConsultationMember);
      expect(formData.birth_date).toBe('1990-05-15');
    });

    it('JSON 문자열 fitness_goals를 배열로 변환해야 함', () => {
      const formData = convertToFormData(mockConsultationMember);
      
      expect(Array.isArray(formData.fitness_goals)).toBe(true);
      expect(formData.fitness_goals).toEqual(['체중감량', '근력강화']);
    });

    it('이미 배열인 fitness_goals는 그대로 유지해야 함', () => {
      const memberWithArrayGoals: ConsultationMember = {
        ...mockConsultationMember,
        fitness_goals: ['체중감량', '근력강화'] as any
      };
      
      const formData = convertToFormData(memberWithArrayGoals);
      expect(formData.fitness_goals).toEqual(['체중감량', '근력강화']);
    });

    it('잘못된 JSON 문자열은 빈 배열로 처리해야 함', () => {
      const memberWithInvalidJson: ConsultationMember = {
        ...mockConsultationMember,
        fitness_goals: 'invalid-json' as any
      };
      
      const formData = convertToFormData(memberWithInvalidJson);
      expect(formData.fitness_goals).toEqual([]);
    });

    it('undefined 값들을 빈 문자열로 처리해야 함', () => {
      const memberWithUndefined: ConsultationMember = {
        ...mockConsultationMember,
        email: undefined,
        health_conditions: undefined,
        notes: undefined,
        birth_date: undefined
      };
      
      const formData = convertToFormData(memberWithUndefined);
      
      expect(formData.email).toBe('');
      expect(formData.health_conditions).toBe('');
      expect(formData.notes).toBe('');
      expect(formData.birth_date).toBe('');
    });
  });

  describe('formatPhoneNumber', () => {
    it('전화번호를 올바른 형식으로 포맷팅해야 함', () => {
      expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
      expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678');
      expect(formatPhoneNumber('010 1234 5678')).toBe('010-1234-5678');
    });

    it('짧은 번호는 부분적으로 포맷팅해야 함', () => {
      expect(formatPhoneNumber('010')).toBe('010');
      expect(formatPhoneNumber('01012')).toBe('010-12');
      expect(formatPhoneNumber('0101234')).toBe('010-1234');
    });

    it('11자리를 넘는 번호는 잘라내야 함', () => {
      expect(formatPhoneNumber('010123456789')).toBe('010-1234-5678');
    });
  });

  describe('데이터 변환 라운드트립 테스트', () => {
    it('ConsultationMember → FormData → UpdateData 변환이 일관되어야 함', () => {
      // 1. ConsultationMember → FormData
      const formData = convertToFormData(mockConsultationMember);
      
      // 2. FormData → UpdateData
      const updateData = convertToUpdateData(mockConsultationMember.id!, formData);
      
      // 3. 핵심 데이터가 보존되는지 확인
      expect(updateData.name).toBe(mockConsultationMember.name);
      expect(updateData.phone).toBe(mockConsultationMember.phone);
      expect(updateData.email).toBe(mockConsultationMember.email);
      expect(updateData.gender).toBe(mockConsultationMember.gender);
      expect(updateData.birth_date).toBe(mockConsultationMember.birth_date);
      expect(updateData.consultation_status).toBe(mockConsultationMember.consultation_status);
      expect(updateData.health_conditions).toBe(mockConsultationMember.health_conditions);
      expect(updateData.notes).toBe(mockConsultationMember.notes);
      expect(updateData.staff_id).toBe(mockConsultationMember.staff_id);
      
      // fitness_goals는 배열로 변환되어야 함
      expect(Array.isArray(updateData.fitness_goals)).toBe(true);
      expect(updateData.fitness_goals).toEqual(['체중감량', '근력강화']);
    });
  });

  describe('staff_name 처리 테스트', () => {
    it('convertToUpdateData에서 staff_name이 포함되어야 함', () => {
      const formData: MemberEditFormData = {
        ...mockFormData,
        staff_id: 1,
        staff_name: '김트레이너'
      };
      
      const updateData = convertToUpdateData(1, formData);
      
      expect(updateData.staff_id).toBe(1);
      expect(updateData.staff_name).toBe('김트레이너');
    });

    it('convertToFormData에서 staff_name이 올바르게 변환되어야 함', () => {
      const member: ConsultationMember = {
        ...mockConsultationMember,
        staff_id: 1,
        staff_name: '이트레이너'
      };
      
      const formData = convertToFormData(member);
      
      expect(formData.staff_id).toBe(1);
      expect(formData.staff_name).toBe('이트레이너');
    });

    it('staff_name이 없을 때 빈 문자열로 처리되어야 함', () => {
      const member: ConsultationMember = {
        ...mockConsultationMember,
        staff_id: 1,
        staff_name: undefined
      };
      
      const formData = convertToFormData(member);
      
      expect(formData.staff_id).toBe(1);
      expect(formData.staff_name).toBe('');
    });

    it('staff_name이 공백일 때 undefined로 변환되어야 함', () => {
      const formData: MemberEditFormData = {
        ...mockFormData,
        staff_id: 1,
        staff_name: '   '
      };
      
      const updateData = convertToUpdateData(1, formData);
      
      expect(updateData.staff_id).toBe(1);
      expect(updateData.staff_name).toBeUndefined();
    });

    it('staff_id가 없을 때 staff_name도 빈 문자열이어야 함', () => {
      const formData: MemberEditFormData = {
        ...mockFormData,
        staff_id: undefined,
        staff_name: ''
      };
      
      const updateData = convertToUpdateData(1, formData);
      
      expect(updateData.staff_id).toBeUndefined();
      expect(updateData.staff_name).toBeUndefined();
    });
  });
}); 