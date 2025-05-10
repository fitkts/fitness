import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, UserCheck, UserX } from 'lucide-react';
import StaffModal from '../components/StaffModal';
import { Staff } from '../models/types';
import { getAllStaff, addStaff, updateStaff, deleteStaff } from '../database/ipcService';
import { useToast } from '../contexts/ToastContext';

const Staff: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // 모달 상태 관리
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);

  const { showToast } = useToast();

  // 초기 데이터 로드
  useEffect(() => {
    loadStaff();
  }, []);

  // 스태프 데이터 로드
  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await getAllStaff();
      if (response.success && response.data) {
        setStaffList(response.data);
      } else {
        showToast('error', '직원 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('직원 목록 로드 오류:', error);
      showToast('error', '직원 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStaff(null);
    setIsViewMode(false);
  };

  // 모달 열기 핸들러 (신규 추가)
  const handleAddStaff = () => {
    setSelectedStaff(null);
    setIsViewMode(false);
    setModalOpen(true);
  };

  // 모달 열기 핸들러 (수정)
  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsViewMode(false);
    setModalOpen(true);
  };

  // 모달 열기 핸들러 (상세 보기)
  const handleViewStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsViewMode(true);
    setModalOpen(true);
  };

  // 직원 저장 핸들러
  const handleSaveStaff = async (staff: Staff): Promise<boolean> => {
    try {
      let success = false;
      
      if (staff.id) {
        // 기존 직원 수정
        const response = await updateStaff(staff.id, staff);
        success = response.success;
        if (success) {
          showToast('success', '직원 정보가 수정되었습니다.');
        } else {
          showToast('error', '직원 정보 수정에 실패했습니다.');
        }
      } else {
        // 신규 직원 추가
        const response = await addStaff(staff);
        success = response.success;
        if (success) {
          showToast('success', '새 직원이 추가되었습니다.');
        } else {
          showToast('error', '직원 추가에 실패했습니다.');
        }
      }

      if (success) {
        // 목록 새로고침
        await loadStaff();
      }
      
      return success;
    } catch (error) {
      console.error('직원 저장 오류:', error);
      showToast('error', '직원 정보 저장 중 오류가 발생했습니다.');
      return false;
    }
  };

  // 직원 삭제 핸들러
  const handleDeleteStaff = async (id: number) => {
    if (window.confirm('정말로 이 직원을 삭제하시겠습니까?')) {
      try {
        const response = await deleteStaff(id);
        if (response.success) {
          showToast('success', '직원이 삭제되었습니다.');
          await loadStaff(); // 목록 새로고침
        } else {
          showToast('error', '직원 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('직원 삭제 오류:', error);
        showToast('error', '직원 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 검색 및 필터링된 직원 목록
  const filteredStaff = staffList.filter((staff) => {
    // 검색어 필터링
    const matchesSearch = 
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.phone?.includes(searchTerm);

    // 상태 필터링
    const matchesStatus = 
      statusFilter === 'all' || 
      staff.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">직원 관리</h1>
      
      {/* 검색 및 필터링 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <input
              type="text"
              placeholder="이름, 이메일, 전화번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="select"
          >
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>

        <button
          onClick={handleAddStaff}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          직원 추가
        </button>
      </div>

      {/* 직원 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                직책
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                연락처
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStaff.map((staff) => (
              <tr key={staff.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                      <div className="text-sm text-gray-500">{staff.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{staff.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{staff.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    staff.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {staff.status === 'active' ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleViewStaff(staff)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    보기
                  </button>
                  <button
                    onClick={() => handleEditStaff(staff)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(staff.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 모달 */}
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

export default Staff; 