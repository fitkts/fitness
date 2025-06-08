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
- [ ] 하드코딩된 값이 없는가?
- [ ] TypeScript 타입이 명시되었는가?
- [ ] 컴포넌트가 props만으로 렌더링되는가?
- [ ] 유틸리티 함수가 순수 함수인가?

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

### **TDD 장점**
- 버그를 미리 예방할 수 있습니다.
- 요구사항이 명확해집니다.
- 리팩터링이 쉬워집니다.

> **TIP:** 새로운 기능을 만들 때, 꼭 테스트 코드를 먼저 작성해보세요!

---

## 🚫 피해야 할 안티패턴

### **❌ 나쁜 예시**
```typescript
// 모든 것이 한 파일에 있는 나쁜 예시
const Dashboard = () => {
  interface DashboardData { ... }
  const chartColors = ['red', 'blue'];
  const formatCurrency = (value) => { ... };
  
  // 500줄의 코드...
};
```

### **✅ 좋은 예시**  
```typescript
// 잘 분리된 좋은 예시
import { DashboardData } from '../types/dashboard';
import { CHART_COLORS } from '../config/dashboardConfig';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
  // 상태 관리와 조합 로직만 (150줄 이하)
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

### **선택적 포함 정보**
1. **성능 요구사항**: 대용량 데이터 처리 등
2. **보안 고려사항**: 민감 정보 처리
3. **확장성**: 향후 추가될 기능

---

**작성일**: 2025년 06월  
**작성자**: AI Assistant  
**버전**: 1.0.0

> 📝 **참고**: 이 문서는 AI 코딩의 품질과 일관성을 위한 가이드라인입니다. 