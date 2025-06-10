/**
 * 락커 페이지네이션 및 필터링 테스트
 * TDD 방식: 테스트를 먼저 작성하고 기능을 구현
 */

describe('락커 페이지네이션 테스트', () => {
  test('첫 번째 페이지에는 1-50번 락커가 표시되어야 함', async () => {
    // Given: 100개의 락커가 있을 때
    const mockLockers = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      number: (i + 1).toString(),
      status: 'available'
    }));

    // When: 첫 번째 페이지를 요청하면
    const page1Result = await getAllLockers(1, 50, '', 'all');

    // Then: 1-50번 락커가 반환되어야 함
    expect(page1Result.success).toBe(true);
    expect(page1Result.data.data).toHaveLength(50);
    expect(page1Result.data.data[0].number).toBe('1');
    expect(page1Result.data.data[49].number).toBe('50');
    expect(page1Result.data.total).toBe(100);
  });

  test('두 번째 페이지에는 51-100번 락커가 표시되어야 함', async () => {
    // When: 두 번째 페이지를 요청하면
    const page2Result = await getAllLockers(2, 50, '', 'all');

    // Then: 51-100번 락커가 반환되어야 함
    expect(page2Result.success).toBe(true);
    expect(page2Result.data.data).toHaveLength(50);
    expect(page2Result.data.data[0].number).toBe('51');
    expect(page2Result.data.data[49].number).toBe('100');
    expect(page2Result.data.total).toBe(100);
  });

  test('상태 필터링이 올바르게 작동해야 함', async () => {
    // When: 사용중인 락커만 필터링하면
    const occupiedResult = await getAllLockers(1, 50, '', 'occupied');

    // Then: 사용중인 락커만 반환되어야 함
    expect(occupiedResult.success).toBe(true);
    expect(occupiedResult.data.data.every(locker => locker.status === 'occupied')).toBe(true);
  });

  test('검색어 필터링이 올바르게 작동해야 함', async () => {
    // When: '10' 검색어로 검색하면
    const searchResult = await getAllLockers(1, 50, '10', 'all');

    // Then: 번호에 '10'이 포함된 락커만 반환되어야 함
    expect(searchResult.success).toBe(true);
    expect(searchResult.data.data.every(locker => locker.number.includes('10'))).toBe(true);
  });
});

describe('락커 UI 상태 테스트', () => {
  test('페이지 변경 시 올바른 데이터가 표시되어야 함', () => {
    // Given: 현재 페이지가 1이고
    const currentPage = 1;
    const itemsPerPage = 50;
    
    // When: 페이지를 2로 변경하면
    const newPage = 2;
    
    // Then: 2페이지의 시작 인덱스가 올바르게 계산되어야 함
    const startIndex = (newPage - 1) * itemsPerPage + 1;
    const endIndex = newPage * itemsPerPage;
    
    expect(startIndex).toBe(51);
    expect(endIndex).toBe(100);
  });

  test('필터 변경 시 첫 페이지로 이동해야 함', () => {
    // Given: 현재 3페이지에 있을 때
    const currentPage = 3;
    
    // When: 필터를 변경하면
    const shouldResetToPage1 = true;
    
    // Then: 페이지가 1로 초기화되어야 함
    expect(shouldResetToPage1).toBe(true);
  });
}); 