import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Staff, StaffFilter, StaffStatisticsData, SortConfig, PaginationConfig } from '../types/staff';
import { PAGINATION_CONFIG } from '../config/staffConfig';
import { 
  STAFF_MESSAGES,
  STAFF_FILTER_DEFAULTS,
  STAFF_TEST_IDS
} from '../config/staffPageConfig';
import { calculateStaffStatistics, filterStaff, sortStaff } from '../utils/staffUtils';
import { useToast } from '../contexts/ToastContext';
import { useModalState } from '../hooks/useModalState';
import { getAllStaff, addStaff, updateStaff, deleteStaff } from '../database/ipcService';
import PageContainer from '../components/common/PageContainer';
import PageHeader from '../components/common/PageHeader';
import StaffModal from '../components/StaffModal';
import StaffSearchFilter from '../components/staff/StaffSearchFilter';
import StaffStatistics from '../components/staff/StaffStatistics';
import StaffTableWithPagination from '../components/staff/StaffTableWithPagination';

const Staff: React.FC = () => {
  // 전역 상태 및 컨텍스트
  const { showToast } = useToast();
  const { modalState, openModal, closeModal, switchToEditMode } = useModalState<Staff>();

  // 로컬 상태
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StaffFilter>(STAFF_FILTER_DEFAULTS);
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

  // 초기 데이터 로딩
  useEffect(() => {
    fetchStaffData();
  }, []);

  // 데이터 로딩 함수
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllStaff();
      if (response.success && response.data) {
        setStaff(response.data);
      } else {
        setError(response.error || STAFF_MESSAGES.error.loadFailed);
      }
    } catch (error) {
      console.error('직원 데이터 로딩 오류:', error);
      setError(STAFF_MESSAGES.error.loadFailed);
      showToast('error', STAFF_MESSAGES.error.loadFailed);
    } finally {
      setLoading(false);
    }
  };

  // 필터링된 직원 목록 계산
  const filteredStaff = useMemo(() => {
    return filterStaff(staff, filter);
  }, [staff, filter]);

  // 정렬된 직원 목록 계산
  const sortedStaff = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredStaff;
    }
    return sortStaff(filteredStaff, sortConfig.key, sortConfig.direction);
  }, [filteredStaff, sortConfig]);

  // 통계 계산
  const statistics = useMemo(() => {
    return calculateStaffStatistics(staff);
  }, [staff]);

  // 모달 핸들러들
  const handleAddStaff = () => {
    openModal(undefined, false);
  };

  const handleEditStaff = (staffMember: Staff) => {
    openModal(staffMember, false);
  };

  const handleViewStaff = (staffMember: Staff) => {
    openModal(staffMember, true);
  };

  // 직원 저장 핸들러
  const handleSaveStaff = async (staffData: Staff): Promise<boolean> => {
    try {
      if (staffData.id) {
        const response = await updateStaff(staffData);
        if (response.success) {
          showToast('success', STAFF_MESSAGES.success.itemUpdated);
          await fetchStaffData();
          return true;
        } else {
          showToast('error', response.error || STAFF_MESSAGES.error.saveFailed);
          return false;
        }
      } else {
        const response = await addStaff(staffData);
        if (response.success) {
          showToast('success', STAFF_MESSAGES.success.itemAdded);
          await fetchStaffData();
          return true;
        } else {
          showToast('error', response.error || STAFF_MESSAGES.error.saveFailed);
          return false;
        }
      }
    } catch (error) {
      console.error('직원 저장 오류:', error);
      showToast('error', STAFF_MESSAGES.error.saveFailed);
      return false;
    }
  };

  // 직원 삭제 핸들러
  const handleDeleteStaff = async (id: number) => {
    if (window.confirm(STAFF_MESSAGES.confirm.deleteConfirm)) {
      try {
        const response = await deleteStaff(id);
        if (response.success) {
          showToast('success', STAFF_MESSAGES.success.itemDeleted);
          await fetchStaffData();
        } else {
          showToast('error', response.error || STAFF_MESSAGES.error.deleteFailed);
        }
      } catch (error) {
        console.error('직원 삭제 오류:', error);
        showToast('error', STAFF_MESSAGES.error.deleteFailed);
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
    setFilter(STAFF_FILTER_DEFAULTS);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  return (
    <PageContainer testId={STAFF_TEST_IDS.pageContainer}>
      <PageHeader 
        title={STAFF_MESSAGES.pageTitle}
        testId={STAFF_TEST_IDS.pageHeader}
      />

      <StaffSearchFilter
        filter={filter}
        onFilterChange={setFilter}
        onReset={handleResetFilters}
        onPaginationReset={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
        showActionButtons={true}
        onAddStaff={handleAddStaff}
        showToast={showToast}
      />

      <StaffStatistics statistics={statistics} />

      <StaffTableWithPagination
        staff={sortedStaff}
        sortConfig={sortConfig}
        pagination={pagination}
        isLoading={loading}
        onSort={handleSort}
        onView={handleViewStaff}
        onEdit={handleEditStaff}
        onDelete={handleDeleteStaff}
        onPaginationChange={(newPagination) => setPagination(prev => ({ ...prev, ...newPagination }))}
      />

      {modalState.isOpen && (
        <StaffModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onSave={handleSaveStaff}
          staff={modalState.selectedItem}
          isViewMode={modalState.isViewMode}
          onSwitchToEdit={switchToEditMode}
        />
      )}
    </PageContainer>
  );
};

export default Staff;
