import React, { useState, useEffect } from 'react';
import { 
  ConsultationMember,
  ConsultationFilter,
  ConsultationSortConfig,
  ConsultationPaginationConfig,
  ConsultationStatistics as ConsultationStatsType,
  NewMemberFormData,
  ConsultationFormData
} from '../types/consultation';
import { Staff } from '../models/types';
import { 
  filterConsultationMembers, 
  sortConsultationMembers, 
  calculateConsultationStatistics 
} from '../utils/consultationFilterUtils';
import { 
  transformNewMemberData 
} from '../utils/consultationUtils';
import { 
  CONSULTATION_PAGINATION_CONFIG 
} from '../config/consultationFilterConfig';
import { useToast } from '../contexts/ToastContext';

// 컴포넌트 임포트
import ConsultationSearchFilter from '../components/consultation/ConsultationSearchFilter';
import ConsultationStatistics from '../components/consultation/ConsultationStatistics';
import ConsultationTableWithPagination from '../components/consultation/ConsultationTableWithPagination';
import NewMemberModal from '../components/consultation/NewMemberModal';
import ConsultationDetailModal from '../components/consultation/ConsultationDetailModal';
import PromotionModal from '../components/consultation/PromotionModal';
import { MESSAGES } from '../config/consultationConfig';

const ConsultationDashboard: React.FC = () => {
  const { showToast } = useToast();
  
  // 상태 관리
  const [allMembers, setAllMembers] = useState<ConsultationMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<ConsultationMember[]>([]);
  const [filter, setFilter] = useState<ConsultationFilter>({
    search: '',
    status: 'all',
    staffName: 'all',
    gender: 'all'
  });
  const [sortConfig, setSortConfig] = useState<ConsultationSortConfig>({
    key: 'created_at',
    direction: 'descending'
  });
  const [pagination, setPagination] = useState<ConsultationPaginationConfig>({
    currentPage: 1,
    pageSize: CONSULTATION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    showAll: false
  });
  const [statistics, setStatistics] = useState<ConsultationStatsType | undefined>();
  const [loading, setLoading] = useState(true);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  
  // 부가 데이터
  const [staffList, setStaffList] = useState<Staff[]>([]);
  
  // 모달 상태
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  
  // 선택된 회원
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [memberForPromotion, setMemberForPromotion] = useState<ConsultationMember | null>(null);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 필터, 정렬, 페이지네이션 적용
  useEffect(() => {
    let result = [...allMembers];
    
    // 필터 적용
    result = filterConsultationMembers(result, filter);
    
    // 정렬 적용
    result = sortConsultationMembers(result, sortConfig);
    
    setFilteredMembers(result);
    
    // 통계 계산 (필터링된 결과 기준)
    setStatistics(calculateConsultationStatistics(result));
    setStatisticsLoading(false);
  }, [allMembers, filter, sortConfig]);

  // 초기 데이터 로드
  const loadInitialData = async () => {
    await Promise.all([
      loadMembers(),
      loadStaffList()
    ]);
  };

  // 회원 데이터 로드
  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await window.api.getAllConsultationMembers();
      
      if (response.success) {
        const consultationMembers: ConsultationMember[] = response.data.map((member: any) => ({
          id: member.id,
          name: member.name,
          phone: member.phone || '',
          email: member.email,
          gender: member.gender,
          birth_date: member.birth_date,
          join_date: member.created_at,
          first_visit: member.first_visit,
          last_visit: undefined,
          membership_type: undefined,
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
        showToast('error', '상담 회원 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('상담 회원 데이터 로드 실패:', error);
      setAllMembers([]);
      showToast('error', '상담 회원 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 직원 데이터 로드
  const loadStaffList = async () => {
    try {
      const response = await window.api.getAllStaff();
      if (response.success) {
        setStaffList(response.data || []);
      } else {
        console.error('직원 데이터 로드 실패:', response.error);
        setStaffList([]);
      }
    } catch (error) {
      console.error('직원 데이터 로드 실패:', error);
      setStaffList([]);
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (newFilter: ConsultationFilter) => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // 필터 초기화 핸들러
  const handleFilterReset = () => {
    setFilter({
      search: '',
      status: 'all',
      staffName: 'all',
      gender: 'all'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // 페이지네이션 초기화 (검색/필터 변경 시)
  const handlePaginationReset = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // 정렬 변경 핸들러
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // 페이지네이션 변경 핸들러
  const handlePaginationChange = (newPagination: Partial<ConsultationPaginationConfig>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  // 신규 회원 등록 모달 열기
  const handleAddMember = () => {
    setIsNewMemberModalOpen(true);
  };

  // 신규 상담 회원 등록 제출
  const handleNewMemberSubmit = async (formData: NewMemberFormData) => {
    try {
      const consultationMemberData = {
        name: formData.name,
        phone: formData.phone || '',
        email: formData.email || '',
        gender: formData.gender,
        birth_date: formData.birth_date,
        first_visit: formData.first_visit,
        health_conditions: formData.health_conditions || '',
        fitness_goals: formData.fitness_goals || [],
        staff_id: formData.staff_id,
        staff_name: formData.staff_name,
        consultation_status: formData.consultation_status || 'pending',
        notes: formData.notes || ''
      };
      
      const response = await window.api.addConsultationMember(consultationMemberData);
      
      if (response.success) {
        await loadMembers();
        showToast('success', MESSAGES.success.memberCreated);
      } else {
        throw new Error(response.error || '상담 회원 등록에 실패했습니다.');
      }
      
    } catch (error) {
      console.error('상담 회원 등록 실패:', error);
      throw error;
    }
  };

  // 상세보기 핸들러
  const handleViewDetail = (member: ConsultationMember) => {
    setSelectedMemberId(member.id!);
    setIsDetailModalOpen(true);
  };

  // 상세보기 닫기
  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedMemberId(null);
  };

  // 상세보기에서 업데이트 후 처리
  const handleDetailUpdate = () => {
    loadMembers();
  };

  // 승격 핸들러
  const handlePromote = (member: ConsultationMember) => {
    setMemberForPromotion(member);
    setIsPromotionModalOpen(true);
  };

  // 상세보기에서 승격 핸들러
  const handlePromoteFromDetail = (member: ConsultationMember) => {
    setMemberForPromotion(member);
    setIsPromotionModalOpen(true);
    setIsDetailModalOpen(false);
  };

  // 승격 성공 핸들러
  const handlePromotionSuccess = () => {
    loadMembers();
    setIsPromotionModalOpen(false);
    setMemberForPromotion(null);
    showToast('success', '정식 회원으로 승격되었습니다.');
  };

  // 엑셀 불러오기 성공 핸들러
  const handleImportSuccess = () => {
    loadMembers();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">상담일지 관리</h1>
        <p className="text-gray-600">
          회원들의 상담 현황을 관리하고 새로운 회원을 등록할 수 있습니다.
        </p>
      </div>

      {/* 검색 및 필터 */}
      <ConsultationSearchFilter
        filter={filter}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
        onPaginationReset={handlePaginationReset}
        staffList={staffList}
        onAddMember={handleAddMember}
        onImportSuccess={handleImportSuccess}
        showToast={showToast}
        members={allMembers}
        showActionButtons={true}
      />

      {/* 통계 정보 */}
      <ConsultationStatistics
        statistics={statistics}
        isLoading={statisticsLoading}
      />

      {/* 테이블과 페이지네이션 */}
      <ConsultationTableWithPagination
        members={filteredMembers}
        sortConfig={sortConfig}
        pagination={pagination}
        isLoading={loading}
        onSort={handleSort}
        onView={handleViewDetail}
        onPromote={handlePromote}
        onPaginationChange={handlePaginationChange}
      />

      {/* 신규 회원 등록 모달 */}
      <NewMemberModal
        isOpen={isNewMemberModalOpen}
        onClose={() => setIsNewMemberModalOpen(false)}
        onSubmit={handleNewMemberSubmit}
      />

      {/* 상세보기 모달 */}
      <ConsultationDetailModal
        isOpen={isDetailModalOpen}
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