import { ConsultationMember, ConsultationFilter, ConsultationSortConfig, ConsultationStatistics } from '../types/consultation';

// 상담 회원 필터링 함수
export const filterConsultationMembers = (
  members: ConsultationMember[],
  filter: ConsultationFilter
): ConsultationMember[] => {
  return members.filter((member) => {
    // 검색어 필터
    if (filter.search && filter.search.trim() !== '') {
      const searchTerm = filter.search.toLowerCase();
      const nameMatch = member.name.toLowerCase().includes(searchTerm);
      const phoneMatch = member.phone && member.phone.includes(searchTerm);
      if (!nameMatch && !phoneMatch) {
        return false;
      }
    }

    // 상담 상태 필터
    if (filter.status && filter.status !== 'all') {
      if (member.consultation_status !== filter.status) {
        return false;
      }
    }

    // 담당자 필터
    if (filter.staffName && filter.staffName !== 'all') {
      if (member.staff_name !== filter.staffName) {
        return false;
      }
    }

    // 성별 필터
    if (filter.gender && filter.gender !== 'all') {
      if (member.gender !== filter.gender) {
        return false;
      }
    }

    // 등록일 범위 필터
    if (filter.dateFrom && member.created_at) {
      const memberDate = new Date(member.created_at * 1000);
      const fromDate = new Date(filter.dateFrom);
      if (memberDate < fromDate) {
        return false;
      }
    }

    if (filter.dateTo && member.created_at) {
      const memberDate = new Date(member.created_at * 1000);
      const toDate = new Date(filter.dateTo);
      toDate.setHours(23, 59, 59, 999); // 하루 끝까지 포함
      if (memberDate > toDate) {
        return false;
      }
    }

    return true;
  });
};

// 상담 회원 정렬 함수
export const sortConsultationMembers = (
  members: ConsultationMember[],
  sortConfig: ConsultationSortConfig
): ConsultationMember[] => {
  if (!sortConfig.key || !sortConfig.direction) {
    return members;
  }

  return [...members].sort((a, b) => {
    let aValue: any = '';
    let bValue: any = '';

    switch (sortConfig.key) {
      case 'name':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'phone':
        aValue = a.phone || '';
        bValue = b.phone || '';
        break;
      case 'gender':
        aValue = a.gender || '';
        bValue = b.gender || '';
        break;
      case 'birth_date':
        aValue = a.birth_date || '';
        bValue = b.birth_date || '';
        break;
      case 'consultation_status':
        aValue = a.consultation_status || '';
        bValue = b.consultation_status || '';
        break;
      case 'staff_name':
        aValue = a.staff_name || '';
        bValue = b.staff_name || '';
        break;
      case 'first_visit':
        aValue = a.first_visit || '';
        bValue = b.first_visit || '';
        break;
      case 'created_at':
        aValue = a.created_at || 0;
        bValue = b.created_at || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
};

// 상담 통계 계산 함수
export const calculateConsultationStatistics = (
  members: ConsultationMember[]
): ConsultationStatistics => {
  const total = members.length;
  const pending = members.filter(m => m.consultation_status === 'pending').length;
  const inProgress = members.filter(m => m.consultation_status === 'in_progress').length;
  const completed = members.filter(m => m.consultation_status === 'completed').length;
  const followUp = members.filter(m => m.consultation_status === 'follow_up').length;

  return {
    total,
    pending,
    inProgress,
    completed,
    followUp
  };
};

// 페이지네이션 계산 함수
export const calculateConsultationPagination = (
  totalItems: number,
  currentPage: number,
  pageSize: number,
  maxVisiblePages: number = 5
) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return {
    totalPages,
    hasNextPage,
    hasPrevPage,
    startPage,
    endPage,
    pageNumbers
  };
}; 