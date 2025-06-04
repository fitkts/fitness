# 락커 표시 및 중복 번호 문제 해결

## 🚨 발생한 문제

### 1. 락커 40번 이후 표시 문제
- 락커 카드가 40번 이후부터 제대로 표시되지 않음
- 51, 52번 락커 추가 시 "이미 있는 락커 번호"라는 오류 발생

### 2. 중복 번호 오류 원인
- 백엔드에서 락커 번호를 정규화하여 저장 (앞의 0 제거)
- 예: "051" → "51"로 저장되어, 나중에 "51" 입력 시 중복으로 판단

## 🔧 해결 방법

### 1. 백엔드 수정 (lockerRepository.ts)

#### **락커 번호 정규화 함수 수정**
```typescript
// Before: 저장 시에도 정규화
function normalizeLockerNumber(number: string): string {
  return number.replace(/^0+/, '');
}

// After: 비교용으로만 사용
function normalizeLockerNumberForComparison(number: string): string {
  return number.replace(/^0+/, '') || '0';
}
```

#### **addLocker 함수 수정**
```typescript
// Before: 정규화된 번호로 저장
const normalizedNumber = normalizeLockerNumber(lockerData.number);
const existingLocker = db.prepare('SELECT id FROM lockers WHERE number = ?').get(normalizedNumber);

// After: 원본 번호 그대로 저장
const existingLocker = db.prepare('SELECT id FROM lockers WHERE number = ?').get(lockerData.number);
```

#### **정렬 로직 개선**
```sql
-- Before: 0 제거로 인한 정렬 문제
ORDER BY CAST(REPLACE(l.number, '0', '') AS INTEGER)

-- After: 자연스러운 숫자 정렬
ORDER BY 
  CASE 
    WHEN l.number GLOB '[0-9]*' 
    THEN CAST(l.number AS INTEGER) 
    ELSE 999999 
  END,
  l.number COLLATE NOCASE
```

### 2. 프론트엔드 수정 (Lockers.tsx)

#### **데이터 로딩 개선**
```typescript
// Before: 1000개 제한
const response = await getAllLockers(1, 1000, '', 'all');

// After: 10000개로 확장
const response = await getAllLockers(1, 10000, '', 'all');

// 응답 구조 수정
const lockersData = response.data.data || [];
const total = response.data.total || 0;
```

#### **디버깅 정보 추가**
```typescript
console.log('📊 로드된 락커 데이터:', {
  totalCount: lockersData.length,
  totalFromServer: total,
  numbersOver40: lockersData.filter(l => parseInt(l.number) > 40)
});
```

## 📊 문제 해결 결과

### Before (문제 상황)
- ❌ 락커 번호 "051" → "51"로 변경되어 저장
- ❌ 이후 "51" 입력 시 중복 오류 발생
- ❌ 40번 이후 락커들이 제대로 표시되지 않음
- ❌ 정렬 순서가 자연스럽지 않음

### After (해결 후)
- ✅ 락커 번호 원본 그대로 저장 ("051" → "051")
- ✅ 중복 검사 정확성 향상
- ✅ 모든 락커 번호 정상 표시
- ✅ 자연스러운 숫자 정렬 (1, 2, 3, ... 49, 50, 51)

## 🔍 디버깅 도구 추가

### 콘솔 로그 출력
```typescript
console.log('🔍 락커 데이터 로딩 디버깅:', {
  response,
  success: response?.success,
  total: response?.data?.total
});

console.log('📊 로드된 락커 데이터:', {
  totalCount: lockersData.length,
  numbersOver40: lockersData.filter(l => parseInt(l.number) > 40)
});
```

### 확인 방법
1. 브라우저 개발자 도구 → Console 탭
2. 락커 페이지 새로고침 시 디버깅 정보 확인
3. 40번 이후 락커들이 `numbersOver40` 배열에 표시되는지 확인

## 🧪 테스트 시나리오

### 1. 락커 번호 중복 테스트
```
1. 락커 "051" 추가
2. 락커 "51" 추가 시도
3. 결과: 정상적으로 추가됨 (서로 다른 번호로 인식)
```

### 2. 정렬 테스트
```
락커 번호: 1, 2, 3, 10, 11, 49, 50, 51, 52, 100
정렬 결과: 자연스러운 숫자 순서대로 표시
```

### 3. 대용량 데이터 테스트
```
100개 이상의 락커 생성 후 모든 락커가 정상 표시되는지 확인
```

## 💡 예방책

### 1. 락커 번호 정책
- 락커 번호는 입력한 그대로 저장
- 정규화는 검색/비교 시에만 사용
- 대소문자 구분하지 않음

### 2. 데이터 로딩 정책
- 충분한 페이지 크기 설정 (10,000개)
- 실제 총 개수와 로드된 개수 비교 확인
- 오류 발생 시 재시도 로직

### 3. 정렬 정책
- 숫자는 숫자로, 문자는 문자로 분리하여 정렬
- 자연스러운 정렬 순서 유지
- 대소문자 구분하지 않음

## 🚀 성능 개선

### 데이터베이스 쿼리 최적화
- COUNT 쿼리와 데이터 조회 쿼리 분리
- 필요한 경우에만 JOIN 수행
- 인덱스 활용을 위한 효율적인 WHERE 조건

### 프론트엔드 렌더링 최적화
- 페이지네이션으로 50개씩 표시
- 가상화(Virtualization) 고려 (향후 개선사항)
- 메모이제이션으로 불필요한 재계산 방지

이제 락커 시스템이 안정적으로 작동하며, 모든 번호의 락커를 정확히 표시하고 관리할 수 있습니다! 🎉 