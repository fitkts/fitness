import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Key, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import LockerModal from '../components/LockerModal';
import { Locker } from '../models/types';
import {
  getAllLockers,
  addLocker,
  updateLocker,
  deleteLocker,
} from '../database/ipcService';
import { useToast } from '../contexts/ToastContext';
import { useCache } from '../hooks/useCache';

const ITEMS_PER_PAGE = 12; // 한 페이지당 표시할 락커 수

const Lockers: React.FC = () => {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'available' | 'occupied' | 'maintenance'
  >('all');

  // 모달 상태 관리
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);

  const { showToast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const { get: getCache, set: setCache } = useCache<Locker[]>();

  // 초기 데이터 로드
  useEffect(() => {
    loadLockers();
  }, []);

  // 락커 데이터 로드
  const loadLockers = async () => {
    try {
      setIsLoading(true);
      const response: any = await getAllLockers(currentPage, ITEMS_PER_PAGE, searchTerm, filter);

      console.log('getAllLockers response:', response);

      if (response && response.success && response.data && Array.isArray(response.data.data)) {
        const sanitizedLockers: Locker[] = response.data.data.map((l: any): Locker => {
          const lockerNumber = (l.number === null || l.number === undefined || String(l.number).trim() === '') 
                             ? 'UNKNOWN' 
                             : String(l.number);
          const lockerStatus = ['available', 'occupied', 'maintenance'].includes(l.status) ? l.status : 'available';

          return {
            id: l.id as number | undefined, // 타입 명시
            number: lockerNumber,
            status: lockerStatus as 'available' | 'occupied' | 'maintenance',
            size: l.size ?? undefined, // size 추가 (LockerSize 타입은 string enum이므로 별도 캐스팅 불필요)
            location: l.location ?? undefined, // location 추가
            feeOptions: l.feeOptions ?? undefined, // feeOptions 추가 (객체 배열로 가정)
            memberId: l.memberId ?? undefined, 
            memberName: l.memberName ?? undefined, 
            startDate: l.startDate ?? undefined,
            endDate: l.endDate ?? undefined,
            notes: l.notes ?? undefined,
            createdAt: l.createdAt ?? undefined,
            updatedAt: l.updatedAt ?? undefined,
          };
        });
        setLockers(sanitizedLockers);
        setTotalItems(response.data.total);
        setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
      } else {
        console.error('락커 목록 로드 실패:', response);
        const errorMessage = response?.message || response?.error?.message || response?.error || '락커 목록을 불러오는데 실패했습니다.';
        showToast('error', errorMessage);
        setLockers([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('락커 목록 로드 오류:', error);
      const message = error?.message || '락커 목록을 불러오는 중 오류가 발생했습니다.';
      showToast('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLocker(null);
    setIsViewMode(false);
  };

  // 모달 열기 핸들러 (신규 추가)
  const handleAddLocker = () => {
    setSelectedLocker(null);
    setIsViewMode(false);
    setModalOpen(true);
  };

  // 모달 열기 핸들러 (수정)
  const handleEditLocker = (locker: Locker) => {
    setSelectedLocker(locker);
    setIsViewMode(false);
    setModalOpen(true);
  };

  // 모달 열기 핸들러 (상세 보기)
  const handleViewLocker = (locker: Locker) => {
    setSelectedLocker(locker);
    setIsViewMode(true);
    setModalOpen(true);
  };

  // 락커 저장 핸들러
  const handleSaveLocker = async (locker: Locker): Promise<boolean> => {
    try {
      let success = false;

      if (locker.id) {
        // 기존 락커 수정
        const response = await updateLocker(locker.id, locker);
        success = response.success;
        if (success) {
          showToast('success', '락커 정보가 수정되었습니다.');
        } else {
          showToast('error', '락커 정보 수정에 실패했습니다.');
        }
      } else {
        // 신규 락커 추가
        const response = await addLocker(locker);
        success = response.success;
        if (success) {
          showToast('success', '새 락커가 추가되었습니다.');
        } else {
          showToast('error', '락커 추가에 실패했습니다.');
        }
      }

      if (success) {
        // 목록 새로고침
        await loadLockers();
      }

      return success;
    } catch (error) {
      console.error('락커 저장 오류:', error);
      showToast('error', '락커 정보 저장 중 오류가 발생했습니다.');
      return false;
    }
  };

  // 락커 삭제 핸들러
  const handleDeleteLocker = async (id: number) => {
    if (window.confirm('정말로 이 락커를 삭제하시겠습니까?')) {
      try {
        const response = await deleteLocker(id);
        if (response.success) {
          showToast('success', '락커가 삭제되었습니다.');
          await loadLockers(); // 목록 새로고침
        } else {
          showToast('error', '락커 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('락커 삭제 오류:', error);
        showToast('error', '락커 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 임시: 서버에서 받은 lockers 데이터를 그대로 사용
  const filteredLockers = lockers;

  // 페이지네이션된 락커 목록 계산
  const paginatedLockers = filteredLockers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <ChevronLeft size={20} />
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    );
  };

  // 검색어나 필터가 변경될 때 첫 페이지로 이동하고 데이터 다시 로드
  useEffect(() => {
    setCurrentPage(1);
    loadLockers();
  }, [searchTerm, filter]);

  // 페이지 변경 시 데이터 다시 로드
  useEffect(() => {
    loadLockers();
  }, [currentPage]);

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">락커 관리</h1>

      {/* 검색 및 필터링 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <input
              type="text"
              placeholder="락커 번호 또는 회원명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(
                e.target.value as
                  | 'all'
                  | 'available'
                  | 'occupied'
                  | 'maintenance',
              )
            }
            className="select"
          >
            <option value="all">전체</option>
            <option value="available">사용 가능</option>
            <option value="occupied">사용 중</option>
            <option value="maintenance">점검 중</option>
          </select>
        </div>

        <button
          onClick={handleAddLocker}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          락커 추가
        </button>
      </div>

      {/* 락커 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedLockers.map((locker) => (
          <div
            key={locker.id}
            className={`p-4 rounded-lg shadow ${
              locker.status === 'available'
                ? 'bg-green-50 border border-green-200'
                : locker.status === 'occupied'
                  ? 'bg-blue-50 border border-blue-200'
                  : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">락커 {locker.number}</h3>
                <p
                  className={`text-sm font-medium ${
                    locker.status === 'available'
                      ? 'text-green-600'
                      : locker.status === 'occupied'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                  }`}
                >
                  {locker.status === 'available'
                    ? '사용 가능'
                    : locker.status === 'occupied'
                      ? '사용 중'
                      : '점검 중'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewLocker(locker)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Key size={18} />
                </button>
                <button
                  onClick={() => handleEditLocker(locker)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteLocker(locker.id!)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {locker.memberName && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  사용자: {locker.memberName}
                </p>
                {locker.startDate && locker.endDate && (
                  <p className="text-sm text-gray-500">
                    {locker.startDate} ~ {locker.endDate}
                  </p>
                )}
              </div>
            )}

            {locker.notes && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">{locker.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <Pagination />

      {/* 모달 */}
      {modalOpen && selectedLocker && (
        <LockerModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveLocker}
          locker={selectedLocker as Locker} 
          isViewMode={isViewMode}
        />
      )}
      {modalOpen && !selectedLocker && (
         <LockerModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveLocker}
          locker={null}
          isViewMode={false} // 신규 추가 시 isViewMode는 항상 false
        />
      )}
    </div>
  );
};

export default Lockers;
