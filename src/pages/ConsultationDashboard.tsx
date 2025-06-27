import React, { useState, useEffect, useMemo } from 'react';
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
import { CONSULTATION_PAGINATION_CONFIG } from '../config/consultationFilterConfig';
import { 
  CONSULTATION_MESSAGES,
  CONSULTATION_FILTER_DEFAULTS,
  CONSULTATION_TEST_IDS
} from '../config/consultationPageConfig';
import { 
  filterConsultationMembers, 
  sortConsultationMembers, 
  calculateConsultationStatistics 
} from '../utils/consultationFilterUtils';
import { transformNewMemberData } from '../utils/consultationUtils';
import { useToast } from '../contexts/ToastContext';
import { useModalState } from '../hooks/useModalState';
import { getAllStaff } from '../database/ipcService';
import PageContainer from '../components/common/PageContainer';
import PageHeader from '../components/common/PageHeader';
import NewMemberModal from '../components/consultation/NewMemberModal';
import ConsultationDetailModal from '../components/consultation/ConsultationDetailModal';
import ConsultationSearchFilter from '../components/consultation/ConsultationSearchFilter';
import ConsultationStatistics from '../components/consultation/ConsultationStatistics';
import ConsultationTableWithPagination from '../components/consultation/ConsultationTableWithPagination';
import PromotionModal from '../components/consultation/PromotionModal';

// 실제 API 함수들
const getAllConsultationMembers = async (): Promise<{ success: boolean; data?: ConsultationMember[]; error?: string; }> => {
  try {
    if (window.api?.getAllConsultationMembers) {
      return await window.api.getAllConsultationMembers();
    }
    return { success: false, error: 'API를 사용할 수 없습니다.' };
  } catch (error) {
    return { success: false, error: '상담 회원 조회 실패' };
  }
};

const addConsultationMember = async (memberData: any): Promise<{ success: boolean; data?: number; error?: string; }> => {
  try {
    if (window.api?.addConsultationMember) {
      return await window.api.addConsultationMember(memberData);
    }
    return { success: false, error: 'API를 사용할 수 없습니다.' };
  } catch (error) {
    return { success: false, error: '상담 회원 추가 실패' };
  }
};

const updateConsultationMember = async (consultationData: any): Promise<{ success: boolean; error?: string; }> => {
  try {
    if (window.api?.updateConsultationMember) {
      return await window.api.updateConsultationMember(consultationData.id, consultationData);
    }
    return { success: false, error: 'API를 사용할 수 없습니다.' };
  } catch (error) {
    return { success: false, error: '상담 회원 수정 실패' };
  }
};

const deleteConsultationMember = async (id: number): Promise<{ success: boolean; error?: string; }> => {
  try {
    if (window.api?.deleteConsultationMember) {
      return await window.api.deleteConsultationMember(id);
    }
    return { success: false, error: 'API를 사용할 수 없습니다.' };
  } catch (error) {
    return { success: false, error: '상담 회원 삭제 실패' };
  }
};

const ConsultationDashboard: React.FC = () => {
  // 전역 상태 및 컨텍스트
  const { showToast } = useToast();
  const { modalState, openModal, closeModal } = useModalState<ConsultationMember>();

  // 로컬 상태
  const [consultationMembers, setConsultationMembers] = useState<ConsultationMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConsultationFilter>(CONSULTATION_FILTER_DEFAULTS);
  const [sortConfig, setSortConfig] = useState<ConsultationSortConfig>({
    key: null,
    direction: 'ascending'
  });
  const [pagination, setPagination] = useState<ConsultationPaginationConfig>({
    currentPage: 1,
    pageSize: CONSULTATION_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    showAll: false,
  });

  // 추가 상태
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // 승격 모달 상태
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [memberForPromotion, setMemberForPromotion] = useState<ConsultationMember | null>(null);

  // 초기 데이터 로딩
  useEffect(() => {
    loadInitialData();
  }, []);

  // 데이터 로딩 함수
  const loadInitialData = async () => {
    await Promise.all([
      fetchConsultationMembers(),
      loadStaffList()
    ]);
  };

  const fetchConsultationMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllConsultationMembers();
      if (response.success && response.data) {
        setConsultationMembers(response.data);
      } else {
        setError(response.error || CONSULTATION_MESSAGES.error.loadFailed);
      }
    } catch (error) {
      console.error('상담 회원 데이터 로딩 오류:', error);
      setError(CONSULTATION_MESSAGES.error.loadFailed);
      showToast('error', CONSULTATION_MESSAGES.error.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  const loadStaffList = async () => {
    try {
      const response = await getAllStaff();
      if (response.success && response.data) {
        setStaffList(response.data);
      }
    } catch (error) {
      console.error('직원 목록 로딩 오류:', error);
    }
  };

  // 필터링된 상담 회원 목록 계산
  const filteredConsultationMembers = useMemo(() => {
    return filterConsultationMembers(consultationMembers, filter);
  }, [consultationMembers, filter]);

  // 정렬된 상담 회원 목록 계산
  const sortedConsultationMembers = useMemo(() => {
    if (!sortConfig.key) {
      return filteredConsultationMembers;
    }
    return sortConsultationMembers(filteredConsultationMembers, sortConfig);
  }, [filteredConsultationMembers, sortConfig]);

  // 통계 계산
  const statistics = useMemo(() => {
    return calculateConsultationStatistics(consultationMembers);
  }, [consultationMembers]);

  // 모달 핸들러들
  const handleAddMember = () => {
    setIsAddModalOpen(true);
  };

  const handleViewMember = (member: ConsultationMember) => {
    openModal(member, true);
  };

  // 새 회원 추가 핸들러
  const handleSaveNewMember = async (memberData: NewMemberFormData): Promise<void> => {
    try {
      const transformedData = transformNewMemberData(memberData);
      const response = await addConsultationMember(transformedData);
      
      if (response.success) {
        showToast('success', CONSULTATION_MESSAGES.success.memberAdded);
        await fetchConsultationMembers();
        setIsAddModalOpen(false);
      } else {
        showToast('error', response.error || CONSULTATION_MESSAGES.error.saveFailed);
        throw new Error(response.error || CONSULTATION_MESSAGES.error.saveFailed);
      }
    } catch (error) {
      console.error('새 회원 추가 오류:', error);
      showToast('error', CONSULTATION_MESSAGES.error.saveFailed);
      throw error;
    }
  };

  // 상담 기록 저장 핸들러
  const handleSaveConsultation = async (consultationData: ConsultationFormData): Promise<boolean> => {
    try {
      const response = await updateConsultationMember(consultationData);
      
      if (response.success) {
        showToast('success', CONSULTATION_MESSAGES.success.itemUpdated);
        await fetchConsultationMembers();
        return true;
      } else {
        showToast('error', response.error || CONSULTATION_MESSAGES.error.saveFailed);
        return false;
      }
    } catch (error) {
      console.error('상담 기록 저장 오류:', error);
      showToast('error', CONSULTATION_MESSAGES.error.saveFailed);
      return false;
    }
  };

  // 회원 승격 핸들러 (PromotionModal 사용)
  const handlePromoteToMember = async (consultationMember: ConsultationMember): Promise<boolean> => {
    // 승격 조건 검증
    if (consultationMember.consultation_status !== 'completed') {
      showToast('error', '상담이 완료된 회원만 승격 가능합니다.');
      return false;
    }
    
    if (consultationMember.is_promoted) {
      showToast('error', '이미 승격된 회원입니다.');
      return false;
    }

    // 승격 모달 열기
    setMemberForPromotion(consultationMember);
    setIsPromotionModalOpen(true);
    return true;
  };

  // 승격 성공 핸들러
  const handlePromotionSuccess = async () => {
    await fetchConsultationMembers();
    setIsPromotionModalOpen(false);
    setMemberForPromotion(null);
    showToast('success', CONSULTATION_MESSAGES.success.memberPromoted);
  };

  // 상담 회원 삭제 핸들러
  const handleDeleteMember = async (member: ConsultationMember) => {
    if (window.confirm(`${member.name} 회원의 상담 정보를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      try {
        const response = await deleteConsultationMember(member.id!);
        if (response.success) {
          showToast('success', CONSULTATION_MESSAGES.success.itemDeleted);
          await fetchConsultationMembers();
        } else {
          showToast('error', response.error || CONSULTATION_MESSAGES.error.deleteFailed);
        }
      } catch (error) {
        console.error('상담 회원 삭제 오류:', error);
        showToast('error', CONSULTATION_MESSAGES.error.deleteFailed);
      }
    }
  };

  // 정렬 핸들러
  const handleSort = (key: keyof ConsultationMember) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setFilter(CONSULTATION_FILTER_DEFAULTS);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // 가져오기 성공 핸들러
  const handleImportSuccess = () => {
    fetchConsultationMembers();
    showToast('success', CONSULTATION_MESSAGES.success.importSuccess);
  };

  return (
    <PageContainer testId={CONSULTATION_TEST_IDS.pageContainer}>
      <PageHeader 
        title={CONSULTATION_MESSAGES.pageTitle}
        testId={CONSULTATION_TEST_IDS.pageHeader}
      />
      
      {/* 페이지 설명 */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {CONSULTATION_MESSAGES.pageDescription}
        </p>
      </div>

      <ConsultationSearchFilter
        filter={filter}
        onFilterChange={setFilter}
        onReset={handleResetFilters}
        onPaginationReset={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
        staffList={staffList}
        onAddMember={handleAddMember}
        onImportSuccess={handleImportSuccess}
        showToast={showToast}
      />

      <ConsultationStatistics statistics={statistics} />

      <ConsultationTableWithPagination
        members={sortedConsultationMembers}
        sortConfig={sortConfig}
        pagination={pagination}
        isLoading={loading}
        onSort={handleSort}
        onView={handleViewMember}
        onPromote={handlePromoteToMember}
        onDelete={handleDeleteMember}
        onPaginationChange={(newPagination) => setPagination(prev => ({ ...prev, ...newPagination }))}
      />

      {/* 새 회원 추가 모달 */}
      {isAddModalOpen && (
        <NewMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleSaveNewMember}
          loading={loading}
        />
      )}

      {/* 상담 상세 모달 */}
      {modalState.isOpen && modalState.selectedItem && (
        <ConsultationDetailModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          consultationMemberId={modalState.selectedItem.id || null}
          onUpdate={fetchConsultationMembers}
          onPromote={handlePromoteToMember}
        />
      )}

      {/* 승격 모달 */}
      {isPromotionModalOpen && memberForPromotion && (
        <PromotionModal
          isOpen={isPromotionModalOpen}
          onClose={() => {
            setIsPromotionModalOpen(false);
            setMemberForPromotion(null);
          }}
          consultationMember={memberForPromotion}
          onSuccess={handlePromotionSuccess}
        />
      )}
    </PageContainer>
  );
};

export default ConsultationDashboard; 