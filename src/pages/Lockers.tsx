import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Locker } from '../models/types';
import { LockerAction } from '../config/lockerConfig';
import { PAGINATION_CONFIG } from '../config/lockerConfig';
import {
  getAllLockers,
  addLocker,
  updateLocker,
  deleteLocker,
} from '../database/ipcService';
import { useToast } from '../contexts/ToastContext';
import { filterLockers, sortLockersAdvanced, calculatePagination } from '../utils/lockerUtils';

// 컴포넌트 임포트
import LockerSearchAndFilter from '../components/locker/LockerSearchAndFilter';
import LockerGrid from '../components/locker/LockerGrid';
import LockerPagination from '../components/locker/LockerPagination';
import LockerModal from '../components/LockerModal';
import LockerBulkAddModal from '../components/LockerBulkAddModal';

const Lockers: React.FC = () => {
  // 기본 상태
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('number_asc');
  const [layoutDirection, setLayoutDirection] = useState<'row' | 'column'>('row');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // 첫 로드 추적을 위한 ref
  const isFirstLoad = useRef(true);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkAddModalOpen, setBulkAddModalOpen] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const { showToast } = useToast();

  // 데이터 로드
  const loadLockers = async (page: number = 1) => {
    try {
      setIsLoading(true);
      // 서버 사이드 페이지네이션 사용
      const requestParams = {
        page,
        pageSize: PAGINATION_CONFIG.ITEMS_PER_PAGE,
        searchTerm: searchTerm || '',
        filter: filter === 'all' ? 'all' : filter as any
      };
      
      console.log('🚀 락커 데이터 요청 시작:', requestParams);
      
      const response = await getAllLockers(
        requestParams.page,
        requestParams.pageSize,
        requestParams.searchTerm,
        requestParams.filter
      );
      
      console.log('📡 서버 응답:', {
        success: response?.success,
        dataLength: response?.data?.data?.length || 0,
        total: response?.data?.total || 0,
        actualResponse: response
      });
      
      if (response && response.success && response.data) {
        const lockersData = response.data.data || [];
        const total = response.data.total || 0;
        
        console.log('✅ 처리된 락커 데이터:', {
          requestedPage: page,
          receivedCount: lockersData.length,
          totalFromServer: total,
          totalPages: Math.ceil(total / PAGINATION_CONFIG.ITEMS_PER_PAGE),
          lockersPreview: lockersData.slice(0, 3).map(l => ({ 
            id: l.id, 
            number: l.number, 
            status: l.status 
          })),
          searchActive: !!searchTerm,
          filterActive: filter !== 'all'
        });
        
        setLockers(lockersData);
        setTotalItems(total);
      } else {
        console.error('❌ 락커 목록 로드 실패:', response);
        showToast('error', '락커 목록을 불러오는데 실패했습니다.');
        setLockers([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('💥 락커 목록 로드 오류:', error);
      showToast('error', '락커 목록을 불러오는 중 오류가 발생했습니다.');
      setLockers([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    if (isFirstLoad.current) {
      loadLockers(1);
      isFirstLoad.current = false;
    }
  }, []);

  // 검색어, 필터, 정렬 변경 시 첫 페이지로 이동하면서 새로고침
  useEffect(() => {
    if (!isFirstLoad.current) {
      console.log('🔄 검색/필터 변경 감지:', { searchTerm, filter, sortBy });
      setCurrentPage(1);
      loadLockers(1);
    }
  }, [searchTerm, filter, sortBy]);

  // 페이지네이션 계산 (서버 사이드)
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(totalItems / PAGINATION_CONFIG.ITEMS_PER_PAGE);
    return {
      totalPages,
      startIndex: (currentPage - 1) * PAGINATION_CONFIG.ITEMS_PER_PAGE,
      endIndex: Math.min(currentPage * PAGINATION_CONFIG.ITEMS_PER_PAGE, totalItems),
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [totalItems, currentPage]);

  // 현재 페이지의 락커들 (서버에서 이미 필터링되어 옴)
  const currentPageLockers = useMemo(() => {
    return sortLockersAdvanced(lockers, sortBy);
  }, [lockers, sortBy]);

  // 이벤트 핸들러들
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleLayoutChange = (newLayout: 'row' | 'column') => {
    setLayoutDirection(newLayout);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadLockers(page); // 새 페이지 데이터 로드
  };

  const handleAddLocker = () => {
    setBulkAddModalOpen(true);
  };

  const handleLockerAction = (action: LockerAction, locker: Locker) => {
    setSelectedLocker(locker);
    
    switch (action) {
      case 'view':
        setIsViewMode(true);
        setModalOpen(true);
        break;
      case 'edit':
        setIsViewMode(false);
        setModalOpen(true);
        break;
      case 'delete':
        handleDeleteLocker(locker.id!);
        break;
    }
  };

  const handleDeleteLocker = async (id: number) => {
    if (window.confirm('정말로 이 락커를 삭제하시겠습니까?')) {
      try {
        const response = await deleteLocker(id);
        if (response.success) {
          showToast('success', '락커가 삭제되었습니다.');
          await loadLockers(currentPage); // 현재 페이지 유지
        } else {
          showToast('error', '락커 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('락커 삭제 오류:', error);
        showToast('error', '락커 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSaveLocker = async (locker: Locker): Promise<boolean> => {
    try {
      let success = false;

      if (locker.id) {
        const response = await updateLocker(locker.id, locker);
        success = response.success;
        if (success) {
          showToast('success', '락커 정보가 수정되었습니다.');
        } else {
          showToast('error', '락커 정보 수정에 실패했습니다.');
        }
      } else {
        const response = await addLocker(locker);
        success = response.success;
        if (success) {
          showToast('success', '새 락커가 추가되었습니다.');
        } else {
          showToast('error', '락커 추가에 실패했습니다.');
        }
      }

      if (success) {
        await loadLockers(currentPage); // 현재 페이지 유지
      }

      return success;
    } catch (error) {
      console.error('락커 저장 오류:', error);
      showToast('error', '락커 정보 저장 중 오류가 발생했습니다.');
      return false;
    }
  };

  const handleSaveBulkLockers = async (lockersToAdd: Locker[]): Promise<boolean> => {
    try {
      let successCount = 0;
      let failCount = 0;

      for (const locker of lockersToAdd) {
        try {
          const response = await addLocker(locker);
          if (response.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      if (successCount > 0) {
        await loadLockers(1); // 벌크 추가 후에는 첫 페이지로 이동
        setCurrentPage(1);
      }

      if (failCount === 0) {
        showToast('success', `${successCount}개의 락커가 모두 추가되었습니다.`);
        return true;
      } else if (successCount > 0) {
        showToast('warning', `${successCount}개는 성공, ${failCount}개는 실패했습니다.`);
        return false;
      } else {
        showToast('error', '모든 락커 추가에 실패했습니다.');
        return false;
      }
    } catch (error) {
      console.error('벌크 락커 추가 오류:', error);
      showToast('error', '락커 벌크 추가 중 오류가 발생했습니다.');
      return false;
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLocker(null);
    setIsViewMode(false);
  };

  const handleCloseBulkModal = () => {
    setBulkAddModalOpen(false);
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* 검색 및 필터링 */}
      <LockerSearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filter={filter}
        onFilterChange={handleFilterChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        layoutDirection={layoutDirection}
        onLayoutChange={handleLayoutChange}
        onAddClick={handleAddLocker}
        totalCount={totalItems}
        filteredCount={totalItems}
      />

      {/* 락커 그리드 */}
      <LockerGrid
        lockers={currentPageLockers}
        onAction={handleLockerAction}
        isLoading={isLoading}
        layoutDirection={layoutDirection}
      />

      {/* 페이지네이션 */}
      <LockerPagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        totalItems={totalItems}
        itemsPerPage={PAGINATION_CONFIG.ITEMS_PER_PAGE}
      />

      {/* 벌크 추가 모달 */}
      <LockerBulkAddModal
        isOpen={bulkAddModalOpen}
        onClose={handleCloseBulkModal}
        onSave={handleSaveBulkLockers}
        existingLockers={lockers}
      />

      {/* 수정/상세보기 모달 */}
      <LockerModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveLocker}
        locker={selectedLocker}
        isViewMode={isViewMode}
      />
    </div>
  );
};

export default Lockers;
