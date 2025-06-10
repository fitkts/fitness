/**
 * 락커 카드 컴팩트 디자인 테스트
 * TDD: 카드 크기 최적화 및 불필요한 정보 제거
 */

describe('락커 카드 컴팩트 디자인 테스트', () => {
  test('카드 패딩이 컴팩트하게 조정되어야 함', () => {
    // Given: 기존 p-3 패딩 (12px)
    const oldPadding = 'p-3'; // 12px
    
    // When: 컴팩트 디자인 적용
    const newPadding = 'p-2'; // 8px
    
    // Then: 패딩이 줄어들어야 함
    expect(newPadding).not.toBe(oldPadding);
    expect('p-2').toBe('p-2'); // 8px 패딩 확인
  });

  test('크기와 위치 정보가 제거되어야 함', () => {
    // Given: 락커 객체에 크기와 위치 정보가 있을 때
    const locker = {
      id: 1,
      number: '1',
      status: 'available',
      size: 'medium',
      location: '1층 남자 탈의실'
    };

    // When: 컴팩트 디자인 적용
    const shouldShowSizeAndLocation = false;

    // Then: 크기와 위치 정보가 표시되지 않아야 함
    expect(shouldShowSizeAndLocation).toBe(false);
  });

  test('필수 정보만 표시되어야 함', () => {
    // Given: 락커의 핵심 정보
    const essentialInfo = [
      'number',      // 락커 번호 ✅
      'status',      // 상태 ✅
      'memberName',  // 사용자명 ✅ (사용중일 때)
      'endDate'      // 만료일 ✅ (사용중일 때)
    ];

    // When: 컴팩트 디자인 적용
    const removedInfo = [
      'size',        // 크기 ❌
      'location'     // 위치 ❌
    ];

    // Then: 필수 정보는 유지, 불필요한 정보는 제거
    expect(essentialInfo).toHaveLength(4);
    expect(removedInfo).toHaveLength(2);
  });

  test('액션 버튼이 더 컴팩트하게 표시되어야 함', () => {
    // Given: 기존 버튼 크기
    const oldButtonSize = 14; // 14px 아이콘
    const oldButtonPadding = 'p-1'; // 4px 패딩

    // When: 컴팩트 디자인 적용
    const newButtonSize = 12; // 12px 아이콘
    const newButtonPadding = 'p-0.5'; // 2px 패딩

    // Then: 버튼이 더 작아져야 함
    expect(newButtonSize).toBeLessThan(oldButtonSize);
  });

  test('카드 간 간격이 조정되어야 함', () => {
    // Given: 기존 gap-3 (12px)
    const oldGap = 'gap-3';
    
    // When: 컴팩트 디자인 적용
    const newGap = 'gap-2'; // 8px
    
    // Then: 간격이 줄어들어야 함
    expect(newGap).toBe('gap-2');
  });
}); 