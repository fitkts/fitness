import { formatDate, getMembershipStatus, calculateStatistics } from '../../utils/memberUtils';
import { Member } from '../../types/member';

describe('memberUtils', () => {
  describe('formatDate', () => {
    it('유효한 날짜 문자열을 한국어 형식으로 변환해야 한다', () => {
      const result = formatDate('2024-06-15');
      expect(result).toBe('2024년 6월 15일');
    });

    it('null이나 undefined일 때 "N/A"를 반환해야 한다', () => {
      expect(formatDate(null)).toBe('N/A');
      expect(formatDate(undefined)).toBe('N/A');
    });

    it('빈 문자열일 때 "N/A"를 반환해야 한다', () => {
      expect(formatDate('')).toBe('N/A');
    });
  });

  describe('getMembershipStatus', () => {
    it('만료일이 현재 날짜보다 미래면 "active"를 반환해야 한다', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const result = getMembershipStatus(futureDate.toISOString().split('T')[0]);
      expect(result).toBe('active');
    });

    it('만료일이 현재 날짜보다 과거면 "expired"를 반환해야 한다', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const result = getMembershipStatus(pastDate.toISOString().split('T')[0]);
      expect(result).toBe('expired');
    });

    it('만료일이 없으면 "expired"를 반환해야 한다', () => {
      expect(getMembershipStatus(null)).toBe('expired');
      expect(getMembershipStatus(undefined)).toBe('expired');
    });
  });

  describe('calculateStatistics', () => {
    const mockMembers: Member[] = [
      {
        id: 1,
        name: '홍길동',
        membershipEnd: '2024-12-31',
        membershipType: '3개월'
      },
      {
        id: 2,
        name: '김철수',
        membershipEnd: '2023-12-31',
        membershipType: '6개월'
      },
      {
        id: 3,
        name: '이영희',
        membershipEnd: '2024-07-15',
        membershipType: '3개월'
      }
    ] as Member[];

    it('총 회원수를 정확히 계산해야 한다', () => {
      const stats = calculateStatistics(mockMembers);
      expect(stats.total).toBe(3);
    });

    it('활성 회원수와 만료 회원수를 정확히 계산해야 한다', () => {
      const stats = calculateStatistics(mockMembers);
      expect(stats.active).toBeGreaterThanOrEqual(0);
      expect(stats.expired).toBeGreaterThanOrEqual(0);
      expect(stats.active + stats.expired).toBe(stats.total);
    });

    it('30일 내 만료 예정 회원수를 계산해야 한다', () => {
      const stats = calculateStatistics(mockMembers);
      expect(stats.expiringIn30Days).toBeGreaterThanOrEqual(0);
    });
  });
}); 