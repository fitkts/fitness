// 날짜 계산 함수들 테스트 (시간대 문제 수정 버전)
const dateUtils = {
  // 로컬 날짜를 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
  formatLocalDate: (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 이번 주의 시작일(월요일)과 종료일(일요일) 계산
  getThisWeek: (offset = 0) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    
    // 월요일 계산 (일요일이 0이므로 조정)
    const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday + (offset * 7));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6); // 일요일로 설정
    
    return {
      startDate: dateUtils.formatLocalDate(monday),
      endDate: dateUtils.formatLocalDate(sunday),
    };
  },

  // 이번 달의 첫날과 마지막날 계산
  getThisMonth: (offset = 0) => {
    const today = new Date();
    const targetYear = today.getFullYear();
    const targetMonth = today.getMonth() + offset;
    
    const firstDay = new Date(targetYear, targetMonth, 1);
    const lastDay = new Date(targetYear, targetMonth + 1, 0); // 다음 달 0일 = 이번 달 마지막 일
    
    return {
      startDate: dateUtils.formatLocalDate(firstDay),
      endDate: dateUtils.formatLocalDate(lastDay),
    };
  },

  // 올해의 첫날(1월 1일)과 마지막날(12월 31일) 계산
  getThisYear: (offset = 0) => {
    const today = new Date();
    const targetYear = today.getFullYear() + offset;
    
    const firstDay = new Date(targetYear, 0, 1); // 1월 1일
    const lastDay = new Date(targetYear, 11, 31); // 12월 31일
    
    return {
      startDate: dateUtils.formatLocalDate(firstDay),
      endDate: dateUtils.formatLocalDate(lastDay),
    };
  },

  // 오늘 날짜
  getToday: (offset = 0) => {
    const today = new Date();
    today.setDate(today.getDate() + offset);
    const dateStr = dateUtils.formatLocalDate(today);
    
    return {
      startDate: dateStr,
      endDate: dateStr,
    };
  },

  // 최근 N일
  getRecentDays: (days, offset = 0) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + offset);
    
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days + 1); // +1을 해서 오늘 포함
    
    return {
      startDate: dateUtils.formatLocalDate(startDate),
      endDate: dateUtils.formatLocalDate(endDate),
    };
  },
};

console.log('=== 현재 시스템 날짜 정보 ===');
const now = new Date();
console.log('Current Date (Local):', dateUtils.formatLocalDate(now));
console.log('Year:', now.getFullYear());
console.log('Month (0-based):', now.getMonth(), '(실제 월:', now.getMonth() + 1, ')');
console.log('Date:', now.getDate());
console.log('Day of Week:', now.getDay());

console.log('\n=== 수정된 날짜 계산 결과 ===');
console.log('오늘:', dateUtils.getToday());
console.log('이번 주:', dateUtils.getThisWeek()); 
console.log('이번 달:', dateUtils.getThisMonth());
console.log('올해:', dateUtils.getThisYear());
console.log('최근 7일:', dateUtils.getRecentDays(7));
console.log('최근 30일:', dateUtils.getRecentDays(30));

console.log('\n=== 날짜 이동 테스트 ===');
console.log('지난 달:', dateUtils.getThisMonth(-1));
console.log('다음 달:', dateUtils.getThisMonth(1));
console.log('지난 주:', dateUtils.getThisWeek(-1));
console.log('다음 주:', dateUtils.getThisWeek(1));
console.log('작년:', dateUtils.getThisYear(-1));
console.log('내년:', dateUtils.getThisYear(1));

console.log('\n=== 검증 ===');
// 2025년 6월이면
// - 이번 달: 2025-06-01부터 2025-06-30까지
// - 올해: 2025-01-01부터 2025-12-31까지
// - 6월 25일이 수요일이면 이번 주: 월요일(6/23)부터 일요일(6/29)까지
const expectedThisMonth = { startDate: '2025-06-01', endDate: '2025-06-30' };
const expectedThisYear = { startDate: '2025-01-01', endDate: '2025-12-31' };

const actualThisMonth = dateUtils.getThisMonth();
const actualThisYear = dateUtils.getThisYear();

console.log('이번 달 기대값:', expectedThisMonth);
console.log('이번 달 실제값:', actualThisMonth);
console.log('이번 달 올바른가?', JSON.stringify(expectedThisMonth) === JSON.stringify(actualThisMonth));

console.log('올해 기대값:', expectedThisYear);
console.log('올해 실제값:', actualThisYear);
console.log('올해 올바른가?', JSON.stringify(expectedThisYear) === JSON.stringify(actualThisYear)); 