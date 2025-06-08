import React, { useState, useEffect, useMemo } from 'react';
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
import { Staff } from '../models/types';
import {
  getAllStaff,
  addStaff,
  updateStaff,
  deleteStaff,
} from '../database/ipcService';
import { useToast } from '../contexts/ToastContext';

const Staff: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<{
    search: string;
    status: 'all' | 'active' | 'inactive';
  }>({ search: '', status: 'all' });
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending' | null;
  }>({ key: '', direction: null });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [pagedStaff, setPagedStaff] = useState<Staff[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  const { showToast } = useToast();

  // 데이터 로드
  const loadStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllStaff();
      if (response.success && response.data) {
        // 데이터를 날짜 기준으로 정렬하여 저장
        const sortedData = response.data.sort((a, b) => {
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
        setStaffList(sortedData);
      } else {
        setError('직원 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      setError('직원 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 필터/정렬/페이지네이션 적용된 직원 목록
  useEffect(() => {
    let filtered = staffList.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        staff.email?.toLowerCase().includes(filter.search.toLowerCase()) ||
        staff.phone?.includes(filter.search);
      const matchesStatus =
        filter.status === 'all' || staff.status === filter.status;
      return matchesSearch && matchesStatus;
    });
    // 정렬
    if (sortConfig.key && sortConfig.direction) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Staff] || '';
        const bValue = b[sortConfig.key as keyof Staff] || '';
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    // 페이지네이션
    if (!showAll) {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      setPagedStaff(filtered.slice(start, end));
      setTotalPages(Math.max(1, Math.ceil(filtered.length / pageSize)));
    } else {
      setPagedStaff(filtered);
      setTotalPages(1);
    }
  }, [staffList, filter, sortConfig, currentPage, pageSize, showAll]);

  // 직원 통계
  const statistics = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter((s) => s.status === 'active').length;
    const inactive = staffList.filter((s) => s.status === 'inactive').length;
    return { total, active, inactive };
  }, [staffList]);

  // 모달 핸들러
  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setSelectedStaff(null);
      setIsViewMode(false);
    }, 300);
  };
  const handleAddStaff = () => {
    setSelectedStaff(null);
    setIsViewMode(false);
    setModalOpen(true);
  };
  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsViewMode(false);
    setModalOpen(true);
  };
  const handleViewStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsViewMode(true);
    setModalOpen(true);
  };

  // 저장/삭제
  const handleSaveStaff = async (staff: Staff): Promise<boolean> => {
    try {
      // 디버깅: 저장할 직원 데이터 로그
      console.log('🔍 [Staff.tsx] handleSaveStaff 받은 데이터:', {
        name: staff.name,
        birthDate: staff.birthDate,
        birthDateType: typeof staff.birthDate,
        id: staff.id,
        isEdit: !!staff.id,
        fullData: staff,
      });

      let success = false;
      if (staff.id) {
        const { id, ...updateFields } = staff;
        
        console.log('🔍 [Staff.tsx] updateStaff 호출 데이터:', {
          id,
          updateFields,
          birthDate: updateFields.birthDate,
        });
        
        const response = await updateStaff(id, updateFields);
        success = response.success;
        if (success) {
          showToast('success', '직원 정보가 수정되었습니다.');
          // 데이터베이스에서 최신 데이터를 다시 불러옴
          await loadStaff();
        } else {
          showToast('error', '직원 정보 수정에 실패했습니다.');
        }
      } else {
        console.log('🔍 [Staff.tsx] addStaff 호출 데이터:', {
          staff,
          birthDate: staff.birthDate,
        });
        
        const response = await addStaff(staff);
        success = response.success;
        if (success) {
          showToast('success', '새 직원이 추가되었습니다.');
          // 데이터베이스에서 최신 데이터를 다시 불러옴
          await loadStaff();
        } else {
          showToast('error', '직원 추가에 실패했습니다.');
        }
      }
      
      console.log('🔍 [Staff.tsx] 저장 결과:', { success });
      
      return success;
    } catch (error) {
      console.error('🔍 [Staff.tsx] 저장 중 오류:', error);
      showToast('error', '직원 정보 저장 중 오류가 발생했습니다.');
      return false;
    }
  };
  const handleDeleteStaff = async (id: number) => {
    if (window.confirm('정말로 이 직원을 삭제하시겠습니까?')) {
      try {
        const response = await deleteStaff(id);
        if (response.success) {
          showToast('success', '직원이 삭제되었습니다.');
          // 데이터베이스에서 최신 데이터를 다시 불러옴
          await loadStaff();
        } else {
          showToast('error', '직원 삭제에 실패했습니다.');
        }
      } catch (error) {
        showToast('error', '직원 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 정렬
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') direction = 'descending';
      else if (sortConfig.direction === 'descending') direction = null;
    }
    setSortConfig({ key, direction });
  };

  // 페이지네이션
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
  const handleShowAllToggle = () => {
    setShowAll(!showAll);
    setCurrentPage(1);
  };

  // 컴포넌트 마운트 시와 페이지 포커스 시 데이터 로드
  useEffect(() => {
    loadStaff();

    // 페이지 포커스 이벤트 리스너 추가
    const handleFocus = () => {
      loadStaff();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 로딩/에러
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">직원 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex items-center">
          <AlertTriangle className="text-red-500 mr-3" size={24} />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col rounded mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">직원 관리</h1>
        {/* 검색 및 필터 영역 */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="이름, 이메일, 전화번호 검색"
                className="border border-gray-300 p-3 rounded-md w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value })
                }
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-md flex items-center transition-colors"
              onClick={() => setShowFilterOptions(!showFilterOptions)}
            >
              <Filter size={18} className="mr-2" />
              필터 {showFilterOptions ? '숨기기' : '보기'}
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md flex items-center transition-colors ml-auto"
              onClick={handleAddStaff}
            >
              <Plus size={18} className="mr-2" />
              직원 추가
            </button>
          </div>
          {showFilterOptions && (
            <div className="bg-gray-50 p-4 rounded-md flex flex-wrap gap-4 items-center animate-fadeIn">
              <div>
                <label
                  htmlFor="statusFilter"
                  className="mr-2 font-medium text-gray-700"
                >
                  직원 상태:
                </label>
                <select
                  id="statusFilter"
                  className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filter.status}
                  onChange={(e) =>
                    setFilter({
                      ...filter,
                      status: e.target.value as 'all' | 'active' | 'inactive',
                    })
                  }
                >
                  <option value="all">전체</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
              </div>
              <button
                className="text-sm text-blue-500 hover:text-blue-700 ml-auto"
                onClick={() => setFilter({ search: '', status: 'all' })}
              >
                필터 초기화
              </button>
            </div>
          )}
        </div>
      </div>
      {/* 통계 요약 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">총 직원수</p>
            <p className="text-2xl font-bold text-blue-800 mt-1">
              {statistics.total}명
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">활성 직원</p>
            <p className="text-2xl font-bold text-green-800 mt-1">
              {statistics.active}명
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-medium">비활성 직원</p>
            <p className="text-2xl font-bold text-red-800 mt-1">
              {statistics.inactive}명
            </p>
          </div>
        </div>
      </div>
      {/* 직원 목록 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className={`border border-gray-300 rounded-md px-2 py-1.5 sm:px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${showAll ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={showAll}
            >
              <option value={10}>10개씩 보기</option>
              <option value={20}>20개씩 보기</option>
              <option value={30}>30개씩 보기</option>
              <option value={50}>50개씩 보기</option>
            </select>
            <button
              onClick={handleShowAllToggle}
              className={`px-2 py-1.5 sm:px-3 text-sm rounded-md transition-colors ${showAll ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {showAll ? '페이지 보기' : '전체 보기'}
            </button>
          </div>
          <div className="text-sm text-gray-500">
            총 {staffList.length}명의 직원
            {!showAll &&
              ` (${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, staffList.length)}번째 표시)`}
          </div>
        </div>
        <div
          className="w-full overflow-x-auto"
          style={{ maxHeight: 'calc(100vh - 350px)', minWidth: 600 }}
        >
          <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th
                  className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    이름
                    {sortConfig.key === 'name' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? (
                          <ChevronUp className="text-blue-500" size={14} />
                        ) : sortConfig.direction === 'descending' ? (
                          <ChevronDown className="text-blue-500" size={14} />
                        ) : null}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('position')}
                >
                  <div className="flex items-center">
                    직책
                    {sortConfig.key === 'position' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? (
                          <ChevronUp className="text-blue-500" size={14} />
                        ) : sortConfig.direction === 'descending' ? (
                          <ChevronDown className="text-blue-500" size={14} />
                        ) : null}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('phone')}
                >
                  <div className="flex items-center">
                    연락처
                    {sortConfig.key === 'phone' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? (
                          <ChevronUp className="text-blue-500" size={14} />
                        ) : sortConfig.direction === 'descending' ? (
                          <ChevronDown className="text-blue-500" size={14} />
                        ) : null}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('birthDate')}
                >
                  <div className="flex items-center">
                    생년월일
                    {sortConfig.key === 'birthDate' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? (
                          <ChevronUp className="text-blue-500" size={14} />
                        ) : sortConfig.direction === 'descending' ? (
                          <ChevronDown className="text-blue-500" size={14} />
                        ) : null}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    상태
                    {sortConfig.key === 'status' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? (
                          <ChevronUp className="text-blue-500" size={14} />
                        ) : sortConfig.direction === 'descending' ? (
                          <ChevronDown className="text-blue-500" size={14} />
                        ) : null}
                      </span>
                    )}
                  </div>
                </th>
                <th className="py-2 px-2 sm:py-2.5 sm:px-3 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagedStaff.length > 0 ? (
                pagedStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                    onClick={() => handleViewStaff(staff)}
                  >
                    <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {staff.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {staff.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                      {staff.position}
                    </td>
                    <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                      {staff.phone}
                    </td>
                    <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                      {staff.birthDate || '-'}
                    </td>
                    <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          staff.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {staff.status === 'active' ? '재직 중' : '퇴사'}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-center">
                      <div
                        className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewStaff(staff);
                          }}
                          className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                          title="상세보기"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStaff(staff);
                          }}
                          className="text-yellow-500 hover:text-yellow-700 transition-colors p-1"
                          title="수정"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStaff(staff.id);
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 px-4 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <User size={48} className="text-gray-300 mb-3" />
                      <p className="text-lg">직원 정보가 없습니다.</p>
                      <p className="text-sm text-gray-400 mt-1">
                        직원을 추가하려면 '직원 추가' 버튼을 클릭하세요.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* 페이지네이션 */}
        {!showAll && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  총 <span className="font-medium">{staffList.length}</span>명
                  중{' '}
                  <span className="font-medium">
                    {(currentPage - 1) * pageSize + 1}
                  </span>
                  {' - '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, staffList.length)}
                  </span>{' '}
                  명 표시
                </p>
              </div>
              <div>
                <nav
                  className="inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {/* 페이지 번호 */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => handlePageChange(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === number ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {number}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
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
