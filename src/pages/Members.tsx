import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Filter, Database, AlertTriangle, Info, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download, Upload, X as CloseIcon } from 'lucide-react';
import { Member, MemberFilter } from '../models/types';
import MemberModal from '../components/MemberModal';
import { useToast } from '../contexts/ToastContext';
import { useMemberStore } from '../stores/memberStore';
import { getMembersWithPagination, importMembersFromExcel } from '../database/ipcService';
import * as XLSX from 'xlsx';

const Members: React.FC = () => {
  // Zustand 스토어에서 상태와 함수 가져오기
  const { 
    members, 
    isLoading,
    error,
    fetchMembers, 
    addMember, 
    updateMember, 
    deleteMember,
    deleteAllMembers
  } = useMemberStore();

  // 로컬 상태 (필터, 모달 관련 상태는 유지)
  const [filter, setFilter] = useState<MemberFilter>({
    search: '',
    status: 'all',
  });
  const [showFilterOptions, setShowFilterOptions] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // 정렬 관련 상태 추가
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending' | null;
  }>({ key: '', direction: null });

  // 페이지네이션 관련 상태 추가
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize] = useState<number>(20); // 한 페이지당 표시할 회원 수
  const [pagedMembers, setPagedMembers] = useState<Member[]>([]);
  
  const [excelInfoOpen, setExcelInfoOpen] = useState(false);
  
  // useToast를 try-catch로 감싸서 오류 방지
  let showToast;
  try {
    const toastContext = useToast();
    showToast = toastContext?.showToast;
  } catch (error) {
    console.error("Toast 컨텍스트를 사용할 수 없습니다:", error);
    showToast = () => console.log("Toast 메시지 표시 실패");
  }

  // 최상단에 테스트 메시지 추가
  console.log('회원 관리 페이지가 로드되었습니다!');

  // 초기 데이터 로딩 (컴포넌트 마운트 시 스토어의 fetchMembers 호출)
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMember(null);
    setIsViewMode(false);
  };

  // 모달 열기 핸들러 (신규 추가)
  const handleAddMember = () => {
    setSelectedMember(null);
    setIsViewMode(false);
    setModalOpen(true);
  };

  // 모달 열기 핸들러 (수정)
  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsViewMode(false);
    setModalOpen(true);
  };

  // 모달 열기 핸들러 (상세 보기)
  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setIsViewMode(true);
    setModalOpen(true);
  };

  // 상세 보기에서 수정 모드로 전환
  const handleSwitchToEditMode = () => {
    setIsViewMode(false);
  };

  // 회원 저장 핸들러 (추가 또는 수정) - 스토어 함수 사용
  const handleSaveMember = async (member: Member): Promise<boolean> => {
    try {
      if (member.id) {
        // 스토어의 updateMember 함수 호출
        await updateMember(member); 
      } else {
        // 스토어의 addMember 함수 호출
        await addMember(member);
      }
      // 성공 시 Toast 메시지 등 추가 가능
      showToast?.('success', '회원 정보가 저장되었습니다.');
      return true; // 성공
    } catch (err) {
      console.error('회원 저장 오류 (스토어):', err);
      // 스토어의 error 상태를 사용할 수도 있고, 여기서 직접 Toast 표시도 가능
      showToast?.('error', `회원 정보 저장 실패: ${err.message || '알 수 없는 오류'}`);
      return false; // 실패
    }
  };

  // 회원 삭제 핸들러 - 스토어 함수 사용
  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 회원을 삭제하시겠습니까?')) {
      try {
        // 스토어의 deleteMember 함수 호출
        await deleteMember(id); 
        showToast?.('info', '회원이 삭제되었습니다.');
      } catch (err) {
        console.error('회원 삭제 오류 (스토어):', err);
        showToast?.('error', `회원 삭제 실패: ${err.message || '알 수 없는 오류'}`);
      }
    }
  };

  // 필터링된 회원 목록
  const filteredMembers = members.filter((member) => {
    // 검색어 필터링
    if (
      filter.search &&
      !member.name.includes(filter.search) &&
      !member.phone?.includes(filter.search)
    ) {
      return false;
    }

    // 회원권 타입 필터링
    if (filter.membershipType && member.membershipType !== filter.membershipType) {
      return false;
    }

    // 상태 필터링
    if (filter.status !== 'all') {
      const now = new Date();
      const endDate = member.membershipEnd ? new Date(member.membershipEnd) : null;
      
      if (filter.status === 'active' && (!endDate || endDate < now)) {
        return false;
      }
      
      if (filter.status === 'expired' && endDate && endDate >= now) {
        return false;
      }
    }

    return true;
  });

  // 정렬 요청 처리 함수
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null;
      }
    }
    
    setSortConfig({ key, direction });
  };

  // 정렬된 회원 목록 생성 (useMemo로 성능 최적화)
  const sortedMembers = useMemo(() => {
    let sortableMembers = [...filteredMembers];
    
    if (sortConfig.direction === null) {
      return sortableMembers;
    }
    
    return sortableMembers.sort((a, b) => {
      if (a[sortConfig.key as keyof Member] === undefined || b[sortConfig.key as keyof Member] === undefined) {
        return 0;
      }
      
      // 문자열 비교
      if (typeof a[sortConfig.key as keyof Member] === 'string') {
        const aValue = (a[sortConfig.key as keyof Member] as string) || '';
        const bValue = (b[sortConfig.key as keyof Member] as string) || '';
        
        if (sortConfig.direction === 'ascending') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      // 날짜 비교 (membershipEnd 필드)
      if (sortConfig.key === 'membershipEnd') {
        const aDate = a.membershipEnd ? new Date(a.membershipEnd).getTime() : 0;
        const bDate = b.membershipEnd ? new Date(b.membershipEnd).getTime() : 0;
        
        if (sortConfig.direction === 'ascending') {
          return aDate - bDate;
        } else {
          return bDate - aDate;
        }
      }
      
      // 숫자 비교
      if (typeof a[sortConfig.key as keyof Member] === 'number') {
        if (sortConfig.direction === 'ascending') {
          return (a[sortConfig.key as keyof Member] as number) - (b[sortConfig.key as keyof Member] as number);
        } else {
          return (b[sortConfig.key as keyof Member] as number) - (a[sortConfig.key as keyof Member] as number);
        }
      }
      
      return 0;
    });
  }, [filteredMembers, sortConfig]);

  // 통계 데이터 계산 (useMemo로 성능 최적화)
  const statistics = useMemo(() => {
    const activeMembers = members.filter(member => {
      const now = new Date();
      const endDate = member.membershipEnd ? new Date(member.membershipEnd) : null;
      return endDate && endDate >= now;
    });
    
    const expiringMembersIn30Days = activeMembers.filter(member => {
      const now = new Date();
      const endDate = new Date(member.membershipEnd!);
      const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays >= 0;
    });
    
    const membersByType: {[key: string]: number} = {};
    members.forEach(member => {
      const type = member.membershipType || '미지정';
      membersByType[type] = (membersByType[type] || 0) + 1;
    });
    
    const sortedMembershipTypes = Object.entries(membersByType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return {
      total: members.length,
      active: activeMembers.length,
      expired: members.length - activeMembers.length,
      expiringIn30Days: expiringMembersIn30Days.length,
      topMembershipTypes: sortedMembershipTypes
    };
  }, [members]);

  // 회원 상태 확인 함수
  const getMembershipStatus = (endDate: string | undefined | null) => {
    if (!endDate) return 'expired';
    
    const now = new Date();
    const expiryDate = new Date(endDate);
    
    return expiryDate >= now ? 'active' : 'expired';
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 회원 목록 로드 함수 수정
  const loadMembers = async () => {
    try {
      const response = await getMembersWithPagination(currentPage, pageSize, {
        search: filter.search,
        status: filter.status,
        membershipType: filter.membershipType
      });
      
      if (response.success && response.data) {
        setPagedMembers(response.data.members);
        setTotalPages(Math.ceil(response.data.total / pageSize));
      } else {
        console.error('회원 목록 로드 오류:', response.error);
        showToast?.('error', '회원 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('회원 목록 로드 오류:', error);
      showToast?.('error', '회원 목록을 불러오는데 실패했습니다.');
    }
  };
  
  // 페이지 변경 시 데이터 다시 로드
  useEffect(() => {
    loadMembers();
  }, [currentPage, filter]);
  
  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  // 페이지네이션 컴포넌트
  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
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
              총 <span className="font-medium">{totalPages * pageSize}</span>명 중{' '}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>
              {' - '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalPages * pageSize)}
              </span>
              {' '}명 표시
            </p>
          </div>
          <div>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {startPage > 1 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    1
                  </button>
                  {startPage > 2 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  )}
                </>
              )}
              
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === number
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {number}
                </button>
              ))}
              
              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                </>
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
    );
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(members);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '회원목록');
    XLSX.writeFile(wb, '회원목록.xlsx');
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      const result = await importMembersFromExcel(jsonData);
      if (result.success) {
        showToast?.('success', '엑셀 데이터가 성공적으로 불러와졌습니다.');
        fetchMembers();
      } else {
        showToast?.('error', result.error || '엑셀 데이터 불러오기 실패');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setExcelInfoOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col rounded mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">회원 관리</h1>
        
        {/* 검색 및 필터 영역 */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="이름 또는 전화번호 검색"
                className="border border-gray-300 p-3 rounded-md w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
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
              onClick={handleAddMember}
            >
              <Plus size={18} className="mr-2" />
              회원 추가
            </button>

            {/* 미니멀 엑셀 버튼 그룹 */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                title="엑셀 불러오기"
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: 6, cursor: 'pointer' }}
                onClick={() => document.getElementById('excel-import-input')?.click()}
              >
                <Upload size={16} />
              </button>
              <input
                id="excel-import-input"
                type="file"
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                onChange={handleImportExcel}
              />
              <button
                title="엑셀 내보내기"
                style={{ background: '#f3f4f6', border: 'none', borderRadius: 4, padding: 6, cursor: 'pointer' }}
                onClick={handleExportExcel}
              >
                <Download size={16} />
              </button>
              <button
                title="엑셀 형식 안내"
                style={{ background: 'transparent', border: 'none', padding: 0, marginLeft: 2, cursor: 'pointer' }}
                onClick={() => setExcelInfoOpen(true)}
              >
                <Info size={15} color="#888" />
              </button>
            </div>
          </div>
          
          {showFilterOptions && (
            <div className="bg-gray-50 p-4 rounded-md flex flex-wrap gap-4 items-center animate-fadeIn">
              <div>
                <label htmlFor="statusFilter" className="mr-2 font-medium text-gray-700">회원 상태:</label>
                <select
                  id="statusFilter"
                  className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filter.status}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value as MemberFilter['status'] })}
                >
                  <option value="all">전체</option>
                  <option value="active">활성</option>
                  <option value="expired">만료</option>
                </select>
              </div>
              
              {/* 추가 필터 옵션을 여기에 넣을 수 있습니다 */}
              
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

      {/* 로딩 및 에러 상태 */}
      {isLoading && (
        <div className="flex justify-center items-center p-10">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">회원 목록을 불러오는 중...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 mr-3" size={24} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* 통계 요약 영역 (신규 추가) */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">총 회원수</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">{statistics.total}명</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">활성 회원</p>
              <p className="text-2xl font-bold text-green-800 mt-1">
                {statistics.active}명
                <span className="text-sm font-normal ml-1">({((statistics.active / statistics.total) * 100 || 0).toFixed(1)}%)</span>
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">만료 회원</p>
              <p className="text-2xl font-bold text-red-800 mt-1">
                {statistics.expired}명
                <span className="text-sm font-normal ml-1">({((statistics.expired / statistics.total) * 100 || 0).toFixed(1)}%)</span>
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">30일 내 만료 예정</p>
              <p className="text-2xl font-bold text-yellow-800 mt-1">{statistics.expiringIn30Days}명</p>
            </div>
          </div>
        </div>
      )}

      {/* 회원 목록 테이블 */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      이름
                      {sortConfig.key === 'name' && sortConfig.direction === 'ascending' && <ChevronUp className="ml-1" size={14} />}
                      {sortConfig.key === 'name' && sortConfig.direction === 'descending' && <ChevronDown className="ml-1" size={14} />}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('phone')}
                  >
                    <div className="flex items-center">
                      연락처
                      {sortConfig.key === 'phone' && sortConfig.direction === 'ascending' && <ChevronUp className="ml-1" size={14} />}
                      {sortConfig.key === 'phone' && sortConfig.direction === 'descending' && <ChevronDown className="ml-1" size={14} />}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('membershipType')}
                  >
                    <div className="flex items-center">
                      회원권 종류
                      {sortConfig.key === 'membershipType' && sortConfig.direction === 'ascending' && <ChevronUp className="ml-1" size={14} />}
                      {sortConfig.key === 'membershipType' && sortConfig.direction === 'descending' && <ChevronDown className="ml-1" size={14} />}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('membershipEnd')}
                  >
                    <div className="flex items-center">
                      만료일
                      {sortConfig.key === 'membershipEnd' && sortConfig.direction === 'ascending' && <ChevronUp className="ml-1" size={14} />}
                      {sortConfig.key === 'membershipEnd' && sortConfig.direction === 'descending' && <ChevronDown className="ml-1" size={14} />}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pagedMembers.length > 0 ? (
                  pagedMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors cursor-pointer" 
                        onClick={() => handleViewMember(member)}>
                      <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{member.name}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-gray-700">{member.phone || '-'}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-gray-700">{member.membershipType || '-'}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-gray-700">{formatDate(member.membershipEnd)}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getMembershipStatus(member.membershipEnd) === 'active' 
                                ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getMembershipStatus(member.membershipEnd) === 'active' ? '활성' : '만료'}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-3" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewMember(member);
                            }} 
                            className="text-blue-500 hover:text-blue-700 transition-colors" 
                            title="상세보기"
                          >
                            <Info size={18} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMember(member);
                            }} 
                            className="text-yellow-500 hover:text-yellow-700 transition-colors" 
                            title="수정"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(member.id!);
                            }} 
                            className="text-red-500 hover:text-red-700 transition-colors" 
                            title="삭제"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Database size={48} className="text-gray-300 mb-3" />
                        <p className="text-lg">회원 정보가 없습니다.</p>
                        <p className="text-sm text-gray-400 mt-1">회원을 추가하려면 '회원 추가' 버튼을 클릭하세요.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* 페이지네이션 추가 */}
          {renderPagination()}
        </div>
      )}

      {modalOpen && (
        <MemberModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveMember}
          member={selectedMember}
          isViewMode={isViewMode}
          onSwitchToEdit={handleSwitchToEditMode}
        />
      )}

      {/* 엑셀 테이블 형식 안내 모달 */}
      {excelInfoOpen && (
        <div
          onClick={handleOverlayClick}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div
            style={{
              background: '#fff', borderRadius: 8, padding: 24, minWidth: 340, boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
              position: 'relative', maxWidth: 420
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setExcelInfoOpen(false)}
              style={{
                position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer'
              }}
              aria-label="닫기"
            >
              <CloseIcon size={18} color="#888" />
            </button>
            <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>엑셀 데이터 형식 안내</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                borderCollapse: 'collapse', width: '100%', fontSize: 14, background: '#fafbfc'
              }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #d1d5db', padding: 8, background: '#f3f4f6' }}>이름</th>
                    <th style={{ border: '1px solid #d1d5db', padding: 8, background: '#f3f4f6' }}>전화번호</th>
                    <th style={{ border: '1px solid #d1d5db', padding: 8, background: '#f3f4f6' }}>이메일</th>
                    <th style={{ border: '1px solid #d1d5db', padding: 8, background: '#f3f4f6' }}>생년월일</th>
                    <th style={{ border: '1px solid #d1d5db', padding: 8, background: '#f3f4f6' }}>회원권종류</th>
                    <th style={{ border: '1px solid #d1d5db', padding: 8, background: '#f3f4f6' }}>시작일</th>
                    <th style={{ border: '1px solid #d1d5db', padding: 8, background: '#f3f4f6' }}>종료일</th>
                    <th style={{ border: '1px solid #d1d5db', padding: 8, background: '#f3f4f6' }}>비고</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>홍길동</td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>010-1234-5678</td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>hong@example.com</td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>1990-01-01</td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>3개월</td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>2024-06-01</td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>2024-08-31</td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>특이사항</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
              ※ 엑셀 파일의 첫 행은 반드시 <b>컬럼명</b>이어야 하며, 위 예시와 같은 형식으로 데이터를 입력해주세요.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members; 