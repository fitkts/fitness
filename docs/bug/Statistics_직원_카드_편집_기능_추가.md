# Statistics 직원 카드 편집 기능 추가 해결방안

## 📋 문제 상황

Statistics 페이지에 직원 관련 통계 카드들이 이미 구현되어 있었지만, **카드 편집 기능에서 '직원' 카테고리가 보이지 않아** 사용자가 직원 관련 카드들을 활성화/비활성화할 수 없었습니다.

### 문제 증상
- 카드 편집 모달에서 '매출', '회원', '운영', '성과' 카테고리만 표시됨
- '직원' 카테고리의 4개 카드가 보이지 않음:
  - 직원별 매출
  - 직원별 회원 등록
  - 직원별 상담 건수
  - 직원별 성과 점수

### 기술적 원인
`KPICardEditModal.tsx`에서 하드코딩된 카테고리 배열에 '직원' 카테고리가 누락됨:
```tsx
// 기존 코드 (문제)
{['매출', '회원', '운영', '성과'].map(category => {
  // 카테고리별 카드 렌더링 로직
})}
```

## 🔧 해결 방법

### 1. 카드 편집 모달에 '직원' 카테고리 추가

**파일**: `src/components/KPICardEditModal.tsx`

```tsx
// 수정된 코드
{['매출', '회원', '운영', '성과', '직원'].map(category => {
  const categoryCards = kpiCards.filter(card => card.category === category);
  const enabledCategoryCards = categoryCards.filter(card => card.enabled);
  // 카테고리별 카드 렌더링 로직
})}
```

### 2. 기본 설정 복원 기능 추가

**인터페이스 확장**:
```tsx
interface KPICardEditModalProps {
  // 기존 props...
  onRestoreDefaults?: () => void; // 새로 추가
}
```

**UI 컴포넌트 추가**:
```tsx
{onRestoreDefaults && (
  <button
    onClick={onRestoreDefaults}
    className="px-3 py-1.5 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-md transition-colors"
  >
    기본값 복원
  </button>
)}
```

### 3. Statistics 컴포넌트에 복원 함수 구현

**파일**: `src/pages/Statistics.tsx`

```tsx
// 기본 설정 복원 함수
const handleRestoreDefaults = () => {
  setKpiCards(defaultKPICards);
  saveKPICardsConfig(defaultKPICards);
  showToast('success', 'KPI 카드 설정이 기본값으로 복원되었습니다.');
};
```

**모달에 prop 전달**:
```tsx
<KPICardEditModal
  // 기존 props...
  onRestoreDefaults={handleRestoreDefaults}
/>
```

## 🎯 구현된 직원 KPI 카드들

### 1. 직원별 매출
- **계산 로직**: 각 직원이 담당한 회원들의 결제 금액 합계
- **표시 형태**: 상위 직원의 매출 + 전체 직원 차트
- **데이터 연결**: Member.staffId → Payment.memberId

### 2. 직원별 회원 등록
- **계산 로직**: 선택 기간 내 직원이 담당하여 등록한 신규 회원 수
- **표시 형태**: 상위 직원의 등록 수 + 전체 직원 차트
- **데이터 연결**: Member.staffId + joinDate 필터링

### 3. 직원별 상담 건수
- **계산 로직**: 신규 회원 등록 + 결제 건수 * 0.3 (추정)
- **표시 형태**: 상위 직원의 상담 건수 + 전체 직원 차트
- **데이터 추정**: 실제 상담 데이터가 없어 업무량으로 근사치 계산

### 4. 직원별 성과 점수
- **계산 로직**: 매출(40점) + 회원등록(30점) + 상담(30점) = 100점 만점
- **표시 형태**: 상위 직원의 총점 + 전체 직원 점수 차트
- **종합 평가**: 다양한 업무 성과를 통합한 점수

## 📊 데이터 구조 확인

### Member 테이블 연결
```typescript
export type Member = {
  id: number;
  staffId?: number;     // 담당 직원 ID
  staffName?: string;   // 담당 직원 이름
  joinDate: string;     // 가입일
  // 기타 필드들...
}
```

### Staff 테이블
```typescript
export type Staff = {
  id: number;
  name: string;
  position: string;
  // 기타 필드들...
}
```

## 🔍 테스트 방법

1. **개발 서버 실행**: `npm run dev`
2. **Statistics 페이지** 접속
3. **"카드 편집" 버튼** 클릭
4. **"직원" 카테고리** 확인
5. 직원 관련 4개 카드 **체크박스로 활성화**
6. **"저장" 버튼** 클릭
7. 메인 대시보드에서 **직원 카드들이 표시되는지** 확인

## 🚀 추가 개선사항

### 기본값 복원 기능
- **목적**: 설정이 꼬였을 때 쉽게 초기화
- **동작**: localStorage 설정을 기본값으로 재설정
- **피드백**: 토스트 메시지로 사용자에게 알림

### 카테고리별 선택/해제
- **직원 카테고리**: 모든 직원 카드를 한 번에 선택/해제 가능
- **일관성**: 다른 카테고리와 동일한 UI/UX 제공

## 📝 작업 완료 체크리스트

- [x] KPICardEditModal에 '직원' 카테고리 추가
- [x] 기본 설정 복원 버튼 구현
- [x] Statistics 컴포넌트에 복원 함수 연결
- [x] 인터페이스 타입 확장
- [x] 직원 KPI 계산 로직 확인 (이미 구현됨)
- [x] 직원 카드 렌더링 로직 확인 (이미 구현됨)

## 🎉 결과

이제 사용자는 **카드 편집 기능**을 통해 직원 관련 통계 카드들을 자유롭게 활성화/비활성화할 수 있으며, 직원 성과 관리를 위한 다양한 KPI를 확인할 수 있습니다.

---

**해결일**: 2025년 1월  
**담당자**: AI Assistant  
**난이도**: ⭐⭐ (중급)  
**소요시간**: 약 30분 