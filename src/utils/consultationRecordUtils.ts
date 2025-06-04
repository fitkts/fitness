// 상담 기록 관리 유틸리티 함수들

import { 
  ConsultationRecord, 
  ConsultationFormData,
  ConsultationMember
} from '../types/consultation';

/**
 * 상담 폼 데이터를 ConsultationRecord 형식으로 변환
 */
export const transformConsultationFormData = (
  formData: ConsultationFormData,
  memberId: number,
  consultantId: number,
  consultantName: string
): Partial<ConsultationRecord> => {
  const now = Math.floor(Date.now() / 1000);
  
  return {
    member_id: memberId,
    consultation_date: Math.floor(new Date(formData.consultation_date).getTime() / 1000),
    consultation_type: formData.consultation_type,
    consultant_id: consultantId,
    consultant_name: consultantName,
    content: formData.content.trim(),
    goals_discussed: formData.goals_discussed || [],
    recommendations: formData.recommendations?.trim() || '',
    next_appointment: formData.next_appointment ? 
      Math.floor(new Date(formData.next_appointment).getTime() / 1000) : undefined,
    status: 'completed', // 기본값: 완료됨
    created_at: now,
    updated_at: now
  };
};

/**
 * 상담 기록 유효성 검증
 */
export const validateConsultationRecord = (data: ConsultationFormData): string[] => {
  const errors: string[] = [];
  
  // 필수 필드 검증
  if (!data.consultation_date) {
    errors.push('상담 날짜는 필수 입력 항목입니다.');
  }
  
  if (!data.content.trim()) {
    errors.push('상담 내용은 필수 입력 항목입니다.');
  }
  
  // 상담 내용 길이 검증
  if (data.content.trim().length < 10) {
    errors.push('상담 내용은 최소 10자 이상 입력해주세요.');
  }
  
  if (data.content.trim().length > 1000) {
    errors.push('상담 내용은 최대 1000자까지 입력 가능합니다.');
  }
  
  // 권장사항 길이 검증
  if (data.recommendations && data.recommendations.length > 500) {
    errors.push('권장사항은 최대 500자까지 입력 가능합니다.');
  }
  
  // 날짜 검증
  const consultationDate = new Date(data.consultation_date);
  const today = new Date();
  
  if (consultationDate > today) {
    errors.push('상담 날짜는 오늘 이전 날짜여야 합니다.');
  }
  
  // 다음 상담 날짜 검증
  if (data.next_appointment) {
    const nextDate = new Date(data.next_appointment);
    
    if (nextDate <= consultationDate) {
      errors.push('다음 상담 날짜는 현재 상담 날짜보다 뒤여야 합니다.');
    }
  }
  
  return errors;
};

/**
 * 회원의 상담 기록을 날짜순으로 정렬
 */
export const sortConsultationRecords = (
  records: ConsultationRecord[],
  direction: 'asc' | 'desc' = 'desc'
): ConsultationRecord[] => {
  return [...records].sort((a, b) => {
    const comparison = a.consultation_date - b.consultation_date;
    return direction === 'asc' ? comparison : -comparison;
  });
};

/**
 * 상담 기록을 유형별로 필터링
 */
export const filterConsultationsByType = (
  records: ConsultationRecord[],
  types: string[]
): ConsultationRecord[] => {
  if (types.length === 0) return records;
  return records.filter(record => types.includes(record.consultation_type));
};

/**
 * 상담 기록을 날짜 범위로 필터링
 */
export const filterConsultationsByDateRange = (
  records: ConsultationRecord[],
  startDate?: string,
  endDate?: string
): ConsultationRecord[] => {
  return records.filter(record => {
    const recordDate = new Date(record.consultation_date * 1000);
    const recordDateStr = recordDate.toISOString().split('T')[0];
    
    if (startDate && recordDateStr < startDate) return false;
    if (endDate && recordDateStr > endDate) return false;
    
    return true;
  });
};

/**
 * 회원의 다음 상담 예정일 계산
 */
export const getNextConsultationDate = (records: ConsultationRecord[]): Date | null => {
  if (records.length === 0) return null;
  
  // 가장 최근 상담 기록에서 next_appointment 확인
  const sortedRecords = sortConsultationRecords(records, 'desc');
  const latestRecord = sortedRecords[0];
  
  if (latestRecord.next_appointment) {
    return new Date(latestRecord.next_appointment * 1000);
  }
  
  return null;
};

/**
 * 상담 기록 통계 계산
 */
export const calculateConsultationStats = (records: ConsultationRecord[]) => {
  const total = records.length;
  const completed = records.filter(r => r.status === 'completed').length;
  const scheduled = records.filter(r => r.status === 'scheduled').length;
  const cancelled = records.filter(r => r.status === 'cancelled').length;
  
  // 상담 유형별 통계
  const typeStats = records.reduce((acc, record) => {
    acc[record.consultation_type] = (acc[record.consultation_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // 월별 상담 통계 (최근 6개월)
  const monthlyStats = getMonthlyConsultationStats(records);
  
  return {
    total,
    completed,
    scheduled,
    cancelled,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    typeStats,
    monthlyStats
  };
};

/**
 * 월별 상담 통계 계산 (최근 6개월)
 */
const getMonthlyConsultationStats = (records: ConsultationRecord[]) => {
  const months = [];
  const now = new Date();
  
  // 최근 6개월 생성
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: month.toISOString().slice(0, 7), // YYYY-MM 형태
      label: month.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
      count: 0
    });
  }
  
  // 상담 기록을 월별로 집계
  records.forEach(record => {
    const recordDate = new Date(record.consultation_date * 1000);
    const recordMonth = recordDate.toISOString().slice(0, 7);
    
    const monthStat = months.find(m => m.month === recordMonth);
    if (monthStat) {
      monthStat.count++;
    }
  });
  
  return months;
};

/**
 * 상담 기록에서 가장 많이 논의된 목표 상위 5개 추출
 */
export const getTopDiscussedGoals = (records: ConsultationRecord[]): Array<{goal: string, count: number}> => {
  const goalCounts = records.reduce((acc, record) => {
    record.goals_discussed.forEach(goal => {
      acc[goal] = (acc[goal] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(goalCounts)
    .map(([goal, count]) => ({ goal, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

/**
 * 상담 기록 검색 (내용, 권장사항에서 키워드 검색)
 */
export const searchConsultationRecords = (
  records: ConsultationRecord[],
  searchQuery: string
): ConsultationRecord[] => {
  if (!searchQuery.trim()) return records;
  
  const query = searchQuery.toLowerCase().trim();
  
  return records.filter(record => {
    const content = record.content.toLowerCase();
    const recommendations = (record.recommendations || '').toLowerCase();
    const goals = record.goals_discussed.join(' ').toLowerCase();
    
    return content.includes(query) || 
           recommendations.includes(query) || 
           goals.includes(query);
  });
};

/**
 * 상담 기록을 페이지네이션
 */
export const paginateConsultationRecords = (
  records: ConsultationRecord[],
  page: number,
  pageSize: number = 10
) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: records.slice(startIndex, endIndex),
    total: records.length,
    currentPage: page,
    pageSize,
    totalPages: Math.ceil(records.length / pageSize),
    hasNext: endIndex < records.length,
    hasPrevious: startIndex > 0
  };
};

/**
 * 상담 기록 요약 생성 (최근 상담 기록 기반)
 */
export const generateConsultationSummary = (
  member: ConsultationMember,
  records: ConsultationRecord[]
): string => {
  if (records.length === 0) {
    return `${member.name} 회원의 상담 기록이 아직 없습니다.`;
  }
  
  const sortedRecords = sortConsultationRecords(records, 'desc');
  const latestRecord = sortedRecords[0];
  const totalRecords = records.length;
  const topGoals = getTopDiscussedGoals(records);
  
  let summary = `${member.name} 회원 (총 ${totalRecords}회 상담)\n\n`;
  summary += `최근 상담: ${new Date(latestRecord.consultation_date * 1000).toLocaleDateString('ko-KR')}\n`;
  summary += `상담 유형: ${latestRecord.consultation_type}\n\n`;
  
  if (topGoals.length > 0) {
    summary += '주요 논의 목표:\n';
    topGoals.forEach((goal, index) => {
      summary += `${index + 1}. ${goal.goal} (${goal.count}회)\n`;
    });
  }
  
  return summary;
};

/**
 * 상담 기록 내보내기 데이터 준비 (CSV 형태)
 */
export const prepareConsultationExportData = (
  member: ConsultationMember,
  records: ConsultationRecord[]
) => {
  const headers = [
    '날짜',
    '상담유형', 
    '상담자',
    '상담내용',
    '논의목표',
    '권장사항',
    '다음예약일',
    '상태'
  ];
  
  const rows = records.map(record => [
    new Date(record.consultation_date * 1000).toLocaleDateString('ko-KR'),
    record.consultation_type,
    record.consultant_name,
    record.content.replace(/\n/g, ' '),
    record.goals_discussed.join(', '),
    (record.recommendations || '').replace(/\n/g, ' '),
    record.next_appointment ? 
      new Date(record.next_appointment * 1000).toLocaleDateString('ko-KR') : '',
    record.status
  ]);
  
  return {
    filename: `${member.name}_상담기록_${new Date().toISOString().split('T')[0]}.csv`,
    headers,
    rows
  };
}; 