import React, { useState, useEffect } from 'react';
import { 
  ConsultationMember,
  ConsultationTableFilters,
  ConsultationTableSort,
  NewMemberFormData,
  ConsultationRecord,
  ConsultationFormData
} from '../types/consultation';
import { 
  filterMembers, 
  sortMembers, 
  transformNewMemberData 
} from '../utils/consultationUtils';
import { 
  transformConsultationFormData 
} from '../utils/consultationRecordUtils';
import ConsultationTable from '../components/consultation/ConsultationTable';
import NewMemberModal from '../components/consultation/NewMemberModal';
import ConsultationDetailModal from '../components/consultation/ConsultationDetailModal';
import AddConsultationModal from '../components/consultation/AddConsultationModal';
import { MESSAGES } from '../config/consultationConfig';

const ConsultationDashboard: React.FC = () => {
  // 상태 관리
  const [allMembers, setAllMembers] = useState<ConsultationMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<ConsultationMember[]>([]);
  const [filters, setFilters] = useState<ConsultationTableFilters>({});
  const [sort, setSort] = useState<ConsultationTableSort>({
    field: 'last_visit',
    direction: 'desc'
  });
  const [loading, setLoading] = useState(true);
  
  // 모달 상태
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddConsultationModalOpen, setIsAddConsultationModalOpen] = useState(false);
  
  // 선택된 회원 및 상담 기록
  const [selectedMember, setSelectedMember] = useState<ConsultationMember | null>(null);
  const [consultationRecords, setConsultationRecords] = useState<ConsultationRecord[]>([]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadMembers();
    loadConsultationRecords();
  }, []);

  // 필터 및 정렬 적용
  useEffect(() => {
    let result = [...allMembers];
    
    // 필터 적용
    result = filterMembers(result, filters);
    
    // 정렬 적용
    result = sortMembers(result, sort);
    
    setFilteredMembers(result);
  }, [allMembers, filters, sort]);

  // 회원 데이터 로드 (실제로는 API 호출)
  const loadMembers = async () => {
    setLoading(true);
    try {
      // TODO: 실제 API 호출로 대체
      // const response = await api.getConsultationMembers();
      // setAllMembers(response.data);
      
      // 임시 더미 데이터
      const dummyMembers: ConsultationMember[] = [
        {
          id: 1,
          name: '김철수',
          phone: '010-1234-5678',
          email: 'kimcs@example.com',
          gender: '남',
          birth_date: Math.floor(new Date('1990-05-15').getTime() / 1000),
          join_date: Math.floor(new Date('2024-01-15').getTime() / 1000),
          first_visit: Math.floor(new Date('2024-01-16').getTime() / 1000),
          consultation_status: 'in_progress',
          membership_type: '3개월 회원권',
          staff_name: '이트레이너',
          last_visit: Math.floor(new Date('2024-01-20').getTime() / 1000),
          fitness_goals: ['체중 감량', '근육량 증가'],
          health_conditions: '무릎 관절염 주의',
          emergency_contact: '010-9876-5432',
          notes: '초보자, 천천히 시작',
          created_at: Math.floor(new Date('2024-01-15').getTime() / 1000),
          updated_at: Math.floor(new Date('2024-01-20').getTime() / 1000)
        },
        {
          id: 2,
          name: '박영희',
          phone: '010-2345-6789',
          email: 'parkyhee@example.com',
          gender: '여',
          birth_date: Math.floor(new Date('1985-08-22').getTime() / 1000),
          join_date: Math.floor(new Date('2024-01-10').getTime() / 1000),
          first_visit: Math.floor(new Date('2024-01-11').getTime() / 1000),
          consultation_status: 'completed',
          membership_type: '6개월 회원권',
          staff_name: '김트레이너',
          last_visit: Math.floor(new Date('2024-01-18').getTime() / 1000),
          fitness_goals: ['체력 향상', '스트레스 해소'],
          health_conditions: '특이사항 없음',
          emergency_contact: '010-8765-4321',
          notes: '요가 선호',
          created_at: Math.floor(new Date('2024-01-10').getTime() / 1000),
          updated_at: Math.floor(new Date('2024-01-18').getTime() / 1000)
        },
        {
          id: 3,
          name: '최민수',
          phone: '010-3456-7890',
          email: 'choims@example.com',
          gender: '남',
          birth_date: Math.floor(new Date('1992-03-10').getTime() / 1000),
          join_date: Math.floor(new Date('2024-01-05').getTime() / 1000),
          first_visit: Math.floor(new Date('2024-01-06').getTime() / 1000),
          consultation_status: 'pending',
          membership_type: '1개월 회원권',
          staff_name: '이트레이너',
          last_visit: Math.floor(new Date('2024-01-12').getTime() / 1000),
          fitness_goals: ['근육량 증가', '운동 기능 향상'],
          health_conditions: '허리 디스크 주의',
          emergency_contact: '010-7654-3210',
          notes: '운동 경험 많음',
          created_at: Math.floor(new Date('2024-01-05').getTime() / 1000),
          updated_at: Math.floor(new Date('2024-01-12').getTime() / 1000)
        }
      ];
      
      setAllMembers(dummyMembers);
    } catch (error) {
      console.error('회원 데이터 로드 실패:', error);
      // TODO: 에러 토스트 메시지 표시
    } finally {
      setLoading(false);
    }
  };

  // 상담 기록 로드 (실제로는 API 호출)
  const loadConsultationRecords = async () => {
    try {
      // TODO: 실제 API 호출로 대체
      // const response = await api.getConsultationRecords();
      // setConsultationRecords(response.data);
      
      // 임시 더미 데이터
      const dummyRecords: ConsultationRecord[] = [
        {
          id: 1,
          member_id: 1,
          consultation_date: Math.floor(new Date('2024-01-15').getTime() / 1000),
          consultation_type: 'initial',
          consultant_id: 1,
          consultant_name: '이트레이너',
          content: '첫 상담을 진행했습니다. 회원님의 운동 목표는 체중 감량과 근육량 증가이며, 무릎 관절염이 있어 주의가 필요합니다. 현재 운동 경험이 거의 없어서 기초부터 차근차근 시작하기로 했습니다.',
          goals_discussed: ['체중 감량', '근육량 증가'],
          recommendations: '주 3회 이상 운동, 유산소와 근력운동 병행, 무릎에 부담이 적은 운동 위주로 진행',
          next_appointment: Math.floor(new Date('2024-01-22').getTime() / 1000),
          status: 'completed',
          created_at: Math.floor(new Date('2024-01-15').getTime() / 1000),
          updated_at: Math.floor(new Date('2024-01-15').getTime() / 1000)
        },
        {
          id: 2,
          member_id: 2,
          consultation_date: Math.floor(new Date('2024-01-10').getTime() / 1000),
          consultation_type: 'initial',
          consultant_id: 2,
          consultant_name: '김트레이너',
          content: '초기 상담을 통해 회원님의 목표와 현재 상태를 파악했습니다. 주로 스트레스 해소와 체력 향상이 목표이시며, 요가를 선호하신다고 하셨습니다.',
          goals_discussed: ['체력 향상', '스트레스 해소'],
          recommendations: '요가 클래스 참여, 주 2-3회 운동, 명상과 스트레칭 병행',
          status: 'completed',
          created_at: Math.floor(new Date('2024-01-10').getTime() / 1000),
          updated_at: Math.floor(new Date('2024-01-10').getTime() / 1000)
        },
        {
          id: 3,
          member_id: 2,
          consultation_date: Math.floor(new Date('2024-01-17').getTime() / 1000),
          consultation_type: 'progress',
          consultant_id: 2,
          consultant_name: '김트레이너',
          content: '1주차 진도 점검을 했습니다. 요가 수업에 잘 적응하고 계시고, 스트레스가 많이 줄었다고 하셨습니다. 체력도 조금씩 향상되고 있는 것 같습니다.',
          goals_discussed: ['스트레스 해소'],
          recommendations: '현재 프로그램 유지, 홈트레이닝 추가 고려',
          status: 'completed',
          created_at: Math.floor(new Date('2024-01-17').getTime() / 1000),
          updated_at: Math.floor(new Date('2024-01-17').getTime() / 1000)
        }
      ];
      
      setConsultationRecords(dummyRecords);
    } catch (error) {
      console.error('상담 기록 로드 실패:', error);
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: ConsultationTableFilters) => {
    setFilters(newFilters);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (newSort: ConsultationTableSort) => {
    setSort(newSort);
  };

  // 회원 선택 핸들러
  const handleMemberSelect = (member: ConsultationMember) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
  };

  // 신규 회원 등록 모달 열기
  const handleAddNewMember = () => {
    setIsNewMemberModalOpen(true);
  };

  // 신규 회원 등록 제출
  const handleNewMemberSubmit = async (formData: NewMemberFormData) => {
    try {
      // 폼 데이터를 Member 형식으로 변환
      const memberData = transformNewMemberData(formData);
      
      // TODO: 실제 API 호출로 대체
      // const response = await api.createMember(memberData);
      
      // 임시로 로컬 상태에 추가
      const newMember: ConsultationMember = {
        ...memberData,
        id: Date.now(), // 임시 ID
        join_date: Math.floor(Date.now() / 1000),
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000)
      } as ConsultationMember;
      
      setAllMembers(prev => [newMember, ...prev]);
      
      // TODO: 성공 토스트 메시지 표시
      console.log(MESSAGES.success.memberCreated);
      
    } catch (error) {
      console.error('회원 등록 실패:', error);
      // TODO: 에러 토스트 메시지 표시
      throw error;
    }
  };

  // 상담 기록 추가 핸들러
  const handleAddConsultation = async (formData: ConsultationFormData) => {
    if (!selectedMember) return;
    
    try {
      // 폼 데이터를 ConsultationRecord 형식으로 변환
      const consultationData = transformConsultationFormData(
        formData,
        selectedMember.id!,
        1, // TODO: 현재 로그인한 직원 ID
        '이트레이너' // TODO: 현재 로그인한 직원 이름
      );
      
      // TODO: 실제 API 호출로 대체
      // const response = await api.createConsultationRecord(consultationData);
      
      // 임시로 로컬 상태에 추가
      const newRecord: ConsultationRecord = {
        ...consultationData,
        id: Date.now(), // 임시 ID
      } as ConsultationRecord;
      
      setConsultationRecords(prev => [newRecord, ...prev]);
      
      // 회원의 상담 상태 업데이트
      if (formData.next_appointment) {
        // 다음 상담이 예정되어 있으면 진행 중으로 변경
        setAllMembers(prev => prev.map(member => 
          member.id === selectedMember.id 
            ? { ...member, consultation_status: 'in_progress' as const }
            : member
        ));
      }
      
      // TODO: 성공 토스트 메시지 표시
      console.log(MESSAGES.success.consultationSaved);
      
    } catch (error) {
      console.error('상담 기록 저장 실패:', error);
      // TODO: 에러 토스트 메시지 표시
      throw error;
    }
  };

  // 상담 기록 편집 핸들러
  const handleEditConsultation = async (id: number, formData: ConsultationFormData) => {
    try {
      // TODO: 실제 API 호출로 대체
      // const response = await api.updateConsultationRecord(id, formData);
      
      // 폼 데이터를 올바른 형식으로 변환
      const updatedData = {
        consultation_type: formData.consultation_type,
        consultation_date: Math.floor(new Date(formData.consultation_date).getTime() / 1000),
        content: formData.content,
        goals_discussed: formData.goals_discussed,
        recommendations: formData.recommendations || '',
        next_appointment: formData.next_appointment ? 
          Math.floor(new Date(formData.next_appointment).getTime() / 1000) : undefined,
        updated_at: Math.floor(Date.now() / 1000)
      };
      
      // 임시로 로컬 상태 업데이트
      setConsultationRecords(prev => prev.map(record => 
        record.id === id 
          ? { ...record, ...updatedData }
          : record
      ));
      
      console.log(MESSAGES.success.dataUpdated);
      
    } catch (error) {
      console.error('상담 기록 업데이트 실패:', error);
      throw error;
    }
  };

  // 선택된 회원의 상담 기록 필터링
  const memberConsultationRecords = selectedMember 
    ? consultationRecords.filter(record => record.member_id === selectedMember.id)
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">상담일지 관리</h1>
        <p className="text-gray-600">
          회원들의 상담 현황을 관리하고 새로운 회원을 등록할 수 있습니다.
        </p>
      </div>

      {/* 메인 테이블 */}
      <ConsultationTable
        members={filteredMembers}
        filters={filters}
        sort={sort}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onMemberSelect={handleMemberSelect}
        onAddNewMember={handleAddNewMember}
        loading={loading}
      />

      {/* 신규 회원 등록 모달 */}
      <NewMemberModal
        isOpen={isNewMemberModalOpen}
        onClose={() => setIsNewMemberModalOpen(false)}
        onSubmit={handleNewMemberSubmit}
      />

      {/* 상담 상세 정보 모달 */}
      <ConsultationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        consultationRecords={memberConsultationRecords}
        onAddConsultation={async () => setIsAddConsultationModalOpen(true)}
        onEditConsultation={handleEditConsultation}
      />

      {/* 상담 기록 추가 모달 */}
      <AddConsultationModal
        isOpen={isAddConsultationModalOpen}
        onClose={() => setIsAddConsultationModalOpen(false)}
        member={selectedMember}
        onSubmit={handleAddConsultation}
      />
    </div>
  );
};

export default ConsultationDashboard; 