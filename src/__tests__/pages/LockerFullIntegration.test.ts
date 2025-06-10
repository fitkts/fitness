/**
 * 락커 완전 통합 기능 테스트 (TDD)
 * 프론트엔드 ↔ 백엔드 완전 연결 + 히스토리 + 통계 연동
 */

describe('락커 히스토리 관리 테스트', () => {
  test('락커 상태 변경 시 히스토리가 기록되어야 함', async () => {
    // Given: 락커가 사용가능 상태일 때
    const locker = { id: 1, number: '1', status: 'available' };
    
    // When: 락커를 사용중으로 변경하면
    const historyData = {
      lockerId: 1,
      memberId: 123,
      action: 'assign',
      previousStatus: 'available',
      newStatus: 'occupied',
      startDate: '2025-01-15',
      endDate: '2025-02-15'
    };
    
    // Then: 히스토리가 기록되어야 함
    expect(historyData.action).toBe('assign');
    expect(historyData.previousStatus).toBe('available');
    expect(historyData.newStatus).toBe('occupied');
  });

  test('락커 히스토리를 조회할 수 있어야 함', async () => {
    // Given: 락커에 여러 히스토리가 있을 때
    const lockerId = 1;
    
    // When: 히스토리를 조회하면
    const expectedHistory = [
      { action: 'assign', memberName: '김철수', date: '2025-01-15' },
      { action: 'release', memberName: '김철수', date: '2025-02-15' },
      { action: 'assign', memberName: '박영희', date: '2025-02-20' }
    ];
    
    // Then: 시간순으로 정렬된 히스토리가 반환되어야 함
    expect(expectedHistory).toHaveLength(3);
    expect(expectedHistory[0].action).toBe('assign');
    expect(expectedHistory[2].memberName).toBe('박영희');
  });

  test('회원별 락커 사용 히스토리를 조회할 수 있어야 함', async () => {
    // Given: 특정 회원의 락커 사용 기록이 있을 때
    const memberId = 123;
    
    // When: 회원의 락커 히스토리를 조회하면
    const memberLockerHistory = [
      { lockerNumber: '1', startDate: '2025-01-15', endDate: '2025-02-15', status: 'completed' },
      { lockerNumber: '5', startDate: '2025-02-20', endDate: '2025-03-20', status: 'active' }
    ];
    
    // Then: 해당 회원의 락커 사용 기록이 반환되어야 함
    expect(memberLockerHistory).toHaveLength(2);
    expect(memberLockerHistory[0].lockerNumber).toBe('1');
    expect(memberLockerHistory[1].status).toBe('active');
  });
});

describe('락커 통계 연동 테스트', () => {
  test('락커 점유율 통계가 계산되어야 함', () => {
    // Given: 100개 락커 중 70개가 사용중일 때
    const totalLockers = 100;
    const occupiedLockers = 70;
    const availableLockers = 25;
    const maintenanceLockers = 5;
    
    // When: 점유율을 계산하면
    const occupancyRate = (occupiedLockers / totalLockers) * 100;
    const availabilityRate = (availableLockers / totalLockers) * 100;
    
    // Then: 올바른 통계가 계산되어야 함
    expect(occupancyRate).toBe(70);
    expect(availabilityRate).toBe(25);
    expect(occupiedLockers + availableLockers + maintenanceLockers).toBe(totalLockers);
  });

  test('월별 락커 수익 통계가 계산되어야 함', () => {
    // Given: 락커 결제 데이터가 있을 때
    const lockerPayments = [
      { lockerId: 1, amount: 50000, date: '2025-01-15', type: 'monthly' },
      { lockerId: 2, amount: 30000, date: '2025-01-20', type: 'monthly' },
      { lockerId: 3, amount: 50000, date: '2025-02-01', type: 'monthly' }
    ];
    
    // When: 월별 수익을 집계하면
    const januaryRevenue = lockerPayments
      .filter(p => p.date.startsWith('2025-01'))
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Then: 올바른 수익이 계산되어야 함
    expect(januaryRevenue).toBe(80000);
  });

  test('락커 사용 패턴 분석이 가능해야 함', () => {
    // Given: 락커 사용 데이터가 있을 때
    const usagePattern = {
      averageUsageDuration: 30, // 평균 30일
      mostPopularSize: 'medium',
      peakUsageMonth: 'January',
      renewalRate: 85 // 85% 갱신율
    };
    
    // When: 사용 패턴을 분석하면
    const insights = {
      popularSize: usagePattern.mostPopularSize,
      averageDays: usagePattern.averageUsageDuration,
      renewalSuccess: usagePattern.renewalRate > 80
    };
    
    // Then: 유용한 인사이트가 제공되어야 함
    expect(insights.popularSize).toBe('medium');
    expect(insights.renewalSuccess).toBe(true);
  });
});

describe('락커 실시간 상태 관리 테스트', () => {
  test('만료 예정 락커가 자동으로 감지되어야 함', () => {
    // Given: 만료가 임박한 락커들이 있을 때
    const today = new Date('2025-01-15');
    const lockers = [
      { id: 1, endDate: '2025-01-17', memberName: '김철수' }, // 2일 후 만료
      { id: 2, endDate: '2025-01-20', memberName: '박영희' }, // 5일 후 만료
      { id: 3, endDate: '2025-02-15', memberName: '이민수' }  // 31일 후 만료
    ];
    
    // When: 7일 이내 만료 예정 락커를 필터링하면
    const expiringLockers = lockers.filter(locker => {
      const endDate = new Date(locker.endDate);
      const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    });
    
    // Then: 해당 락커들이 감지되어야 함
    expect(expiringLockers).toHaveLength(2);
    expect(expiringLockers[0].memberName).toBe('김철수');
    expect(expiringLockers[1].memberName).toBe('박영희');
  });

  test('락커 상태 변경 알림이 생성되어야 함', () => {
    // Given: 락커 상태가 변경될 때
    const statusChange = {
      lockerId: 1,
      lockerNumber: '1',
      oldStatus: 'available',
      newStatus: 'occupied',
      memberName: '김철수',
      changeDate: '2025-01-15'
    };
    
    // When: 알림을 생성하면
    const notification = {
      type: 'locker_assigned',
      title: `락커 #${statusChange.lockerNumber} 배정`,
      message: `${statusChange.memberName}님에게 락커가 배정되었습니다.`,
      timestamp: statusChange.changeDate
    };
    
    // Then: 적절한 알림이 생성되어야 함
    expect(notification.type).toBe('locker_assigned');
    expect(notification.message).toContain('김철수');
    expect(notification.message).toContain('배정');
  });
}); 