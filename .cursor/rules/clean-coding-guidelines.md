# 🏗️ 모듈화된 깨끗한 코딩 지시사항 가이드

## 📌 기본 원칙

### 1. 단일 책임 원칙
- **각 파일은 하나의 명확한 역할만** 담당
- **200줄 이상 넘지 않도록** 제한
- **하나의 파일에 모든 기능을 넣지 않기**

### 2. 모듈 분리 우선순위
1. **타입 정의** → `src/types/`
2. **설정 및 상수** → `src/config/`
3. **유틸리티 함수** → `src/utils/`
4. **재사용 컴포넌트** → `src/components/`
5. **메인 페이지/컴포넌트** → `src/pages/` 또는 `src/components/`

## 🎯 구체적인 지시사항 템플릿

### 기본 템플릿
```
[기능명] 페이지/컴포넌트를 만들어주세요.

**아키텍처 요구사항:**
1. 다음과 같이 파일을 분리해서 만들어주세요:
   - 타입 정의: `src/types/[기능명].ts`
   - 설정 파일: `src/config/[기능명]Config.ts`
   - 유틸리티: `src/utils/[기능명]Utils.ts`
   - 하위 컴포넌트: `src/components/[컴포넌트명].tsx`
   - 메인 컴포넌트: `src/pages/[기능명].tsx`

2. 각 파일별 역할:
   - 타입: interface, type, enum 정의만
   - 설정: 상수, 기본값, 옵션 배열 등
   - 유틸리티: 데이터 처리, 포맷팅, 계산 함수
   - 컴포넌트: UI 렌더링과 이벤트 처리만

3. 재사용성 고려:
   - 컴포넌트는 props로만 데이터 받기
   - 하드코딩된 값 없이 설정 파일 참조
   - 순수 함수로 유틸리티 작성
```

### 실제 사용 예시

#### 📊 대시보드 만들기
```
회원 관리 대시보드를 만들어주세요.

**모듈 분리 요구사항:**

1. 파일 구조:
   - `src/types/memberDashboard.ts` - 모든 타입 정의
   - `src/config/memberDashboardConfig.tsx` - 차트 설정, 색상, 아이콘
   - `src/utils/memberDataUtils.ts` - 데이터 변환, 필터링 함수
   - `src/utils/memberFormatters.ts` - 날짜, 숫자, 통화 포맷팅
   - `src/components/MemberChart.tsx` - 차트 컴포넌트
   - `src/components/MemberFilter.tsx` - 필터 컴포넌트
   - `src/components/MemberCard.tsx` - 정보 카드 컴포넌트
   - `src/pages/MemberDashboard.tsx` - 메인 페이지

2. 각 파일 책임:
   - 타입: MemberData, FilterOptions, ChartConfig 등
   - 설정: 차트 색상, 기본 필터값, 카드 레이아웃
   - 유틸리티: 데이터 그룹핑, 통계 계산, 날짜 범위 계산
   - 컴포넌트: 단일 기능의 재사용 가능한 UI 블록
   - 페이지: 전체 조합과 상태 관리만

3. 코딩 스타일:
   - 컴포넌트당 최대 150줄
   - props 타입 명시적 정의
   - 하드코딩 금지 (설정 파일 사용)
   - 테스트 가능한 순수 함수 선호
```

#### 📝 폼 만들기
```
회원 등록 폼을 만들어주세요.

**모듈 분리 요구사항:**

1. 파일 구조:
   - `src/types/memberForm.ts` - 폼 데이터, 검증 규칙 타입
   - `src/config/memberFormConfig.ts` - 필드 설정, 검증 메시지
   - `src/utils/memberFormValidation.ts` - 검증 로직
   - `src/utils/memberFormUtils.ts` - 데이터 변환, 포맷팅
   - `src/components/forms/MemberFormField.tsx` - 개별 필드 컴포넌트
   - `src/components/forms/MemberFormSection.tsx` - 섹션 컴포넌트
   - `src/components/MemberRegistrationForm.tsx` - 메인 폼 컴포넌트

2. 분리 기준:
   - 검증 로직과 UI 분리
   - 필드 설정과 렌더링 분리
   - 각 섹션을 독립 컴포넌트로
   - 재사용 가능한 입력 필드 컴포넌트

3. 테스트 고려사항:
   - 검증 함수는 순수 함수로 작성
   - 컴포넌트는 props만으로 렌더링
   - 외부 의존성 최소화
```

## 📏 파일 크기 가이드라인

### 파일별 권장 라인 수
- **타입 파일**: 50-100줄
- **설정 파일**: 30-80줄  
- **유틸리티 파일**: 100-200줄
- **컴포넌트 파일**: 80-150줄
- **페이지 파일**: 150-300줄

### 분리 기준
- **150줄 초과 시**: 기능별로 분리 검토
- **200줄 초과 시**: 무조건 분리
- **300줄 초과 시**: 아키텍처 재검토 필요

## 🎨 네이밍 컨벤션

### 파일명
- **타입**: `[기능명].ts` (예: `memberDashboard.ts`)
- **설정**: `[기능명]Config.ts` (예: `dashboardConfig.ts`)
- **유틸리티**: `[기능명]Utils.ts` 또는 `[용도]Utils.ts`
- **컴포넌트**: `PascalCase.tsx` (예: `MemberCard.tsx`)

### 폴더 구조
```
src/
├── types/
│   ├── member.ts
│   ├── payment.ts
│   └── dashboard.ts
├── config/
│   ├── memberConfig.ts
│   ├── dashboardConfig.tsx
│   └── chartConfig.ts
├── utils/
│   ├── formatters.ts
│   ├── dateUtils.ts
│   ├── memberUtils.ts
│   └── chartDataUtils.ts
├── components/
│   ├── common/
│   ├── forms/
│   ├── charts/
│   └── cards/
└── pages/
    ├── Dashboard.tsx
    ├── Members.tsx
    └── Payments.tsx
```

## ✅ 체크리스트

### 코딩 시작 전
- [ ] 기능을 어떻게 모듈로 나눌지 계획했는가?
- [ ] 타입 정의가 별도 파일로 분리되는가?
- [ ] 재사용 가능한 컴포넌트를 식별했는가?
- [ ] 설정값과 비즈니스 로직이 분리되는가?

### 코딩 완료 후
- [ ] 각 파일이 200줄을 넘지 않는가?
- [ ] 하드코딩된 값이 없는가?
- [ ] 컴포넌트가 props만으로 렌더링되는가?
- [ ] 유틸리티 함수가 순수 함수인가?
- [ ] 타입 안전성이 확보되었는가?

## 🚫 피해야 할 안티패턴

### ❌ 나쁜 예시
```typescript
// 모든 것이 한 파일에 있는 나쁜 예시
const Dashboard = () => {
  // 타입 정의
  interface DashboardData { ... }
  
  // 설정값들
  const chartColors = ['red', 'blue', 'green'];
  const defaultFilters = { ... };
  
  // 유틸리티 함수들
  const formatCurrency = (value) => { ... };
  const calculateGrowth = (current, previous) => { ... };
  
  // 컴포넌트 로직
  const [data, setData] = useState();
  // ... 500줄의 코드
  
  return (
    // 복잡한 JSX
  );
};
```

### ✅ 좋은 예시
```typescript
// 잘 분리된 좋은 예시
import { DashboardData, FilterOptions } from '../types/dashboard';
import { CHART_COLORS, DEFAULT_FILTERS } from '../config/dashboardConfig';
import { formatCurrency, calculateGrowth } from '../utils/formatters';
import DashboardChart from '../components/DashboardChart';
import DashboardFilters from '../components/DashboardFilters';

const Dashboard = () => {
  // 상태 관리와 조합 로직만
  const [data, setData] = useState<DashboardData>();
  
  return (
    <div>
      <DashboardFilters options={DEFAULT_FILTERS} />
      <DashboardChart data={data} colors={CHART_COLORS} />
    </div>
  );
};
```

## 🎯 실무 적용 팁

### 1. 점진적 적용
```
"이 기능을 만들어주세요. 단, 다음 원칙을 지켜주세요:
1. 타입은 별도 파일로 분리
2. 설정값은 config 파일로 분리  
3. 100줄 넘는 컴포넌트는 분할
4. 재사용 가능한 부분은 독립 컴포넌트로"
```

### 2. 복잡한 기능일 때
```
"[복잡한 기능명]을 만들어주세요.

이 기능은 복잡할 것 같으니 다음과 같이 체계적으로 분리해주세요:
1. 설계 단계에서 모듈 구조를 먼저 제안해주세요
2. 각 모듈의 역할과 의존성을 명시해주세요
3. 파일별로 순차적으로 구현해주세요
4. 마지막에 통합 테스트 코드도 만들어주세요"
```

### 3. 기존 코드 개선 시
```
"[기존 파일명]을 리팩토링해주세요.

요구사항:
1. 현재 구조의 문제점을 먼저 분석해주세요
2. 개선된 모듈 구조를 제안해주세요
3. 단계별로 안전하게 분리해주세요
4. 기능 손실 없이 코드 라인을 50% 이상 줄여주세요"
```

---

**핵심 요약**: **명확한 분리 기준**과 **구체적인 파일 구조**를 지시하면, 처음부터 깨끗하고 유지보수 가능한 코드를 만들 수 있습니다! 