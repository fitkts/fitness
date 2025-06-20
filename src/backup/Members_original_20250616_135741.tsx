import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Member, MemberFilter, SortConfig, PaginationConfig } from '../types/member';
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
import MemberModal from '../components/MemberModal';
import MemberSearchFilter from '../components/member/MemberSearchFilter';
import MemberStatistics from '../components/member/MemberStatistics';
import MemberTable from '../components/member/MemberTable';
import MemberPagination from '../components/member/MemberPagination';
import MemberExcelActions from '../components/member/MemberExcelActions';

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
    deleteAllMembers,
  } = useMemberStore();

  // 로컬 상태 (필터, 모달 관련 상태는 유지)
  const [filter, setFilter] = useState<MemberFilter>({
    search: '',
    status: 'all',
  });
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // 추가 필터 상태
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedMembershipType, setSelectedMembershipType] = useState<string>('all');

  // 정렬 관련 상태 추가
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending' | null;
  }>({ key: '', direction: null });

  // 페이지네이션 관련 상태 추가
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(30);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [pagedMembers, setPagedMembers] = useState<Member[]>([]);

  const [excelInfoOpen, setExcelInfoOpen] = useState(false);

  const [staffList, setStaffList] = useState<Staff[]>([]);

  // useToast를 try-catch로 감싸서 오류 방지
  let showToast;
  try {
    const toastContext = useToast();
    showToast = toastContext?.showToast;
  } catch (error) {
    console.error('Toast 컨텍스트를 사용할 수 없습니다:', error);
    showToast = () => console.log('Toast 메시지 표시 실패');
  }

  // 최상단에 테스트 메시지 추가
  console.log('회원 관리 페이지가 로드되었습니다!');

  // 초기 데이터 로딩 (컴포넌트 마운트 시 스토어의 fetchMembers 호출)
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // 직원 목록 로드
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const response = await getAllStaff();
        if (response.success && response.data) {
          setStaffList(response.data);
        }
      } catch (error) {
        console.error('직원 목록 로드 오류:', error);
      }
    };
    loadStaff();
  }, []);

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
    console.log('[handleSaveMember] 전달받은 member 데이터:', member); // 데이터 확인용 로그 추가
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
      await fetchMembers(); // 데이터 새로고침
      loadMembers();      // 페이지에 표시될 멤버 목록 새로고침
      return true; // 성공
    } catch (err) {
      console.error('회원 저장 오류 (스토어):', err);
      // 스토어의 error 상태를 사용할 수도 있고, 여기서 직접 Toast 표시도 가능
      showToast?.(
        'error',
        `회원 정보 저장 실패: ${err.message || '알 수 없는 오류'}`,
      );
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
        showToast?.(
          'error',
          `회원 삭제 실패: ${err.message || '알 수 없는 오류'}`,
        );
      }
    }
  };

  // 필터링된 회원 목록
  const filteredMembers = members.filter((member) => {
    // 검색어 필터링 (이름만)
    if (
      filter.search &&
      !member.name.includes(filter.search)
    ) {
      return false;
    }

    // 상태 필터링
    if (filter.status !== 'all') {
      const now = new Date();
      const endDate = member.membershipEnd
        ? new Date(member.membershipEnd)
        : null;

      if (filter.status === 'active' && (!endDate || endDate < now)) {
        return false;
      }

      if (filter.status === 'expired' && endDate && endDate >= now) {
        return false;
      }
    }

    // 직원별 필터링
    if (selectedStaff !== 'all' && member.staffName !== selectedStaff) {
      return false;
    }

    // 성별 필터링
    if (selectedGender !== 'all' && member.gender !== selectedGender) {
      return false;
    }

    // 이용권별 필터링
    if (selectedMembershipType !== 'all' && member.membershipType !== selectedMembershipType) {
      return false;
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
    const sortableMembers = [...filteredMembers];

    if (sortConfig.direction === null) {
      return sortableMembers;
    }

    return sortableMembers.sort((a, b) => {
      if (
        a[sortConfig.key as keyof Member] === undefined ||
        b[sortConfig.key as keyof Member] === undefined
      ) {
        return 0;
      }

      // 성별 정렬 로직 추가
      if (sortConfig.key === 'gender') {
        const genderOrder = { 남: 1, 여: 2, '': 3 };
        const aValue = (a[sortConfig.key] as string) || '';
        const bValue = (b[sortConfig.key] as string) || '';

        if (sortConfig.direction === 'ascending') {
          return (
            (genderOrder[aValue as keyof typeof genderOrder] || 3) -
            (genderOrder[bValue as keyof typeof genderOrder] || 3)
          );
        } else {
          return (
            (genderOrder[bValue as keyof typeof genderOrder] || 3) -
            (genderOrder[aValue as keyof typeof genderOrder] || 3)
          );
        }
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

      // 날짜 비교 (membershipEnd, createdAt 필드)
      if (
        sortConfig.key === 'membershipEnd' ||
        sortConfig.key === 'createdAt'
      ) {
        const aDate = a[sortConfig.key]
          ? new Date(a[sortConfig.key] as string).getTime()
          : 0;
        const bDate = b[sortConfig.key]
          ? new Date(b[sortConfig.key] as string).getTime()
          : 0;

        if (sortConfig.direction === 'ascending') {
          return aDate - bDate;
        } else {
          return bDate - aDate;
        }
      }

      // 숫자 비교
      if (typeof a[sortConfig.key as keyof Member] === 'number') {
        if (sortConfig.direction === 'ascending') {
          return (
            (a[sortConfig.key as keyof Member] as number) -
            (b[sortConfig.key as keyof Member] as number)
          );
        } else {
          return (
            (b[sortConfig.key as keyof Member] as number) -
            (a[sortConfig.key as keyof Member] as number)
          );
        }
      }

      return 0;
    });
  }, [filteredMembers, sortConfig]);

  // 통계 데이터 계산 (useMemo로 성능 최적화)
  const statistics = useMemo(() => {
    const activeMembers = members.filter((member) => {
      const now = new Date();
      const endDate = member.membershipEnd
        ? new Date(member.membershipEnd)
        : null;
      return endDate && endDate >= now;
    });

    const expiringMembersIn30Days = activeMembers.filter((member) => {
      const now = new Date();
      const endDate = new Date(member.membershipEnd!);
      const diffDays = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diffDays <= 30 && diffDays >= 0;
    });

    const membersByType: { [key: string]: number } = {};
    members.forEach((member) => {
      const type = member.membershipType || '미지정';
      membersByType[type] = (membersByType[type] || 0) + 1;
    });

    const sortedMembershipTypes = Object.entries(membersByType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return {
      total: members.length,
      active: activeMembers.length,
      expired: members.length - activeMembers.length,
      expiringIn30Days: expiringMembersIn30Days.length,
      topMembershipTypes: sortedMembershipTypes,
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
      day: 'numeric',
    });
  };

  // 페이지당 표시 회원 수 변경 핸들러
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // 페이지 크기가 변경되면 첫 페이지로 이동
    loadMembers(); // 즉시 데이터 다시 로드
  };

  // 전체 보기 토글 핸들러
  const handleShowAllToggle = () => {
    setShowAll(!showAll);
    setCurrentPage(1);
    loadMembers(); // 즉시 데이터 다시 로드
  };

  // 회원 목록 로드 함수 수정 - 클라이언트 사이드 필터링으로 변경
  const loadMembers = () => {
    try {
      // 클라이언트 사이드에서 필터링 및 정렬된 회원 목록 사용
      const currentSortedMembers = sortedMembers;
      
      if (showAll) {
        // 전체 보기일 때는 필터링된 모든 데이터 표시
        setPagedMembers(currentSortedMembers);
        setTotalPages(1);
      } else {
        // 페이지네이션 적용
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pagedData = currentSortedMembers.slice(startIndex, endIndex);
        
        setPagedMembers(pagedData);
        setTotalPages(Math.ceil(currentSortedMembers.length / pageSize));
      }
    } catch (error) {
      console.error('회원 목록 로드 오류:', error);
      showToast?.('error', '회원 목록을 불러오는데 실패했습니다.');
    }
  };

  // 페이지 변경 시 데이터 다시 로드
  useEffect(() => {
    loadMembers();
  }, [currentPage, filter, sortConfig, pageSize, showAll, selectedStaff, selectedGender, selectedMembershipType]); // 새로운 필터 상태들 추가

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
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

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
              총 <span className="font-medium">{sortedMembers.length}</span>명
              중{' '}
              <span className="font-medium">
                {showAll ? 1 : (currentPage - 1) * pageSize + 1}
              </span>
              {' - '}
              <span className="font-medium">
                {showAll ? sortedMembers.length : Math.min(currentPage * pageSize, sortedMembers.length)}
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
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* 검색 박스 - 1/3 크기 */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="이름 검색"
                className="border border-gray-300 p-2.5 rounded-md w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filter.search}
                onChange={(e) => {
                  setFilter({ ...filter, search: e.target.value });
                  setCurrentPage(1); // 검색 시 첫 페이지로 이동
                }}
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>

            {/* 필터 버튼들 */}
            <div className="flex flex-wrap gap-2 items-center">
              {/* 상태별 필터 */}
              <select
                className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filter.status}
                onChange={(e) => {
                  setFilter({
                    ...filter,
                    status: e.target.value as MemberFilter['status'],
                  });
                  setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
                }}
              >
                <option value="all">전체 상태</option>
                <option value="active">활성</option>
                <option value="expired">만료</option>
              </select>

              {/* 직원별 필터 */}
              <select
                className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedStaff}
                onChange={(e) => {
                  setSelectedStaff(e.target.value);
                  setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
                }}
              >
                <option value="all">전체 직원</option>
                {staffList.map((staff) => (
                  <option key={staff.id} value={staff.name}>
                    {staff.name}
                  </option>
                ))}
              </select>

              {/* 성별 필터 */}
              <select
                className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedGender}
                onChange={(e) => {
                  setSelectedGender(e.target.value);
                  setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
                }}
              >
                <option value="all">전체 성별</option>
                {/* 실제 데이터에서 추출된 성별 값들 */}
                {Array.from(new Set(members.map(m => m.gender).filter(Boolean))).map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>

              {/* 이용권별 필터 */}
              <select
                className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedMembershipType}
                onChange={(e) => {
                  setSelectedMembershipType(e.target.value);
                  setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
                }}
              >
                <option value="all">전체 이용권</option>
                {Array.from(new Set(members.map(m => m.membershipType).filter(Boolean))).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              {/* 필터 초기화 버튼 */}
              <button
                className="text-sm text-blue-500 hover:text-blue-700 px-2 py-1 rounded transition-colors"
                onClick={() => {
                  setFilter({ search: '', status: 'all' });
                  setSelectedStaff('all');
                  setSelectedGender('all');
                  setSelectedMembershipType('all');
                  setCurrentPage(1); // 초기화 시 첫 페이지로 이동
                }}
              >
                초기화
              </button>
            </div>

            {/* 오른쪽 버튼 그룹 */}
            <div className="flex gap-2 items-center">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-md flex items-center transition-colors"
                onClick={handleAddMember}
              >
                <Plus size={16} className="mr-2" />
                회원 추가
              </button>

              {/* 엑셀 버튼 그룹 */}
              <div className="flex gap-1 items-center">
                <button
                  title="엑셀 불러오기"
                  className="bg-gray-100 border-none rounded p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() =>
                    document.getElementById('excel-import-input')?.click()
                  }
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
                  className="bg-gray-100 border-none rounded p-2 cursor-pointer hover:bg-gray-200"
                  onClick={handleExportExcel}
                >
                  <Download size={16} />
                </button>
                <button
                  title="엑셀 형식 안내"
                  className="bg-transparent border-none p-1 cursor-pointer"
                  onClick={() => setExcelInfoOpen(true)}
                >
                  <Info size={15} color="#888" />
                </button>
              </div>
            </div>
          </div>
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
            <p className="text-red-700">
              {typeof error === 'string' && error.trim() !== ''
                ? error
                : '회원 데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.'}
            </p>
          </div>
        </div>
      )}

      {/* 통계 요약 영역 (신규 추가) */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">총 회원수</p>
              <p className="text-2xl font-bold text-blue-800 mt-1">
                {statistics.total}명
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">활성 회원</p>
              <p className="text-2xl font-bold text-green-800 mt-1">
                {statistics.active}명
                <span className="text-sm font-normal ml-1">
                  (
                  {((statistics.active / statistics.total) * 100 || 0).toFixed(
                    1,
                  )}
                  %)
                </span>
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">만료 회원</p>
              <p className="text-2xl font-bold text-red-800 mt-1">
                {statistics.expired}명
                <span className="text-sm font-normal ml-1">
                  (
                  {((statistics.expired / statistics.total) * 100 || 0).toFixed(
                    1,
                  )}
                  %)
                </span>
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">
                30일 내 만료 예정
              </p>
              <p className="text-2xl font-bold text-yellow-800 mt-1">
                {statistics.expiringIn30Days}명
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 회원 목록 테이블 */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className={`border border-gray-300 rounded-md px-2 py-1.5 sm:px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  showAll ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={showAll}
              >
                <option value={10}>10개씩 보기</option>
                <option value={20}>20개씩 보기</option>
                <option value={30}>30개씩 보기</option>
                <option value={50}>50개씩 보기</option>
              </select>
              <button
                onClick={handleShowAllToggle}
                className={`px-2 py-1.5 sm:px-3 text-sm rounded-md transition-colors ${
                  showAll
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showAll ? '페이지 보기' : '전체 보기'}
              </button>
            </div>
            <div className="text-sm text-gray-500">
              총 {sortedMembers.length}명의 회원
              {!showAll &&
                ` (${(currentPage - 1) * pageSize + 1} - ${Math.min(currentPage * pageSize, sortedMembers.length)}번째 표시)`}
            </div>
          </div>
          {/* 반응형 테이블: 가로 스크롤, 패딩 조정, 모바일에서 폰트/패딩 축소 */}
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
                    onClick={() => requestSort('gender')}
                  >
                    <div className="flex items-center">
                      성별
                      {sortConfig.key === 'gender' && (
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
                    onClick={() => requestSort('membershipType')}
                  >
                    <div className="flex items-center">
                      회원권 종류
                      {sortConfig.key === 'membershipType' && (
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
                    onClick={() => requestSort('membershipEnd')}
                  >
                    <div className="flex items-center">
                      만료일
                      {sortConfig.key === 'membershipEnd' && (
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
                    onClick={() => requestSort('createdAt')}
                  >
                    <div className="flex items-center">
                      최초 등록일
                      {sortConfig.key === 'createdAt' && (
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
                    onClick={() => requestSort('staffName')}
                  >
                    <div className="flex items-center">
                      담당자
                      {sortConfig.key === 'staffName' && (
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
                  <th className="py-2 px-2 sm:py-2.5 sm:px-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="py-2 px-2 sm:py-2.5 sm:px-3 text-center text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pagedMembers.length > 0 ? (
                  pagedMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer group"
                      onClick={() => handleViewMember(member)}
                    >
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap font-medium text-gray-900 group-hover:text-blue-600">
                        {member.name}
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                        {member.gender || '-'}
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                        {member.phone || '-'}
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                        {member.membershipType || '-'}
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                        {formatDate(member.membershipEnd)}
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                        {formatDate(member.createdAt)}
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap text-gray-700">
                        {member.staffName || '-'}
                      </td>
                      <td className="py-2 px-2 sm:py-2.5 sm:px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            getMembershipStatus(member.membershipEnd) ===
                            'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {getMembershipStatus(member.membershipEnd) ===
                          'active'
                            ? '활성'
                            : '만료'}
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
                              handleViewMember(member);
                            }}
                            className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                            title="상세보기"
                          >
                            <Info size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditMember(member);
                            }}
                            className="text-yellow-500 hover:text-yellow-700 transition-colors p-1"
                            title="수정"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(member.id!);
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
                      colSpan={9}
                      className="py-8 px-4 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Database size={48} className="text-gray-300 mb-3" />
                        <p className="text-lg">회원 정보가 없습니다.</p>
                        <p className="text-sm text-gray-400 mt-1">
                          회원을 추가하려면 '회원 추가' 버튼을 클릭하세요.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션은 전체 보기 모드일 때는 숨김 */}
          {!showAll && renderPagination()}
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
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.2)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: 24,
              minWidth: 340,
              boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
              position: 'relative',
              maxWidth: 420,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setExcelInfoOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              aria-label="닫기"
            >
              <CloseIcon size={18} color="#888" />
            </button>
            <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>
              엑셀 데이터 형식 안내
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                  fontSize: 14,
                  background: '#fafbfc',
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        border: '1px solid #d1d5db',
                        padding: 8,
                        background: '#f3f4f6',
                      }}
                    >
                      이름
                    </th>
                    <th
                      style={{
                        border: '1px solid #d1d5db',
                        padding: 8,
                        background: '#f3f4f6',
                      }}
                    >
                      전화번호
                    </th>
                    <th
                      style={{
                        border: '1px solid #d1d5db',
                        padding: 8,
                        background: '#f3f4f6',
                      }}
                    >
                      이메일
                    </th>
                    <th
                      style={{
                        border: '1px solid #d1d5db',
                        padding: 8,
                        background: '#f3f4f6',
                      }}
                    >
                      생년월일
                    </th>
                    <th
                      style={{
                        border: '1px solid #d1d5db',
                        padding: 8,
                        background: '#f3f4f6',
                      }}
                    >
                      회원권종류
                    </th>
                    <th
                      style={{
                        border: '1px solid #d1d5db',
                        padding: 8,
                        background: '#f3f4f6',
                      }}
                    >
                      시작일
                    </th>
                    <th
                      style={{
                        border: '1px solid #d1d5db',
                        padding: 8,
                        background: '#f3f4f6',
                      }}
                    >
                      종료일
                    </th>
                    <th
                      style={{
                        border: '1px solid #d1d5db',
                        padding: 8,
                        background: '#f3f4f6',
                      }}
                    >
                      비고
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>
                      홍길동
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>
                      010-1234-5678
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>
                      hong@example.com
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>
                      1990-01-01
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>
                      3개월
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>
                      2024-06-01
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>
                      2024-08-31
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: 8 }}>
                      특이사항
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12, color: '#666', fontSize: 13 }}>
              ※ 엑셀 파일의 첫 행은 반드시 <b>컬럼명</b>이어야 하며, 위 예시와
              같은 형식으로 데이터를 입력해주세요.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
