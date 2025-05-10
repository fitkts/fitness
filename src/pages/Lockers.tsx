import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Key, AlertCircle } from 'lucide-react';
import LockerModal from '../components/LockerModal';
import { Locker } from '../models/types';
import { getAllLockers, addLocker, updateLocker, deleteLocker } from '../database/ipcService';
import { useToast } from '../contexts/ToastContext';

const Lockers: React.FC = () => {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all');
  
  // 모달 상태 관리
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);

  const { showToast } = useToast();

  // 초기 데이터 로드
  useEffect(() => {
    loadLockers();
  }, []);

  // 락커 데이터 로드
  const loadLockers = async () => {
    try {
      setIsLoading(true);
      const response = await getAllLockers();
      if (response.success && response.data) {
        setLockers(response.data);
      } else {
        showToast('error', '락커 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('락커 목록 로드 오류:', error);
      showToast('error', '락커 목록을 불러오는 중 오류가 발생했습니다.');
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

  // 검색 및 필터링된 락커 목록
  const filteredLockers = lockers.filter((locker) => {
    // 검색어 필터링
    const matchesSearch = 
      locker.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (locker.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    // 상태 필터링
    const matchesStatus = 
      filter === 'all' || 
      locker.status === filter;

    return matchesSearch && matchesStatus;
  });

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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'available' | 'occupied' | 'maintenance')}
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
        {filteredLockers.map((locker) => (
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
                <p className={`text-sm font-medium ${
                  locker.status === 'available'
                    ? 'text-green-600'
                    : locker.status === 'occupied'
                    ? 'text-blue-600'
                    : 'text-yellow-600'
                }`}>
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

      {/* 모달 */}
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