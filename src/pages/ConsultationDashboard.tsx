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
import PromotionModal from '../components/consultation/PromotionModal';
import { MESSAGES } from '../config/consultationConfig';
import { Eye, Edit, Trash2 } from 'lucide-react';

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
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  
  // 선택된 회원 및 상담 기록
  const [selectedMember, setSelectedMember] = useState<ConsultationMember | null>(null);
  const [consultationRecords, setConsultationRecords] = useState<ConsultationRecord[]>([]);
  const [memberForPromotion, setMemberForPromotion] = useState<ConsultationMember | null>(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

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

  // 회원 데이터 로드 (실제 API 호출)
  const loadMembers = async () => {
    setLoading(true);
    try {
      // 상담 회원 테이블에서 데이터 로드 (members 테이블 대신)
      const response = await window.api.getAllConsultationMembers();
      
      if (response.success) {
        // ConsultationMemberData를 ConsultationMember 형식으로 변환
        const consultationMembers: ConsultationMember[] = response.data.map((member: any) => ({
          id: member.id,
          name: member.name,
          phone: member.phone || '',
          email: member.email,
          gender: member.gender,
          birth_date: member.birth_date, // 이미 Unix timestamp
          join_date: member.created_at, // 상담 회원은 가입일 대신 생성일 사용
          first_visit: member.first_visit, // 이미 Unix timestamp
          last_visit: undefined, // 상담 회원은 아직 방문 기록이 없음
          membership_type: undefined, // 상담 회원은 아직 회원권이 없음
          membership_start: undefined,
          membership_end: undefined,
          staff_id: member.staff_id,
          staff_name: member.staff_name,
          notes: member.notes,
          consultation_status: member.consultation_status || 'pending',
          health_conditions: member.health_conditions,
          fitness_goals: member.fitness_goals ? JSON.parse(member.fitness_goals) : [],
          is_promoted: member.is_promoted,
          promoted_at: member.promoted_at,
          promoted_member_id: member.promoted_member_id,
          created_at: member.created_at,
          updated_at: member.updated_at
        }));
        
        setAllMembers(consultationMembers);
      } else {
        console.error('상담 회원 데이터 로드 실패:', response.error);
        setAllMembers([]);
      }
    } catch (error) {
      console.error('상담 회원 데이터 로드 실패:', error);
      setAllMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // 상담 기록 로드
  const loadConsultationRecords = async () => {
    try {
      const response = await window.api.getAllConsultationRecords();
      
      if (response.success) {
        setConsultationRecords(response.data);
      } else {
        console.error('상담 기록 로드 실패:', response.error);
        setConsultationRecords([]);
      }
    } catch (error) {
      console.error('상담 기록 로드 실패:', error);
      setConsultationRecords([]);
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

  // 회원 선택 핸들러 (승격용)
  const handleMemberSelect = (member: ConsultationMember) => {
    setMemberForPromotion(member);
    setIsPromotionModalOpen(true);
  };

  // 신규 회원 등록 모달 열기
  const handleAddNewMember = () => {
    setIsNewMemberModalOpen(true);
  };

  // 신규 상담 회원 등록 제출
  const handleNewMemberSubmit = async (formData: NewMemberFormData) => {
    try {
      // 폼 데이터를 ConsultationMember 형식으로 변환
      const consultationMemberData = {
        name: formData.name,
        phone: formData.phone || '',
        email: formData.email || '',
        gender: formData.gender,
        birth_date: formData.birth_date, // YYYY-MM-DD 형식
        first_visit: formData.first_visit, // YYYY-MM-DD 형식
        health_conditions: formData.health_conditions || '',
        fitness_goals: formData.fitness_goals || [],
        staff_id: formData.staff_id,
        staff_name: formData.staff_name,
        consultation_status: formData.consultation_status || 'pending',
        notes: formData.notes || ''
      };
      
      // 상담 회원 API 호출
      const response = await window.api.addConsultationMember(consultationMemberData);
      
      if (response.success) {
        // 상담 회원 목록 다시 로드하여 테이블에 실시간 반영
        await loadMembers();
        
        console.log(MESSAGES.success.memberCreated);
      } else {
        throw new Error(response.error || '상담 회원 등록에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('상담 회원 등록 실패:', error);
      throw error;
    }
  };

  // 상담 기록 추가 핸들러
  const handleAddConsultation = async (formData: ConsultationFormData) => {
    if (!selectedMember) return;
    
    try {
      // API 호출을 위한 데이터 준비
      const consultationData = {
        member_id: selectedMember.id!,
        consultation_type: formData.consultation_type,
        consultation_date: formData.consultation_date,
        content: formData.content,
        goals_discussed: formData.goals_discussed,
        recommendations: formData.recommendations || '',
        next_appointment: formData.next_appointment || '',
        status: formData.status || 'completed',
        consultant_id: formData.consultant_id!,
        consultant_name: formData.consultant_name!
      };
      
      // 실제 API 호출
      const response = await window.api.addConsultationRecord(consultationData);
      
      if (response.success) {
        // 상담 기록 목록 새로고침
        await loadConsultationRecords();
        
        // 회원의 상담 상태 업데이트
        if (formData.next_appointment) {
          // 다음 상담이 예정되어 있으면 진행 중으로 변경
          setAllMembers(prev => prev.map(member => 
            member.id === selectedMember.id 
              ? { ...member, consultation_status: 'in_progress' as const }
              : member
          ));
        }
        
        console.log(MESSAGES.success.consultationSaved);
      } else {
        throw new Error(response.error || '상담 기록 저장에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('상담 기록 저장 실패:', error);
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

  // 상세보기 열기
  const handleViewDetail = (memberId: number) => {
    console.log('handleViewDetail 호출됨:', memberId);
    setSelectedMemberId(memberId);
    setShowDetailModal(true);
    console.log('상세보기 모달 상태 변경:', { selectedMemberId: memberId, showDetailModal: true });
  };

  // 상세보기 닫기
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedMemberId(null);
  };

  // 상세보기에서 업데이트 후 처리
  const handleDetailUpdate = () => {
    loadMembers(); // 목록 새로고침
  };

  // 상세보기에서 승격 핸들러
  const handlePromoteFromDetail = (member: ConsultationMember) => {
    setMemberForPromotion(member);
    setIsPromotionModalOpen(true);
    setShowDetailModal(false); // 상세보기 모달 닫기
  };

  // 승격 성공 핸들러
  const handlePromotionSuccess = () => {
    loadMembers(); // 목록 새로고침
    setIsPromotionModalOpen(false);
    setMemberForPromotion(null);
  };

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
        onViewDetail={handleViewDetail}
        loading={loading}
      />

      {/* 신규 회원 등록 모달 */}
      <NewMemberModal
        isOpen={isNewMemberModalOpen}
        onClose={() => setIsNewMemberModalOpen(false)}
        onSubmit={handleNewMemberSubmit}
      />

      {/* 상담 기록 추가 모달 */}
      <AddConsultationModal
        isOpen={isAddConsultationModalOpen}
        onClose={() => setIsAddConsultationModalOpen(false)}
        member={selectedMember}
        onSubmit={handleAddConsultation}
      />

      {/* 상세보기 모달 */}
      <ConsultationDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetail}
        consultationMemberId={selectedMemberId}
        onUpdate={handleDetailUpdate}
        onPromote={handlePromoteFromDetail}
      />

      {/* 승격 모달 */}
      <PromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => {
          setIsPromotionModalOpen(false);
          setMemberForPromotion(null);
        }}
        consultationMember={memberForPromotion}
        onSuccess={handlePromotionSuccess}
      />
    </div>
  );
};

export default ConsultationDashboard; 