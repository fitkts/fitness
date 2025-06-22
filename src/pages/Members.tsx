import React, { useState, useEffect } from 'react';
import { Member, MemberFilter } from '../models/types';
import { SortConfig, PaginationConfig } from '../types/member';
import { PAGINATION_CONFIG } from '../config/memberConfig';
import { 
  MEMBERS_PAGE_STYLES,
  MEMBERS_MESSAGES,
  MEMBERS_FILTER_DEFAULTS,
  MEMBERS_TEST_IDS
} from '../config/membersPageConfig';
import { 
  formatDate, 
  getMembershipStatus, 
  calculateStatistics, 
  sortMembers, 
  calculatePagination 
} from '../utils/memberUtils';
import { useMemberStore } from '../stores/memberStore';
import { useToast } from '../contexts/ToastContext';
import { useModalState } from '../hooks/useModalState';
import { getAllStaff } from '../database/ipcService';
import { Staff } from '../models/types';
import PageContainer from '../components/common/PageContainer';
import PageHeader from '../components/common/PageHeader';
import MemberModal from '../components/MemberModal';
import MemberSearchFilter from '../components/member/MemberSearchFilter';
import MemberStatistics from '../components/member/MemberStatistics';
import MemberTableWithPagination from '../components/member/MemberTableWithPagination';

const Members: React.FC = () => {
  // Zustand 스토어 상태 및 액션
  const {
    members,
    isLoading,
    error,
    fetchMembers,
    addMember,
    updateMember,
    deleteMember,
  } = useMemberStore();

  // Toast 컨텍스트
  const { showToast } = useToast();

  // 모달 상태 관리 (커스텀 훅 사용)
  const { modalState, openModal, closeModal, switchToEditMode } = useModalState<Member>();

  // 로컬 상태
  const [filter, setFilter] = useState<MemberFilter>(MEMBERS_FILTER_DEFAULTS);

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: null,
  });

  const [pagination, setPagination] = useState<PaginationConfig>({
    currentPage: 1,
    pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    totalPages: 1,
    showAll: false,
  });

  // 필터용 데이터 상태
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [membershipTypes, setMembershipTypes] = useState<string[]>([]);

  // 초기 데이터 로딩
  useEffect(() => {
    fetchMembers();
    loadFilterData();
  }, [fetchMembers]);

  // 필터용 데이터 로딩
  const loadFilterData = async () => {
    try {
      // 직원 목록 가져오기
      const staffResponse = await getAllStaff();
      if (staffResponse.success && staffResponse.data) {
        setStaffList(staffResponse.data);
      }

      // 회원들로부터 이용권 종류 추출
      const uniqueMembershipTypes = Array.from(
        new Set(
          members
            .map(member => member.membershipType)
            .filter(type => type && type.trim() !== '')
        )
      );
      setMembershipTypes(uniqueMembershipTypes);
    } catch (error) {
      console.error('필터 데이터 로딩 오류:', error);
      showToast('error', MEMBERS_MESSAGES.error.loadFailed);
    }
  };

  // 회원 데이터가 변경될 때마다 이용권 종류 업데이트
  useEffect(() => {
    const uniqueMembershipTypes = Array.from(
      new Set(
        members
          .map(member => member.membershipType)
          .filter(type => type && type.trim() !== '')
      )
    );
    setMembershipTypes(uniqueMembershipTypes);
  }, [members]);

  // 필터링된 회원 목록 계산
  const filteredMembers = React.useMemo(() => {
    return members.filter((member) => {
      if (filter.search && member.name && !member.name.includes(filter.search)) {
        return false;
      }

      if (filter.status !== 'all') {
        const status = getMembershipStatus(member.membershipEnd);
        if (filter.status !== status) {
          return false;
        }
      }

      if (filter.staffName !== 'all' && member.staffName !== filter.staffName) {
        return false;
      }

      if (filter.gender !== 'all' && member.gender !== filter.gender) {
        return false;
      }

      if (filter.membershipType !== 'all' && member.membershipType !== filter.membershipType) {
        return false;
      }

      return true;
    });
  }, [members, filter]);

  // 정렬된 회원 목록 계산
  const sortedMembers = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredMembers;
    }
    return sortMembers(filteredMembers, sortConfig.key, sortConfig.direction);
  }, [filteredMembers, sortConfig]);

  // 통계 계산
  const statistics = React.useMemo(() => {
    return calculateStatistics(members);
  }, [members]);

  // 모달 핸들러들
  const handleAddMember = () => {
    openModal(undefined, false);
  };

  const handleEditMember = (member: Member) => {
    openModal(member, false);
  };

  const handleViewMember = (member: Member) => {
    openModal(member, true);
  };

  // 회원 저장 핸들러
  const handleSaveMember = async (member: Member): Promise<boolean> => {
    try {
      if (member.id) {
        await updateMember(member);
        showToast('success', MEMBERS_MESSAGES.success.memberUpdated);
      } else {
        await addMember(member);
        showToast('success', MEMBERS_MESSAGES.success.memberAdded);
      }
      await fetchMembers();
      return true;
    } catch (error) {
      console.error('회원 저장 오류:', error);
      showToast('error', MEMBERS_MESSAGES.error.saveFailed);
      return false;
    }
  };

  // 회원 삭제 핸들러
  const handleDeleteMember = async (id: number) => {
    if (window.confirm(MEMBERS_MESSAGES.confirm.deleteConfirm)) {
      try {
        await deleteMember(id);
        showToast('info', MEMBERS_MESSAGES.success.memberDeleted);
      } catch (error) {
        console.error('회원 삭제 오류:', error);
        showToast('error', MEMBERS_MESSAGES.error.deleteFailed);
      }
    }
  };

  // 정렬 핸들러
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' 
        ? 'descending' 
        : prev.key === key && prev.direction === 'descending'
        ? null
        : 'ascending'
    }));
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setFilter(MEMBERS_FILTER_DEFAULTS);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <PageContainer testId={MEMBERS_TEST_IDS.pageContainer}>
      <PageHeader 
        title={MEMBERS_MESSAGES.pageTitle}
        testId={MEMBERS_TEST_IDS.pageHeader}
      />

      <MemberSearchFilter
        filter={filter}
        onFilterChange={setFilter}
        onReset={handleResetFilters}
        onPaginationReset={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
        staffList={staffList}
        membershipTypes={membershipTypes}
        showActionButtons={true}
        onAddMember={handleAddMember}
        onImportSuccess={fetchMembers}
        showToast={showToast}
        members={members}
      />

      <MemberStatistics statistics={statistics} />

      <MemberTableWithPagination
        members={sortedMembers}
        sortConfig={sortConfig}
        pagination={pagination}
        isLoading={isLoading}
        onSort={handleSort}
        onView={handleViewMember}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
        onPaginationChange={(newPagination) => setPagination(prev => ({ ...prev, ...newPagination }))}
      />

      {modalState.isOpen && (
        <MemberModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSave={handleSaveMember}
          member={modalState.selectedItem}
          isViewMode={modalState.isViewMode}
          onSwitchToEdit={switchToEditMode}
        />
      )}
    </PageContainer>
  );
};

export default Members;
