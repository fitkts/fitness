# 🤖 AI 코딩 통합 가이드라인

## 📌 문서 목적
이 문서는 피트니스 회원 관리 시스템의 AI 코딩을 위한 통합 가이드라인입니다.  
3개 문서(clean-coding-guidelines.md, database_schema.md, system-architecture.md)의 핵심 내용을 중복 없이 통합했습니다.

---

## 🏗️ 시스템 아키텍처 개요

### **기술 스택**
- **Frontend**: React 18.2.0 + TypeScript + Tailwind CSS
- **Backend**: Electron Main Process + Node.js  
- **데이터베이스**: SQLite (better-sqlite3)
- **상태 관리**: Zustand 4.4.7

### **Electron 프로세스 구조**
```
┌─────────────────────────────────────────────────────────────────┐
│ Renderer Process (React) ←─IPC─→ Main Process (Database/FS)    │
│ • UI Components              • SQLite Database                 │
│ • State Management           • File System Access             │
│ • Business Logic             • Background Services            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ 데이터베이스 스키마 핵심

### **주요 테이블 (6개)**

| 테이블명 | 주요 컬럼 | 역할 |
|---------|----------|------|
| `members` | id, name, phone, membership_type, membership_end | 회원 기본 정보 |
| `payments` | id, member_id, amount, payment_date, status | 결제 내역 |
| `attendance` | id, member_id, visit_date | 출석 기록 |
| `staff` | id, name, position, permissions | 직원 정보 |
| `lockers` | id, number, status, member_id | 락커 관리 |
| `membership_types` | id, name, price, duration_months | 회원권 종류 |

### **데이터 처리 원칙**
- **날짜**: Unix Timestamp → ISO 문자열 (YYYY-MM-DD) 변환
- **JSON 활용**: permissions, available_facilities, fee_options
- **외래키**: member_id 기준으로 관계 설정

---

## 📂 모듈 분리 가이드라인

### **필수 폴더 구조**
```
src/
├── types/          # TypeScript 인터페이스
├── config/         # 설정값, 상수, 옵션
├── utils/          # 순수 함수, 포맷팅, 계산
├── components/     # 재사용 가능한 UI 컴포넌트
│   ├── common/     # 공통 컴포넌트
│   ├── forms/      # 폼 관련
│   └── [domain]/   # 도메인별 (member, payment 등)
└── pages/          # 메인 페이지 컴포넌트
```

### **파일 분리 우선순위**
1. **타입 정의** → `types/[기능명].ts`
2. **설정 및 상수** → `config/[기능명]Config.ts`  
3. **유틸리티 함수** → `utils/[기능명]Utils.ts`
4. **하위 컴포넌트** → `components/[컴포넌트명].tsx`
5. **메인 컴포넌트** → `pages/[기능명].tsx`

---

## 🎯 AI 코딩 요청 템플릿

### **기본 템플릿**
```
[기능명] 페이지/컴포넌트를 만들어주세요.

**모듈 분리 요구사항:**
1. 다음과 같이 파일을 분리해서 만들어주세요:
   - 타입 정의: `src/types/[기능명].ts`
   - 설정 파일: `src/config/[기능명]Config.ts`
   - 유틸리티: `src/utils/[기능명]Utils.ts`
   - 컴포넌트: `src/components/[컴포넌트명].tsx`
   - 메인 파일: `src/pages/[기능명].tsx`

2. 각 파일별 역할:
   - 타입: interface, type, enum 정의만
   - 설정: 상수, 기본값, 옵션 배열 등
   - 유틸리티: 데이터 처리, 포맷팅, 계산 함수
   - 컴포넌트: UI 렌더링과 이벤트 처리만

3. 코딩 원칙:
   - 각 파일 200줄 이하로 제한
   - 하드코딩 금지, 설정 파일 활용
   - TypeScript 타입 안전성 확보
   - 재사용 가능한 순수 함수 작성
```

### **⚠️ 하드코딩 제거 템플릿 (실제 Members.tsx 분석 기반)**
```
[기능명] 페이지를 디자인 시스템을 활용해서 하드코딩 없이 만들어주세요.

**하드코딩 제거 요구사항:**
1. 스타일 관련:
   - ❌ 금지: className="text-3xl font-bold text-gray-800"
   - ✅ 사용: createPageStructure('페이지명') 함수 활용
   - ❌ 금지: className="bg-blue-600 hover:bg-blue-700"
   - ✅ 사용: getButtonStyle('primary') 함수 활용

2. 반복되는 패턴 제거:
   - 테이블 셀 스타일: getTableCellStyle() 사용
   - 페이지네이션 버튼: getPaginationButtonStyle() 사용
   - 상태 배지: getStatusBadgeStyle() 사용
   - 카드 스타일: createCardStyle() 사용

3. 설정 파일 활용:
   - 숫자값: 페이지 크기, 간격 등은 config 파일에서 관리
   - 색상: DESIGN_SYSTEM에서 정의된 색상 팔레트 사용
   - 타이포그래피: 미리 정의된 텍스트 스타일 사용
```

### **데이터베이스 연동 요청 시**
```
[기능명] 페이지를 데이터베이스와 연동해서 만들어주세요.

**데이터베이스 요구사항:**
1. 주요 테이블: [테이블명들]
2. 필요한 작업: 조회/생성/수정/삭제
3. IPC 통신: window.api.[메서드명] 활용
4. 에러 처리: try-catch + 사용자 피드백

**데이터 처리:**
- Unix Timestamp ↔ ISO 날짜 변환
- 상태값 필터링 (status가 '완료'인 것만)
- JSON 필드 파싱 (permissions, options 등)
```

---

## 🔧 IPC 통신 패턴

### **기본 사용법**
```typescript
// Renderer에서 Main Process 호출
const result = await window.api.getAllMembers();
if (result.success) {
  setMembers(result.data);
} else {
  showError(result.error);
}
```

### **주요 API 메서드**
```typescript
// 회원 관리
window.api.getAllMembers()
window.api.addMember(member)
window.api.updateMember(member)
window.api.deleteMember(id)

// 결제 관리  
window.api.getAllPayments()
window.api.addPayment(payment)

// 출석 관리
window.api.getAttendanceByMember(memberId)
window.api.addAttendance(attendance)
```

---

## 🎨 컴포넌트 작성 원칙

### **컴포넌트 구조**
```typescript
interface Props {
  // props 타입 명시적 정의
}

const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // 1. 상태 관리 (useState, useEffect)
  // 2. 이벤트 핸들러
  // 3. 계산된 값 (useMemo, useCallback)
  // 4. JSX 반환
  
  return (
    // 150줄 이하의 깔끔한 JSX
  );
};

export default ComponentName;
```

### **⚠️ 실제 발견된 하드코딩 문제 사례**
```typescript
// ❌ Members.tsx에서 발견된 나쁜 예시
<h1 className="text-3xl font-bold text-gray-800">회원 관리</h1>
<div className="space-y-6">

// ❌ MemberViewDetails.tsx에서 발견된 나쁜 예시
<div className="w-24 h-24 rounded-full bg-gray-200">
<h3 className="text-xl font-bold">{formData.name}</h3>

// ❌ MemberTable.tsx에서 발견된 나쁜 예시
className="py-8 px-4 text-center text-gray-500"
className="py-2 px-2 sm:py-2.5 sm:px-3"

// ✅ 개선된 예시
import { createPageStructure, getAvatarStyle, getTableCellStyle } from '../utils/designSystemUtils';

const pageStructure = createPageStructure('회원 관리');
<h1 className={pageStructure.titleClass}>{pageStructure.title}</h1>
<div className={pageStructure.containerClass}>

<div className={getAvatarStyle('lg')}>
<h3 className={getTypographyClass('cardTitle')}>{formData.name}</h3>

<td className={getTableCellStyle()}>
```

### **상태 관리 (Zustand)**
```typescript
interface StoreState {
  data: DataType[];
  isLoading: boolean;
  error: string | null;
  
  fetchData: () => Promise<void>;
  addData: (data: DataType) => Promise<void>;
}

const useStore = create<StoreState>((set, get) => ({
  // 상태와 액션 정의
}));
```

---

## 📏 코딩 제약사항

### **파일 크기 제한**
- **타입 파일**: 50-100줄
- **설정 파일**: 30-80줄
- **유틸리티**: 100-200줄  
- **컴포넌트**: 80-150줄
- **페이지**: 150-300줄

### **필수 체크리스트**
- [ ] 각 파일이 200줄을 넘지 않는가?
- [ ] ~~하드코딩된 값이 없는가?~~ → **디자인 시스템 함수 사용**
- [ ] TypeScript 타입이 명시되었는가?
- [ ] 컴포넌트가 props만으로 렌더링되는가?
- [ ] 유틸리티 함수가 순수 함수인가?

### **⚠️ 하드코딩 금지 사항 (실제 발견 사례)**
```typescript
// ❌ 절대 금지 - 직접 Tailwind 클래스 하드코딩
className="text-3xl font-bold text-gray-800"
className="bg-blue-600 hover:bg-blue-700"
className="px-4 py-2"
className="space-y-6"

// ✅ 반드시 사용 - 디자인 시스템 함수
className={createPageStructure('제목').titleClass}
className={getButtonStyle('primary')}
className={getSpacingClass('pageContainer')}
```

---

## 🧪 TDD(테스트 주도 개발) 원칙

### **TDD란?**
- **테스트 코드를 먼저 작성**하고, 그 테스트가 통과할 수 있도록 실제 코드를 작성하는 개발 방법론입니다.
- "실패하는 테스트 → 실제 코드 작성 → 테스트 통과 → 코드 정리" 순서로 개발합니다.

### **TDD 개발 순서**
1. **테스트 코드 작성**: 원하는 기능(예상 동작)을 먼저 테스트로 만듭니다.
2. **테스트 실행**: 당연히 처음엔 실패합니다.
3. **실제 코드 작성**: 테스트가 통과할 수 있도록 최소한의 실제 코드를 작성합니다.
4. **테스트 통과 확인**: 테스트가 성공하면, 필요시 코드를 정리(리팩터링)합니다.

### **쉬운 예시**
```typescript
// 1. 테스트 코드 먼저 작성
it('1 + 2는 3이어야 한다', () => {
  expect(sum(1, 2)).toBe(3);
});

// 2. 실제 코드 작성 (테스트 통과하도록)
export function sum(a: number, b: number) {
  return a + b;
}
```

### **디자인 시스템 TDD 예시**
```typescript
// 1. 디자인 시스템 함수 테스트 먼저 작성
it('createPageStructure는 올바른 클래스를 반환해야 한다', () => {
  const result = createPageStructure('테스트 페이지');
  expect(result.titleClass).toContain('text-3xl');
  expect(result.containerClass).toContain('space-y-6');
});

// 2. 실제 함수 구현
export const createPageStructure = (title: string) => ({
  titleClass: `${DESIGN_SYSTEM.typography.pageTitle} ${DESIGN_SYSTEM.colors.text.primary}`,
  containerClass: DESIGN_SYSTEM.spacing.pageContainer,
  title
});
```

### **TDD 장점**
- 버그를 미리 예방할 수 있습니다.
- 요구사항이 명확해집니다.
- 리팩터링이 쉬워집니다.

> **TIP:** 새로운 기능을 만들 때, 꼭 테스트 코드를 먼저 작성해보세요!

---

## 🚫 피해야 할 안티패턴

### **❌ 나쁜 예시 (실제 발견 사례)**
```typescript
// 모든 것이 한 파일에 있는 나쁜 예시
const Dashboard = () => {
  interface DashboardData { ... }
  const chartColors = ['red', 'blue'];
  const formatCurrency = (value) => { ... };
  
  // 500줄의 코드...
};

// 하드코딩된 스타일 반복 사용 (MemberPagination.tsx에서 발견)
<button className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">

// 같은 스타일이 여러 컴포넌트에서 중복 (MemberPaymentHistory.tsx에서도 동일)
<button className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
```

### **✅ 좋은 예시**  
```typescript
// 잘 분리된 좋은 예시
import { DashboardData } from '../types/dashboard';
import { CHART_COLORS } from '../config/dashboardConfig';
import { formatCurrency } from '../utils/formatters';
import { createPageStructure, getPaginationButtonStyle } from '../utils/designSystemUtils';

const Dashboard = () => {
  const pageStructure = createPageStructure('대시보드');
  
  return (
    <div className={pageStructure.containerClass}>
      <h1 className={pageStructure.titleClass}>{pageStructure.title}</h1>
      <button className={getPaginationButtonStyle(false, false)}>
        페이지 버튼
      </button>
    </div>
  );
};
```

---

## 🔍 데이터 변환 가이드

### **날짜 처리**
```typescript
// Unix Timestamp → ISO 날짜
const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString().split('T')[0];
};

// ISO 날짜 → Unix Timestamp  
const parseDate = (dateStr: string): number => {
  return Math.floor(new Date(dateStr).getTime() / 1000);
};
```

### **결제 상태 필터링**
```typescript
// "완료" 상태인 결제만 매출로 집계
const completedPayments = payments.filter(p => p.status === '완료');
```

### **JSON 데이터 처리**
```typescript
// permissions, options 등 JSON 필드 파싱
const permissions = JSON.parse(staff.permissions || '{}');
const feeOptions = JSON.parse(locker.fee_options || '[]');
```

---

## 🎯 성능 최적화 원칙

### **React 최적화**
- `React.memo` - 불필요한 리렌더링 방지
- `useCallback` - 함수 메모이제이션
- `useMemo` - 계산된 값 캐싱

### **데이터베이스 최적화**
- 인덱싱: 자주 검색되는 컬럼 (`members.name`, `payments.payment_date`)
- 페이지네이션: 대용량 데이터 분할 로딩
- 트랜잭션: 배치 작업의 성능 향상

---

## 🛡️ 보안 및 에러 처리

### **Electron 보안**
```typescript
webPreferences: {
  nodeIntegration: false,      // Node.js 직접 접근 차단
  contextIsolation: true,      // 컨텍스트 격리
  preload: path.join(__dirname, 'preload.js')
}
```

### **에러 처리 패턴**
```typescript
try {
  const result = await window.api.someMethod();
  if (result.success) {
    // 성공 처리
  } else {
    showToast('error', result.error || '처리 중 오류가 발생했습니다.');
  }
} catch (error) {
  console.error('API 호출 실패:', error);
  showToast('error', '네트워크 오류가 발생했습니다.');
}
```

---

## 📋 AI 코딩 요청 시 참고사항

### **필수 포함 정보**
1. **기능 설명**: 구체적인 요구사항
2. **데이터베이스**: 연관 테이블과 필드
3. **UI 요소**: 필요한 컴포넌트들
4. **제약사항**: 변경하면 안 되는 부분
5. **⭐ 디자인 시스템**: 하드코딩 없이 디자인 시스템 함수 사용

### **⚠️ 하드코딩 제거 체크리스트 (Members.tsx 분석 기반)**
```
다음 항목들을 반드시 확인하고 수정해주세요:

1. 페이지 제목 스타일:
   - ❌ className="text-3xl font-bold text-gray-800" 
   - ✅ createPageStructure('페이지명') 사용

2. 컨테이너 간격:
   - ❌ className="space-y-6"
   - ✅ DESIGN_SYSTEM.spacing.pageContainer 사용

3. 버튼 스타일:
   - ❌ className="bg-blue-600 hover:bg-blue-700"
   - ✅ getButtonStyle('primary') 사용

4. 테이블 관련:
   - ❌ 반복되는 px-4 py-2, px-6 py-3 등
   - ✅ getTableCellStyle(), getTableHeaderStyle() 사용

5. 아바타/프로필 이미지:
   - ❌ className="w-24 h-24 rounded-full"
   - ✅ getAvatarStyle('lg') 사용

6. 상태 배지:
   - ❌ 직접 bg-green-100 text-green-800
   - ✅ getStatusBadgeStyle('active') 사용
```

### **선택적 포함 정보**
1. **성능 요구사항**: 대용량 데이터 처리 등
2. **보안 고려사항**: 민감 정보 처리
3. **확장성**: 향후 추가될 기능

---

## 🔄 리팩터링 가이드

### **Members.tsx 리팩터링 계획**
```typescript
// 1단계: 페이지 구조 개선
// Before:
<div className="space-y-6">
  <h1 className="text-3xl font-bold text-gray-800">회원 관리</h1>
</div>

// After:
import { createPageStructure } from '../utils/designSystemUtils';
const pageStructure = createPageStructure('회원 관리');
<div className={pageStructure.containerClass}>
  <h1 className={pageStructure.titleClass}>{pageStructure.title}</h1>
</div>

// 2단계: 컴포넌트별 스타일 함수 적용
// 3단계: 설정 파일에서 상수값 관리
// 4단계: 테스트 코드 작성 및 검증
```

---

**작성일**: 2025년 06월  
**작성자**: AI Assistant  
**버전**: 2.0.0 (하드코딩 제거 및 실제 사례 반영)

> 📝 **참고**: 이 문서는 AI 코딩의 품질과 일관성을 위한 가이드라인이며, 실제 Members.tsx 분석을 통해 발견된 하드코딩 문제들의 해결방안을 포함합니다.