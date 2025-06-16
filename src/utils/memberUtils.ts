import { Member, MemberStatistics, MemberStatus } from '../types/member';
import { STATISTICS_CONFIG, GENDER_SORT_ORDER } from '../config/memberConfig';

/**
 * 날짜 문자열을 한국어 형식으로 포맷팅
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 회원 상태 확인 (활성/만료)
 */
export const getMembershipStatus = (endDate: string | undefined | null): MemberStatus => {
  if (!endDate) return 'expired';

  const now = new Date();
  const expiryDate = new Date(endDate);

  return expiryDate >= now ? 'active' : 'expired';
};

/**
 * 회원 통계 계산
 */
export const calculateStatistics = (members: Member[]): MemberStatistics => {
  const activeMembers = members.filter((member) => {
    const now = new Date();
    const endDate = member.membershipEnd ? new Date(member.membershipEnd) : null;
    return endDate && endDate >= now;
  });

  const expiringMembersIn30Days = activeMembers.filter((member) => {
    const now = new Date();
    const endDate = new Date(member.membershipEnd!);
    const diffDays = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= STATISTICS_CONFIG.EXPIRING_DAYS_THRESHOLD && diffDays >= 0;
  });

  const membersByType: { [key: string]: number } = {};
  members.forEach((member) => {
    const type = member.membershipType || '미지정';
    membersByType[type] = (membersByType[type] || 0) + 1;
  });

  const sortedMembershipTypes = Object.entries(membersByType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, STATISTICS_CONFIG.TOP_MEMBERSHIP_TYPES_COUNT);

  return {
    total: members.length,
    active: activeMembers.length,
    expired: members.length - activeMembers.length,
    expiringIn30Days: expiringMembersIn30Days.length,
    topMembershipTypes: sortedMembershipTypes,
  };
};

/**
 * 회원 목록 정렬
 */
export const sortMembers = (
  members: Member[],
  sortKey: string,
  direction: 'ascending' | 'descending' | null
): Member[] => {
  if (direction === null) {
    return [...members];
  }

  return [...members].sort((a, b) => {
    if (
      a[sortKey as keyof Member] === undefined ||
      b[sortKey as keyof Member] === undefined
    ) {
      return 0;
    }

    // 성별 정렬 로직
    if (sortKey === 'gender') {
      const aValue = (a[sortKey] as string) || '';
      const bValue = (b[sortKey] as string) || '';

      if (direction === 'ascending') {
        return (
          (GENDER_SORT_ORDER[aValue as keyof typeof GENDER_SORT_ORDER] || 3) -
          (GENDER_SORT_ORDER[bValue as keyof typeof GENDER_SORT_ORDER] || 3)
        );
      } else {
        return (
          (GENDER_SORT_ORDER[bValue as keyof typeof GENDER_SORT_ORDER] || 3) -
          (GENDER_SORT_ORDER[aValue as keyof typeof GENDER_SORT_ORDER] || 3)
        );
      }
    }

    // 문자열 비교
    if (typeof a[sortKey as keyof Member] === 'string') {
      const aValue = (a[sortKey as keyof Member] as string) || '';
      const bValue = (b[sortKey as keyof Member] as string) || '';

      if (direction === 'ascending') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    }

    // 날짜 비교
    if (sortKey === 'membershipEnd' || sortKey === 'createdAt') {
      const aDate = a[sortKey] ? new Date(a[sortKey] as string).getTime() : 0;
      const bDate = b[sortKey] ? new Date(b[sortKey] as string).getTime() : 0;

      if (direction === 'ascending') {
        return aDate - bDate;
      } else {
        return bDate - aDate;
      }
    }

    // 숫자 비교
    if (typeof a[sortKey as keyof Member] === 'number') {
      if (direction === 'ascending') {
        return (
          (a[sortKey as keyof Member] as number) -
          (b[sortKey as keyof Member] as number)
        );
      } else {
        return (
          (b[sortKey as keyof Member] as number) -
          (a[sortKey as keyof Member] as number)
        );
      }
    }

    return 0;
  });
};

/**
 * 페이지네이션 계산
 */
export const calculatePagination = (
  totalItems: number,
  currentPage: number,
  pageSize: number,
  maxVisiblePages: number = 5
) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return {
    totalPages,
    startPage,
    endPage,
    pageNumbers,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}; 