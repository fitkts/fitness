import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Member, MemberFilter } from '../models/types';
import { SortConfig, PaginationConfig } from '../types/member';
import { PAGINATION_CONFIG } from '../config/memberConfig';
import { 
  formatDate, 
  getMembershipStatus, 
  calculateStatistics, 
  sortMembers, 
  calculatePagination 
} from '../utils/memberUtils';
import { useMemberStore } from '../stores/memberStore';
import { useToast } from '../contexts/ToastContext';
import { getAllStaff } from '../database/ipcService';
import { Staff } from '../models/types';
import MemberModal from '../components/MemberModal';
import MemberSearchFilter from '../components/member/MemberSearchFilter';
import MemberStatistics from '../components/member/MemberStatistics';
import MemberTableWithPagination from '../components/member/MemberTableWithPagination';
import MemberExcelActions from '../components/member/MemberExcelActions';

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

  // 로컬 상태
  const [filter, setFilter] = useState<MemberFilter>({
    search: '',
    status: 'all',
    staffName: 'all',
    gender: 'all',
    membershipType: 'all',
  });

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

  // 모달 상태
  const [modalState, setModalState] = useState({
    isOpen: false,
    isViewMode: false,
    selectedMember: null as Member | null,
  });

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
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      isViewMode: false,
      selectedMember: null,
    });
  };

  const handleAddMember = () => {
    setModalState({
      isOpen: true,
      isViewMode: false,
      selectedMember: null,
    });
  };

  const handleEditMember = (member: Member) => {
    setModalState({
      isOpen: true,
      isViewMode: false,
      selectedMember: member,
    });
  };

  const handleViewMember = (member: Member) => {
    setModalState({
      isOpen: true,
      isViewMode: true,
      selectedMember: member,
    });
  };

  const handleSwitchToEditMode = () => {
    setModalState(prev => ({
      ...prev,
      isViewMode: false,
    }));
  };

  // 회원 저장 핸들러
  const handleSaveMember = async (member: Member): Promise<boolean> => {
    try {
      if (member.id) {
        await updateMember(member);
        showToast('success', '회원 정보가 수정되었습니다.');
      } else {
        await addMember(member);
        showToast('success', '새 회원이 추가되었습니다.');
      }
      await fetchMembers();
      return true;
    } catch (error) {
      console.error('회원 저장 오류:', error);
      showToast('error', '회원 정보 저장에 실패했습니다.');
      return false;
    }
  };

  // 회원 삭제 핸들러
  const handleDeleteMember = async (id: number) => {
    if (window.confirm('정말로 이 회원을 삭제하시겠습니까?')) {
      try {
        await deleteMember(id);
        showToast('info', '회원이 삭제되었습니다.');
      } catch (error) {
        console.error('회원 삭제 오류:', error);
        showToast('error', '회원 삭제에 실패했습니다.');
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
    setFilter({
      search: '',
      status: 'all',
      staffName: 'all',
      gender: 'all',
      membershipType: 'all',
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">회원 관리</h1>
        <div className="flex items-center gap-2">
          <MemberExcelActions 
            members={members}
            onImportSuccess={fetchMembers}
            showToast={showToast}
          />
          <button
            onClick={handleAddMember}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-md flex items-center transition-colors"
          >
            <Plus size={16} className="mr-2" />
            회원 추가
          </button>
        </div>
      </div>

      <MemberSearchFilter
        filter={filter}
        onFilterChange={setFilter}
        onReset={handleResetFilters}
        onPaginationReset={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
        staffList={staffList}
        membershipTypes={membershipTypes}
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
          onClose={handleCloseModal}
          onSave={handleSaveMember}
          member={modalState.selectedMember}
          isViewMode={modalState.isViewMode}
          onSwitchToEdit={handleSwitchToEditMode}
        />
      )}
    </div>
  );
};

export default Members;
