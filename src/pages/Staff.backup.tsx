import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  User,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import StaffModal from '../components/StaffModal';
import { Staff, StaffFilter, StaffStatisticsData, SortConfig, PaginationConfig } from '../types/staff';
import {
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
} from '../database/ipcService';
import { useToast } from '../contexts/ToastContext';
import { calculateStaffStatistics, filterStaff, sortStaff } from '../utils/staffUtils';
import { PAGINATION_CONFIG } from '../config/staffConfig';
import StaffSearchFilter from '../components/staff/StaffSearchFilter';
import StaffStatistics from '../components/staff/StaffStatistics';
import StaffTableWithPagination from '../components/staff/StaffTableWithPagination';

const StaffPage: React.FC = () => {
  // 상태 관리
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // 필터 및 검색
  const [filter, setFilter] = useState<StaffFilter>({
    search: '',
    status: 'all',
    position: 'all',
  });
  
  // 정렬
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: 'none',
  });
  
  // 페이지네이션
  const [pagination, setPagination] = useState<PaginationConfig>({
    currentPage: PAGINATION_CONFIG.DEFAULT_CURRENT_PAGE,
    pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
    showAll: false,
  });
  
  // 모달
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);

  const { showToast } = useToast();

  // 데이터 로드
  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllStaff();
      if (response.success && response.data) {
        setStaff(response.data);
      } else {
        setError('직원 목록을 불러오는데 실패했습니다.');
        setStaff([]);
      }
    } catch (error) {
      setError('직원 목록을 불러오는 중 오류가 발생했습니다.');
      setStaff([]);
      console.error('직원 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // 필터링 및 정렬된 직원 목록 계산
  const processedStaff = useMemo(() => {
    let filtered = filterStaff(staff, filter);
    let sorted = sortStaff(filtered, sortConfig.key, sortConfig.direction);
    return sorted;
  }, [staff, filter, sortConfig]);

  // 통계 계산
  const statistics: StaffStatisticsData = useMemo(() => {
    return calculateStaffStatistics(staff);
  }, [staff]);

  // 핸들러 함수들
  const handleFilterChange = (newFilter: StaffFilter) => {
    setFilter(newFilter);
  };

  const handleFilterReset = () => {
    setFilter({
      search: '',
      status: 'all',
      position: 'all',
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePaginationReset = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePaginationChange = (newPagination: Partial<PaginationConfig>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        const direction = prev.direction === 'ascending' ? 'descending' : 
                         prev.direction === 'descending' ? 'none' : 'ascending';
        return { key: direction === 'none' ? '' : key, direction };
      }
      return { key, direction: 'ascending' };
    });
  };

  // 모달 핸들러
  const handleAddStaff = () => {
    setSelectedStaff(null);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleViewStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsViewMode(true);
    setModalOpen(true);
  };

  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsViewMode(false);
    setModalOpen(true);
  };

  const handleDeleteStaff = async (id: number) => {
    if (!window.confirm('정말로 이 직원을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await deleteStaff(id);
      if (response.success) {
        showToast('success', '직원이 삭제되었습니다.');
        await loadStaff();
      } else {
        showToast('error', '직원 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('직원 삭제 오류:', error);
      showToast('error', '직원 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setSelectedStaff(null);
      setIsViewMode(false);
    }, 300);
  };

  const handleSaveStaff = async (staffData: Staff): Promise<boolean> => {
    try {
      let success = false;
      
      if (staffData.id) {
        // 수정
        const { id, ...updateFields } = staffData;
        const response = await updateStaff(id, updateFields);
        success = response.success;
        
        if (success) {
          showToast('success', '직원 정보가 수정되었습니다.');
        } else {
          showToast('error', '직원 정보 수정에 실패했습니다.');
        }
      } else {
        // 추가
        const response = await addStaff(staffData);
        success = response.success;
        
        if (success) {
          showToast('success', '새 직원이 추가되었습니다.');
        } else {
          showToast('error', '직원 추가에 실패했습니다.');
        }
      }
      
      if (success) {
        await loadStaff();
      }
      
      return success;
    } catch (error) {
      console.error('직원 저장 오류:', error);
      showToast('error', '직원 정보 저장 중 오류가 발생했습니다.');
      return false;
    }
  };

  const handleImportSuccess = () => {
    loadStaff();
  };

  return (
    <div className="space-y-6 p-6">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">직원 관리</h1>
            <p className="text-gray-600 mt-1">직원 정보를 관리하고 권한을 설정하세요.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">총 직원수</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.total}명</p>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <StaffStatistics statistics={statistics} isLoading={loading} />

      {/* 검색 및 필터 */}
      <StaffSearchFilter
        filter={filter}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
        onPaginationReset={handlePaginationReset}
        onAddStaff={handleAddStaff}
        onImportSuccess={handleImportSuccess}
        showToast={showToast}
        staff={staff}
        showActionButtons={true}
      />

      {/* 직원 테이블 */}
      <StaffTableWithPagination
        staff={processedStaff}
        sortConfig={sortConfig}
        pagination={pagination}
        isLoading={loading}
        onSort={handleSort}
        onView={handleViewStaff}
        onEdit={handleEditStaff}
        onDelete={handleDeleteStaff}
        onPaginationChange={handlePaginationChange}
      />

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류가 발생했습니다</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadStaff}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 직원 모달 */}
      <StaffModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveStaff}
        staff={selectedStaff}
        isViewMode={isViewMode}
      />
    </div>
  );
};

export default StaffPage;
